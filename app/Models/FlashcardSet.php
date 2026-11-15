<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashcardSet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'transcript_id',
        'user_id',
        'cards',
        'cards_count',
        'custom_prompt',
    ];

    protected $casts = [
        'cards' => 'array',
        'cards_count' => 'integer',
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
}
