<?php

namespace App\Services;

use App\Models\GroqUsageLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GroqBudgetGuard
{
    protected bool $enabled;
    protected int $maxSecondsPerHour;
    protected int $maxSecondsPerDay;
    protected int $maxSingleFileMinutes;

    public function __construct()
    {
        $this->enabled = (bool) config('services.groq.budget_guard_enabled', true);
        $this->maxSecondsPerHour = (int) config('services.groq.max_audio_seconds_per_hour', 7200); // 2 hours
        $this->maxSecondsPerDay = (int) config('services.groq.max_audio_seconds_per_day', 28800);  // 8 hours
        $this->maxSingleFileMinutes = (int) config('services.groq.max_single_file_minutes', 90);
    }

    /**
     * Check if Groq has available quota to process an audio of the given duration.
     *
     * @param int $durationSeconds
     * @return array{allowed: bool, reason: string|null, retry_after_seconds: int, suggest_gemini: bool}
     */
    public function checkAvailability(int $durationSeconds): array
    {
        if (!$this->enabled) {
            return [
                'allowed' => true,
                'reason' => null,
                'retry_after_seconds' => 0,
                'suggest_gemini' => false,
            ];
        }

        // 1. Single file duration limit (prevents one long lecture from exhausting the entire hour)
        $maxSingleFileSeconds = $this->maxSingleFileMinutes * 60;
        if ($durationSeconds > $maxSingleFileSeconds) {
            return [
                'allowed' => false,
                'reason' => "مدة الملف ({$durationSeconds} ثانية) تتجاوز الحد الأقصى للملف الواحد المسموح به في البوت ({$this->maxSingleFileMinutes} دقيقة).",
                'retry_after_seconds' => 0,
                'suggest_gemini' => false,
            ];
        }

        $nowUtc = Carbon::now('UTC');

        // 2. Audio Seconds per Hour (ASH)
        $oneHourAgo = (clone $nowUtc)->subHour();
        $usedLastHour = (int) GroqUsageLog::where('provider', 'groq')
            ->where('created_at', '>=', $oneHourAgo)
            ->sum('audio_seconds');

        if (($usedLastHour + $durationSeconds) > $this->maxSecondsPerHour) {
            // Estimate seconds until the oldest log within the hour rolls off
            $oldestInHour = GroqUsageLog::where('provider', 'groq')
                ->where('created_at', '>=', $oneHourAgo)
                ->orderBy('created_at', 'asc')
                ->first();

            $retryAfter = $oldestInHour ? max(60, 3600 - $nowUtc->diffInSeconds($oldestInHour->created_at)) : 900;

            Log::warning('Groq ASH limit reached', [
                'used_last_hour' => $usedLastHour,
                'requested' => $durationSeconds,
                'limit' => $this->maxSecondsPerHour,
                'retry_after' => $retryAfter,
            ]);

            return [
                'allowed' => false,
                'reason' => 'تم الوصول إلى الحد الأقصى لمعدل التفريغ الساعي المتاح. جاري إعادة المحاولة تلقائياً.',
                'retry_after_seconds' => (int) min(1800, $retryAfter),
                'suggest_gemini' => true,
            ];
        }

        // 3. Audio Seconds per Day (ASD) - Groq resets at 00:00 UTC
        $startOfDayUtc = (clone $nowUtc)->startOfDay();
        $usedToday = (int) GroqUsageLog::where('provider', 'groq')
            ->where('created_at', '>=', $startOfDayUtc)
            ->sum('audio_seconds');

        if (($usedToday + $durationSeconds) > $this->maxSecondsPerDay) {
            $endOfDayUtc = (clone $nowUtc)->endOfDay();
            $retryAfter = max(60, $nowUtc->diffInSeconds($endOfDayUtc));

            Log::warning('Groq ASD limit reached', [
                'used_today' => $usedToday,
                'requested' => $durationSeconds,
                'limit' => $this->maxSecondsPerDay,
                'retry_after' => $retryAfter,
            ]);

            return [
                'allowed' => false,
                'reason' => 'تم استهلاك الحصة الصوتية اليومية للمنصة على Groq. جاري التحويل للمزود البديل أو تأجيل الطلب.',
                'retry_after_seconds' => (int) $retryAfter,
                'suggest_gemini' => true,
            ];
        }

        return [
            'allowed' => true,
            'reason' => null,
            'retry_after_seconds' => 0,
            'suggest_gemini' => false,
        ];
    }

    /**
     * Record audio duration successfully processed by Groq.
     */
    public function recordGroqUsage(int $audioSeconds, ?string $transcriptId = null): void
    {
        if ($audioSeconds <= 0) {
            return;
        }

        GroqUsageLog::create([
            'provider' => 'groq',
            'audio_seconds' => $audioSeconds,
            'transcript_id' => $transcriptId,
            'created_at' => Carbon::now('UTC'),
        ]);
    }

    /**
     * Record audio duration processed by Gemini fallback.
     */
    public function recordGeminiUsage(int $audioSeconds, ?string $transcriptId = null): void
    {
        if ($audioSeconds <= 0) {
            return;
        }

        GroqUsageLog::create([
            'provider' => 'gemini',
            'audio_seconds' => $audioSeconds,
            'transcript_id' => $transcriptId,
            'created_at' => Carbon::now('UTC'),
        ]);
    }
}
