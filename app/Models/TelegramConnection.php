<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelegramConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'telegram_chat_id',
        'telegram_user_id',
        'telegram_username',
        'telegram_first_name',
        'preferred_language',
        'connected_at',
        'last_interaction_at',
    ];

    protected $casts = [
        'telegram_chat_id' => 'integer',
        'telegram_user_id' => 'integer',
        'connected_at' => 'datetime',
        'last_interaction_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function pendingTranscriptions(): HasMany
    {
        return $this->hasMany(TelegramPendingTranscription::class);
    }

    public function isConnected(): bool
    {
        return !empty($this->telegram_chat_id);
    }

    public function touchActivity(): void
    {
        $this->update(['last_interaction_at' => now()]);
    }

    public function disconnect(): void
    {
        $this->delete();
    }
}
