<?php

namespace App\Http\Controllers;

use App\Models\DocumentTheme;
use App\Models\Transcript;
use App\Services\DocumentThemeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentThemeController extends Controller
{
    public function __construct(
        protected DocumentThemeService $themeService
    ) {}

    /**
     * Display the document themes & branding manager.
     */
    public function index(Request $request): Response
    {
        $tenant = $request->user()->currentTenant;
        if (!$tenant) {
            abort(403, 'لا يوجد مساحة عمل نشطة.');
        }

        $themes = $tenant->documentThemes()
            ->latest()
            ->get()
            ->map(function ($theme) {
                return [
                    'id' => $theme->id,
                    'name' => $theme->name,
                    'type' => $theme->type,
                    'colors' => $theme->colors,
                    'font_family' => $theme->font_family,
                    'header_text' => $theme->header_text,
                    'footer_text' => $theme->footer_text,
                    'logo_url' => $theme->getEmbeddableLogo(),
                    'is_default' => (bool) $theme->is_default,
                    'created_at' => $theme->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('themes/index', [
            'themes' => $themes,
            'systemPresets' => DocumentThemeService::SYSTEM_PRESETS,
            'availableFonts' => DocumentThemeService::AVAILABLE_FONTS,
            'sampleTemplate' => $this->themeService->getSampleHtmlTemplate(),
        ]);
    }

    /**
     * Store a newly created theme (Builder or Custom HTML).
     */
    public function store(Request $request)
    {
        $tenant = $request->user()->currentTenant;
        if (!$tenant) {
            abort(403);
        }

        $type = $request->input('type', 'builder');

        if ($type === 'custom_html') {
            $request->validate([
                'name' => 'required|string|max:120',
                'html_file' => 'required|file|max:2048', // up to 2MB HTML
                'logo' => 'nullable|image|max:2048',
                'header_text' => 'nullable|string|max:255',
                'footer_text' => 'nullable|string|max:255',
                'is_default' => 'nullable|boolean',
            ], [
                'name.required' => 'يرجى إدخال اسم القالب.',
                'html_file.required' => 'يرجى اختيار ملف HTML.',
                'html_file.file' => 'الملف المرفوع غير صالح.',
            ]);

            try {
                $this->themeService->createHtmlTheme(
                    $tenant,
                    $request->input('name'),
                    $request->file('html_file'),
                    $request->file('logo'),
                    null,
                    $request->input('header_text'),
                    $request->input('footer_text'),
                    $request->boolean('is_default')
                );
            } catch (\InvalidArgumentException $e) {
                return back()->withErrors(['html_file' => $e->getMessage()]);
            }

            return redirect()->route('themes.index')->with('success', 'تم رفع وحفظ قالب الـ HTML المخصص بنجاح!');
        }

        // Builder type
        $request->validate([
            'name' => 'required|string|max:120',
            'primary_color' => 'required|string|max:20',
            'accent_color' => 'required|string|max:20',
            'bg_color' => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'card_bg' => 'nullable|string|max:20',
            'border_color' => 'nullable|string|max:20',
            'font_family' => 'required|string|max:50',
            'header_text' => 'nullable|string|max:255',
            'footer_text' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'is_default' => 'nullable|boolean',
        ], [
            'name.required' => 'يرجى إدخال اسم القالب.',
            'primary_color.required' => 'اللون الرئيسي مطلوب.',
            'accent_color.required' => 'اللون الثانوي مطلوب.',
        ]);

        $this->themeService->createBuilderTheme(
            $tenant,
            $request->only([
                'name', 'primary_color', 'accent_color', 'bg_color', 'text_color',
                'card_bg', 'border_color', 'font_family', 'header_text', 'footer_text', 'is_default'
            ]),
            $request->file('logo')
        );

        return redirect()->route('themes.index')->with('success', 'تم إنشاء وحفظ قالب الهوية الجديد بنجاح!');
    }

    /**
     * Set a theme as the tenant's default theme.
     */
    public function setDefault(Request $request, DocumentTheme $theme)
    {
        $tenant = $request->user()->currentTenant;
        if ($theme->tenant_id !== $tenant->id) {
            abort(403);
        }

        $tenant->documentThemes()->update(['is_default' => false]);
        $theme->update(['is_default' => true]);

        return back()->with('success', "تم تعيين قالب «{$theme->name}» كقالب افتراضي لجميع المستندات.");
    }

    /**
     * Delete a theme.
     */
    public function destroy(Request $request, DocumentTheme $theme)
    {
        $tenant = $request->user()->currentTenant;
        if ($theme->tenant_id !== $tenant->id) {
            abort(403);
        }

        $name = $theme->name;
        $theme->delete();

        return back()->with('success', "تم حذف قالب «{$name}» بنجاح.");
    }

    /**
     * Download the starter HTML boilerplate template.
     */
    public function downloadSample()
    {
        $html = $this->themeService->getSampleHtmlTemplate();
        return response($html, 200, [
            'Content-Type' => 'text/html; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="nasstube-starter-theme.html"',
        ]);
    }

    /**
     * Preview a theme with mock or real transcript data.
     */
    public function preview(Request $request, ?DocumentTheme $theme = null)
    {
        $tenant = $request->user()->currentTenant;
        if ($theme && $theme->tenant_id !== $tenant->id) {
            abort(403);
        }

        // Get latest real transcript or create mock
        $transcript = $tenant->transcripts()->latest()->first();

        if (!$transcript) {
            $transcript = new Transcript([
                'tenant_id' => $tenant->id,
                'title' => 'معاينة القالب: استراتيجيات التسويق وصناعة المحتوى لعام 2026',
                'channel_name' => 'أكاديمية نَص تيوب للتقنية',
                'video_url' => 'https://youtube.com/watch?v=preview',
                'duration_seconds' => 1845,
                'summary_generated_at' => now(),
                'summary_html' => <<<HTML
<h2>الملخص التنفيذي</h2>
<p>هذا نص تجريبي لمعاينة تنسيق القالب والهوية البصرية المختارة. تتيح لك المنصة ضبط تباين الألوان والخطوط بدقة لتظهر بأعلى مستويات الجودة الاحترافية عند الطباعة أو التصدير بصيغة PDF.</p>

<div class="highlight-card">
    <strong>✦ النقطة الجوهرية:</strong> الهوية البصرية المتناسقة تزيد من موثوقية المستندات الأكاديمية والتقارير الإدارية بنسبة تفوق 70%.
</div>

<h2>أبرز المحاور المستخلصة</h2>
<ul>
    <li>التركيز على سرعة استيعاب القارئ للمعلومة عبر جداول ونقاط محددة.</li>
    <li>استخدام هوية رقمية متكاملة تتضمن شعار المؤسسة وألوانها الأساسية.</li>
    <li>التوافق التام مع معايير طباعة مستندات A4 الرسمية.</li>
</ul>

<h2>جدول البيانات والنتائج</h2>
<table>
    <thead>
        <tr>
            <th>المحور</th>
            <th>الهدف</th>
            <th>الأثر المتوقع</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>التفريغ الآلي</td>
            <td>دقة 99% بالذكاء الاصطناعي</td>
            <td>توفير 80% من وقت التدقيق اليدوي</td>
        </tr>
        <tr>
            <td>القوالب المخصصة</td>
            <td>إبراز الهوية المؤسسية</td>
            <td>تقارير فاخرة جاهزة للإدارة والعملاء</td>
        </tr>
    </tbody>
</table>
HTML,
            ]);
            $transcript->id = 'preview-uuid';
        }

        $themeIdOrKey = $theme ? $theme->id : $request->query('theme', 'obsidian');
        $html = $this->themeService->render($transcript, $themeIdOrKey);

        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }
}
