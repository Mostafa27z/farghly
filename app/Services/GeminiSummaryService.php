<?php

namespace App\Services;

use App\Models\Transcript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiSummaryService
{
    protected string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?? '';
        $this->model = config('services.gemini.model') ?? 'gemini-2.5-flash';
    }

    /**
     * Generate an AI summary and structured HTML document using Gemini.
     *
     * @param Transcript $transcript
     * @param string $style Preset style: 'executive', 'academic', 'corporate', 'meeting', 'custom'
     * @param string|null $customInstructions Custom instructions or design commands from user
     * @param string $theme Visual document theme: 'obsidian', 'navy', 'minimal', 'classic'
     * @return array
     */
    public function generate(
        Transcript $transcript,
        string $style = 'executive',
        ?string $customInstructions = null,
        string $theme = 'obsidian'
    ): array {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message_ar' => 'مفتاح Gemini API غير معرف في ملف .env.',
                'message_en' => 'Gemini API key is missing.',
            ];
        }

        $prompt = $this->buildPrompt($transcript, $style, $customInstructions);

        try {
            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(90)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($apiUrl, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 8192,
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API call failed', [
                    'status' => $response->status(),
                    'error' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message_ar' => 'فشل الاتصال بخدمة الذكاء الاصطناعي Gemini: ' . ($response->json()['error']['message'] ?? 'خطأ غير معروف'),
                    'message_en' => 'Gemini API request failed.',
                ];
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $innerHtml = $this->cleanHtmlOutput($rawText);

            if (empty($innerHtml)) {
                return [
                    'success' => false,
                    'message_ar' => 'لم يتم إرجاع محتوى صالح من الذكاء الاصطناعي.',
                    'message_en' => 'No content returned from AI.',
                ];
            }

            // Build full standalone A4 printable document
            $fullDocumentHtml = $this->renderPrintableDocument($transcript, $innerHtml, $theme);

            return [
                'success' => true,
                'summary_html' => $innerHtml,
                'document_html' => $fullDocumentHtml,
                'plain_text' => trim(strip_tags($innerHtml)),
            ];
        } catch (\Throwable $e) {
            Log::error("Gemini summary exception: {$e->getMessage()}", ['trace' => $e->getTraceAsString()]);

            return [
                'success' => false,
                'message_ar' => 'حدث خطأ غير متوقع أثناء معالجة التلخيص: ' . $e->getMessage(),
                'message_en' => 'An exception occurred during summarization.',
            ];
        }
    }

    /**
     * Build contextual Arabic prompt for Gemini.
     */
    protected function buildPrompt(Transcript $transcript, string $style, ?string $customInstructions): string
    {
        $styleInstructions = match ($style) {
            'academic' => 'الأسلوب الأكاديمي والتعليمي: قسّم المحتوى إلى فصول ومفاهيم واضحة، واشرح المسائل بعمق، وأضف قسماً للمصطلحات العلمية وقسماً لأسئلة المراجعة والأجوبة.',
            'corporate' => 'التقرير المؤسسي الرسمي: ركّز على السياق العام، المحاور الاستراتيجية، الأرقام والبيانات، وجدول يوضح المخرجات والتوصيات العملية.',
            'meeting' => 'محضر وقرارات عملية: ركّز على النقاط المتفق عليها، القرارات، توزيع المهام، والخطوات القادمة.',
            'custom' => 'أسلوب مخصص بالكامل بناءً على توجيهات المستخدم المرفقة.',
            default => 'الملخص التنفيذي الذكي: نظرة عامة سريعة للمدراء وصناع القرار، أبرز 5 نقاط رئيسية، تفاصيل المحاور بدقة، وتوصيات ختامية مركزة.',
        };

        $userDirectives = $customInstructions ? "\n\nتوجيهات إضافية خاصة من المستخدم يجب الالتزام بها بدقة:\n\"{$customInstructions}\"" : '';

        return <<<PROMPT
أنت كبير محللي المحتوى والذكاء الاصطناعي المتخصص في صياغة التقارير والمستندات الفاخرة باللغة العربية الفصحى.
المهمة: قم بتحليل وتلخيص نص تفريغ فيديو اليوتيوب التالي وإخراجه في شكل مستند HTML منسق ومهيكل وجاهز للطباعة والتحويل إلى PDF.

معلومات الفيديو:
- عنوان الفيديو: {$transcript->title}
- القناة: {$transcript->channel_name}
- المدة: {$transcript->duration_seconds} ثانية
- لغة النص الأصلية: {$transcript->language}

نمط التلخيص المطلوب:
{$styleInstructions}
{$userDirectives}

تعليمات التنسيق البرمجي (CRITICAL):
1. أخرج النتيجة بصيغة وسوم HTML دلالية مباشرة (Semantic HTML elements) بدون تغليف بـ <html> أو <body> أو <head>.
2. استخدم العناوين <h2> للعناوين الرئيسية، و <h3> للعناوين الفرعية.
3. استخدم الفقرات <p>، والقوائم النقطية <ul> و <li>، واقتباسات التمييز <blockquote>.
4. استخدم وسوم الجداول <table> و <thead> و <tbody> إذا كان هناك تصنيفات أو مقارنات أو نقاط قابلة للجدولة.
5. أضف عناصر تمييز بأقسام مثل <div class="highlight-card"> أو <div class="badge"> لتزيين المستند.
6. اللغة: العربية الفصحى الرصينة، بدون أي أخطاء إملائية أو لغوية.
7. لا تضع أي شروحات خارج كود الـ HTML. لا تبدأ بـ "بالتأكيد" أو "إليك التلخيص". ابدأ مباشرة بوسم <h2>.

نص الفيديو الكامل:
{$transcript->full_text}
PROMPT;
    }

    /**
     * Clean HTML text returned by the model.
     */
    protected function cleanHtmlOutput(string $raw): string
    {
        // Strip markdown code block wrappers (e.g. ```html ... ```)
        $cleaned = preg_replace('/^```(?:html)?\s*/i', '', trim($raw));
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);

        return trim($cleaned);
    }

    /**
     * Render a complete, standalone, print-optimized A4 HTML document.
     */
    public function renderPrintableDocument(Transcript $transcript, string $bodyHtml, string $theme = 'obsidian'): string
    {
        $themeColors = match ($theme) {
            'navy' => [
                'primary' => '#1E3A8A',
                'accent' => '#3B82F6',
                'bg' => '#FFFFFF',
                'card_bg' => '#F8FAFC',
                'text' => '#0F172A',
                'border' => '#E2E8F0',
                'header_bg' => '#0F172A',
                'header_text' => '#FFFFFF',
            ],
            'academic' => [
                'primary' => '#1B4332',
                'accent' => '#2D6A4F',
                'bg' => '#FFFFFF',
                'card_bg' => '#F4FBF7',
                'text' => '#1A202C',
                'border' => '#D8E2DC',
                'header_bg' => '#1B4332',
                'header_text' => '#FFFFFF',
            ],
            'minimal' => [
                'primary' => '#18181B',
                'accent' => '#52525B',
                'bg' => '#FFFFFF',
                'card_bg' => '#FAFAFA',
                'text' => '#18181B',
                'border' => '#E4E4E7',
                'header_bg' => '#18181B',
                'header_text' => '#FFFFFF',
            ],
            default => [ // obsidian / emerald studio
                'primary' => '#00593B',
                'accent' => '#10B981',
                'bg' => '#FFFFFF',
                'card_bg' => '#F0FDF4',
                'text' => '#0F172A',
                'border' => '#D1FAE5',
                'header_bg' => '#0A0E16',
                'header_text' => '#FFFFFF',
            ],
        };

        $dateFormatted = now()->locale('ar')->isoFormat('D MMMM YYYY');
        $durationFormatted = gmdate($transcript->duration_seconds > 3600 ? 'H:i:s' : 'i:s', $transcript->duration_seconds);

        return <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ملخص: {$transcript->title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 18mm 15mm 20mm 15mm;
            @bottom-right {
                content: counter(page) " من " counter(pages);
                font-family: 'Cairo', sans-serif;
                font-size: 9pt;
                color: #64748B;
            }
        }

        *, *::before, *::after {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Cairo', 'Amiri', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #F1F5F9;
            color: {$themeColors['text']};
            line-height: 1.8;
            font-size: 11pt;
            direction: rtl;
        }

        /* Top Action Toolbar (Hidden during print) */
        .no-print-toolbar {
            position: sticky;
            top: 0;
            z-index: 100;
            background: #0A0E16;
            color: #FFFFFF;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .no-print-toolbar .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            border-radius: 8px;
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }

        .no-print-toolbar .btn-primary {
            background: #10B981;
            color: #003824;
            box-shadow: 0 0 15px rgba(16,185,129,0.3);
        }

        .no-print-toolbar .btn-primary:hover {
            background: #34D399;
        }

        .no-print-toolbar .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255,255,255,0.15);
        }

        .no-print-toolbar .btn-secondary:hover {
            background: rgba(255,255,255,0.2);
        }

        /* A4 Page Container */
        .page-container {
            width: 210mm;
            min-height: 297mm;
            margin: 25px auto;
            background: {$themeColors['bg']};
            padding: 20mm;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 6px;
        }

        /* Document Header Banner */
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
            font-family: 'Cairo', sans-serif;
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

        /* Typography & Content Styling */
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

        /* Tables */
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

        /* Callout cards */
        .highlight-card, .callout {
            background: {$themeColors['card_bg']};
            border: 1px solid {$themeColors['border']};
            border-radius: 8px;
            padding: 14px 18px;
            margin: 16px 0;
            page-break-inside: avoid;
        }

        /* Print Media Styles */
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
    <!-- Interactive Toolbar (Only visible in browser, automatically hidden when printing/saving to PDF) -->
    <div class="no-print-toolbar">
        <div style="display: flex; align-items: center; gap: 12px;">
            <a href="javascript:history.back()" class="btn btn-secondary">← العودة للاستوديو</a>
            <span style="font-size: 13px; color: #94A3B8;">معاينة المستند الرسمي جاهز للطباعة والحفظ كـ PDF</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 8v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2H5z"/></svg>
                طباعة / حفظ كملف PDF
            </button>
        </div>
    </div>

    <div class="page-container">
        <!-- Header -->
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

        <!-- Summary HTML Body generated by Gemini -->
        <article class="doc-body">
            {$bodyHtml}
        </article>
    </div>
</body>
</html>
HTML;
    }
}
