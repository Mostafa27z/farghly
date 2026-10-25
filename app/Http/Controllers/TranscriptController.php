<?php

namespace App\Http\Controllers;

use App\Models\Transcript;
use App\Services\DocumentThemeService;
use App\Services\GeminiSummaryService;
use App\Services\YouTubeTranscriptService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TranscriptController extends Controller
{
    public function __construct(
        protected YouTubeTranscriptService $transcriptService,
        protected DocumentThemeService $themeService
    ) {}

    /**
     * Display a listing of workspace transcripts.
     */
    public function index(Request $request)
    {
        $tenant = $request->user()->currentTenant;

        $query = $tenant->transcripts()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('channel_name', 'like', "%{$search}%")
                  ->orWhere('full_text', 'like', "%{$search}%");
            });
        }

        $transcripts = $query->paginate(12)->withQueryString();

        return Inertia::render('transcripts/index', [
            'transcripts' => $transcripts,
            'tenant' => [
                'name' => $tenant->name,
                'plan_name' => $tenant->plan_name,
                'monthly_minutes_limit' => $tenant->monthly_minutes_limit,
                'monthly_minutes_used' => $tenant->monthly_minutes_used,
                'remaining_minutes' => $tenant->remainingMinutes(),
                'expires_at' => $tenant->expires_at?->format('Y-m-d'),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Extract transcript from YouTube URL and save to workspace.
     */
    public function store(Request $request)
    {
        if ($request->user()->isSales()) {
            abort(403, 'غير مصرح لحساب المبيعات باستخدام خدمة التفريغ.');
        }

        $request->validate([
            'url' => ['required', 'string', 'max:500'],
        ], [
            'url.required' => 'يرجى إدخال رابط فيديو يوتيوب صالح.',
        ]);

        $tenant = $request->user()->currentTenant;

        // Perform extraction via service
        $result = $this->transcriptService->extract($request->input('url'));

        if (!$result['success']) {
            return back()->withErrors([
                'url' => $result['message_ar'] ?? 'فشل في استخراج نص الفيديو من يوتيوب.',
            ]);
        }

        $durationSeconds = $result['duration_seconds'] ?? 0;

        // Verify quota
        if (!$tenant->canTranscribe($durationSeconds)) {
            return back()->withErrors([
                'url' => 'عذراً، رصيدك من الدقائق الشهرية غير كافٍ لتفريغ هذا الفيديو. المتبقي: ' . $tenant->remainingMinutes() . ' دقيقة.',
            ]);
        }

        // Save transcript
        $transcript = $tenant->transcripts()->create([
            'user_id' => $request->user()->id,
            'youtube_id' => $result['video_id'],
            'video_url' => $result['video_url'],
            'title' => $result['title'],
            'channel_name' => $result['channel_name'],
            'thumbnail_url' => $result['thumbnail_url'],
            'duration_seconds' => $durationSeconds,
            'language' => $result['language'] ?? 'ar',
            'segments' => $result['segments'] ?? [],
            'full_text' => $result['full_text'] ?? '',
        ]);

        // Record minutes used
        $tenant->recordUsage($durationSeconds);

        return redirect()->route('transcripts.show', $transcript->id)->with('success', 'تم استخراج وتفريغ نص الفيديو بنجاح!');
    }

    /**
     * Display a specific transcript.
     */
    public function show(Request $request, Transcript $transcript)
    {
        $tenant = $request->user()->currentTenant;

        // Enforce tenant authorization
        if ($transcript->tenant_id !== $tenant->id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الملف.');
        }

        $themes = $tenant->documentThemes()
            ->latest()
            ->get()
            ->map(function ($theme) {
                return [
                    'id' => $theme->id,
                    'name' => $theme->name,
                    'type' => $theme->type,
                    'is_default' => (bool) $theme->is_default,
                    'colors' => $theme->colors,
                    'logo_url' => $theme->getEmbeddableLogo(),
                ];
            });

        return Inertia::render('transcripts/show', [
            'transcript' => $transcript,
            'tenant' => [
                'name' => $tenant->name,
                'plan_name' => $tenant->plan_name,
                'remaining_minutes' => $tenant->remainingMinutes(),
            ],
            'themes' => $themes,
            'systemPresets' => DocumentThemeService::SYSTEM_PRESETS,
        ]);
    }

    /**
     * Export as SubRip Subtitle (.SRT)
     */
    public function exportSrt(Request $request, Transcript $transcript): StreamedResponse
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $srtContent = $transcript->toSrt();
        $filename = 'transcript_' . $transcript->youtube_id . '.srt';

        return response()->streamDownload(function () use ($srtContent) {
            echo "\xEF\xBB\xBF"; // UTF-8 BOM for Arabic support in editing software
            echo $srtContent;
        }, $filename, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }

    /**
     * Export as WebVTT (.VTT)
     */
    public function exportVtt(Request $request, Transcript $transcript): StreamedResponse
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $vttContent = $transcript->toVtt();
        $filename = 'transcript_' . $transcript->youtube_id . '.vtt';

        return response()->streamDownload(function () use ($vttContent) {
            echo "\xEF\xBB\xBF";
            echo $vttContent;
        }, $filename, [
            'Content-Type' => 'text/vtt; charset=utf-8',
        ]);
    }

    /**
     * Export as plain text (.TXT)
     */
    public function exportTxt(Request $request, Transcript $transcript): StreamedResponse
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $txtContent = $transcript->full_text;
        $filename = 'transcript_' . $transcript->youtube_id . '.txt';

        return response()->streamDownload(function () use ($txtContent) {
            echo "\xEF\xBB\xBF";
            echo $txtContent;
        }, $filename, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }

    /**
     * Generate or re-generate AI Summary for the transcript using Gemini.
     */
    public function summarize(Request $request, Transcript $transcript, GeminiSummaryService $gemini)
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $request->validate([
            'style' => ['nullable', 'string', 'in:executive,academic,corporate,meeting,custom'],
            'prompt' => ['nullable', 'string', 'max:1500'],
            'theme' => ['nullable', 'string', 'in:obsidian,navy,academic,minimal'],
        ]);

        $style = $request->input('style', 'executive');
        $customPrompt = $request->input('prompt');
        $theme = $request->input('theme', 'obsidian');

        $result = $gemini->generate($transcript, $style, $customPrompt, $theme);

        if (!$result['success']) {
            return back()->withErrors([
                'summary' => $result['message_ar'] ?? 'فشل في توليد الملخص عبر الذكاء الاصطناعي.',
            ]);
        }

        $transcript->update([
            'summary_html' => $result['summary_html'],
            'summary_text' => $result['plain_text'],
            'summary_style' => $style,
            'summary_prompt' => $customPrompt,
            'summary_generated_at' => now(),
        ]);

        return back()->with('success', 'تم توليد الملخص والمستند بنجاح بالذكاء الاصطناعي!');
    }

    /**
     * View and print full A4 document for PDF export.
     */
    public function document(Request $request, Transcript $transcript, GeminiSummaryService $gemini)
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        if (empty($transcript->summary_html)) {
            // Auto-generate executive summary if not created yet
            $res = $gemini->generate($transcript, 'executive', null, 'obsidian');
            if ($res['success']) {
                $transcript->update([
                    'summary_html' => $res['summary_html'],
                    'summary_text' => $res['plain_text'],
                    'summary_style' => 'executive',
                    'summary_generated_at' => now(),
                ]);
            }
        }

        $theme = $request->input('theme', 'default');
        $docHtml = $this->themeService->render($transcript, $theme);

        return response($docHtml)->header('Content-Type', 'text/html; charset=utf-8');
    }

    protected function authorizeTranscriptAccess(Request $request, Transcript $transcript): void
    {
        if ($transcript->tenant_id !== $request->user()->current_tenant_id) {
            abort(403);
        }
    }
}
