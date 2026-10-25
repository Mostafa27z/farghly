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
        'monthly_minutes_limit',
        'monthly_minutes_used',
        'max_team_members',
        'created_by_sales_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'monthly_minutes_limit' => 'integer',
        'monthly_minutes_used' => 'integer',
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
     * Compute remaining transcription minutes for the current billing cycle.
     */
    public function remainingMinutes(): int
    {
        $left = $this->monthly_minutes_limit - $this->monthly_minutes_used;
        return max(0, $left);
    }

    /**
     * Verify whether tenant has sufficient minutes to transcribe a video.
     */
    public function canTranscribe(int $videoDurationSeconds): bool
    {
        if (!$this->hasActiveSubscription()) {
            return false;
        }

        $requiredMinutes = (int) ceil($videoDurationSeconds / 60);
        return $this->remainingMinutes() >= $requiredMinutes;
    }

    /**
     * Record usage after successful extraction.
     */
    public function recordUsage(int $videoDurationSeconds): void
    {
        $minutes = (int) ceil($videoDurationSeconds / 60);
        $this->increment('monthly_minutes_used', $minutes);
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
}
