<?php

namespace App\Services;

use App\Jobs\ProcessTelegramTranscriptionJob;
use App\Models\TelegramConnection;
use App\Models\TelegramLinkCode;
use App\Models\TelegramPendingTranscription;
use App\Models\Transcript;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class TelegramWorkflowService
{
    public function __construct(
        protected TelegramBotClient $botClient,
        protected GroqBudgetGuard $budgetGuard,
        protected MediaDurationInspector $durationInspector
    ) {}

    /**
     * Handle incoming raw update from Telegram Webhook.
     */
    public function handleUpdate(array $update): void
    {
        $updateId = $update['update_id'] ?? null;
        if ($updateId !== null) {
            // Deduplicate incoming update for 5 minutes
            $cacheKey = "tg_upd:{$updateId}";
            if (!Cache::add($cacheKey, true, 300)) {
                Log::info("Ignoring duplicate Telegram update_id: {$updateId}");
                return;
            }
        }

        if (isset($update['message'])) {
            $this->processMessage($update['message']);
        } elseif (isset($update['callback_query'])) {
            $this->processCallbackQuery($update['callback_query']);
        }
    }

    /**
     * Process incoming private message.
     */
    protected function processMessage(array $message): void
    {
        $chat = $message['chat'] ?? [];
        $chatId = $chat['id'] ?? null;
        $chatType = $chat['type'] ?? 'private';
        $messageId = $message['message_id'] ?? 0;
        $from = $message['from'] ?? [];

        if (!$chatId) {
            return;
        }

        // Restrict to private chats for security & quota isolation
        if ($chatType !== 'private') {
            $this->botClient->sendMessage($chatId, '🔒 <b>تنبيه:</b> يرجى التحدث مع البوت في محادثة خاصة للحفاظ على أمان حسابك وحصتك.');
            return;
        }

        $text = trim($message['text'] ?? ($message['caption'] ?? ''));

        // 1. Check for Account Linking code (/start frg_xxx, /connect frg_xxx, or plain frg_xxx)
        if (preg_match('/^(?:\/(?:start|connect)\s+)?(frg_[a-z0-9]{16,40})$/i', $text, $matches)) {
            $this->handleLinkCode($chatId, $from, $matches[1], $messageId);
            return;
        }

        // Find linked connection
        $connection = TelegramConnection::where('telegram_chat_id', $chatId)
            ->with(['user', 'tenant'])
            ->first();

        // 2. Handle Text Commands
        if (!empty($text) && str_starts_with($text, '/')) {
            $command = strtolower(explode(' ', $text)[0]);
            $this->handleCommand($command, $chatId, $connection, $from);
            return;
        }

        // 3. Handle Media (Voice, Audio, Video, Video Note, Document)
        $mediaInfo = $this->extractMediaFromMessage($message);
        if ($mediaInfo) {
            $this->handleIncomingMedia($chatId, $from, $connection, $mediaInfo, $message);
            return;
        }

        // 4. Default message for plain text without media
        if (!$connection) {
            $this->sendUnlinkedHelp($chatId);
        } else {
            $this->botClient->sendMessage(
                $chatId,
                "👋 أهلاً بك يا <b>" . e($connection->telegram_first_name ?: $from['first_name'] ?? 'صديقنا') . "</b> في بوت <b>فرغلي AI</b>!\n\n"
                . "🎙 <b>كيف تستخدم البوت:</b>\n"
                . "• سجّل فويس نوت مباشرة في الشات.\n"
                . "• أو حوّل أي رسالة صوتية/فيديو من أي قناة أو محادثة.\n"
                . "• أو ارفع ملف صوت/فيديو (حتى 20 ميجابايت مباشرة).\n\n"
                . "📊 لمعرفة رصيدك المتبقي: أرسل /quota\n"
                . "📁 لاستعراض آخر تفريغاتك: أرسل /recent"
            );
        }
    }

    /**
     * Link Telegram chat to Farghly User via one-time code.
     */
    protected function handleLinkCode(int $chatId, array $from, string $plainCode, int $messageId): void
    {
        // Rate limit: max 5 failed attempts per 15 minutes per chat
        $rateKey = "tg_link_rate:{$chatId}";
        if (RateLimiter::tooManyAttempts($rateKey, 5)) {
            $seconds = RateLimiter::availableIn($rateKey);
            $this->botClient->sendMessage($chatId, "⚠️ <b>تم تجاوز عدد المحاولات المسموح بها.</b>\nيرجى الانتظار دقيقة ({$seconds} ثانية) ثم إعادة المحاولة.");
            return;
        }

        // Clean up user's message containing the code for privacy
        $this->botClient->deleteMessage($chatId, $messageId);

        $linkCode = TelegramLinkCode::findValid($plainCode, 'connect');
        if (!$linkCode) {
            RateLimiter::hit($rateKey, 900);
            $this->botClient->sendMessage(
                $chatId,
                "❌ <b>كود الربط غير صالح أو انتهت صلاحيته (10 دقائق).</b>\n\n"
                . "يرجى الدخول إلى حسابك في منصة فرغلي ← <b>الإعدادات</b> ← <b>ربط تيليجرام</b> وتوليد كود جديد."
            );
            return;
        }

        $user = $linkCode->user;
        $tenant = $linkCode->tenant;

        if (!$user || !$user->is_active) {
            $this->botClient->sendMessage($chatId, '🚫 هذا الحساب معطل أو غير موجود.');
            return;
        }

        if ($user->isSales()) {
            $this->botClient->sendMessage($chatId, '🚫 غير مصرح لحساب المبيعات باستخدام خدمة التفريغ.');
            return;
        }

        // Prevent linking if already connected to another Telegram chat
        $existing = TelegramConnection::where('user_id', $user->id)->first();
        if ($existing && $existing->telegram_chat_id && (int) $existing->telegram_chat_id !== (int) $chatId) {
            $this->botClient->sendMessage(
                $chatId,
                "🔒 هذا الحساب مرتبط بالفعل بحساب تيليجرام آخر.\n"
                . "لفك الارتباط، يرجى الدخول للإعدادات في الموقع أو إرسال /disconnect من الحساب السابق."
            );
            return;
        }

        // Link connection
        TelegramConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'tenant_id' => $tenant->id,
                'telegram_chat_id' => $chatId,
                'telegram_user_id' => $from['id'] ?? null,
                'telegram_username' => $from['username'] ?? null,
                'telegram_first_name' => $from['first_name'] ?? null,
                'connected_at' => now(),
                'last_interaction_at' => now(),
            ]
        );

        $linkCode->markUsed();
        RateLimiter::clear($rateKey);

        $recMinutes = $tenant->remainingRecordingMinutes();
        $videos = $tenant->remainingVideos();

        $this->botClient->sendMessage(
            $chatId,
            "🎉 <b>تم ربط حسابك في فرغلي بنجاح!</b>\n\n"
            . "👤 <b>المستخدم:</b> " . e($user->name) . "\n"
            . "🏢 <b>مساحة العمل:</b> " . e($tenant->name) . "\n"
            . "📦 <b>الباقة:</b> " . e($tenant->plan_name) . "\n"
            . "🎙 <b>رصيد دقائق التسجيل:</b> {$recMinutes} دقيقة متبقية\n"
            . "🎬 <b>رصيد يوتيوب:</b> {$videos} فيديو متبقي\n\n"
            . "✨ يمكنك الآن إرسال أو تحويل أي تسجيل صوتي لتفريغه فوراً!"
        );
    }

    /**
     * Handle command routing.
     */
    protected function handleCommand(string $command, int $chatId, ?TelegramConnection $connection, array $from): void
    {
        if (!$connection) {
            $this->sendUnlinkedHelp($chatId);
            return;
        }

        $tenant = $connection->tenant;

        switch ($command) {
            case '/start':
            case '/help':
                $this->botClient->sendMessage(
                    $chatId,
                    "👋 مرحباً بك في <b>فرغلي AI</b>!\n\n"
                    . "<b>الأوامر المتاحة:</b>\n"
                    . "• /quota — استعراض رصيدك والباقة\n"
                    . "• /recent — آخر التفريغات في مساحة عملك\n"
                    . "• /disconnect — فك ارتباط الحساب\n\n"
                    . "🎙 أرسل أو حوّل أي ملف صوتي أو فويس نوت مباشرة لتفريغه."
                );
                break;

            case '/quota':
                $recMins = $tenant->remainingRecordingMinutes();
                $recUsed = $tenant->monthly_recording_minutes_used ?? 0;
                $recTotal = $tenant->monthly_recording_minutes_limit ?? 300;
                $vids = $tenant->remainingVideos();
                $expiry = $tenant->expires_at ? $tenant->expires_at->format('Y-m-d') : 'غير محدد';
                $status = $tenant->hasActiveSubscription() ? '🟢 نشط' : '🔴 منتهي الصلاحية';

                $this->botClient->sendMessage(
                    $chatId,
                    "📊 <b>رصيد واشتراك مساحة العمل:</b>\n\n"
                    . "🏢 <b>المساحة:</b> " . e($tenant->name) . " (" . e($tenant->plan_name) . ")\n"
                    . "📅 <b>حالة الاشتراك:</b> {$status} (ينتهي في: {$expiry})\n\n"
                    . "🎙 <b>دقائق التسجيل والصوت:</b>\n"
                    . "• المتبقي: <b>{$recMins} دقيقة</b>\n"
                    . "• المستهلك: {$recUsed} / {$recTotal} دقيقة\n\n"
                    . "🎬 <b>فيديوهات يوتيوب:</b>\n"
                    . "• المتبقي: <b>{$vids} فيديو</b>"
                );
                break;

            case '/recent':
                $recent = $tenant->transcripts()->latest()->take(5)->get();
                if ($recent->isEmpty()) {
                    $this->botClient->sendMessage($chatId, '📁 لا توجد أي تفريغات سابقة في مساحة عملك بعد.');
                    return;
                }

                $msg = "📁 <b>آخر التفريغات في مساحة عملك:</b>\n\n";
                foreach ($recent as $idx => $t) {
                    $num = $idx + 1;
                    $mins = (int) ceil($t->duration_seconds / 60);
                    $url = route('transcripts.show', $t->id);
                    $msg .= "{$num}. <a href=\"{$url}\">" . e(Str::limit($t->title, 40)) . "</a> ({$mins} د)\n";
                }

                $this->botClient->sendMessage($chatId, $msg);
                break;

            case '/disconnect':
                $connection->disconnect();
                $this->botClient->sendMessage(
                    $chatId,
                    "👋 <b>تم فك ارتباط حسابك بنجاح.</b>\n"
                    . "لربط حساب جديد في أي وقت، ادخل لمنصة فرغلي ← الإعدادات واطلب كود ربط جديد."
                );
                break;

            default:
                $this->botClient->sendMessage($chatId, "عذراً، هذا الأمر غير معروف. أرسل /help للمساعدة.");
                break;
        }
    }

    /**
     * Handle incoming voice/audio/video files.
     */
    protected function handleIncomingMedia(int $chatId, array $from, ?TelegramConnection $connection, array $media, array $message): void
    {
        if (!$connection) {
            $this->sendUnlinkedHelp($chatId);
            return;
        }

        $connection->touchActivity();
        $tenant = $connection->tenant;

        // 1. Subscription check
        if (!$tenant || !$tenant->hasActiveSubscription()) {
            $this->botClient->sendMessage(
                $chatId,
                "⚠️ <b>عذراً، اشتراك مساحة العمل «" . e($tenant?->name ?? 'حسابك') . "» غير نشط أو منتهي الصلاحية.</b>\n"
                . "يرجى تجديد الاشتراك عبر بوابة الموقع أو التواصل مع الدعم للمتابعة."
            );
            return;
        }

        $fileSize = (int) ($media['file_size'] ?? 0);
        $fileSizeMb = round($fileSize / (1024 * 1024), 1);
        $maxSizeMb = (int) config('services.telegram.max_file_size_mb', 20);

        // 2. File size branch: If > 20MB -> Phase 2 Scoped Upload link!
        if ($fileSize > ($maxSizeMb * 1024 * 1024)) {
            $this->handleLargeFileRedirect($chatId, $connection, $fileSizeMb);
            return;
        }

        // 3. Supported extension check
        $mime = $media['mime_type'] ?? '';
        $fileName = $media['file_name'] ?? '';
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION) ?: $this->guessExtensionFromMime($mime, $media['media_type']));

        $supportedExts = ['mp3', 'ogg', 'oga', 'wav', 'm4a', 'aac', 'webm', 'mp4', 'mov', 'flac'];
        if (!in_array($ext, $supportedExts) && !str_starts_with($mime, 'audio/') && !str_starts_with($mime, 'video/')) {
            $this->botClient->sendMessage(
                $chatId,
                "📄 <b>صيغة الملف غير مدعومة للتفريغ.</b>\n"
                . "الصيغ المدعومة: <code>MP3, OGG (Voice), WAV, M4A, AAC, WEBM, MP4, FLAC</code>"
            );
            return;
        }

        // 4. Pre-flight duration & quota check if duration is provided by Telegram
        $reportedDuration = (int) ($media['duration'] ?? 0);
        if ($reportedDuration > 0) {
            $maxSingleFileSeconds = (int) config('services.groq.max_single_file_minutes', 90) * 60;
            if ($reportedDuration > $maxSingleFileSeconds) {
                $maxMins = config('services.groq.max_single_file_minutes', 90);
                $this->botClient->sendMessage(
                    $chatId,
                    "⚠️ مدة هذا الملف تتجاوز الحد الأقصى للملف الواحد المسموح به ({$maxMins} دقيقة)."
                );
                return;
            }

            if (!$tenant->canTranscribeRecord($reportedDuration)) {
                $fileMins = (int) ceil($reportedDuration / 60);
                $remMins = $tenant->remainingRecordingMinutes();
                $this->botClient->sendMessage(
                    $chatId,
                    "⚠️ <b>رصيدك غير كافٍ لتفريغ هذا الملف!</b>\n\n"
                    . "• مدة الملف: <b>{$fileMins} دقيقة</b>\n"
                    . "• رصيد باقتك المتبقي: <b>{$remMins} دقيقة</b>\n\n"
                    . "لم يتم خصم أي رصيد. يرجى تجديد أو ترقية الباقة من الموقع."
                );
                return;
            }
        }

        // 5. Anti-flood: max 5 active pending confirmations
        $pendingCount = TelegramPendingTranscription::where('telegram_connection_id', $connection->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->count();

        if ($pendingCount >= 5) {
            $this->botClient->sendMessage(
                $chatId,
                "⚠️ لديك 5 طلبات بانتظار التأكيد حالياً.\nيرجى تأكيدها أو إلغائها قبل إرسال ملفات جديدة."
            );
            return;
        }

        // 6. Duplicate check via file_unique_id
        $fileUniqueId = $media['file_unique_id'] ?? null;
        if ($fileUniqueId) {
            $existing = TelegramPendingTranscription::where('tenant_id', $tenant->id)
                ->where('file_unique_id', $fileUniqueId)
                ->where('status', 'completed')
                ->whereNotNull('transcript_id')
                ->first();

            if ($existing) {
                $url = route('transcripts.show', $existing->transcript_id);
                $this->botClient->sendMessage(
                    $chatId,
                    "💡 <b>ملاحظة:</b> هذا الملف تم تفريغه مسبقاً في مساحة عملك!\n"
                    . "🔗 يمكنك فتحه مباشرة دون استهلاك رصيدك: <a href=\"{$url}\">عرض التفريغ السابق</a>"
                );
            }
        }

        // 7. Derive suggested title
        $title = $this->deriveTitle($message, $media);

        // 8. Create Pending Record
        $pending = TelegramPendingTranscription::create([
            'telegram_connection_id' => $connection->id,
            'user_id' => $connection->user_id,
            'tenant_id' => $tenant->id,
            'telegram_chat_id' => $chatId,
            'source' => 'bot',
            'source_message_id' => $message['message_id'] ?? null,
            'file_id' => $media['file_id'],
            'file_unique_id' => $fileUniqueId,
            'media_type' => $media['media_type'],
            'file_name' => $fileName ?: "audio_{$fileUniqueId}.{$ext}",
            'mime_type' => $mime,
            'file_size_bytes' => $fileSize,
            'duration_seconds' => $reportedDuration ?: null,
            'suggested_title' => $title,
            'language' => $connection->preferred_language ?: 'ar',
            'status' => 'pending',
            'expires_at' => now()->addHours(2),
        ]);

        // Drop eyes reaction on the audio message
        $this->botClient->setMessageReaction($chatId, $message['message_id'] ?? 0, '👀');

        // 9. Send Confirmation Card
        $this->sendConfirmationCard($chatId, $pending, $tenant);
    }

    /**
     * Send confirmation card with Inline Keyboard.
     */
    protected function sendConfirmationCard(int $chatId, TelegramPendingTranscription $pending, $tenant, ?int $editMessageId = null): void
    {
        $durationText = $pending->duration_seconds ? ($this->formatDuration($pending->duration_seconds) . ' (' . ceil($pending->duration_seconds / 60) . ' دقيقة)') : 'سيتم حسابها بدقة عند الفحص';
        $sizeMb = round($pending->file_size_bytes / (1024 * 1024), 1);
        $langLabels = ['ar' => 'العربية 🇸🇦', 'en' => 'English 🇬🇧', 'auto' => 'تلقائي 🌐'];
        $currentLang = $langLabels[$pending->language] ?? 'العربية 🇸🇦';
        $remMinutes = $tenant->remainingRecordingMinutes();

        $cardText = "🎙 <b>تأكيد تفريغ التسجيل الصوتي</b>\n\n"
            . "📝 <b>العنوان المقترح:</b> " . e($pending->suggested_title) . "\n"
            . "⏱ <b>المدة:</b> {$durationText}\n"
            . "📦 <b>الحجم:</b> {$sizeMb} MB\n"
            . "🌐 <b>لغة التفريغ:</b> {$currentLang}\n"
            . "💳 <b>رصيدك المتبقي:</b> {$remMinutes} دقيقة\n\n"
            . "هل ترغب في بدء التفريغ بالذكاء الاصطناعي الآن؟";

        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '✅ تأكيد التفريغ الآن', 'callback_data' => "tx:ok:{$pending->id}"],
                    ['text' => '❌ إلغاء', 'callback_data' => "tx:cancel:{$pending->id}"],
                ],
                [
                    ['text' => "🌐 اللغة: {$currentLang}", 'callback_data' => "tx:lang:{$pending->id}"],
                ],
            ],
        ];

        if ($editMessageId) {
            $this->botClient->editMessageText($chatId, $editMessageId, $cardText, ['reply_markup' => json_encode($keyboard)]);
        } else {
            $res = $this->botClient->sendMessage($chatId, $cardText, ['reply_markup' => json_encode($keyboard)]);
            if (!empty($res['result']['message_id'])) {
                $pending->update(['prompt_message_id' => $res['result']['message_id']]);
            }
        }
    }

    /**
     * Handle Inline Keyboard callback taps.
     */
    protected function processCallbackQuery(array $callback): void
    {
        $callbackId = $callback['id'] ?? '';
        $data = $callback['data'] ?? '';
        $message = $callback['message'] ?? [];
        $chatId = $message['chat']['id'] ?? null;
        $messageId = $message['message_id'] ?? null;

        if (!$chatId || empty($data)) {
            $this->botClient->answerCallbackQuery($callbackId);
            return;
        }

        // 1. Language Toggle: tx:lang:{id}
        if (preg_match('/^tx:lang:(\d+)$/', $data, $matches)) {
            $pendingId = (int) $matches[1];
            $pending = TelegramPendingTranscription::find($pendingId);
            if ($pending && $pending->status === 'pending') {
                $order = ['ar' => 'en', 'en' => 'auto', 'auto' => 'ar'];
                $nextLang = $order[$pending->language] ?? 'ar';
                $pending->update(['language' => $nextLang]);
                $this->botClient->answerCallbackQuery($callbackId, "تم تغيير اللغة");
                $this->sendConfirmationCard($chatId, $pending, $pending->tenant, $messageId);
                return;
            }
        }

        // 2. Cancel: tx:cancel:{id}
        if (preg_match('/^tx:cancel:(\d+)$/', $data, $matches)) {
            $pendingId = (int) $matches[1];
            $pending = TelegramPendingTranscription::find($pendingId);
            if ($pending) {
                $pending->update(['status' => 'cancelled']);
                $this->botClient->answerCallbackQuery($callbackId, "تم الإلغاء");
                $this->botClient->editMessageText($chatId, $messageId, "❌ <b>تم إلغاء طلب التفريغ.</b> لن يتم استهلاك أي رصيد.");
                return;
            }
        }

        // 3. Confirm & Queue: tx:ok:{id}
        if (preg_match('/^tx:ok:(\d+)$/', $data, $matches)) {
            $pendingId = (int) $matches[1];

            // Atomic status update: pending -> queued (prevents double execution on double-click!)
            $affected = TelegramPendingTranscription::where('id', $pendingId)
                ->where('status', 'pending')
                ->where('expires_at', '>', now())
                ->update([
                    'status' => 'queued',
                    'queued_at' => now(),
                ]);

            if ($affected === 0) {
                $this->botClient->answerCallbackQuery($callbackId, "الطلب جارٍ تنفيذه أو انتهت صلاحيته", true);
                return;
            }

            $this->botClient->answerCallbackQuery($callbackId, "بدأ تجهيز الطلب...");
            $this->botClient->editMessageText(
                $chatId,
                $messageId,
                "⏳ <b>تم استلام طلبك بنجاح!</b>\n\n"
                . "سيبدأ التفريغ تلقائياً خلال أقل من دقيقة، وسنرسل لك النتيجة ورابط الاستوديو فور الانتهاء مباشرة."
            );

            // Dispatch background queue job
            dispatch(new ProcessTelegramTranscriptionJob($pendingId));
            return;
        }

        // 4. Download TXT in Telegram: tx:txt:{transcriptId}
        if (preg_match('/^tx:txt:([a-f0-9\-]{36})$/', $data, $matches)) {
            $this->botClient->answerCallbackQuery($callbackId, "جاري إرسال الملف...");
            $transcript = Transcript::find($matches[1]);
            if ($transcript) {
                $this->sendTranscriptTxtFile($chatId, $transcript);
            }
            return;
        }

        $this->botClient->answerCallbackQuery($callbackId);
    }

    /**
     * Send scoped upload link for files larger than 20MB (Phase 2).
     */
    protected function handleLargeFileRedirect(int $chatId, TelegramConnection $connection, float $fileSizeMb): void
    {
        $user = $connection->user;
        $tenant = $connection->tenant;

        $tokenData = TelegramLinkCode::generate($user, $tenant, 'scoped_upload', 20, $chatId);
        $signedUrl = URL::temporarySignedRoute(
            'telegram.scoped-upload.show',
            now()->addMinutes(20),
            ['token' => $tokenData['plain_code']]
        );

        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '🚀 رفع الملف مباشرة عبر المنصة (صالح 20 دقيقة)', 'url' => $signedUrl],
                ],
            ],
        ];

        $msg = "📦 <b>حجم الملف ({$fileSizeMb} MB) يتجاوز الحد المباشر لبوت تيليجرام (20 MB).</b>\n\n"
            . "💡 <b>الحل المباشر:</b>\n"
            . "اضغط على الزر أدناه لفتح صفحة الرفع السريعة المخصصة لحسابك؛ حيث يتم استخلاص وضغط الصوت داخل متصفحك تلقائياً لرفعه وتفريغه بسرعة فائقة دون الحاجة لتسجيل الدخول."
            . "\n\n<i>ملاحظة: الرابط مخصص لرفع هذا الملف لمرة واحدة وصالح لمدة 20 دقيقة.</i>";

        $this->botClient->sendMessage($chatId, $msg, [
            'reply_markup' => json_encode($keyboard),
            'disable_web_page_preview' => true,
        ]);
    }

    /**
     * Send transcript as a downloadable UTF-8 .txt document.
     */
    protected function sendTranscriptTxtFile(int $chatId, Transcript $transcript): void
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'tg_txt_') . '.txt';
        $content = "\xEF\xBB\xBF"; // UTF-8 BOM for Arabic support
        $content .= "العنوان: {$transcript->title}\n";
        $content .= "المدة: " . $this->formatDuration($transcript->duration_seconds) . "\n";
        $content .= "تاريخ التفريغ: " . $transcript->created_at?->format('Y-m-d H:i') . "\n";
        $content .= str_repeat("=", 40) . "\n\n";
        $content .= $transcript->full_text;

        file_put_contents($tempFile, $content);

        $cleanName = Str::slug($transcript->title) ?: 'transcript';
        $filename = "{$cleanName}.txt";

        $this->botClient->sendDocument($chatId, $tempFile, $filename, "📄 تفريغ نصي كامل: <b>" . e($transcript->title) . "</b>");

        if (file_exists($tempFile)) {
            @unlink($tempFile);
        }
    }

    /**
     * Derive a human-friendly title from caption, filename, or forward source.
     */
    protected function deriveTitle(array $message, array $media): string
    {
        $caption = trim($message['caption'] ?? '');
        if ($caption !== '') {
            return Str::limit($caption, 120);
        }

        $fileName = $media['file_name'] ?? '';
        if ($fileName !== '') {
            $cleanName = pathinfo($fileName, PATHINFO_FILENAME);
            if ($cleanName !== '') {
                return Str::limit(str_replace(['_', '-'], ' ', $cleanName), 120);
            }
        }

        // Check forward source (user / channel name)
        $origin = $message['forward_origin'] ?? [];
        if (!empty($origin['chat']['title'])) {
            return "تسجيل من " . Str::limit($origin['chat']['title'], 80);
        }
        if (!empty($origin['sender_user']['first_name'])) {
            return "تسجيل من " . Str::limit($origin['sender_user']['first_name'], 80);
        }

        return "تسجيل تيليجرام " . now()->format('Y-m-d H:i');
    }

    /**
     * Extract media attributes from message object.
     */
    protected function extractMediaFromMessage(array $message): ?array
    {
        if (!empty($message['voice'])) {
            return array_merge($message['voice'], [
                'media_type' => 'voice',
                'mime_type' => $message['voice']['mime_type'] ?? 'audio/ogg',
            ]);
        }

        if (!empty($message['audio'])) {
            return array_merge($message['audio'], [
                'media_type' => 'audio',
                'mime_type' => $message['audio']['mime_type'] ?? 'audio/mpeg',
            ]);
        }

        if (!empty($message['video'])) {
            return array_merge($message['video'], [
                'media_type' => 'video',
                'mime_type' => $message['video']['mime_type'] ?? 'video/mp4',
            ]);
        }

        if (!empty($message['video_note'])) {
            return array_merge($message['video_note'], [
                'media_type' => 'video_note',
                'mime_type' => 'video/mp4',
            ]);
        }

        if (!empty($message['document'])) {
            return array_merge($message['document'], [
                'media_type' => 'document',
                'mime_type' => $message['document']['mime_type'] ?? 'application/octet-stream',
            ]);
        }

        return null;
    }

    protected function guessExtensionFromMime(string $mime, string $type): string
    {
        return match ($mime) {
            'audio/ogg', 'audio/opus' => 'ogg',
            'audio/mpeg', 'audio/mp3' => 'mp3',
            'audio/wav', 'audio/x-wav' => 'wav',
            'audio/x-m4a', 'audio/m4a' => 'm4a',
            'audio/aac' => 'aac',
            'video/mp4' => 'mp4',
            'video/webm', 'audio/webm' => 'webm',
            'video/quicktime' => 'mov',
            default => ($type === 'voice' ? 'ogg' : 'mp3'),
        };
    }

    protected function formatDuration(int $seconds): string
    {
        $hrs = floor($seconds / 3600);
        $mins = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;

        if ($hrs > 0) {
            return sprintf('%02d:%02d:%02d', $hrs, $mins, $secs);
        }

        return sprintf('%02d:%02d', $mins, $secs);
    }

    protected function sendUnlinkedHelp(int $chatId): void
    {
        $this->botClient->sendMessage(
            $chatId,
            "👋 <b>أهلاً بك في بوت فرغلي AI للتفريغ الصوتي الذكي!</b>\n\n"
            . "🔒 <b>لبدء الاستخدام:</b>\n"
            . "1. افتح حسابك في منصة فرغلي: <a href=\"" . url('/settings/telegram') . "\">صفحة ربط تيليجرام</a>\n"
            . "2. اضغط على زر <b>«إنشاء كود ربط»</b>.\n"
            . "3. اضغط على رابط التفعيل المباشر أو انسخ الكود وأرسله هنا مباشرة!\n\n"
            . "✨ الكود صالح لمرة واحدة لمدة 10 دقائق."
        );
    }
}
