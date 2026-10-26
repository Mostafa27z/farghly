<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transcript extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'youtube_id',
        'video_url',
        'title',
        'channel_name',
        'thumbnail_url',
        'duration_seconds',
        'language',
        'segments',
        'full_text',
        'summary_html',
        'summary_text',
        'summary_style',
        'summary_prompt',
        'summary_generated_at',
        'proofread_html',
        'proofread_text',
        'proofread_generated_at',
    ];

    protected $casts = [
        'segments' => 'array',
        'duration_seconds' => 'integer',
        'summary_generated_at' => 'datetime',
        'proofread_generated_at' => 'datetime',
    ];

    /**
     * Tenant workspace that owns this transcript.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * User who initiated this transcript.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate standard SubRip Subtitle (.SRT) format.
     */
    public function toSrt(): string
    {
        $segments = $this->segments ?? [];
        $output = '';

        foreach ($segments as $idx => $segment) {
            $num = $idx + 1;
            $start = $this->formatSrtTime($segment['offset_seconds'] ?? 0);
            $end = $this->formatSrtTime($segment['end_seconds'] ?? (($segment['offset_seconds'] ?? 0) + ($segment['duration_seconds'] ?? 2)));
            $text = trim($segment['text'] ?? '');

            $output .= "{$num}\n{$start} --> {$end}\n{$text}\n\n";
        }

        return trim($output);
    }

    /**
     * Generate standard WebVTT (.VTT) format.
     */
    public function toVtt(): string
    {
        $segments = $this->segments ?? [];
        $output = "WEBVTT - {$this->title}\n\n";

        foreach ($segments as $idx => $segment) {
            $num = $idx + 1;
            $start = $this->formatVttTime($segment['offset_seconds'] ?? 0);
            $end = $this->formatVttTime($segment['end_seconds'] ?? (($segment['offset_seconds'] ?? 0) + ($segment['duration_seconds'] ?? 2)));
            $text = trim($segment['text'] ?? '');

            $output .= "{$num}\n{$start} --> {$end}\n{$text}\n\n";
        }

        return trim($output);
    }

    protected function formatSrtTime(float $seconds): string
    {
        $s = floor($seconds);
        $ms = floor(($seconds - $s) * 1000);
        $hrs = floor($s / 3600);
        $mins = floor(($s % 3600) / 60);
        $secs = $s % 60;

        return sprintf('%02d:%02d:%02d,%03d', $hrs, $mins, $secs, $ms);
    }

    protected function formatVttTime(float $seconds): string
    {
        $s = floor($seconds);
        $ms = floor(($seconds - $s) * 1000);
        $hrs = floor($s / 3600);
        $mins = floor(($s % 3600) / 60);
        $secs = $s % 60;

        return sprintf('%02d:%02d:%02d.%03d', $hrs, $mins, $secs, $ms);
    }
}
