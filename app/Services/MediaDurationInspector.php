<?php

namespace App\Services;

use getID3;
use Illuminate\Support\Facades\Log;

class MediaDurationInspector
{
    /**
     * Inspect audio/video file duration in seconds and format information.
     * Works with pure PHP without requiring FFmpeg/FFprobe.
     *
     * @param string $filePath Absolute path on disk
     * @return array{valid: bool, duration_seconds: int, format: string|null, error: string|null}
     */
    public function inspect(string $filePath): array
    {
        if (!file_exists($filePath) || filesize($filePath) === 0) {
            return [
                'valid' => false,
                'duration_seconds' => 0,
                'format' => null,
                'error' => 'الملف غير موجود أو فارغ على الخادم.',
            ];
        }

        try {
            $getID3 = new getID3();
            // Disable unnecessary tag writing modules for fast read
            $getID3->option_tag_id3v1 = true;
            $getID3->option_tag_id3v2 = true;
            $getID3->option_tag_lyrics3 = false;
            $getID3->option_tag_apetag = false;
            $getID3->option_tags_html = false;

            $info = $getID3->analyze($filePath);

            $playtime = isset($info['playtime_seconds']) ? (float) $info['playtime_seconds'] : 0.0;
            $durationSeconds = (int) max(0, round($playtime));

            $fileFormat = $info['fileformat'] ?? ($info['audio']['dataformat'] ?? null);

            // If playtime is 0 or error returned
            if ($durationSeconds <= 0 && !empty($info['error'])) {
                Log::warning("getID3 could not determine playtime for {$filePath}", [
                    'errors' => $info['error'] ?? [],
                ]);

                return [
                    'valid' => false,
                    'duration_seconds' => 0,
                    'format' => $fileFormat,
                    'error' => 'تعذر قراءة الترويسة الصوتية للملف. قد يكون الملف تالفاً أو بصيغة غير مدعومة.',
                ];
            }

            return [
                'valid' => true,
                'duration_seconds' => $durationSeconds,
                'format' => $fileFormat,
                'error' => null,
            ];
        } catch (\Throwable $e) {
            Log::error("MediaDurationInspector exception on {$filePath}: " . $e->getMessage());

            return [
                'valid' => false,
                'duration_seconds' => 0,
                'format' => null,
                'error' => 'حدث استثناء أثناء فحص الترويسة الصوتية: ' . $e->getMessage(),
            ];
        }
    }
}
