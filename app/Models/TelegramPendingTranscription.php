<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramPendingTranscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_connection_id',
        'user_id',
        'tenant_id',
        'telegram_chat_id',
        'source',
        'source_message_id',
        'prompt_message_id',
        'file_id',
        'file_unique_id',
        'local_temp_path',
        'media_type',
        'file_name',
        'mime_type',
        'file_size_bytes',
        'duration_seconds',
        'suggested_title',
        'language',
        'status',
        'queued_at',
        'started_at',
        'transcript_id',
        'error_message',
        'expires_at',
    ];

    protected $casts = [
        'telegram_chat_id' => 'integer',
        'source_message_id' => 'integer',
        'prompt_message_id' => 'integer',
        'file_size_bytes' => 'integer',
        'duration_seconds' => 'integer',
        'queued_at' => 'datetime',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function connection(): BelongsTo
    {
        return $this->belongsTo(TelegramConnection::class, 'telegram_connection_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(Transcript::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
