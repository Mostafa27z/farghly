<?php

namespace App\Jobs;

use App\Models\TelegramPendingTranscription;
use App\Models\Tenant;
use App\Models\Transcript;
use App\Services\AudioTranscriptionService;
use App\Services\GroqBudgetGuard;
use App\Services\MediaDurationInspector;
use App\Services\TelegramBotClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessTelegramTranscriptionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 0;           // Prevents release() from failing jobs due to MaxAttemptsExceeded
    public int $maxExceptions = 2;   // Fails only on unexpected fatal exceptions
    public int $timeout = 240;

    public function __construct(public int $pendingId) {}

    public function retryUntil(): \DateTime
    {
        return now()->addHours(6);
    }

    public function handle(
        TelegramBotClient $botClient,
        AudioTranscriptionService $audioService,
        GroqBudgetGuard $budgetGuard,
        MediaDurationInspector $durationInspector
    ): void {
        $pending = TelegramPendingTranscription::with(['user', 'tenant', 'connection'])->find($this->pendingId);
        if (!$pending || in_array($pending->status, ['completed', 'cancelled'])) {
            return;
        }

        $tenant = $pending->tenant;
        $chatId = $pending->telegram_chat_id;

        // 1. Transition to processing
        $pending->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        if ($chatId) {
            $botClient->sendChatAction($chatId, 'typing');
        }

        // 2. Prepare physical media file on disk
        $filePath = null;
        $mediaPathForStorage = null;

        if ($pending->source === 'scoped_upload') {
            $filePath = $pending->local_temp_path;
            if (!$filePath || !file_exists($filePath)) {
                $this->failWithNotice($pending, $botClient, 'الملف المرفوع لم يعد متاحاً على الخادم.');
                return;
            }
            $mediaPathForStorage = "transcripts/{$tenant->id}/" . basename($filePath);
        } else {
            // Source is 'bot' -> download from Telegram via streaming
            if (empty($pending->file_id)) {
                $this->failWithNotice($pending, $botClient, 'معرف الملف غير متوفر للتحميل.');
                return;
            }

            $fileMeta = $botClient->getFile($pending->file_id);
            if (!$fileMeta['success']) {
                $this->failWithNotice($pending, $botClient, 'تعذر الوصول للملف من خوادم تيليجرام: ' . ($fileMeta['error'] ?? 'خطأ غير معروف'));
                return;
            }

            $remotePath = $fileMeta['file_path'];
            $ext = strtolower(pathinfo($remotePath, PATHINFO_EXTENSION) ?: 'ogg');
            if ($ext === 'oga') {
                $ext = 'ogg'; // Normalize .oga to .ogg for universal browser & player playback
            }

            $fileName = 'tg_' . time() . '_' . Str::random(8) . '.' . $ext;
            $mediaPathForStorage = "transcripts/{$tenant->id}/{$fileName}";
            $absolutePath = Storage::disk('public')->path($mediaPathForStorage);

            $downloaded = $botClient->downloadFile($remotePath, $absolutePath);
            if (!$downloaded || !file_exists($absolutePath) || filesize($absolutePath) === 0) {
                $this->failWithNotice($pending, $botClient, 'فشل تحميل الملف الصوتي من تيليجرام.');
                return;
            }

            $filePath = $absolutePath;
            $pending->update(['local_temp_path' => $absolutePath]);
        }

        // 3. Inspect duration using getID3 before making any AI calls (prevents free-quota leakage on document files!)
        $duration = $pending->duration_seconds;
        if (!$duration || $duration <= 0) {
            $inspection = $durationInspector->inspect($filePath);
            if (!$inspection['valid'] || $inspection['duration_seconds'] <= 0) {
                // If inspection failed, don't burn Groq tokens on a corrupted file
                $this->failWithNotice($pending, $botClient, $inspection['error'] ?: 'تعذر فحص الترويسة الصوتية للملف للتأكد من صلاحيته.');
                return;
            }
            $duration = $inspection['duration_seconds'];
            $pending->update(['duration_seconds' => $duration]);
        }

        // 4. Pre-check single file limit & tenant quota BEFORE Groq call
        $maxSingleMinutes = (int) config('services.groq.max_single_file_minutes', 90);
        if ($duration > ($maxSingleMinutes * 60)) {
            $this->failWithNotice($pending, $botClient, "عذراً، مدة هذا الملف تتجاوز الحد الأقصى للملف الواحد ({$maxSingleMinutes} دقيقة).");
            return;
        }

        if (!$tenant->canTranscribeRecord($duration)) {
            $fileMinutes = (int) ceil($duration / 60);
            $remMinutes = $tenant->remainingRecordingMinutes();
            $this->failWithNotice(
                $pending,
                $botClient,
                "⚠️ <b>رصيد دقائق التسجيل في باقتك غير كافٍ!</b>\n\n"
                . "• مدة الملف: <b>{$fileMinutes} دقيقة</b>\n"
                . "• الرصيد المتبقي: <b>{$remMinutes} دقيقة</b>\n\n"
                . "لم يتم استهلاك أي رصيد. يرجى تجديد أو ترقية باقتك من الموقع."
            );
            return;
        }

        // 5. Groq Budget Guard Check (ASH & ASD)
        $guardCheck = $budgetGuard->checkAvailability($duration);
        $result = null;
        $providerUsed = 'groq';

        if ($guardCheck['allowed']) {
            // Groq has available capacity
            $result = $audioService->transcribe($filePath, $pending->language);

            // Handle potential 429 rate limit returned by Groq
            if (!empty($result['is_rate_limited'])) {
                $guardCheck['allowed'] = false;
                $guardCheck['retry_after_seconds'] = $result['retry_after'] ?? 60;
                $guardCheck['suggest_gemini'] = true;
                $result = null;
            }
        }

        if (!$result || empty($result['success'])) {
            // Check if fallback to Gemini is viable (if file <= 20MB)
            if ($guardCheck['suggest_gemini'] && filesize($filePath) <= 20 * 1024 * 1024) {
                Log::info("Falling back to Gemini for Telegram pending #{$pending->id} due to Groq limit.");
                $result = $audioService->transcribeWithGemini($filePath, basename($filePath), $pending->language);
                if (!empty($result['success'])) {
                    $providerUsed = 'gemini';
                }
            }
        }

        // If still no successful result and rate-limited, release back to queue
        if (!$result || empty($result['success'])) {
            if (!$guardCheck['allowed'] && $guardCheck['retry_after_seconds'] > 0) {
                $delay = min(1800, max(30, $guardCheck['retry_after_seconds']));
                $pending->update([
                    'status' => 'delayed',
                    'error_message' => 'تم وضع الطلب في قائمة الانتظار بسبب ضغط الخدمة',
                ]);

                if ($chatId && $pending->prompt_message_id) {
                    $delayMinutes = ceil($delay / 60);
                    $botClient->editMessageText(
                        $chatId,
                        $pending->prompt_message_id,
                        "⏳ <b>يوجد ضغط مؤقت على خدمة التفريغ فائقة السرعة.</b>\n\n"
                        . "طلبك في قائمة الانتظار الآمنة وسيبدأ تلقائياً خلال حوالي {$delayMinutes} دقيقة.\n"
                        . "<i>لم يتم خصم أي رصيد من باقتك.</i>"
                    );
                }

                $this->release($delay);
                return;
            }

            // Permanent failure
            $errorMsg = $result['message_ar'] ?? ($guardCheck['reason'] ?? 'فشلت معالجة الصوت بالذكاء الاصطناعي.');
            $this->failWithNotice($pending, $botClient, $errorMsg);
            return;
        }

        // 6. Final atomic quota deduction and record persistence
        $actualDurationSeconds = $result['duration_seconds'] ?: $duration;

        try {
            $transcript = DB::transaction(function () use ($pending, $tenant, $result, $actualDurationSeconds, $filePath, $mediaPathForStorage, $providerUsed, $budgetGuard) {
                // Lock tenant row for update to guarantee strict quota safety under concurrent jobs
                $freshTenant = Tenant::whereKey($tenant->id)->lockForUpdate()->first();

                if (!$freshTenant->canTranscribeRecord($actualDurationSeconds)) {
                    throw new \RuntimeException('QUOTA_EXCEEDED');
                }

                $transcript = $freshTenant->transcripts()->create([
                    'user_id' => $pending->user_id,
                    'source_type' => 'telegram',
                    'title' => $pending->suggested_title,
                    'channel_name' => 'تيليجرام',
                    'original_filename' => $pending->file_name,
                    'media_path' => $mediaPathForStorage,
                    'file_size_bytes' => file_exists($filePath) ? filesize($filePath) : $pending->file_size_bytes,
                    'duration_seconds' => $actualDurationSeconds,
                    'language' => $result['language'] ?? $pending->language,
                    'segments' => $result['segments'] ?? [],
                    'full_text' => $result['full_text'] ?? '',
                ]);

                $freshTenant->recordRecordingUsage($actualDurationSeconds);

                if ($providerUsed === 'groq') {
                    $budgetGuard->recordGroqUsage($actualDurationSeconds, $transcript->id);
                } else {
                    $budgetGuard->recordGeminiUsage($actualDurationSeconds, $transcript->id);
                }

                $pending->update([
                    'status' => 'completed',
                    'transcript_id' => $transcript->id,
                    'duration_seconds' => $actualDurationSeconds,
                ]);

                return $transcript;
            });
        } catch (\Throwable $e) {
            if ($e->getMessage() === 'QUOTA_EXCEEDED') {
                $this->failWithNotice($pending, $botClient, 'عذراً، رصيدك المتبقي لا يكفي بعد حساب مدة التسجيل الفعلية.');
            } else {
                Log::error('DB Exception in ProcessTelegramTranscriptionJob: ' . $e->getMessage());
                $this->failWithNotice($pending, $botClient, 'حدث خطأ أثناء حفظ التفريغ في قاعدة البيانات.');
            }
            return;
        }

        // 7. Send final success message with direct studio links
        if ($chatId) {
            $this->sendSuccessNotification($chatId, $pending, $transcript, $botClient, $actualDurationSeconds);
        }
    }

    /**
     * Send crisp success message and action buttons.
     */
    protected function sendSuccessNotification(
        int $chatId,
        TelegramPendingTranscription $pending,
        Transcript $transcript,
        TelegramBotClient $botClient,
        int $actualDurationSeconds
    ): void {
        $minutesDeducted = (int) ceil($actualDurationSeconds / 60);
        $remainingMinutes = $pending->tenant->fresh()->remainingRecordingMinutes();

        $previewText = Str::limit($transcript->full_text, 350);

        $msg = "✅ <b>اكتمل تفريغ التسجيل الصوتي بنجاح!</b>\n\n"
            . "📝 <b>العنوان:</b> " . e($transcript->title) . "\n"
            . "⏱ <b>المدة:</b> {$minutesDeducted} دقيقة (المتبقي في باقتك: {$remainingMinutes} دقيقة)\n\n"
            . "📜 <b>معاينة من النص:</b>\n"
            . "<i>«" . e($previewText) . "»</i>\n\n"
            . "👇 اضغط أدناه لفتح الاستوديو للاستفادة من (التلخيص الذكي، التدقيق، الاختبارات، والبطاقات):";

        $studioUrl = route('transcripts.show', $transcript->id);

        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '🚀 فتح في استوديو فرغلي AI', 'url' => $studioUrl],
                ],
                [
                    ['text' => '📄 إرسال النص كملف TXT', 'callback_data' => "tx:txt:{$transcript->id}"],
                ],
            ],
        ];

        if ($pending->prompt_message_id) {
            $botClient->editMessageText($chatId, $pending->prompt_message_id, $msg, [
                'reply_markup' => json_encode($keyboard),
                'disable_web_page_preview' => true,
            ]);
        } else {
            $botClient->sendMessage($chatId, $msg, [
                'reply_markup' => json_encode($keyboard),
                'disable_web_page_preview' => true,
            ]);
        }
    }

    /**
     * Helper to fail job cleanly with user notification and zero quota deducted.
     */
    protected function failWithNotice(TelegramPendingTranscription $pending, TelegramBotClient $botClient, string $reason): void
    {
        $pending->update([
            'status' => 'failed',
            'error_message' => $reason,
        ]);

        // Clean up temporary local file if any
        if (!empty($pending->local_temp_path) && file_exists($pending->local_temp_path) && str_contains($pending->local_temp_path, 'storage/app/public/transcripts')) {
            // Keep or delete depending on requirements
            @unlink($pending->local_temp_path);
        }

        $chatId = $pending->telegram_chat_id;
        if ($chatId) {
            $keyboard = [
                'inline_keyboard' => [
                    [
                        ['text' => '🔄 إعادة المحاولة', 'callback_data' => "tx:ok:{$pending->id}"],
                    ],
                ],
            ];

            $msg = "❌ <b>تعذر استكمال التفريغ الصوتي:</b>\n\n"
                . e($reason) . "\n\n"
                . "<i>لم يتم خصم أي دقيقة من باقتك.</i>";

            if ($pending->prompt_message_id) {
                $botClient->editMessageText($chatId, $pending->prompt_message_id, $msg, [
                    'reply_markup' => json_encode($keyboard),
                ]);
            } else {
                $botClient->sendMessage($chatId, $msg, [
                    'reply_markup' => json_encode($keyboard),
                ]);
            }
        }
    }

    /**
     * Called when job fails permanently after max exceptions.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessTelegramTranscriptionJob failed permanently for pending #{$this->pendingId}: " . $exception->getMessage());

        $pending = TelegramPendingTranscription::find($this->pendingId);
        if ($pending) {
            $pending->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            $botClient = app(TelegramBotClient::class);
            $botClient->notifyAdmin(
                "فشل تفريغ الطلب #{$pending->id} لمساحة العمل #{$pending->tenant_id}: " . $exception->getMessage()
            );
        }
    }
}
