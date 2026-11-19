<?php

namespace App\Console\Commands;

use App\Models\TelegramLinkCode;
use App\Models\TelegramPendingTranscription;
use App\Models\Transcript;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupTelegramDataCommand extends Command
{
    protected $signature = 'telegram:cleanup';
    protected $description = 'Clean expired Telegram link codes, stale pending records, and archived audio files to conserve Hostinger storage';

    public function handle(): int
    {
        $this->info('Starting Telegram data cleanup...');

        // 1. Delete link codes expired > 24 hours ago
        $deletedCodes = TelegramLinkCode::where('expires_at', '<', now()->subDay())->delete();
        $this->info("✓ Cleaned {$deletedCodes} expired link codes.");

        // 2. Delete pending records older than 7 days that are completed, cancelled, or failed
        $oldPendings = TelegramPendingTranscription::where('created_at', '<', now()->subDays(7))
            ->whereIn('status', ['completed', 'cancelled', 'failed', 'expired'])
            ->get();

        $deletedPendingsCount = 0;
        foreach ($oldPendings as $pending) {
            // Delete temp path if left over
            if (!empty($pending->local_temp_path) && file_exists($pending->local_temp_path)) {
                @unlink($pending->local_temp_path);
            }
            $pending->delete();
            $deletedPendingsCount++;
        }
        $this->info("✓ Cleaned {$deletedPendingsCount} stale pending transcription rows.");

        // 3. Audio retention cleanup: delete physical raw audio older than TELEGRAM_MEDIA_RETENTION_DAYS (defaults to 30 days)
        // Keeps the text, summary, quizzes, and flashcards forever!
        $retentionDays = (int) config('services.telegram.media_retention_days', 30);
        if ($retentionDays > 0) {
            $archivedTranscripts = Transcript::where('source_type', 'telegram')
                ->whereNotNull('media_path')
                ->where('created_at', '<', now()->subDays($retentionDays))
                ->get();

            $deletedMediaCount = 0;
            foreach ($archivedTranscripts as $t) {
                if (Storage::disk('public')->exists($t->media_path)) {
                    Storage::disk('public')->delete($t->media_path);
                }
                $t->update(['media_path' => null]);
                $deletedMediaCount++;
            }
            $this->info("✓ Archived raw audio for {$deletedMediaCount} transcripts older than {$retentionDays} days.");
        }

        Log::info('Telegram cleanup completed successfully.');
        return 0;
    }
}
