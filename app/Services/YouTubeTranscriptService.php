<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YouTubeTranscriptService
{
    protected const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    protected const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
    protected const INNERTUBE_CLIENT_VERSION = '20.10.38';

    /** Diagnostic info collected during the last extract() call. */
    public array $diagnostics = [];

    /**
     * Extract transcript and video metadata using 100% Native PHP.
     * Works seamlessly on Windows, VPS, and Shared Hosting (zero Node.js required).
     *
     * @param string $urlOrId
     * @param string|null $preferredLang
     * @return array
     */
    public function extract(string $urlOrId, ?string $preferredLang = 'ar'): array
    {
        $videoId = $this->extractVideoId($urlOrId);

        if (!$videoId) {
            return [
                'success' => false,
                'code' => 'INVALID_URL',
                'message_ar' => 'رابط يوتيوب المدخل غير صالح. يرجى التأكد من الرابط.',
                'message_en' => 'Invalid YouTube URL or Video ID provided.',
            ];
        }

        $this->diagnostics = [];

        // 1. Fetch Caption Tracks via InnerTube API (Primary) or WebPage HTML (Fallback)
        $captionTracks = $this->fetchCaptionTracksViaInnerTube($videoId);

        if (empty($captionTracks)) {
            $captionTracks = $this->fetchCaptionTracksViaWebPage($videoId);
        }

        if (empty($captionTracks)) {
            // PO-token-free path via the watch-page transcript panel
            if ($viaPanel = $this->extractViaGetTranscript($videoId)) {
                return $viaPanel;
            }

            // Optional third-party fallback (works from blocked datacenter IPs)
            $fallback = $this->extractViaFallbackApi($videoId);
            if ($fallback) {
                return $fallback;
            }

            Log::warning('YouTube transcript: no caption tracks found', [
                'video_id' => $videoId,
                'diagnostics' => $this->diagnostics,
            ]);

            if ($this->wasBlockedByYouTube()) {
                return [
                    'success' => false,
                    'code' => 'YOUTUBE_BLOCKED',
                    'message_ar' => 'يوتيوب يمنع الطلبات القادمة من عنوان IP الخاص بالسيرفر (حماية ضد الروبوتات). يرجى ضبط بروكسي أو مفتاح خدمة بديلة في إعدادات الخادم.',
                    'message_en' => 'YouTube is blocking requests from this server IP (bot protection). Configure a proxy or fallback API key.',
                ];
            }

            return [
                'success' => false,
                'code' => 'TRANSCRIPTS_DISABLED',
                'message_ar' => 'عذراً، هذا الفيديو لا يحتوي على تفريغ نصي أو ترجمة متاحة على يوتيوب.',
                'message_en' => 'No transcripts available or captions disabled on this video.',
            ];
        }

        // 2. Select track (prefer Arabic if available, else first track)
        $selectedTrack = $this->selectTrack($captionTracks, $preferredLang);

        if (!$selectedTrack || empty($selectedTrack['baseUrl'])) {
            return [
                'success' => false,
                'code' => 'NO_SUITABLE_TRACK',
                'message_ar' => 'تعذر العثور على مسار تفريغ صالح لهذا الفيديو.',
                'message_en' => 'Unable to locate a valid caption track.',
            ];
        }

        // 3. Fetch TimedText XML
        $xmlBody = $this->fetchTimedTextXml($selectedTrack['baseUrl']);

        if (empty($xmlBody)) {
            // timedtext is withheld without a PO token; try the transcript panel endpoint instead
            if ($viaPanel = $this->extractViaGetTranscript($videoId)) {
                return $viaPanel;
            }

            if ($fallback = $this->extractViaFallbackApi($videoId)) {
                return $fallback;
            }

            Log::warning('YouTube transcript: timedtext empty', ['video_id' => $videoId, 'diagnostics' => $this->diagnostics]);

            return [
                'success' => false,
                'code' => 'EMPTY_TIMEDTEXT',
                'message_ar' => 'فشل في استلام بيانات النص من خوادم يوتيوب.',
                'message_en' => 'YouTube timedtext returned empty response.',
            ];
        }

        // 4. Parse Segments from XML
        $segmentsData = $this->parseTranscriptXml($xmlBody, $selectedTrack['languageCode'] ?? 'ar');

        if (empty($segmentsData['segments'])) {
            return [
                'success' => false,
                'code' => 'EMPTY_TRANSCRIPT',
                'message_ar' => 'لم يتم العثور على نصوص مقروءة داخل ملف الترجمة.',
                'message_en' => 'No readable text entries found in transcript.',
            ];
        }

        $videoUrl = "https://www.youtube.com/watch?v={$videoId}";

        // 5. Enrich with Video Metadata via oEmbed API
        $meta = $this->fetchMetadata($videoUrl, $videoId);

        return [
            'success' => true,
            'video_id' => $videoId,
            'video_url' => $videoUrl,
            'title' => $meta['title'] ?? "فيديو يوتيوب ({$videoId})",
            'channel_name' => $meta['author_name'] ?? 'قناة يوتيوب',
            'thumbnail_url' => $meta['thumbnail_url'] ?? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
            'language' => $selectedTrack['languageCode'] ?? 'ar',
            'segment_count' => count($segmentsData['segments']),
            'duration_seconds' => $segmentsData['duration_seconds'],
            'duration_formatted' => $this->formatTimestamp($segmentsData['duration_seconds']),
            'full_text' => $segmentsData['full_text'],
            'segments' => $segmentsData['segments'],
        ];
    }

    /**
     * Build an HTTP client honoring optional proxy / cookie config.
     */
    protected function http(int $timeout = 15): PendingRequest
    {
        $req = Http::timeout($timeout)->withHeaders([
            // Pre-accepted EU consent so YouTube doesn't return a consent interstitial
            'Cookie' => 'CONSENT=YES+1; SOCS=CAI;' . (config('services.youtube.cookies') ? ' ' . config('services.youtube.cookies') : ''),
        ]);

        if ($proxy = config('services.youtube.proxy')) {
            $req = $req->withOptions(['proxy' => $proxy]);
        }

        return $req;
    }

    protected function wasBlockedByYouTube(): bool
    {
        foreach ($this->diagnostics as $d) {
            $status = strtoupper($d['playability_status'] ?? '');
            $reason = strtolower($d['reason'] ?? '');
            $http = (int) ($d['http_status'] ?? 0);
            if (
                in_array($status, ['LOGIN_REQUIRED'], true)
                || str_contains($reason, 'bot')
                || str_contains($reason, 'sign in')
                || in_array($http, [403, 429], true)
                || !empty($d['captcha'])
                || !empty($d['error'])
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch caption tracks via YouTube InnerTube, trying several client identities.
     */
    protected function fetchCaptionTracksViaInnerTube(string $videoId): array
    {
        $clients = [
            [
                'name' => 'ANDROID',
                'ua' => 'com.google.android.youtube/' . self::INNERTUBE_CLIENT_VERSION . ' (Linux; U; Android 14)',
                'client' => ['clientName' => 'ANDROID', 'clientVersion' => self::INNERTUBE_CLIENT_VERSION, 'androidSdkVersion' => 34, 'hl' => 'en'],
            ],
            [
                'name' => 'IOS',
                'ua' => 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)',
                'client' => ['clientName' => 'IOS', 'clientVersion' => '20.10.4', 'deviceModel' => 'iPhone16,2', 'hl' => 'en'],
            ],
            [
                'name' => 'TV_EMBEDDED',
                'ua' => self::USER_AGENT,
                'client' => ['clientName' => 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', 'clientVersion' => '2.0', 'hl' => 'en'],
                'third_party' => ['embedUrl' => 'https://www.youtube.com/watch?v=' . $videoId],
            ],
            [
                'name' => 'WEB',
                'ua' => self::USER_AGENT,
                'client' => ['clientName' => 'WEB', 'clientVersion' => '2.20250101.00.00', 'hl' => 'en'],
            ],
        ];

        foreach ($clients as $c) {
            $diag = ['client' => $c['name']];

            try {
                $context = ['client' => $c['client']];
                if (!empty($c['third_party'])) {
                    $context['thirdParty'] = $c['third_party'];
                }

                $response = $this->http()
                    ->withHeaders(['Content-Type' => 'application/json', 'User-Agent' => $c['ua']])
                    ->post(self::INNERTUBE_API_URL, [
                        'context' => $context,
                        'videoId' => $videoId,
                        'contentCheckOk' => true,
                        'racyCheckOk' => true,
                    ]);

                $diag['http_status'] = $response->status();

                if ($response->successful()) {
                    $data = $response->json();
                    $diag['playability_status'] = $data['playabilityStatus']['status'] ?? null;
                    $diag['reason'] = $data['playabilityStatus']['reason'] ?? null;

                    $tracks = $data['captions']['playerCaptionsTracklistRenderer']['captionTracks'] ?? [];
                    if (is_array($tracks) && !empty($tracks)) {
                        $this->diagnostics[] = $diag + ['tracks' => count($tracks)];
                        return $tracks;
                    }
                }
            } catch (\Throwable $e) {
                $diag['error'] = $e->getMessage();
                Log::warning("InnerTube caption fetch failed ({$c['name']}): {$e->getMessage()}");
            }

            $this->diagnostics[] = $diag;
        }

        return [];
    }

    /**
     * Fallback: Fetch caption tracks by scraping YouTube video webpage HTML.
     */
    protected function fetchCaptionTracksViaWebPage(string $videoId): array
    {
        $diag = ['client' => 'WEBPAGE'];

        try {
            $response = $this->http()
                ->withHeaders([
                    'User-Agent' => self::USER_AGENT,
                    'Accept-Language' => 'ar,en;q=0.9',
                ])
                ->get("https://www.youtube.com/watch?v={$videoId}");

            $diag['http_status'] = $response->status();
            $html = $response->body();

            if (str_contains($html, 'g-recaptcha') || str_contains($html, '/sorry/')) {
                $diag['captcha'] = true;
            }

            if ($response->successful()) {
                // Regex for captionTracks in ytInitialPlayerResponse
                if (preg_match('/"captionTracks":\s*(\[.*?\])/s', $html, $matches)) {
                    $tracks = json_decode($matches[1], true);
                    if (is_array($tracks) && !empty($tracks)) {
                        $this->diagnostics[] = $diag + ['tracks' => count($tracks)];
                        return $tracks;
                    }
                }

                if (preg_match('/"playabilityStatus":\{"status":"([A-Z_]+)"(?:,"reason":"([^"]*)")?/', $html, $m)) {
                    $diag['playability_status'] = $m[1];
                    $diag['reason'] = $m[2] ?? null;
                }
            }
        } catch (\Throwable $e) {
            $diag['error'] = $e->getMessage();
            Log::warning("Webpage caption fetch failed: {$e->getMessage()}");
        }

        $this->diagnostics[] = $diag;

        return [];
    }

    /**
     * Build SAPISIDHASH auth headers from the configured cookie string (needed for logged-in WEB requests).
     */
    protected function authHeaders(): array
    {
        $headers = ['Origin' => 'https://www.youtube.com', 'X-Origin' => 'https://www.youtube.com'];
        $cookies = (string) config('services.youtube.cookies');

        if ($cookies !== '' && preg_match('/(?:^|;\s*)(?:SAPISID|__Secure-3PAPISID)=([^;]+)/', $cookies, $m)) {
            $ts = time();
            $hash = sha1($ts . ' ' . trim($m[1]) . ' https://www.youtube.com');
            $headers['Authorization'] = "SAPISIDHASH {$ts}_{$hash}";
            $headers['X-Goog-AuthUser'] = '0';
        }

        return $headers;
    }

    /**
     * Fetch transcript through the watch-page "Show transcript" endpoint (youtubei/v1/get_transcript).
     * This path does not require a PO token, unlike the timedtext baseUrl.
     */
    protected function extractViaGetTranscript(string $videoId): ?array
    {
        $diag = ['client' => 'GET_TRANSCRIPT'];
        $videoUrl = "https://www.youtube.com/watch?v={$videoId}";

        try {
            $page = $this->http()
                ->withHeaders(['User-Agent' => self::USER_AGENT, 'Accept-Language' => 'en-US,en;q=0.9'])
                ->get($videoUrl);

            $html = $page->body();
            $diag['http_status'] = $page->status();

            if (!preg_match('/"getTranscriptEndpoint":\{"params":"([^"]+)"/', $html, $pm)) {
                $diag['reason'] = 'no getTranscriptEndpoint on page';
                $this->diagnostics[] = $diag;
                return null;
            }

            $clientVersion = '2.20250101.00.00';
            if (preg_match('/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/', $html, $cv)) {
                $clientVersion = $cv[1];
            }
            $visitorData = null;
            if (preg_match('/"VISITOR_DATA":"([^"]+)"/', $html, $vd)) {
                $visitorData = $vd[1];
            }

            $client = ['clientName' => 'WEB', 'clientVersion' => $clientVersion, 'hl' => 'en'];
            if ($visitorData) {
                $client['visitorData'] = $visitorData;
            }

            $response = $this->http(20)
                ->withHeaders(array_merge([
                    'Content-Type' => 'application/json',
                    'User-Agent' => self::USER_AGENT,
                    'X-Youtube-Client-Name' => '1',
                    'X-Youtube-Client-Version' => $clientVersion,
                ], $this->authHeaders()))
                ->post('https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false', [
                    'context' => ['client' => $client],
                    'params' => $pm[1],
                ]);

            $diag['http_status'] = $response->status();
            $data = $response->json() ?? [];

            $initial = $data['actions'][0]['updateEngagementPanelAction']['content']['transcriptRenderer']['content']
                ['transcriptSearchPanelRenderer']['body']['transcriptSegmentListRenderer']['initialSegments'] ?? [];

            if (empty($initial)) {
                $diag['reason'] = 'empty segments: ' . substr($response->body(), 0, 120);
                $this->diagnostics[] = $diag;
                return null;
            }

            $segments = [];
            $texts = [];
            $maxEnd = 0;
            $i = 1;
            foreach ($initial as $item) {
                $r = $item['transcriptSegmentRenderer'] ?? null;
                if (!$r) {
                    continue;
                }
                $text = '';
                foreach (($r['snippet']['runs'] ?? []) as $run) {
                    $text .= $run['text'] ?? '';
                }
                $text = $this->cleanTranscriptText($text);
                if ($text === '') {
                    continue;
                }
                $start = round(((float) ($r['startMs'] ?? 0)) / 1000, 2);
                $end = round(((float) ($r['endMs'] ?? 0)) / 1000, 2);
                $maxEnd = max($maxEnd, $end);
                $texts[] = $text;
                $segments[] = [
                    'index' => $i++,
                    'text' => $text,
                    'offset_seconds' => $start,
                    'duration_seconds' => round(max($end - $start, 0), 2),
                    'end_seconds' => $end,
                    'timestamp_formatted' => $this->formatTimestamp($start),
                ];
            }

            if (empty($segments)) {
                $this->diagnostics[] = $diag + ['reason' => 'segments had no text'];
                return null;
            }

            $this->diagnostics[] = $diag + ['tracks' => count($segments)];
            $meta = $this->fetchMetadata($videoUrl, $videoId);

            return [
                'success' => true,
                'video_id' => $videoId,
                'video_url' => $videoUrl,
                'title' => $meta['title'] ?? "فيديو يوتيوب ({$videoId})",
                'channel_name' => $meta['author_name'] ?? 'قناة يوتيوب',
                'thumbnail_url' => $meta['thumbnail_url'] ?? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
                'language' => 'ar',
                'segment_count' => count($segments),
                'duration_seconds' => (int) round($maxEnd),
                'duration_formatted' => $this->formatTimestamp($maxEnd),
                'full_text' => implode(' ', $texts),
                'segments' => $segments,
            ];
        } catch (\Throwable $e) {
            $diag['error'] = $e->getMessage();
            $this->diagnostics[] = $diag;
            Log::warning("get_transcript failed: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Optional fallback through Supadata API (set SUPADATA_API_KEY). Works from blocked datacenter IPs.
     */
    protected function extractViaFallbackApi(string $videoId): ?array
    {
        $key = config('services.youtube.fallback_api_key');
        if (!$key) {
            return null;
        }

        $videoUrl = "https://www.youtube.com/watch?v={$videoId}";

        try {
            $response = Http::timeout(60)
                ->withHeaders(['x-api-key' => $key])
                ->get('https://api.supadata.ai/v1/youtube/transcript', ['url' => $videoUrl, 'text' => 'false']);

            if (!$response->successful()) {
                Log::warning('Fallback transcript API failed', ['status' => $response->status(), 'body' => $response->body()]);
                return null;
            }

            $data = $response->json();
            $items = $data['content'] ?? [];
            if (!is_array($items) || empty($items)) {
                return null;
            }

            $segments = [];
            $texts = [];
            $maxEnd = 0;
            $i = 1;
            foreach ($items as $item) {
                $text = $this->cleanTranscriptText((string) ($item['text'] ?? ''));
                if ($text === '') {
                    continue;
                }
                $start = round(((float) ($item['offset'] ?? 0)) / 1000, 2);
                $dur = round(((float) ($item['duration'] ?? 0)) / 1000, 2);
                $end = round($start + $dur, 2);
                $maxEnd = max($maxEnd, $end);
                $texts[] = $text;
                $segments[] = [
                    'index' => $i++,
                    'text' => $text,
                    'offset_seconds' => $start,
                    'duration_seconds' => $dur,
                    'end_seconds' => $end,
                    'timestamp_formatted' => $this->formatTimestamp($start),
                ];
            }

            if (empty($segments)) {
                return null;
            }

            $meta = $this->fetchMetadata($videoUrl, $videoId);

            return [
                'success' => true,
                'video_id' => $videoId,
                'video_url' => $videoUrl,
                'title' => $meta['title'] ?? "فيديو يوتيوب ({$videoId})",
                'channel_name' => $meta['author_name'] ?? 'قناة يوتيوب',
                'thumbnail_url' => $meta['thumbnail_url'] ?? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
                'language' => $data['lang'] ?? 'ar',
                'segment_count' => count($segments),
                'duration_seconds' => (int) round($maxEnd),
                'duration_formatted' => $this->formatTimestamp($maxEnd),
                'full_text' => implode(' ', $texts),
                'segments' => $segments,
            ];
        } catch (\Throwable $e) {
            Log::warning("Fallback transcript API exception: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Select preferred caption track (Arabic first, or preferred language).
     */
    protected function selectTrack(array $captionTracks, ?string $preferredLang): ?array
    {
        // 1. Search for preferred language (e.g. 'ar')
        if ($preferredLang) {
            foreach ($captionTracks as $track) {
                if (($track['languageCode'] ?? '') === $preferredLang) {
                    return $track;
                }
            }
        }

        // 2. Search for any Arabic dialect
        foreach ($captionTracks as $track) {
            $code = strtolower($track['languageCode'] ?? '');
            if (str_starts_with($code, 'ar')) {
                return $track;
            }
        }

        // 3. Fall back to the first available track
        return $captionTracks[0] ?? null;
    }

    /**
     * Fetch timedtext XML from the caption track baseUrl.
     */
    protected function fetchTimedTextXml(string $baseUrl): ?string
    {
        $base = preg_replace('/&fmt=[^&]*/', '', $baseUrl);

        $variants = [
            ['label' => 'asis', 'url' => $baseUrl, 'ua' => self::USER_AGENT],
            ['label' => 'srv3', 'url' => $base . '&fmt=srv3', 'ua' => self::USER_AGENT],
            ['label' => 'json3', 'url' => $base . '&fmt=json3', 'ua' => self::USER_AGENT],
            ['label' => 'classic', 'url' => $base, 'ua' => 'com.google.android.youtube/' . self::INNERTUBE_CLIENT_VERSION . ' (Linux; U; Android 14)'],
        ];

        foreach ($variants as $v) {
            $diag = ['client' => 'TIMEDTEXT:' . $v['label']];

            try {
                $response = $this->http(20)
                    ->withHeaders([
                        'User-Agent' => $v['ua'],
                        'Accept-Language' => 'en-US,en;q=0.9',
                        'Referer' => 'https://www.youtube.com/',
                    ])
                    ->get($v['url']);

                $body = $response->body();
                $diag['http_status'] = $response->status();
                $diag['reason'] = 'bytes=' . strlen($body);

                if ($response->successful() && trim($body) !== '') {
                    // Convert json3 into classic <text> XML so the existing parser can consume it
                    if ($v['label'] === 'json3') {
                        $json = json_decode($body, true);
                        $xml = '';
                        foreach (($json['events'] ?? []) as $ev) {
                            if (empty($ev['segs'])) {
                                continue;
                            }
                            $text = '';
                            foreach ($ev['segs'] as $seg) {
                                $text .= $seg['utf8'] ?? '';
                            }
                            $text = trim($text);
                            if ($text === '') {
                                continue;
                            }
                            $start = ($ev['tStartMs'] ?? 0) / 1000;
                            $dur = ($ev['dDurationMs'] ?? 0) / 1000;
                            $xml .= '<text start="' . $start . '" dur="' . $dur . '">' . htmlspecialchars($text, ENT_XML1) . '</text>';
                        }
                        $body = $xml;
                    }

                    if (trim($body) !== '') {
                        $this->diagnostics[] = $diag + ['tracks' => 1];
                        return $body;
                    }
                }
            } catch (\Throwable $e) {
                $diag['error'] = $e->getMessage();
                Log::warning("TimedText fetch failed ({$v['label']}): {$e->getMessage()}");
            }

            $this->diagnostics[] = $diag;
        }

        return null;
    }


    /**
     * Parse transcript XML (supports modern srv3 format <p t="..." d="..."> and classic <text start="..." dur="...">).
     */
    protected function parseTranscriptXml(string $xml, string $lang): array
    {
        $segments = [];
        $fullTextParts = [];
        $maxEndTime = 0;
        $index = 1;

        // 1. Check srv3 format: <p t="startMs" d="durMs">...</p>
        if (preg_match_all('/<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/', $xml, $matches, PREG_SET_ORDER)) {
            $prevText = '';

            foreach ($matches as $m) {
                $startMs = (int) $m[1];
                $durMs = (int) $m[2];
                $rawText = strip_tags($m[3]);
                $cleanText = $this->cleanTranscriptText($rawText);

                if (empty($cleanText)) {
                    continue;
                }

                // Avoid immediate duplicates
                if ($cleanText === $prevText) {
                    continue;
                }
                $prevText = $cleanText;

                $offsetSec = round($startMs / 1000, 2);
                $durationSec = round($durMs / 1000, 2);
                $endSec = round(($startMs + $durMs) / 1000, 2);

                if ($endSec > $maxEndTime) {
                    $maxEndTime = $endSec;
                }

                $fullTextParts[] = $cleanText;

                $segments[] = [
                    'index' => $index++,
                    'text' => $cleanText,
                    'offset_seconds' => $offsetSec,
                    'duration_seconds' => $durationSec,
                    'end_seconds' => $endSec,
                    'timestamp_formatted' => $this->formatTimestamp($offsetSec),
                ];
            }
        }

        // 2. Fallback to classic format: <text start="s" dur="s">content</text>
        if (empty($segments) && preg_match_all('/<text\s+start="([^"]*)"\s+dur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/', $xml, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                $offsetSec = round((float) $m[1], 2);
                $durationSec = round((float) $m[2], 2);
                $cleanText = $this->cleanTranscriptText($m[3]);

                if (empty($cleanText)) {
                    continue;
                }

                $endSec = round($offsetSec + $durationSec, 2);
                if ($endSec > $maxEndTime) {
                    $maxEndTime = $endSec;
                }

                $fullTextParts[] = $cleanText;

                $segments[] = [
                    'index' => $index++,
                    'text' => $cleanText,
                    'offset_seconds' => $offsetSec,
                    'duration_seconds' => $durationSec,
                    'end_seconds' => $endSec,
                    'timestamp_formatted' => $this->formatTimestamp($offsetSec),
                ];
            }
        }

        return [
            'duration_seconds' => (int) round($maxEndTime),
            'full_text' => implode(' ', $fullTextParts),
            'segments' => $segments,
        ];
    }

    /**
     * Clean and decode HTML entities in transcript text.
     */
    protected function cleanTranscriptText(string $text): string
    {
        $decoded = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $cleaned = preg_replace('/\s+/', ' ', $decoded);
        return trim($cleaned);
    }

    /**
     * Extract 11-character YouTube video ID.
     */
    public function extractVideoId(string $urlOrId): ?string
    {
        $trimmed = trim($urlOrId);

        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $trimmed)) {
            return $trimmed;
        }

        $patterns = [
            '/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/',
            '/youtube\.com\/live\/([\w-]{11})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $trimmed, $match)) {
                return $match[1];
            }
        }

        return null;
    }

    /**
     * Format seconds into MM:SS or HH:MM:SS.
     */
    protected function formatTimestamp(float|int $seconds): string
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

    /**
     * Fetch YouTube oEmbed metadata (Title, Author, Thumbnail).
     */
    protected function fetchMetadata(string $videoUrl, string $videoId): array
    {
        try {
            $response = Http::timeout(6)->get('https://www.youtube.com/oembed', [
                'url' => $videoUrl,
                'format' => 'json',
            ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            Log::warning("oEmbed metadata fetch failed for {$videoUrl}: {$e->getMessage()}");
        }

        return [
            'title' => "فيديو يوتيوب ({$videoId})",
            'author_name' => 'قناة يوتيوب',
            'thumbnail_url' => "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg",
        ];
    }
}
