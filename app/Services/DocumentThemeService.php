<?php

namespace App\Services;

use App\Models\DocumentTheme;
use App\Models\Tenant;
use App\Models\Transcript;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentThemeService
{
    /**
     * Available font options for themes.
     */
    public const AVAILABLE_FONTS = [
        'Cairo' => 'Cairo (القاهرة) - حديث ومتناسق',
        'Tajawal' => 'Tajawal (تجوال) - أنيق ومريح للقراءة',
        'IBM Plex Sans Arabic' => 'IBM Plex Sans Arabic - احترافي تقني',
        'Almarai' => 'Almarai (المراعي) - واضح وصريح',
        'Readex Pro' => 'Readex Pro - عصري فخم',
    ];

    /**
     * Built-in system theme presets.
     */
    public const SYSTEM_PRESETS = [
        'obsidian' => [
            'name' => 'Obsidian Studio (الوضع الليلي الفاخر)',
            'primary' => '#0F172A',
            'accent' => '#6366F1',
            'bg' => '#FFFFFF',
            'text' => '#1E293B',
            'border' => '#E2E8F0',
            'card_bg' => '#F8FAFC',
        ],
        'navy' => [
            'name' => 'Royal Navy (الأزرق الملكي الرسمي)',
            'primary' => '#0A2540',
            'accent' => '#00D4B2',
            'bg' => '#FFFFFF',
            'text' => '#1A3353',
            'border' => '#E3E8EE',
            'card_bg' => '#F7FAFC',
        ],
        'academic' => [
            'name' => 'Academic Gold (أكاديمي موثق)',
            'primary' => '#1C1917',
            'accent' => '#D97706',
            'bg' => '#FFFFFF',
            'text' => '#292524',
            'border' => '#E7E5E4',
            'card_bg' => '#FBFBFA',
        ],
        'minimal' => [
            'name' => 'Minimal Clean (أبيض مبسط ومفرغ)',
            'primary' => '#111827',
            'accent' => '#4B5563',
            'bg' => '#FFFFFF',
            'text' => '#1F2937',
            'border' => '#E5E7EB',
            'card_bg' => '#F9FAFB',
        ],
    ];

    /**
     * Create a theme via the Visual Builder.
     */
    public function createBuilderTheme(Tenant $tenant, array $data, ?UploadedFile $logoFile = null): DocumentTheme
    {
        $logoPath = null;
        $logoBase64 = null;

        if ($logoFile && $logoFile->isValid()) {
            $logoPath = $this->storeLogo($tenant, $logoFile);
            $logoBase64 = $this->fileToBase64($logoFile);
        }

        if (!empty($data['is_default'])) {
            $tenant->documentThemes()->update(['is_default' => false]);
        }

        $colors = [
            'primary' => $data['primary_color'] ?? '#0F172A',
            'accent' => $data['accent_color'] ?? '#6366F1',
            'bg' => $data['bg_color'] ?? '#FFFFFF',
            'text' => $data['text_color'] ?? '#1E293B',
            'card_bg' => $data['card_bg'] ?? '#F8FAFC',
            'border' => $data['border_color'] ?? '#E2E8F0',
        ];

        return $tenant->documentThemes()->create([
            'name' => $data['name'],
            'type' => 'builder',
            'logo_path' => $logoPath,
            'logo_base64' => $logoBase64,
            'colors' => $colors,
            'font_family' => $data['font_family'] ?? 'Cairo',
            'header_text' => $data['header_text'] ?? null,
            'footer_text' => $data['footer_text'] ?? null,
            'is_default' => !empty($data['is_default']),
        ]);
    }

    /**
     * Create a custom HTML template theme.
     */
    public function createHtmlTheme(
        Tenant $tenant,
        string $name,
        UploadedFile $htmlFile,
        ?UploadedFile $logoFile = null,
        ?array $colors = null,
        ?string $headerText = null,
        ?string $footerText = null,
        bool $isDefault = false
    ): DocumentTheme {
        $rawHtml = file_get_contents($htmlFile->getRealPath());

        // Basic verification
        if (!str_contains($rawHtml, '{{CONTENT}}') && !str_contains($rawHtml, '{{SUMMARY}}')) {
            throw new \InvalidArgumentException('ملف الـ HTML يجب أن يحتوي على وسم المحتوى {{CONTENT}} لتضمين ملخص الذكاء الاصطناعي.');
        }

        // Sanitize dangerous executable scripts while keeping full styling and HTML
        $cleanedHtml = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $rawHtml);

        $logoPath = null;
        $logoBase64 = null;

        if ($logoFile && $logoFile->isValid()) {
            $logoPath = $this->storeLogo($tenant, $logoFile);
            $logoBase64 = $this->fileToBase64($logoFile);
        }

        if ($isDefault) {
            $tenant->documentThemes()->update(['is_default' => false]);
        }

        return $tenant->documentThemes()->create([
            'name' => $name,
            'type' => 'custom_html',
            'logo_path' => $logoPath,
            'logo_base64' => $logoBase64,
            'colors' => $colors ?? [
                'primary' => '#0F172A',
                'accent' => '#6366F1',
                'bg' => '#FFFFFF',
                'text' => '#1E293B',
            ],
            'header_text' => $headerText,
            'footer_text' => $footerText,
            'custom_html' => $cleanedHtml,
            'is_default' => $isDefault,
        ]);
    }

    /**
     * Update an existing theme.
     */
    public function updateTheme(DocumentTheme $theme, array $data, ?UploadedFile $logoFile = null, ?UploadedFile $htmlFile = null): DocumentTheme
    {
        if ($logoFile && $logoFile->isValid()) {
            $data['logo_path'] = $this->storeLogo($theme->tenant, $logoFile);
            $data['logo_base64'] = $this->fileToBase64($logoFile);
        }

        if ($htmlFile && $htmlFile->isValid()) {
            $rawHtml = file_get_contents($htmlFile->getRealPath());
            if (!str_contains($rawHtml, '{{CONTENT}}') && !str_contains($rawHtml, '{{SUMMARY}}')) {
                throw new \InvalidArgumentException('ملف الـ HTML يجب أن يحتوي على وسم المحتوى {{CONTENT}}.');
            }
            $data['custom_html'] = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $rawHtml);
        }

        if (!empty($data['is_default']) && !$theme->is_default) {
            $theme->tenant->documentThemes()->where('id', '!=', $theme->id)->update(['is_default' => false]);
        }

        if (isset($data['primary_color']) || isset($data['accent_color'])) {
            $data['colors'] = [
                'primary' => $data['primary_color'] ?? ($theme->colors['primary'] ?? '#0F172A'),
                'accent' => $data['accent_color'] ?? ($theme->colors['accent'] ?? '#6366F1'),
                'bg' => $data['bg_color'] ?? ($theme->colors['bg'] ?? '#FFFFFF'),
                'text' => $data['text_color'] ?? ($theme->colors['text'] ?? '#1E293B'),
                'card_bg' => $data['card_bg'] ?? ($theme->colors['card_bg'] ?? '#F8FAFC'),
                'border' => $data['border_color'] ?? ($theme->colors['border'] ?? '#E2E8F0'),
            ];
        }

        $theme->update($data);
        return $theme;
    }

    /**
     * Render the full printable A4 document for a transcript using the selected theme.
     */
    public function render(Transcript $transcript, ?string $themeIdOrName = null): string
    {
        $tenant = $transcript->tenant;
        $theme = null;

        if ($themeIdOrName && Str::isUuid($themeIdOrName)) {
            $theme = DocumentTheme::where('tenant_id', $tenant->id)->find($themeIdOrName);
        }

        if (!$theme && ($themeIdOrName === 'default' || empty($themeIdOrName))) {
            $theme = DocumentTheme::where('tenant_id', $tenant->id)->where('is_default', true)->first();
        }

        $summaryHtml = $transcript->summary_html ?? '<p>لم يتم إنشاء ملخص لهذا الفيديو بعد.</p>';

        // 1. Custom HTML Theme rendering
        if ($theme && $theme->type === 'custom_html' && !empty($theme->custom_html)) {
            return $this->renderCustomHtmlTheme($transcript, $theme, $summaryHtml);
        }

        // 2. Custom Visual Builder Theme rendering
        if ($theme && $theme->type === 'builder') {
            return $this->renderBuilderTheme($transcript, $theme, $summaryHtml);
        }

        // 3. Fallback to System Presets ('obsidian', 'navy', 'academic', 'minimal')
        $presetKey = array_key_exists($themeIdOrName ?? '', self::SYSTEM_PRESETS) ? $themeIdOrName : 'obsidian';
        return $this->renderSystemPreset($transcript, $presetKey, $summaryHtml);
    }

    /**
     * Render a custom HTML uploaded theme with variable interpolation.
     */
    protected function renderCustomHtmlTheme(Transcript $transcript, DocumentTheme $theme, string $summaryHtml): string
    {
        $template = $theme->custom_html;

        $durationMinutes = floor($transcript->duration_seconds / 60);
        $durationRemainderSeconds = $transcript->duration_seconds % 60;
        $durationFormatted = "{$durationMinutes} دقيقة و {$durationRemainderSeconds} ثانية";

        $dateFormatted = Carbon::parse($transcript->summary_generated_at ?? $transcript->created_at)
            ->locale('ar')
            ->translatedFormat('d F Y - h:i A');

        $logoHtml = '';
        $logoSrc = $theme->getEmbeddableLogo();
        if ($logoSrc) {
            $logoHtml = '<img src="' . $logoSrc . '" alt="Logo" style="max-height: 52px; max-width: 180px; object-fit: contain;" />';
        } else {
            $logoHtml = '<div style="font-weight: 800; font-size: 16px; color: ' . ($theme->colors['primary'] ?? '#0F172A') . ';">' . htmlspecialchars($theme->tenant->name) . '</div>';
        }

        $colors = $theme->colors ?? [];
        $primary = $colors['primary'] ?? '#0F172A';
        $accent = $colors['accent'] ?? '#6366F1';
        $bg = $colors['bg'] ?? '#FFFFFF';
        $text = $colors['text'] ?? '#1E293B';

        $replacements = [
            '{{TITLE}}' => htmlspecialchars($transcript->title),
            '{{CONTENT}}' => $summaryHtml,
            '{{SUMMARY}}' => $summaryHtml,
            '{{VIDEO_URL}}' => htmlspecialchars($transcript->video_url),
            '{{CHANNEL_NAME}}' => htmlspecialchars($transcript->channel_name ?? 'قناة يوتيوب'),
            '{{DURATION}}' => $durationFormatted,
            '{{DATE}}' => $dateFormatted,
            '{{LOGO}}' => $logoHtml,
            '{{LOGO_URL}}' => $logoSrc ?? '',
            '{{PRIMARY_COLOR}}' => $primary,
            '{{ACCENT_COLOR}}' => $accent,
            '{{BG_COLOR}}' => $bg,
            '{{TEXT_COLOR}}' => $text,
            '{{HEADER_TEXT}}' => htmlspecialchars($theme->header_text ?? ''),
            '{{FOOTER_TEXT}}' => htmlspecialchars($theme->footer_text ?? 'تم التوليد والتنسيق بواسطة منصة نَص تيوب الذكية'),
            '{{ORGANIZATION_NAME}}' => htmlspecialchars($theme->tenant->name),
        ];

        $rendered = str_replace(array_keys($replacements), array_values($replacements), $template);

        // Inject the interactive toolbar & print stylesheet if not present
        return $this->injectToolbarAndPrintStyles($rendered, $transcript);
    }

    /**
     * Render a builder theme with user colors, logo, and typography.
     */
    protected function renderBuilderTheme(Transcript $transcript, DocumentTheme $theme, string $summaryHtml): string
    {
        $colors = $theme->colors ?? [];
        $primary = $colors['primary'] ?? '#0F172A';
        $accent = $colors['accent'] ?? '#6366F1';
        $bg = $colors['bg'] ?? '#FFFFFF';
        $text = $colors['text'] ?? '#1E293B';
        $cardBg = $colors['card_bg'] ?? '#F8FAFC';
        $border = $colors['border'] ?? '#E2E8F0';
        $font = $theme->font_family ?: 'Cairo';

        $logoSrc = $theme->getEmbeddableLogo();
        $logoHtml = '';
        if ($logoSrc) {
            $logoHtml = '<img src="' . $logoSrc . '" alt="Logo" style="max-height: 48px; max-width: 160px; object-fit: contain;" />';
        } else {
            $logoHtml = '<div class="doc-logo-text">' . htmlspecialchars($theme->tenant->name) . '<span>وثيقة رسمية</span></div>';
        }

        $durationMinutes = floor($transcript->duration_seconds / 60);
        $durationRemainderSeconds = $transcript->duration_seconds % 60;
        $durationFormatted = "{$durationMinutes} دقيقة و {$durationRemainderSeconds} ثانية";

        $dateFormatted = Carbon::parse($transcript->summary_generated_at ?? $transcript->created_at)
            ->locale('ar')
            ->translatedFormat('d F Y - h:i A');

        $headerText = $theme->header_text ?: '✦ مستند تفريغ وتلخيص ذكي بالذكاء الاصطناعي';
        $footerText = $theme->footer_text ?: ('تم التوثيق عبر منصة نَص تيوب - ' . htmlspecialchars($theme->tenant->name));

        return <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$transcript->title} - توثيق PDF</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Almarai:wght@400;700;800&family=Readex+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }

        *, *::before, *::after {
            box-sizing: border-box;
        }

        body {
            font-family: '{$font}', 'Cairo', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #E2E8F0;
            color: {$text};
            line-height: 1.8;
            font-size: 10.5pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .no-print-toolbar {
            position: sticky;
            top: 0;
            z-index: 9999;
            background: #0B0F17;
            color: #FFFFFF;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            font-family: inherit;
        }

        .btn-primary {
            background: linear-gradient(135deg, {$accent}, {$primary});
            color: #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        .btn-primary:hover {
            opacity: 0.95;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #E2E8F0;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            margin: 25px auto;
            background: {$bg};
            padding: 20mm;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            border-radius: 6px;
        }

        .doc-header {
            border-bottom: 2px solid {$border};
            padding-bottom: 18px;
            margin-bottom: 24px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
        }

        .doc-header-info {
            flex: 1;
        }

        .doc-tag {
            display: inline-block;
            background: {$cardBg};
            color: {$accent};
            border: 1px solid {$border};
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .doc-title {
            font-size: 18pt;
            font-weight: 800;
            color: {$primary};
            margin: 0 0 8px 0;
            line-height: 1.4;
        }

        .doc-meta {
            font-size: 9.5pt;
            color: #64748B;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }

        .doc-meta-item strong {
            color: #334155;
        }

        .doc-logo-area {
            text-align: left;
            display: flex;
            align-items: center;
        }

        .doc-logo-text {
            font-weight: 800;
            font-size: 13pt;
            color: {$primary};
            border-right: 3px solid {$accent};
            padding-right: 12px;
            text-align: right;
        }

        .doc-logo-text span {
            display: block;
            font-size: 8pt;
            color: #94A3B8;
            font-weight: 600;
        }

        h2 {
            font-size: 14pt;
            font-weight: 700;
            color: {$primary};
            border-right: 4px solid {$accent};
            padding-right: 12px;
            margin-top: 24px;
            margin-bottom: 12px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 12pt;
            font-weight: 600;
            color: #1E293B;
            margin-top: 18px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        p {
            margin: 0 0 12px 0;
            text-align: justify;
        }

        ul, ol {
            margin: 0 0 16px 0;
            padding-right: 24px;
        }

        li {
            margin-bottom: 6px;
        }

        blockquote {
            background: {$cardBg};
            border-right: 4px solid {$accent};
            margin: 16px 0;
            padding: 12px 18px;
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        th {
            background: {$cardBg};
            color: {$primary};
            font-weight: 700;
            padding: 10px 12px;
            border: 1px solid {$border};
            text-align: right;
        }

        td {
            padding: 8px 12px;
            border: 1px solid {$border};
            vertical-align: top;
        }

        tr:nth-child(even) td {
            background-color: #FAFAFA;
        }

        .highlight-card, .callout {
            background: {$cardBg};
            border: 1px solid {$border};
            border-radius: 8px;
            padding: 14px 18px;
            margin: 16px 0;
            page-break-inside: avoid;
        }

        .doc-footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid {$border};
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #94A3B8;
        }

        @media print {
            body {
                background: none;
                color: #000;
            }

            .no-print-toolbar {
                display: none !important;
            }

            .page-container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-toolbar">
        <div style="display: flex; align-items: center; gap: 12px;">
            <a href="javascript:history.back()" class="btn btn-secondary">← العودة للاستوديو</a>
            <span style="font-size: 13px; color: #94A3B8;">معاينة المستند الرسمي بهوية ({$theme->name}) جاهز للطباعة</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 8v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2H5z"/></svg>
                طباعة / حفظ كملف PDF
            </button>
        </div>
    </div>

    <div class="page-container">
        <header class="doc-header">
            <div class="doc-header-info">
                <div class="doc-tag">{$headerText}</div>
                <h1 class="doc-title">{$transcript->title}</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">القناة: <strong>{$transcript->channel_name}</strong></span>
                    <span class="doc-meta-item">المدة: <strong>{$durationFormatted}</strong></span>
                    <span class="doc-meta-item">تاريخ الإنشاء: <strong>{$dateFormatted}</strong></span>
                </div>
            </div>
            <div class="doc-logo-area">
                {$logoHtml}
            </div>
        </header>

        <article class="doc-body">
            {$summaryHtml}
        </article>

        <footer class="doc-footer">
            <span>{$footerText}</span>
            <span>وثيقة مؤتمتة رسمية</span>
        </footer>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Render system preset themes.
     */
    protected function renderSystemPreset(Transcript $transcript, string $presetKey, string $summaryHtml): string
    {
        $themeColors = self::SYSTEM_PRESETS[$presetKey] ?? self::SYSTEM_PRESETS['obsidian'];

        $durationMinutes = floor($transcript->duration_seconds / 60);
        $durationRemainderSeconds = $transcript->duration_seconds % 60;
        $durationFormatted = "{$durationMinutes} دقيقة و {$durationRemainderSeconds} ثانية";

        $dateFormatted = Carbon::parse($transcript->summary_generated_at ?? $transcript->created_at)
            ->locale('ar')
            ->translatedFormat('d F Y - h:i A');

        return <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$transcript->title} - توثيق PDF</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }

        *, *::before, *::after {
            box-sizing: border-box;
        }

        body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #E2E8F0;
            color: {$themeColors['text']};
            line-height: 1.8;
            font-size: 10.5pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .no-print-toolbar {
            position: sticky;
            top: 0;
            z-index: 9999;
            background: #0B0F17;
            color: #FFFFFF;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            font-family: inherit;
        }

        .btn-primary {
            background: linear-gradient(135deg, {$themeColors['accent']}, {$themeColors['primary']});
            color: #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        .btn-primary:hover {
            opacity: 0.95;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #E2E8F0;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            margin: 25px auto;
            background: {$themeColors['bg']};
            padding: 20mm;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            border-radius: 6px;
        }

        .doc-header {
            border-bottom: 2px solid {$themeColors['border']};
            padding-bottom: 18px;
            margin-bottom: 24px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
        }

        .doc-header-info {
            flex: 1;
        }

        .doc-tag {
            display: inline-block;
            background: {$themeColors['card_bg']};
            color: {$themeColors['accent']};
            border: 1px solid {$themeColors['border']};
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .doc-title {
            font-size: 18pt;
            font-weight: 800;
            color: {$themeColors['primary']};
            margin: 0 0 8px 0;
            line-height: 1.4;
        }

        .doc-meta {
            font-size: 9.5pt;
            color: #64748B;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }

        .doc-meta-item strong {
            color: #334155;
        }

        .doc-logo {
            text-align: left;
            font-weight: 800;
            font-size: 12pt;
            color: {$themeColors['primary']};
            border-right: 2px solid {$themeColors['border']};
            padding-right: 14px;
        }

        .doc-logo span {
            display: block;
            font-size: 8pt;
            color: #94A3B8;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
        }

        h2 {
            font-size: 14pt;
            font-weight: 700;
            color: {$themeColors['primary']};
            border-right: 4px solid {$themeColors['accent']};
            padding-right: 12px;
            margin-top: 24px;
            margin-bottom: 12px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 12pt;
            font-weight: 600;
            color: #1E293B;
            margin-top: 18px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        p {
            margin: 0 0 12px 0;
            text-align: justify;
        }

        ul, ol {
            margin: 0 0 16px 0;
            padding-right: 24px;
        }

        li {
            margin-bottom: 6px;
        }

        blockquote {
            background: {$themeColors['card_bg']};
            border-right: 4px solid {$themeColors['accent']};
            margin: 16px 0;
            padding: 12px 18px;
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        th {
            background: {$themeColors['card_bg']};
            color: {$themeColors['primary']};
            font-weight: 700;
            padding: 10px 12px;
            border: 1px solid {$themeColors['border']};
            text-align: right;
        }

        td {
            padding: 8px 12px;
            border: 1px solid {$themeColors['border']};
            vertical-align: top;
        }

        tr:nth-child(even) td {
            background-color: #FAFAFA;
        }

        .highlight-card, .callout {
            background: {$themeColors['card_bg']};
            border: 1px solid {$themeColors['border']};
            border-radius: 8px;
            padding: 14px 18px;
            margin: 16px 0;
            page-break-inside: avoid;
        }

        @media print {
            body {
                background: none;
                color: #000;
            }

            .no-print-toolbar {
                display: none !important;
            }

            .page-container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-toolbar">
        <div style="display: flex; align-items: center; gap: 12px;">
            <a href="javascript:history.back()" class="btn btn-secondary">← العودة للاستوديو</a>
            <span style="font-size: 13px; color: #94A3B8;">معاينة المستند الرسمي ({$themeColors['name']})</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 8v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2H5z"/></svg>
                طباعة / حفظ كملف PDF
            </button>
        </div>
    </div>

    <div class="page-container">
        <header class="doc-header">
            <div class="doc-header-info">
                <div class="doc-tag">✦ مستند تفريغ وتلخيص ذكي بالذكاء الاصطناعي</div>
                <h1 class="doc-title">{$transcript->title}</h1>
                <div class="doc-meta">
                    <span class="doc-meta-item">القناة: <strong>{$transcript->channel_name}</strong></span>
                    <span class="doc-meta-item">المدة: <strong>{$durationFormatted}</strong></span>
                    <span class="doc-meta-item">تاريخ الإنشاء: <strong>{$dateFormatted}</strong></span>
                </div>
            </div>
            <div class="doc-logo">
                نَص تيوب
                <span>NASSTUBE PRO</span>
            </div>
        </header>

        <article class="doc-body">
            {$summaryHtml}
        </article>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Inject toolbar and print controls into an uploaded custom HTML template if it doesn't already have them.
     */
    protected function injectToolbarAndPrintStyles(string $html, Transcript $transcript): string
    {
        $toolbar = <<<HTML
<div id="nasstube-print-toolbar" style="position: sticky; top: 0; z-index: 999999; background: #0B0F17; color: #FFFFFF; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: 'Cairo', sans-serif; direction: rtl;">
    <div style="display: flex; align-items: center; gap: 12px;">
        <a href="javascript:history.back()" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.1); color: #E2E8F0; text-decoration: none;">← العودة للاستوديو</a>
        <span style="font-size: 13px; color: #94A3B8;">قالب HTML مخصص جاهز للطباعة والحفظ كـ PDF</span>
    </div>
    <div>
        <button onclick="window.print()" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; background: #6366F1; color: #FFFFFF; border: none; cursor: pointer;">
            طباعة / حفظ كملف PDF
        </button>
    </div>
</div>
<style>
@media print {
    #nasstube-print-toolbar {
        display: none !important;
    }
}
</style>
HTML;

        if (stripos($html, '<body') !== false) {
            return preg_replace('/(<body[^>]*>)/i', '$1' . "\n" . $toolbar, $html, 1);
        }

        return $toolbar . $html;
    }

    /**
     * Store uploaded logo file.
     */
    protected function storeLogo(Tenant $tenant, UploadedFile $file): string
    {
        $filename = 'logo_' . Str::random(12) . '.' . $file->getClientOriginalExtension();
        $directory = 'tenants/' . $tenant->id . '/logos';
        Storage::disk('public')->putFileAs($directory, $file, $filename);
        return $directory . '/' . $filename;
    }

    /**
     * Convert an uploaded file directly into a base64 Data-URI.
     */
    protected function fileToBase64(UploadedFile $file): string
    {
        $mime = $file->getMimeType() ?: 'image/png';
        $data = file_get_contents($file->getRealPath());
        return 'data:' . $mime . ';base64,' . base64_encode($data);
    }

    /**
     * Get a starter boilerplate HTML template for users to download/learn from.
     */
    public function getSampleHtmlTemplate(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>{{TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        @page { size: A4; margin: 15mm; }
        body {
            font-family: 'Cairo', sans-serif;
            background: #FAFAFA;
            color: #1E293B;
            line-height: 1.8;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 40px;
            border-radius: 12px;
            border-top: 6px solid #6366F1;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #F1F5F9;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo { font-size: 20px; font-weight: 800; color: #0F172A; }
        .meta { font-size: 12px; color: #64748B; }
        h1 { font-size: 22px; color: #0F172A; margin: 0 0 10px 0; }
        .content { font-size: 14px; text-align: justify; }
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #E2E8F0;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div>
                <div class="meta">{{CHANNEL_NAME}} • {{DURATION}} • {{DATE}}</div>
                <h1>{{TITLE}}</h1>
            </div>
            <div class="logo">
                {{LOGO}}
            </div>
        </header>

        <main class="content">
            {{CONTENT}}
        </main>

        <footer class="footer">
            {{FOOTER_TEXT}}
        </footer>
    </div>
</body>
</html>
HTML;
    }
}
