<?php

namespace App\Console\Commands;

use App\Services\YouTubeTranscriptService;
use Illuminate\Console\Command;

class YouTubeDiagnoseCommand extends Command
{
    protected $signature = 'youtube:diagnose {video=1sEGuLpIl-8 : Video ID or URL}';

    protected $description = 'Diagnose YouTube transcript fetching from this server (detects IP blocking)';

    public function handle(YouTubeTranscriptService $service): int
    {
        $this->info('Server public IP: ' . (@file_get_contents('https://api.ipify.org') ?: 'unknown'));
        $this->info('Proxy configured: ' . (config('services.youtube.proxy') ? 'yes' : 'no'));
        $this->info('Fallback API key: ' . (config('services.youtube.fallback_api_key') ? 'yes' : 'no'));

        $result = $service->extract($this->argument('video'));

        $this->newLine();
        $this->table(
            ['Client', 'HTTP', 'Playability', 'Reason', 'Tracks', 'Error'],
            array_map(fn ($d) => [
                $d['client'] ?? '',
                $d['http_status'] ?? '-',
                $d['playability_status'] ?? '-',
                \Illuminate\Support\Str::limit($d['reason'] ?? '-', 50),
                $d['tracks'] ?? 0,
                \Illuminate\Support\Str::limit($d['error'] ?? '', 40),
            ], $service->diagnostics)
        );

        if ($result['success']) {
            $this->info("SUCCESS: {$result['segment_count']} segments, title: {$result['title']}");
            return 0;
        }

        $this->error("FAILED [{$result['code']}]: {$result['message_en']}");
        return 1;
    }
}
