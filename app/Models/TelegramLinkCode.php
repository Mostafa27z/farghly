<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TelegramLinkCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'telegram_chat_id',
        'purpose',
        'code_hash',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'telegram_chat_id' => 'integer',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Generate a new one-time token for linking or scoped upload.
     */
    public static function generate(
        User $user,
        Tenant $tenant,
        string $purpose = 'connect',
        int $ttlMinutes = 10,
        ?int $chatId = null
    ): array {
        // e.g. frg_4a8b1c... (total 28 chars, fits well inside Telegram 64-char ?start= limit)
        $prefix = $purpose === 'scoped_upload' ? 'frgup_' : 'frg_';
        $plainCode = $prefix . Str::lower(Str::random(24));
        $hash = hash('sha256', $plainCode);

        // Invalidate previous unconsumed codes for this user & purpose to keep table lean
        static::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->delete();

        $record = static::create([
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'telegram_chat_id' => $chatId,
            'purpose' => $purpose,
            'code_hash' => $hash,
            'expires_at' => now()->addMinutes($ttlMinutes),
            'used_at' => null,
        ]);

        $botUsername = config('services.telegram.bot_username', 'FarghlyAiBot');
        $deepLink = "https://t.me/{$botUsername}?start={$plainCode}";

        return [
            'plain_code' => $plainCode,
            'link_code' => $record,
            'deep_link' => $deepLink,
            'expires_at' => $record->expires_at,
        ];
    }

    /**
     * Find a valid, unexpired, and unused link code.
     */
    public static function findValid(string $plainCode, string $purpose = 'connect'): ?self
    {
        $hash = hash('sha256', trim($plainCode));

        return static::where('code_hash', $hash)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Mark code as consumed.
     */
    public function markUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}
