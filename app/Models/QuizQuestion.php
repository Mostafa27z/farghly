<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'sort_order',
        'type',
        'question_text',
        'options',
        'correct_option',
        'explanation',
        'model_answer',
        'grading_rubric',
        'points',
    ];

    protected $casts = [
        'options' => 'array',
        'sort_order' => 'integer',
        'points' => 'integer',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
