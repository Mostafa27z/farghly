<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessTelegramTranscriptionJob;
use App\Models\TelegramLinkCode;
use App\Models\TelegramPendingTranscription;
use App\Services\MediaDurationInspector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TelegramScopedUploadController extends Controller
{
    public function __construct(
        protected MediaDurationInspector $durationInspector
    ) {}

    /**
     * Display the isolated, single-use upload page.
     * No Auth::login() is performed, ensuring complete security isolation.
     */
    public function show(Request $request, string $token)
    {
        $linkCode = TelegramLinkCode::findValid($token, 'scoped_upload');

        if (!$linkCode) {
            return Inertia::render('telegram/scoped-upload-invalid', [
                'message' => 'عذراً، هذا الرابط غير صالح أو انتهت صلاحيته (صالح لمدة 20 دقيقة) أو تم استخدامه مسبقاً.',
            ]);
        }

        $tenant = $linkCode->tenant;
        $user = $linkCode->user;

        if (!$tenant || !$tenant->hasActiveSubscription()) {
            return Inertia::render('telegram/scoped-upload-invalid', [
                'message' => 'عذراً، اشتراك مساحة العمل غير نشط أو منتهي الصلاحية.',
            ]);
        }

        return Inertia::render('telegram/scoped-upload', [
            'token' => $token,
            'tenant' => [
                'name' => $tenant->name,
                'plan_name' => $tenant->plan_name,
                'remaining_recording_minutes' => $tenant->remainingRecordingMinutes(),
                'monthly_recording_minutes_limit' => $tenant->monthly_recording_minutes_limit ?? 300,
            ],
            'userName' => $user->name,
        ]);
    }

    /**
     * Handle the single-use file upload.
     */
    public function upload(Request $request, string $token)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400', 'mimes:mp3,ogg,oga,wav,m4a,aac,webm,mp4,mov,flac'],
            'title' => ['nullable', 'string', 'max:150'],
            'language' => ['nullable', 'string', 'max:10'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $linkCode = TelegramLinkCode::findValid($token, 'scoped_upload');
        if (!$linkCode) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الرابط غير صالح أو انتهت صلاحيته.',
            ], 403);
        }

        // Atomically mark code as used (single upload per link)
        $affected = TelegramLinkCode::where('id', $linkCode->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        if ($affected === 0) {
            return response()->json([
                'success' => false,
                'message' => 'تم استخدام هذا الرابط لرفع ملف مسبقاً. يرجى طلب رابط جديد من تيليجرام.',
            ], 403);
        }

        $tenant = $linkCode->tenant;
        $user = $linkCode->user;
        $file = $request->file('file');

        // Store file
        $ext = $file->getClientOriginalExtension() ?: 'mp3';
        $fileName = 'scoped_' . time() . '_' . Str::random(8) . '.' . $ext;
        $mediaPath = $file->storeAs("transcripts/{$tenant->id}", $fileName, 'public');
        $absolutePath = Storage::disk('public')->path($mediaPath);

        // Pre-flight duration
        $duration = (int) $request->input('duration_seconds', 0);
        if ($duration <= 0) {
            $inspection = $this->durationInspector->inspect($absolutePath);
            $duration = $inspection['duration_seconds'] ?: 0;
        }

        // Title
        $title = trim($request->input('title') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));

        // Create pending record
        $pending = TelegramPendingTranscription::create([
            'telegram_connection_id' => $user->telegramConnection?->id ?: 0,
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'telegram_chat_id' => $linkCode->telegram_chat_id,
            'source' => 'scoped_upload',
            'local_temp_path' => $absolutePath,
            'media_type' => 'audio',
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'duration_seconds' => $duration ?: null,
            'suggested_title' => $title,
            'language' => $request->input('language', 'ar'),
            'status' => 'queued',
            'queued_at' => now(),
            'expires_at' => now()->addHours(2),
        ]);

        // Dispatch background queue job
        dispatch(new ProcessTelegramTranscriptionJob($pending->id));

        return response()->json([
            'success' => true,
            'job_id' => $pending->id,
            'message' => 'تم استلام الملف وجاري التفريغ بالخلفية.',
        ]);
    }

    /**
     * Poll the status of the uploaded file.
     */
    public function status(Request $request, string $token, int $pendingId)
    {
        $pending = TelegramPendingTranscription::find($pendingId);
        if (!$pending) {
            return response()->json(['status' => 'not_found'], 404);
        }

        return response()->json([
            'status' => $pending->status, // 'queued', 'processing', 'completed', 'failed'
            'error_message' => $pending->error_message,
            'transcript_id' => $pending->transcript_id,
            'studio_url' => $pending->transcript_id ? route('transcripts.show', $pending->transcript_id) : null,
        ]);
    }
}
