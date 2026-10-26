<?php

namespace App\Http\Controllers;

use App\Models\Transcript;
use App\Services\DocumentThemeService;
use App\Services\GeminiSummaryService;
use App\Services\WordExportService;
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
                'monthly_videos_limit' => $tenant->monthly_videos_limit ?: max(10, (int) round(($tenant->monthly_minutes_limit ?? 3000) / 20)),
                'monthly_videos_used' => $tenant->monthly_videos_used ?? 0,
                'remaining_videos' => $tenant->remainingVideos(),
                'monthly_minutes_limit' => $tenant->monthly_minutes_limit,
                'monthly_minutes_used' => $tenant->monthly_minutes_used,
                'remaining_minutes' => $tenant->remainingVideos(),
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

        // Verify quota (counted by number of videos)
        if (!$tenant->canTranscribe($durationSeconds)) {
            return back()->withErrors([
                'url' => 'عذراً، رصيدك من الفيديوهات الشهرية غير كافٍ لتفريغ هذا الفيديو. المتبقي: ' . $tenant->remainingVideos() . ' فيديو.',
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

        // Record 1 video used
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
                'monthly_videos_limit' => $tenant->monthly_videos_limit ?: max(10, (int) round(($tenant->monthly_minutes_limit ?? 3000) / 20)),
                'monthly_videos_used' => $tenant->monthly_videos_used ?? 0,
                'remaining_videos' => $tenant->remainingVideos(),
                'remaining_minutes' => $tenant->remainingVideos(),
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

        $type = $request->input('type', 'raw');
        if ($type === 'proofread' && !empty($transcript->proofread_text)) {
            $txtContent = $transcript->proofread_text;
            $filename = 'proofread_' . $transcript->youtube_id . '.txt';
        } else {
            $txtContent = $transcript->full_text;
            $filename = 'transcript_' . $transcript->youtube_id . '.txt';
        }

        return response()->streamDownload(function () use ($txtContent) {
            echo "\xEF\xBB\xBF";
            echo $txtContent;
        }, $filename, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }

    /**
     * Export as Word document (.DOCX)
     */
    public function exportDocx(
        Request $request,
        Transcript $transcript,
        WordExportService $wordService,
        GeminiSummaryService $gemini
    ) {
        $this->authorizeTranscriptAccess($request, $transcript);

        $type = $request->input('type', 'summary');
        if (!in_array($type, ['summary', 'proofread', 'transcript'], true)) {
            $type = 'summary';
        }

        if (!class_exists(\PhpOffice\PhpWord\PhpWord::class)) {
            return back()->withErrors([
                'error' => 'حزمة تصدير Word (PhpOffice\PhpWord) لم يتم تثبيتها بعد على السيرفر. يرجى تشغيل الأمر: composer install',
            ]);
        }

        // Auto-generate if summary or proofread is requested but not yet generated
        if ($type === 'proofread' && empty($transcript->proofread_html)) {
            $proofreadResult = $gemini->proofread($transcript);
            if ($proofreadResult['success']) {
                $transcript->update([
                    'proofread_html' => $proofreadResult['proofread_html'],
                    'proofread_text' => $proofreadResult['plain_text'],
                    'proofread_generated_at' => now(),
                ]);
            }
        } elseif ($type === 'summary' && empty($transcript->summary_html)) {
            $summaryResult = $gemini->generate($transcript, $transcript->summary_style ?? 'executive');
            if ($summaryResult['success']) {
                $transcript->update([
                    'summary_html' => $summaryResult['summary_html'],
                    'summary_text' => $summaryResult['plain_text'],
                    'summary_generated_at' => now(),
                ]);
            }
        }

        return $wordService->download($transcript, $type);
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
     * Generate full text linguistic proofreading and formatting using Gemini.
     */
    public function proofread(Request $request, Transcript $transcript, GeminiSummaryService $gemini)
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $request->validate([
            'prompt' => ['nullable', 'string', 'max:1500'],
        ]);

        $customPrompt = $request->input('prompt');

        $result = $gemini->proofread($transcript, $customPrompt);

        if (!$result['success']) {
            return back()->withErrors([
                'proofread' => $result['message_ar'] ?? 'فشل في التدقيق اللغوي للنص عبر الذكاء الاصطناعي.',
            ]);
        }

        $transcript->update([
            'proofread_html' => $result['proofread_html'],
            'proofread_text' => $result['plain_text'],
            'proofread_generated_at' => now(),
        ]);

        return back()->with('success', 'تم إنجاز التدقيق اللغوي للنص الكامل بنجاح!');
    }

    /**
     * View and print full A4 document for PDF export (Summary or Full Proofread).
     */
    public function document(Request $request, Transcript $transcript, GeminiSummaryService $gemini)
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $type = $request->input('type', 'summary'); // 'summary' or 'proofread'

        if ($type === 'proofread' && empty($transcript->proofread_html)) {
            // Auto-generate proofread if not generated yet
            $res = $gemini->proofread($transcript);
            if ($res['success']) {
                $transcript->update([
                    'proofread_html' => $res['proofread_html'],
                    'proofread_text' => $res['plain_text'],
                    'proofread_generated_at' => now(),
                ]);
            }
        } elseif ($type === 'summary' && empty($transcript->summary_html)) {
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
        $docHtml = $this->themeService->render($transcript, $theme, $type);

        return response($docHtml)->header('Content-Type', 'text/html; charset=utf-8');
    }

    protected function authorizeTranscriptAccess(Request $request, Transcript $transcript): void
    {
        if ($transcript->tenant_id !== $request->user()->current_tenant_id) {
            abort(403);
        }
    }
}
