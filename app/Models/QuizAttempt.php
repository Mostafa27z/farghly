<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'attempt_number',
        'attempt_mode',
        'status',
        'score_obtained',
        'total_possible_score',
        'percentage',
        'answers',
        'submitted_at',
    ];

    protected $casts = [
        'attempt_number' => 'integer',
        'score_obtained' => 'float',
        'total_possible_score' => 'float',
        'percentage' => 'float',
        'answers' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
