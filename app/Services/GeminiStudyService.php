<?php

namespace App\Services;

use App\Models\Transcript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiStudyService
{
    protected string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?? '';
        $this->model = config('services.gemini.model') ?? 'gemini-2.5-flash';
    }

    /**
     * Generate an AI-powered quiz (MCQ, Written, or Both) from transcript.
     *
     * @param Transcript $transcript
     * @param string $examType 'mcq', 'written', 'both'
     * @param string $difficulty 'easy', 'medium', 'hard'
     * @param int $mcqCount Number of MCQs to generate
     * @param int $writtenCount Number of written questions to generate
     * @param string|null $customPrompt
     * @return array
     */
    public function generateQuiz(
        Transcript $transcript,
        string $examType = 'both',
        string $difficulty = 'medium',
        int $mcqCount = 8,
        int $writtenCount = 3,
        ?string $customPrompt = null
    ): array {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message_ar' => 'مفتاح Gemini API غير معرف في ملف .env.',
                'message_en' => 'Gemini API key is missing.',
            ];
        }

        // Adjust counts based on exam type
        if ($examType === 'mcq') {
            $writtenCount = 0;
            $mcqCount = max(3, min(25, $mcqCount));
        } elseif ($examType === 'written') {
            $mcqCount = 0;
            $writtenCount = max(1, min(10, $writtenCount));
        } else {
            $mcqCount = max(2, min(20, $mcqCount));
            $writtenCount = max(1, min(6, $writtenCount));
        }

        $sourceText = !empty($transcript->proofread_text) ? $transcript->proofread_text : $transcript->full_text;
        if (empty(trim($sourceText ?? ''))) {
            return [
                'success' => false,
                'message_ar' => 'لا يتوفر نص مفرغ في هذه المحاضرة لتوليد الاختبار.',
                'message_en' => 'No transcript text available.',
            ];
        }

        // Truncate sourceText if extremely long to fit comfortably in prompt (first 30k chars is plenty for deep quiz)
        if (mb_strlen($sourceText) > 35000) {
            $sourceText = mb_substr($sourceText, 0, 35000) . "\n...(تم اقتطاع باقي النص للتركيز على المحاور الرئيسية)";
        }

        $difficultyAr = match ($difficulty) {
            'easy' => 'مستوى سهل ومباشر يركز على تذكر المفاهيم الأساسية',
            'hard' => 'مستوى متقدم وعميق يقيس الفهم والتحليل والربط بين الأفكار',
            default => 'مستوى متوسط متوازن يجمع بين المفاهيم المباشرة والتطبيق',
        };

        $prompt = <<<PROMPT
أنت أستاذ جامعي وخبير قياس وتقويم تعليمي.
المهمة: قم بإعداد اختبار تقييمي احترافي باللغة العربية الفصحى استناداً إلى محتوى المحاضرة المرفق.

بيانات الاختبار:
- عنوان المحاضرة: {$transcript->title}
- نوع الاختبار المطلوب: {$examType}
- مستوى الصعوبة: {$difficultyAr}
- عدد أسئلة الاختيار من متعدد (MCQ) المطلوبة: {$mcqCount}
- عدد الأسئلة المقالية (Written) المطلوبة: {$writtenCount}
{$this->formatCustomPrompt($customPrompt)}

تعليمات دقيقة:
1. أسئلة الاختيار من متعدد (MCQ):
   - كل سؤال يحتوي على 4 خيارات بأحرف ("A", "B", "C", "D").
   - حدد خياراً واحداً صحيحاً تماماً ("correct_option": "A" أو "B" أو "C" أو "D").
   - الخيارات الخاطئة يجب أن تكون منطقية وموضوعية (ليست ساذجة).
   - اكتب شرحاً وتوضيحاً وافياً لسبب صحة هذا الخيار ("explanation").
   - النقاط الافتراضية لكل سؤال MCQ: 1 نقطة.

2. الأسئلة المقالية (Written):
   - أسئلة تقيس الاستيعاب والشرح والتحليل لما طرحه المتحدث.
   - اكتب لكل سؤال "model_answer" (إجابة نموذجية وافية توضح كل ما ينبغي للطالب ذكره).
   - اكتب "grading_rubric" (معايير التصحيح وتوزيع الدرجات، مثال: نقطتان لذكر المفهوم، نقطتان للمثال، نقطة للاستنتاج).
   - النقاط الافتراضية لكل سؤال مقالي: 5 نقاط.

يجب أن تكون مخرجاتك بتنسيق JSON حصراً بدون أي نصوص تمهيدية، وفق هذا المخطط:
{
  "title": "عنوان وصفي للاختبار",
  "questions": [
    {
      "sort_order": 1,
      "type": "mcq",
      "question_text": "نص السؤال هنا؟",
      "options": [
        {"key": "A", "text": "الخيار الأول"},
        {"key": "B", "text": "الخيار الثاني"},
        {"key": "C", "text": "الخيار الثالث"},
        {"key": "D", "text": "الخيار الرابع"}
      ],
      "correct_option": "B",
      "explanation": "الشرح العلمي لسبب اختيار هذا البديل...",
      "points": 1
    },
    {
      "sort_order": 2,
      "type": "written",
      "question_text": "نص السؤال المقالي هنا؟",
      "model_answer": "الإجابة النموذجية الكاملة...",
      "grading_rubric": "معايير التقييم: 2 درجة لـ... و 3 درجات لـ...",
      "points": 5
    }
  ]
}

محتوى المحاضرة:
{$sourceText}
PROMPT;

        try {
            $data = $this->callGeminiJson($prompt);

            if (!$data || !isset($data['questions']) || !is_array($data['questions']) || empty($data['questions'])) {
                return [
                    'success' => false,
                    'message_ar' => 'تعذر استخراج أسئلة صالحة من استجابة الذكاء الاصطناعي.',
                    'message_en' => 'Invalid quiz payload returned.',
                ];
            }

            return [
                'success' => true,
                'title' => $data['title'] ?? ('اختبار استيعاب: ' . $transcript->title),
                'questions' => $data['questions'],
            ];
        } catch (\Throwable $e) {
            Log::error("Gemini quiz generation error: {$e->getMessage()}", ['trace' => $e->getTraceAsString()]);
            return [
                'success' => false,
                'message_ar' => 'حدث خطأ أثناء توليد الاختبار: ' . $e->getMessage(),
                'message_en' => $e->getMessage(),
            ];
        }
    }

    /**
     * Grade written answers using Gemini AI against the stored model answers and grading rubrics.
     *
     * @param Transcript $transcript
     * @param array $writtenItems [ ['question_id' => ..., 'question_text' => ..., 'model_answer' => ..., 'grading_rubric' => ..., 'points' => 5, 'user_answer' => ...], ... ]
     * @return array [ 'question_id' => [ 'score_awarded' => float, 'ai_feedback' => string ], ... ]
     */
    public function gradeWrittenAnswers(Transcript $transcript, array $writtenItems): array
    {
        if (empty($writtenItems)) {
            return [];
        }

        if (empty($this->apiKey)) {
            // Fallback default grading if key is somehow missing
            $fallback = [];
            foreach ($writtenItems as $item) {
                $fallback[$item['question_id']] = [
                    'score_awarded' => !empty(trim($item['user_answer'] ?? '')) ? round(($item['points'] ?? 5) * 0.7, 1) : 0,
                    'ai_feedback' => 'تم رصد الإجابة (تعذر الاتصال بخدمة التقييم الذكي الآلي في الوقت الحالي).',
                ];
            }
            return $fallback;
        }

        $itemsJson = json_encode($writtenItems, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $prompt = <<<PROMPT
أنت مصحح أكاديمي محترف وخبير في تصحيح الاختبارات وتقييم إجابات الطلاب المقالية بموضوعية وعدالة.
المهمة: قم بتقييم وتصحيح إجابات الطالب للأسئلة المقالية التالية المستندة إلى محاضرة: "{$transcript->title}".

لكل سؤال، ستجد:
- `question_id`: معرف السؤال
- `question_text`: نص السؤال
- `model_answer`: الإجابة النموذجية المرجعية
- `grading_rubric`: معايير توزيع الدرجات
- `points`: الحد الأقصى للنقاط المتاحة للسؤال
- `user_answer`: إجابة الطالب التي كتبها

قواعد التصحيح الصارمة:
1. قيّم المعنى والفهم الجوهري وليس مجرد التطابق الحرفي للألفاظ.
2. إذا كانت إجابة الطالب فارغة أو غير مرتبطة بالسؤال تماماً، امنحه 0 نقاط.
3. امنح درجات جزئية عادلة (`score_awarded`) بين 0 والحد الأقصى (`points`) حسب تغطية الطالب لعناصر الإجابة النموذجية (يمكن استخدام أنصاف درجات مثل 3.5).
4. اكتب `ai_feedback` لكل سؤال باللغة العربية:
   - اذكر بوضوح ما أصاب فيه الطالب وما أحسن بيانه.
   - وضّح النقاط أو المفاهيم التي أغفلها الطالب أو أخطأ فيها مقارنة بالإجابة النموذجية.
   - قدّم نصيحة توجيهية لتعزيز استيعابه.

أخرج النتيجة بصيغة JSON حصراً بهذا التنسيق:
{
  "grades": [
    {
      "question_id": 1,
      "score_awarded": 4.5,
      "ai_feedback": "إجابة ممتازة ودقيقة ذكرت كافة الأركان الرئيسية... ينقصها فقط ضرب مثال تطبيقي وفقاً للمعايير."
    }
  ]
}

بيانات الأسئلة وإجابات الطالب:
{$itemsJson}
PROMPT;

        try {
            $data = $this->callGeminiJson($prompt);
            $result = [];

            if (isset($data['grades']) && is_array($data['grades'])) {
                foreach ($data['grades'] as $g) {
                    $qId = $g['question_id'] ?? null;
                    if ($qId) {
                        $result[$qId] = [
                            'score_awarded' => (float) ($g['score_awarded'] ?? 0),
                            'ai_feedback' => trim((string) ($g['ai_feedback'] ?? '')),
                        ];
                    }
                }
            }

            // Fill any missed item
            foreach ($writtenItems as $item) {
                $qId = $item['question_id'];
                if (!isset($result[$qId])) {
                    $hasText = !empty(trim($item['user_answer'] ?? ''));
                    $result[$qId] = [
                        'score_awarded' => $hasText ? round(($item['points'] ?? 5) * 0.7, 1) : 0,
                        'ai_feedback' => $hasText ? 'تم استلام الإجابة واحتساب درجة تقديرية.' : 'لم يقم الطالب بكتابة إجابة.',
                    ];
                }
            }

            return $result;
        } catch (\Throwable $e) {
            Log::error("Gemini written grading error: {$e->getMessage()}");
            $fallback = [];
            foreach ($writtenItems as $item) {
                $fallback[$item['question_id']] = [
                    'score_awarded' => !empty(trim($item['user_answer'] ?? '')) ? round(($item['points'] ?? 5) * 0.7, 1) : 0,
                    'ai_feedback' => 'تم تقييم الإجابة تلقائياً: ' . $e->getMessage(),
                ];
            }
            return $fallback;
        }
    }

    /**
     * Generate flashcards from transcript (capped by plan limits).
     */
    public function generateFlashcards(
        Transcript $transcript,
        int $count = 15,
        ?string $customPrompt = null
    ): array {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message_ar' => 'مفتاح Gemini API غير معرف في ملف .env.',
                'message_en' => 'Gemini API key is missing.',
            ];
        }

        $count = max(3, min(100, $count));
        $sourceText = !empty($transcript->proofread_text) ? $transcript->proofread_text : $transcript->full_text;
        if (empty(trim($sourceText ?? ''))) {
            return [
                'success' => false,
                'message_ar' => 'لا يتوفر نص مفرغ في هذه المحاضرة لتوليد البطاقات التعليمية.',
                'message_en' => 'No transcript text available.',
            ];
        }

        if (mb_strlen($sourceText) > 35000) {
            $sourceText = mb_substr($sourceText, 0, 35000) . "\n...(تم اقتطاع باقي النص للتركيز على المحاور الرئيسية)";
        }

        $prompt = <<<PROMPT
أنت خبير في تقنيات الاستذكار الفعال والتكرار المتباعد (Spaced Repetition).
المهمة: قم بإعداد بطاقات تعليمية ذكية (Flashcards) باللغة العربية الفصحى استناداً إلى محتوى المحاضرة: "{$transcript->title}".

العدد المطلوب للبطاقات: بالضبط {$count} بطاقة.
{$this->formatCustomPrompt($customPrompt)}

إرشادات إعداد البطاقات:
1. الوجه الأمامي (front): سؤال مركز، مصطلح، أو مفهوم رئيسي يثير التفكير النشط.
2. الوجه الخلفي (back): إجابة واضحة وشاملة ولكنها موجزة، توضح المفهوم أو الحل أو الشرح بدقة.
3. التصنيف (category): حدد تصنيفاً منطقياً لكل بطاقة (مثل: "مفاهيم أساسية"، "تعريفات ومصطلحات"، "خطوات عملية"، "أرقام وإحصاءات"، "قواعد وأحكام").
4. مستوى الصعوبة (difficulty): "سهل" أو "متوسط" أو "متقدم".

يجب أن تكون المخرجات بتنسيق JSON حصراً بدون أي نصوص تمهيدية، وفق هذا النمط:
{
  "cards": [
    {
      "id": 1,
      "front": "ما هو تعريف... في سياق المحاضرة؟",
      "back": "هو عبارة عن... ويهدف إلى تحقيق...",
      "category": "مفاهيم أساسية",
      "difficulty": "متوسط"
    }
  ]
}

محتوى المحاضرة:
{$sourceText}
PROMPT;

        try {
            $data = $this->callGeminiJson($prompt);

            if (!$data || !isset($data['cards']) || !is_array($data['cards']) || empty($data['cards'])) {
                return [
                    'success' => false,
                    'message_ar' => 'تعذر استخراج بطاقات صالحة من استجابة الذكاء الاصطناعي.',
                    'message_en' => 'Invalid flashcards payload returned.',
                ];
            }

            return [
                'success' => true,
                'cards' => $data['cards'],
            ];
        } catch (\Throwable $e) {
            Log::error("Gemini flashcards generation error: {$e->getMessage()}");
            return [
                'success' => false,
                'message_ar' => 'حدث خطأ أثناء توليد البطاقات التعليمية: ' . $e->getMessage(),
                'message_en' => $e->getMessage(),
            ];
        }
    }

    /**
     * Perform HTTP POST to Gemini with responseMimeType application/json and parse response.
     */
    protected function callGeminiJson(string $prompt): ?array
    {
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::timeout(150)
            ->withoutVerifying()
            ->withOptions($this->buildHttpOptions())
            ->withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey,
            ])
            ->post($apiUrl, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 16384,
                    'responseMimeType' => 'application/json',
                ],
            ]);

        if (!$response->successful()) {
            Log::error('Gemini API call failed', [
                'status' => $response->status(),
                'error' => $response->body(),
            ]);
            throw new \RuntimeException($response->json()['error']['message'] ?? ('HTTP ' . $response->status()));
        }

        $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $rawText = $this->cleanJsonOutput($rawText);

        $decoded = json_decode($rawText, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('Failed to decode JSON from Gemini: ' . json_last_error_msg(), ['raw' => mb_substr($rawText, 0, 500)]);
            return null;
        }

        return $decoded;
    }

    /**
     * Clean markdown wrappers like ```json ... ``` from output.
     */
    protected function cleanJsonOutput(string $raw): string
    {
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);
        return trim($cleaned);
    }

    protected function formatCustomPrompt(?string $customPrompt): string
    {
        if (empty(trim($customPrompt ?? ''))) {
            return '';
        }

        return "\nتوجيهات إضافية خاصة مطلوبة من المستخدم يجب الالتزام بها:\n\"" . trim($customPrompt) . "\"\n";
    }

    protected function buildHttpOptions(): array
    {
        $options = [
            'connect_timeout' => 15,
        ];

        if (defined('CURLOPT_IPRESOLVE') && defined('CURL_IPRESOLVE_V4')) {
            $options['curl'] = [
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            ];
        }

        $proxy = config('services.gemini.proxy') ?: env('GEMINI_PROXY');
        if (!empty($proxy)) {
            $options['proxy'] = $proxy;
        }

        return $options;
    }
}
