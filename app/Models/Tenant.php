<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'plan_name',
        'subscription_status',
        'starts_at',
        'expires_at',
        'monthly_videos_limit',
        'monthly_videos_used',
        'monthly_minutes_limit',
        'monthly_minutes_used',
        'monthly_recording_minutes_limit',
        'monthly_recording_minutes_used',
        'max_team_members',
        'created_by_sales_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'monthly_videos_limit' => 'integer',
        'monthly_videos_used' => 'integer',
        'monthly_minutes_limit' => 'integer',
        'monthly_minutes_used' => 'integer',
        'monthly_recording_minutes_limit' => 'integer',
        'monthly_recording_minutes_used' => 'integer',
        'max_team_members' => 'integer',
    ];

    /**
     * Check if the tenant currently holds an active, unexpired subscription.
     */
    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_status !== 'active') {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Compute remaining transcription videos for the current billing cycle.
     */
    public function remainingVideos(): int
    {
        $limit = $this->monthly_videos_limit ?: max(10, (int) round(($this->monthly_minutes_limit ?? 3000) / 20));
        $used = $this->monthly_videos_used ?? 0;
        return max(0, $limit - $used);
    }

    /**
     * Compute remaining transcription minutes for the current billing cycle.
     */
    public function remainingActualMinutes(): int
    {
        $limit = $this->monthly_minutes_limit ?: (($this->monthly_videos_limit ?: 150) * 20);
        $used = $this->monthly_minutes_used ?? 0;
        return max(0, $limit - $used);
    }

    /**
     * Compute remaining audio/video recording minutes for the current billing cycle.
     */
    public function remainingRecordingMinutes(): int
    {
        $limit = $this->monthly_recording_minutes_limit ?? 300;
        $used = $this->monthly_recording_minutes_used ?? 0;
        return max(0, $limit - $used);
    }

    /**
     * Verify whether tenant has sufficient balance for uploaded audio/recording transcription.
     */
    public function canTranscribeRecord(?int $videoDurationSeconds = null): bool
    {
        if (!$this->hasActiveSubscription()) {
            return false;
        }

        if ($this->remainingRecordingMinutes() < 1) {
            return false;
        }

        if ($videoDurationSeconds !== null) {
            $requiredMinutes = (int) max(1, ceil($videoDurationSeconds / 60));
            return $this->remainingRecordingMinutes() >= $requiredMinutes;
        }

        return true;
    }

    /**
     * Record usage for audio/video recording transcription.
     */
    public function recordRecordingUsage(?int $videoDurationSeconds = null): void
    {
        $minutes = $videoDurationSeconds ? (int) max(1, ceil($videoDurationSeconds / 60)) : 1;
        $this->increment('monthly_recording_minutes_used', $minutes);
    }

    /**
     * Verify whether tenant has sufficient video and minute balance to transcribe.
     */
    public function canTranscribe(?int $videoDurationSeconds = null): bool
    {
        if (!$this->hasActiveSubscription()) {
            return false;
        }

        if ($this->remainingVideos() < 1) {
            return false;
        }

        if ($videoDurationSeconds !== null && $this->monthly_minutes_limit > 0) {
            $videoMinutes = (int) ceil($videoDurationSeconds / 60);
            return $this->remainingActualMinutes() >= $videoMinutes;
        }

        return true;
    }

    /**
     * Record usage after successful extraction (1 video used).
     */
    public function recordUsage(?int $videoDurationSeconds = null): void
    {
        $this->increment('monthly_videos_used', 1);

        if ($videoDurationSeconds) {
            $minutes = (int) ceil($videoDurationSeconds / 60);
            $this->increment('monthly_minutes_used', $minutes);
        }
    }

    /**
     * Backward-compatibility alias for remaining count.
     */
    public function remainingMinutes(): int
    {
        return $this->remainingVideos();
    }

    /**
     * Maximum number of flashcards per video based on subscription plan.
     */
    public function maxFlashcardsPerVideo(): int
    {
        $plan = strtolower(trim($this->plan_name ?? ''));

        if (str_contains($plan, 'enterprise')) {
            return 100;
        }

        if (str_contains($plan, 'agency')) {
            return 50;
        }

        if (str_contains($plan, 'creator') || str_contains($plan, 'pro')) {
            return 25;
        }

        if (str_contains($plan, 'starter')) {
            return 10;
        }

        return 15;
    }

    /**
     * Users associated with this workspace.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Transcripts owned by this workspace.
     */
    public function transcripts(): HasMany
    {
        return $this->hasMany(Transcript::class);
    }

    /**
     * Custom document themes / branding templates for this workspace.
     */
    public function documentThemes(): HasMany
    {
        return $this->hasMany(DocumentTheme::class);
    }

    /**
     * The sales representative who created this tenant.
     */
    public function salesAgent()
    {
        return $this->belongsTo(User::class, 'created_by_sales_id');
    }

    /**
     * Complete history of subscription renewals and changes.
     */
    public function subscriptionTransactions(): HasMany
    {
        return $this->hasMany(SubscriptionTransaction::class);
    }

    /**
     * Quizzes created within this workspace.
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    /**
     * Flashcard sets created within this workspace.
     */
    public function flashcardSets(): HasMany
    {
        return $this->hasMany(FlashcardSet::class);
    }
}
