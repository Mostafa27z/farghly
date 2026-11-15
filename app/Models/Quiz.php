<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'transcript_id',
        'user_id',
        'title',
        'exam_type',
        'difficulty',
        'mcq_count',
        'written_count',
        'max_full_attempts',
        'custom_prompt',
    ];

    protected $casts = [
        'mcq_count' => 'integer',
        'written_count' => 'integer',
        'max_full_attempts' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(Transcript::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order', 'asc');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class)->latest('attempt_number');
    }

    /**
     * Number of full exam attempts taken by a specific user.
     */
    public function fullAttemptsCountForUser(int $userId): int
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->where('attempt_mode', 'full')
            ->count();
    }

    /**
     * Remaining full exam attempts (with AI grading for written questions) for a specific user.
     */
    public function remainingFullAttemptsForUser(int $userId): int
    {
        $used = $this->fullAttemptsCountForUser($userId);
        return max(0, ($this->max_full_attempts ?? 3) - $used);
    }

    /**
     * Check if user can still submit a full exam attempt.
     */
    public function canTakeFullExam(int $userId): bool
    {
        return $this->remainingFullAttemptsForUser($userId) > 0;
    }

    /**
     * Check if MCQ retake is possible (unlimited retakes for MCQ portion).
     */
    public function canRetakeMcqOnly(): bool
    {
        return in_array($this->exam_type, ['mcq', 'both'], true) || $this->mcq_count > 0;
    }
}
