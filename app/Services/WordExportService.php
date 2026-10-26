<?php

namespace App\Services;

use App\Models\Transcript;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\JcTable;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WordExportService
{
    /**
     * Generate and stream a Word (.docx) document for the transcript.
     *
     * @param Transcript $transcript
     * @param string $type ('summary' | 'proofread' | 'transcript')
     * @return BinaryFileResponse
     */
    public function download(Transcript $transcript, string $type = 'summary'): BinaryFileResponse
    {
        $phpWord = new PhpWord();

        // 1. Setup Document Default Typography & Properties
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);

        $docProperties = $phpWord->getDocInfo();
        $docProperties->setCreator('NassTube AI');
        $docProperties->setTitle($transcript->title);
        $docProperties->setDescription('تم استخراج هذا المستند عبر منصة NassTube للذكاء الاصطناعي');

        // Setup Headings Styles with RTL support
        $phpWord->addTitleStyle(1, [
            'name' => 'Arial',
            'size' => 18,
            'bold' => true,
            'color' => '003824',
        ], [
            'spaceBefore' => 240,
            'spaceAfter' => 180,
            'alignment' => Jc::START,
            'bidi' => true,
        ]);

        $phpWord->addTitleStyle(2, [
            'name' => 'Arial',
            'size' => 14,
            'bold' => true,
            'color' => '10B981',
        ], [
            'spaceBefore' => 200,
            'spaceAfter' => 140,
            'alignment' => Jc::START,
            'bidi' => true,
        ]);

        $phpWord->addTitleStyle(3, [
            'name' => 'Arial',
            'size' => 12,
            'bold' => true,
            'color' => '1F2937',
        ], [
            'spaceBefore' => 160,
            'spaceAfter' => 100,
            'alignment' => Jc::START,
            'bidi' => true,
        ]);

        // 2. Add Section with RTL orientation
        $section = $phpWord->addSection([
            'bidi' => true,
            'marginTop' => 1440,    // 1 inch
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        // 3. Document Header (Title & Metadata Card)
        $this->addDocumentHeader($section, $transcript, $type);

        // 4. Document Body Content based on type
        $this->addDocumentBody($section, $transcript, $type);

        // 5. Document Footer
        $footer = $section->addFooter();
        $footerTable = $footer->addTable([
            'width' => 100 * 50,
            'unit' => 'pct',
            'bidiVisual' => true,
        ]);
        $footerRow = $footerTable->addRow();
        
        $footerCellRight = $footerRow->addCell(5000);
        $footerCellRight->addText('منصة NassTube للتفريغ والتلخيص الذكي', [
            'size' => 9,
            'color' => '6B7280',
            'italic' => true,
        ], [
            'alignment' => Jc::START,
            'bidi' => true,
        ]);

        $footerCellLeft = $footerRow->addCell(5000);
        $footerTextRun = $footerCellLeft->addTextRun(['alignment' => Jc::END, 'bidi' => true]);
        $footerTextRun->addText('صفحة ', ['size' => 9, 'color' => '6B7280']);
        $footerTextRun->addField('PAGE');
        $footerTextRun->addText(' من ', ['size' => 9, 'color' => '6B7280']);
        $footerTextRun->addField('NUMPAGES');

        // 6. Save to temporary file & return download response
        $tempFile = tempnam(sys_get_temp_dir(), 'nasstube_docx_');
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        $safeTitle = Str::slug($transcript->title, '-') ?: 'document';
        $safeTitle = mb_substr($safeTitle, 0, 50);
        $typeSuffix = match ($type) {
            'proofread' => 'proofread_full',
            'transcript' => 'transcript',
            default => 'summary',
        };
        $fileName = "{$safeTitle}_{$typeSuffix}.docx";

        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'max-age=0',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Add header and metadata infobox to the section.
     */
    protected function addDocumentHeader($section, Transcript $transcript, string $type): void
    {
        $typeLabel = match ($type) {
            'proofread' => 'النص الكامل المدقق لغوياً ونحوياً',
            'transcript' => 'التفريغ النصي المتزامن الأصلي',
            default => 'الملخص والمستند التنفيذي الذكي',
        };

        // Badge / Type
        $section->addText(mb_strtoupper($typeLabel), [
            'name' => 'Arial',
            'size' => 10,
            'bold' => true,
            'color' => '10B981',
        ], [
            'alignment' => Jc::START,
            'spaceAfter' => 100,
            'bidi' => true,
        ]);

        // Main Title
        $section->addText($transcript->title, [
            'name' => 'Arial',
            'size' => 18,
            'bold' => true,
            'color' => '111827',
        ], [
            'alignment' => Jc::START,
            'spaceAfter' => 200,
            'bidi' => true,
        ]);

        // Metadata Table
        $metaTable = $section->addTable([
            'borderSize' => 6,
            'borderColor' => 'E5E7EB',
            'cellMargin' => 120,
            'width' => 100 * 50,
            'unit' => 'pct',
            'bidiVisual' => true,
            'alignment' => JcTable::CENTER,
        ]);

        $row1 = $metaTable->addRow();
        $c1 = $row1->addCell(5000, ['bgColor' => 'F9FAFB']);
        $c1->addText('اسم القناة: ' . ($transcript->channel_name ?: 'غير محدد'), ['size' => 9.5, 'color' => '4B5563', 'bold' => true], ['bidi' => true]);

        $c2 = $row1->addCell(5000, ['bgColor' => 'F9FAFB']);
        $durationFormatted = $this->formatDuration($transcript->duration_seconds ?? 0);
        $c2->addText('مدة الفيديو: ' . $durationFormatted, ['size' => 9.5, 'color' => '4B5563', 'bold' => true], ['bidi' => true]);

        $row2 = $metaTable->addRow();
        $c3 = $row2->addCell(5000, ['bgColor' => 'F9FAFB']);
        $c3->addText('اللغة: ' . strtoupper($transcript->language ?: 'ar'), ['size' => 9.5, 'color' => '4B5563'], ['bidi' => true]);

        $c4 = $row2->addCell(5000, ['bgColor' => 'F9FAFB']);
        $dateText = 'تاريخ الاستخراج: ' . ($transcript->created_at ? $transcript->created_at->format('Y-m-d') : date('Y-m-d'));
        $c4->addText($dateText, ['size' => 9.5, 'color' => '4B5563'], ['bidi' => true]);

        // Divider
        $section->addText('', [], ['spaceAfter' => 240]);
    }

    /**
     * Add body content into section based on requested type.
     */
    protected function addDocumentBody($section, Transcript $transcript, string $type): void
    {
        if ($type === 'proofread') {
            $html = $transcript->proofread_html;
            if (!empty($html)) {
                $this->renderHtmlContent($section, $html);
                return;
            }

            // Fallback if HTML is not generated yet
            $text = $transcript->proofread_text ?: $transcript->full_text;
            $this->renderPlainTextAsParagraphs($section, $text);
            return;
        }

        if ($type === 'transcript') {
            $segments = $transcript->segments ?: [];
            if (!empty($segments)) {
                foreach ($segments as $seg) {
                    $timestamp = $seg['timestamp_formatted'] ?? '';
                    $text = $seg['text'] ?? '';

                    $p = $section->addTextRun([
                        'alignment' => Jc::START,
                        'bidi' => true,
                        'spaceAfter' => 100,
                    ]);

                    if ($timestamp) {
                        $p->addText("[{$timestamp}] ", [
                            'name' => 'Consolas',
                            'size' => 10,
                            'bold' => true,
                            'color' => '10B981',
                        ]);
                    }

                    $p->addText($text, [
                        'name' => 'Arial',
                        'size' => 11,
                        'color' => '1F2937',
                    ]);
                }
                return;
            }

            $this->renderPlainTextAsParagraphs($section, $transcript->full_text);
            return;
        }

        // Default: 'summary'
        $html = $transcript->summary_html;
        if (!empty($html)) {
            $this->renderHtmlContent($section, $html);
            return;
        }

        $text = $transcript->summary_text ?: $transcript->full_text;
        $this->renderPlainTextAsParagraphs($section, $text);
    }

    /**
     * Parse and render HTML content into PHPWord section with RTL wrapping.
     */
    protected function renderHtmlContent($section, string $html): void
    {
        // Clean and prepare HTML for PHPWord
        $cleanedHtml = $this->sanitizeHtmlForWord($html);
        $wrapped = '<div style="direction: rtl; text-align: right; font-family: Arial;">' . $cleanedHtml . '</div>';

        try {
            \PhpOffice\PhpWord\Shared\Html::addHtml($section, $wrapped, false, false);
        } catch (\Throwable $e) {
            // Fallback gracefully to plain text paragraphs if HTML parser encounters unsupported tags
            $plainText = strip_tags(str_replace(['</p>', '</h2>', '</h3>', '</li>'], "\n\n", $html));
            $this->renderPlainTextAsParagraphs($section, $plainText);
        }
    }

    /**
     * Render plain text as formatted RTL paragraphs.
     */
    protected function renderPlainTextAsParagraphs($section, ?string $text): void
    {
        if (empty($text)) {
            return;
        }

        $paragraphs = preg_split('/\n\s*\n/', trim($text));
        foreach ($paragraphs as $para) {
            $para = trim($para);
            if ($para !== '') {
                $section->addText($para, [
                    'name' => 'Arial',
                    'size' => 11,
                    'color' => '1F2937',
                ], [
                    'alignment' => Jc::START,
                    'spaceAfter' => 140,
                    'lineSpacing' => 1.25,
                    'bidi' => true,
                ]);
            }
        }
    }

    /**
     * Sanitize and format HTML before handing over to PHPWord.
     */
    protected function sanitizeHtmlForWord(string $html): string
    {
        // Replace styled elements or remove classes that might confuse the parser
        $html = preg_replace('/class="[^"]*"/', '', $html);
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);

        // Ensure blockquotes render as nice indented quotes
        $html = str_replace(['<blockquote>', '</blockquote>'], ['<p><em>« ', ' »</em></p>'], $html);

        return $html;
    }

    /**
     * Helper to format duration in seconds.
     */
    protected function formatDuration(int $seconds): string
    {
        $hrs = floor($seconds / 3600);
        $mins = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;

        if ($hrs > 0) {
            return sprintf('%02d:%02d:%02d', $hrs, $mins, $secs);
        }

        return sprintf('%02d:%02d', $mins, $secs);
    }
}
