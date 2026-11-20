<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AudioTranscriptionService
{
    protected ?string $groqKey;
    protected string $groqModel;
    protected ?string $geminiKey;

    public function __construct()
    {
        $this->groqKey = config('services.groq.key');
        $this->groqModel = config('services.groq.model') ?: 'whisper-large-v3-turbo';
        $this->geminiKey = config('services.gemini.key');
    }

    /**
     * Transcribe an uploaded audio file using Groq Whisper (Primary) or Gemini (Fallback).
     *
     * @param UploadedFile|string $file File instance or absolute path on disk
     * @param string|null $preferredLanguage e.g. 'ar', 'en', or null for auto-detect
     * @param string|null $prompt Optional initial prompt to guide terminology
     * @return array
     */
    public function transcribe(UploadedFile|string $file, ?string $preferredLanguage = 'ar', ?string $prompt = null): array
    {
        $filePath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $originalName = $file instanceof UploadedFile ? $file->getClientOriginalName() : basename($file);

        if (!file_exists($filePath) || filesize($filePath) === 0) {
            return [
                'success' => false,
                'message_ar' => 'الملف الصوتي فارغ أو تعذر الوصول إليه على الخادم.',
                'message_en' => 'Audio file is empty or unreachable.',
            ];
        }

        $groqError = null;

        // 1. Try Groq Whisper (Fastest, cheapest, word/segment-level timestamps)
        if (!empty($this->groqKey)) {
            $result = $this->transcribeWithGroq($filePath, $originalName, $preferredLanguage, $prompt);
            if ($result['success']) {
                return $result;
            }

            $groqError = $result['message_ar'] ?? 'فشل الاتصال بخدمة Groq';
            Log::warning('Groq Whisper failed, attempting Gemini fallback', [
                'groq_error' => $groqError,
                'status_code' => $result['status_code'] ?? null,
            ]);

            // If rate limited by Groq, try Gemini fallback first before delaying
            if (!empty($result['is_rate_limited']) && !empty($this->geminiKey)) {
                $geminiResult = $this->transcribeWithGemini($filePath, $originalName, $preferredLanguage);
                if ($geminiResult['success']) {
                    return $geminiResult;
                }
                // If Gemini also failed, return the original rate-limited result so job can delay
                return $result;
            }
        } else {
            $groqError = 'مفتاح GROQ_API_KEY غير مضاف في ملف .env على الخادم';
            Log::info('Groq API key not set, using Gemini directly');
        }

        // 2. Fallback to Gemini if Groq is not configured or failed
        if (!empty($this->geminiKey)) {
            $geminiResult = $this->transcribeWithGemini($filePath, $originalName, $preferredLanguage);
            if ($geminiResult['success']) {
                return $geminiResult;
            }

            $geminiError = $geminiResult['message_ar'] ?? 'فشل التفريغ عبر Gemini';

            return [
                'success' => false,
                'message_ar' => "تعذر التفريغ: Groq ({$groqError}) | Gemini ({$geminiError})",
                'message_en' => "Transcription failed: Groq ({$groqError}) | Gemini ({$geminiError})",
            ];
        }

        return [
            'success' => false,
            'message_ar' => "فشل التفريغ الصوتي عبر Groq: {$groqError}. يرجى ضبط مفتاح GROQ_API_KEY أو GEMINI_API_KEY في .env.",
            'message_en' => "Groq transcription failed: {$groqError}. Please configure GROQ_API_KEY or GEMINI_API_KEY in .env.",
        ];
    }

    /**
     * Transcribe using Groq Cloud API (whisper-large-v3-turbo).
     */
    protected function transcribeWithGroq(
        string $filePath,
        string $originalName,
        ?string $preferredLanguage,
        ?string $prompt
    ): array {
        try {
            $fileHandle = fopen($filePath, 'r');
            if (!$fileHandle) {
                return [
                    'success' => false,
                    'message_ar' => 'تعذر فتح الملف الصوتي للقراءة.',
                    'message_en' => 'Failed to read audio file handle.',
                ];
            }

            $endpoint = 'https://api.groq.com/openai/v1/audio/transcriptions';

            $request = Http::timeout(180)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->groqKey,
                ])
                ->attach('file', $fileHandle, $originalName);

            $payload = [
                'model' => $this->groqModel,
                'response_format' => 'verbose_json',
                'temperature' => '0.0',
            ];

            if (!empty($preferredLanguage) && $preferredLanguage !== 'auto') {
                $payload['language'] = $preferredLanguage;
            }

            if (!empty($prompt)) {
                $payload['prompt'] = $prompt;
            }

            $response = $request->post($endpoint, $payload);

            if (is_resource($fileHandle)) {
                fclose($fileHandle);
            }

            if (!$response->successful()) {
                $status = $response->status();
                $err = $response->json();
                $errMsg = $err['error']['message'] ?? ('HTTP ' . $status);
                Log::error('Groq transcription error', ['body' => $response->body(), 'status' => $status]);

                $retryAfter = (int) $response->header('Retry-After', 60);

                return [
                    'success' => false,
                    'status_code' => $status,
                    'is_rate_limited' => ($status === 429),
                    'retry_after' => max(15, $retryAfter),
                    'message_ar' => 'فشلت معالجة الصوت عبر Groq: ' . $errMsg,
                    'message_en' => 'Groq transcription error: ' . $errMsg,
                ];
            }

            $data = $response->json();
            $fullText = trim($data['text'] ?? '');
            $rawSegments = $data['segments'] ?? [];
            $durationSeconds = (int) round($data['duration'] ?? 0);

            $segments = [];
            foreach ($rawSegments as $idx => $seg) {
                $start = (float) ($seg['start'] ?? 0);
                $end = (float) ($seg['end'] ?? ($start + 2));
                $segments[] = [
                    'index' => $idx + 1,
                    'text' => trim($seg['text'] ?? ''),
                    'offset_seconds' => round($start, 2),
                    'duration_seconds' => round($end - $start, 2),
                    'timestamp_formatted' => $this->formatTimestamp($start),
                ];
            }

            // If no segments returned (very short file), synthesize one from full text
            if (empty($segments) && $fullText !== '') {
                $segments[] = [
                    'index' => 1,
                    'text' => $fullText,
                    'offset_seconds' => 0.0,
                    'duration_seconds' => (float) max(1, $durationSeconds),
                    'timestamp_formatted' => '00:00',
                ];
            }

            return [
                'success' => true,
                'source' => 'groq',
                'full_text' => $fullText,
                'duration_seconds' => $durationSeconds ?: (int) ceil(end($segments)['offset_seconds'] ?? 0),
                'language' => $data['language'] ?? $preferredLanguage ?? 'ar',
                'segments' => $segments,
            ];
        } catch (\Throwable $e) {
            Log::error('Groq transcription exception: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [
                'success' => false,
                'message_ar' => 'حدث استثناء أثناء الاتصال بخدمة Groq: ' . $e->getMessage(),
                'message_en' => 'Exception during Groq transcription: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fallback transcription using Gemini Multimodal Audio.
     * Uses inline base64 for files <= 20MB, and Gemini Files API for files > 20MB (up to 2GB).
     */
    public function transcribeWithGemini(string $filePath, string $originalName, ?string $preferredLanguage = 'ar'): array
    {
        $uploadedFileNameToDelete = null;

        try {
            $fileSize = filesize($filePath);

            $mimeType = mime_content_type($filePath) ?: 'audio/mp3';
            if (!str_starts_with($mimeType, 'audio/') && !str_starts_with($mimeType, 'video/')) {
                $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                $mimeType = match ($ext) {
                    'mp3' => 'audio/mp3',
                    'wav' => 'audio/wav',
                    'ogg', 'oga' => 'audio/ogg',
                    'm4a' => 'audio/m4a',
                    'aac' => 'audio/aac',
                    'flac' => 'audio/flac',
                    'webm' => 'audio/webm',
                    'mp4' => 'video/mp4',
                    default => 'audio/mp3',
                };
            }

            $model = config('services.gemini.model') ?: 'gemini-2.5-flash';
            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->geminiKey}";

            $langPrompt = ($preferredLanguage === 'en') ? 'باللغة الإنجليزية' : 'باللغة العربية بدقة تامة';
            $prompt = "قم بتفريغ هذا التسجيل الصوتي كلمة بكلمة {$langPrompt}.\n"
                . "قسّم الكلام إلى فقرات متتالية (كل فقرة 25-40 كلمة).\n"
                . "ابدأ كل فقرة بفاصل زمني تقديري بصيغة [MM:SS] مثل: [00:00] النص هنا.\n"
                . "أخرج النص المفرغ فقط دون أي تعليقات أو شروحات إضافية.";

            $contentsParts = [];

            if ($fileSize <= 20 * 1024 * 1024) {
                // Inline base64 (<20MB)
                $audioBase64 = base64_encode(file_get_contents($filePath));
                $contentsParts[] = [
                    'inlineData' => [
                        'mimeType' => $mimeType,
                        'data' => $audioBase64,
                    ],
                ];
            } else {
                // Large file (>20MB, up to 2GB) via Gemini Files API
                $fileUpload = $this->uploadToGeminiFiles($filePath, $originalName, $mimeType);
                if (!$fileUpload['success']) {
                    return [
                        'success' => false,
                        'message_ar' => 'فشل رفع الملف الكبير إلى Gemini Files API: ' . ($fileUpload['error'] ?? 'خطأ غير معروف'),
                        'message_en' => 'Gemini Files API upload failed: ' . ($fileUpload['error'] ?? 'Unknown error'),
                    ];
                }

                $uploadedFileNameToDelete = $fileUpload['file_name'];
                $contentsParts[] = [
                    'fileData' => [
                        'mimeType' => $mimeType,
                        'fileUri' => $fileUpload['file_uri'],
                    ],
                ];
            }

            $contentsParts[] = [
                'text' => $prompt,
            ];

            $response = Http::timeout(300)
                ->withoutVerifying()
                ->post($apiUrl, [
                    'contents' => [
                        [
                            'parts' => $contentsParts,
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini audio transcription failed', ['body' => $response->body()]);
                return [
                    'success' => false,
                    'message_ar' => 'فشل التفريغ عبر Gemini: ' . ($response->json()['error']['message'] ?? 'خطأ غير معروف'),
                    'message_en' => 'Gemini transcription failed: ' . ($response->json()['error']['message'] ?? 'Unknown error'),
                ];
            }

            $candidate = $response->json()['candidates'][0] ?? [];
            $text = '';
            foreach (($candidate['content']['parts'] ?? []) as $part) {
                $text .= $part['text'] ?? '';
            }

            $text = trim($text);
            if (empty($text)) {
                return [
                    'success' => false,
                    'message_ar' => 'لم يتم إرجاع أي نص مفرغ من الذكاء الاصطناعي.',
                    'message_en' => 'Empty transcription returned.',
                ];
            }

            // Estimate duration roughly from text words (average speech is 130 words per minute)
            $wordCount = count(preg_split('/\s+/u', $text));
            $estimatedDuration = (int) max(10, round(($wordCount / 130) * 60));

            // Split into paragraphs & parse any [MM:SS] timestamps
            $lines = array_filter(explode("\n", $text), fn ($p) => trim($p) !== '');
            $segments = [];
            $currentTime = 0.0;
            $step = count($lines) > 0 ? max(3.0, round($estimatedDuration / count($lines), 2)) : 10.0;
            $cleanFullTextLines = [];

            foreach ($lines as $idx => $line) {
                $line = trim($line);
                $offset = $currentTime;

                // Check for [MM:SS] or [HH:MM:SS] at the start of line
                if (preg_match('/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.*)$/u', $line, $matches)) {
                    if (!empty($matches[3])) {
                        $offset = ((int) $matches[1] * 3600) + ((int) $matches[2] * 60) + (int) $matches[3];
                    } else {
                        $offset = ((int) $matches[1] * 60) + (int) $matches[2];
                    }
                    $cleanText = trim($matches[4]);
                } else {
                    $cleanText = $line;
                }

                if ($cleanText === '') {
                    continue;
                }

                $cleanFullTextLines[] = $cleanText;

                $segments[] = [
                    'index' => count($segments) + 1,
                    'text' => $cleanText,
                    'offset_seconds' => round($offset, 2),
                    'duration_seconds' => round($step, 2),
                    'timestamp_formatted' => $this->formatTimestamp($offset),
                ];

                $currentTime = max($currentTime + $step, $offset + $step);
            }

            $finalDuration = max($estimatedDuration, (int) ceil($currentTime));
            $finalFullText = implode("\n\n", $cleanFullTextLines) ?: $text;

            return [
                'success' => true,
                'source' => 'gemini',
                'full_text' => $finalFullText,
                'duration_seconds' => $finalDuration,
                'language' => $preferredLanguage ?: 'ar',
                'segments' => $segments,
            ];
        } catch (\Throwable $e) {
            Log::error('Gemini audio transcription exception: ' . $e->getMessage());

            return [
                'success' => false,
                'message_ar' => 'حدث خطأ أثناء التفريغ الصوتي الاحتياطي عبر Gemini: ' . $e->getMessage(),
                'message_en' => 'Exception during Gemini fallback transcription: ' . $e->getMessage(),
            ];
        } finally {
            // Delete temporary Gemini file if one was uploaded
            if ($uploadedFileNameToDelete) {
                $this->deleteGeminiFile($uploadedFileNameToDelete);
            }
        }
    }

    /**
     * Upload large media file (>20MB up to 2GB) to Google Gemini Files API via Resumable Upload.
     */
    protected function uploadToGeminiFiles(string $filePath, string $originalName, string $mimeType): array
    {
        try {
            $fileSize = filesize($filePath);

            // Step 1: Initialize Resumable Upload Session
            $initResponse = Http::withoutVerifying()
                ->timeout(60)
                ->withHeaders([
                    'X-Goog-Upload-Protocol' => 'resumable',
                    'X-Goog-Upload-Command' => 'start',
                    'X-Goog-Upload-Header-Content-Length' => (string) $fileSize,
                    'X-Goog-Upload-Header-Content-Type' => $mimeType,
                    'Content-Type' => 'application/json',
                ])
                ->post("https://generativelanguage.googleapis.com/upload/v1beta/files?key={$this->geminiKey}", [
                    'file' => [
                        'display_name' => $originalName,
                    ],
                ]);

            if (!$initResponse->successful()) {
                return [
                    'success' => false,
                    'error' => 'HTTP ' . $initResponse->status() . ': ' . $initResponse->body(),
                ];
            }

            $uploadUrl = $initResponse->header('x-goog-upload-url');
            if (empty($uploadUrl)) {
                return [
                    'success' => false,
                    'error' => 'Missing x-goog-upload-url header from Gemini Files API.',
                ];
            }

            // Step 2: Stream File Binary to Upload URL
            $stream = fopen($filePath, 'r');
            $uploadResponse = Http::withoutVerifying()
                ->timeout(300)
                ->withHeaders([
                    'Content-Length' => (string) $fileSize,
                    'X-Goog-Upload-Offset' => '0',
                    'X-Goog-Upload-Command' => 'upload, finalize',
                ])
                ->withBody($stream, $mimeType)
                ->post($uploadUrl);

            if (is_resource($stream)) {
                fclose($stream);
            }

            if (!$uploadResponse->successful()) {
                return [
                    'success' => false,
                    'error' => 'HTTP ' . $uploadResponse->status() . ': ' . $uploadResponse->body(),
                ];
            }

            $fileInfo = $uploadResponse->json();
            $fileUri = $fileInfo['file']['uri'] ?? null;
            $fileName = $fileInfo['file']['name'] ?? null;

            if (!$fileUri || !$fileName) {
                return [
                    'success' => false,
                    'error' => 'Incomplete file metadata returned from Gemini Files API.',
                ];
            }

            return [
                'success' => true,
                'file_uri' => $fileUri,
                'file_name' => $fileName,
            ];
        } catch (\Throwable $e) {
            Log::error('Gemini Files API upload exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete temporary file from Gemini Files API.
     */
    protected function deleteGeminiFile(string $fileName): void
    {
        try {
            Http::withoutVerifying()
                ->timeout(15)
                ->delete("https://generativelanguage.googleapis.com/v1beta/{$fileName}?key={$this->geminiKey}");
        } catch (\Throwable $e) {
            Log::warning('Failed to delete Gemini file: ' . $e->getMessage());
        }
    }

    /**
     * Format seconds to mm:ss or hh:mm:ss.
     */
    protected function formatTimestamp(float $seconds): string
    {
        $s = (int) floor($seconds);
        $hrs = (int) floor($s / 3600);
        $mins = (int) floor(($s % 3600) / 60);
        $secs = $s % 60;

        if ($hrs > 0) {
            return sprintf('%02d:%02d:%02d', $hrs, $mins, $secs);
        }

        return sprintf('%02d:%02d', $mins, $secs);
    }
}
