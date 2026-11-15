<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Transcript;
use App\Services\GeminiStudyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    /**
     * Generate a new AI Quiz for the transcript.
     */
    public function store(Request $request, Transcript $transcript, GeminiStudyService $studyService)
    {
        $this->authorizeTranscriptAccess($request, $transcript);

        $request->validate([
            'exam_type' => ['required', 'string', 'in:mcq,written,both'],
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'mcq_count' => ['nullable', 'integer', 'min:0', 'max:25'],
            'written_count' => ['nullable', 'integer', 'min:0', 'max:10'],
            'prompt' => ['nullable', 'string', 'max:1000'],
        ]);

        $examType = $request->input('exam_type', 'both');
        $difficulty = $request->input('difficulty', 'medium');
        $mcqCount = (int) ($request->input('mcq_count') ?? ($examType === 'written' ? 0 : 8));
        $writtenCount = (int) ($request->input('written_count') ?? ($examType === 'mcq' ? 0 : 3));
        $customPrompt = $request->input('prompt');

        $result = $studyService->generateQuiz(
            $transcript,
            $examType,
            $difficulty,
            $mcqCount,
            $writtenCount,
            $customPrompt
        );

        if (!$result['success']) {
            return back()->withErrors([
                'quiz' => $result['message_ar'] ?? 'فشل في توليد الاختبار عبر الذكاء الاصطناعي.',
            ]);
        }

        DB::transaction(function () use ($request, $transcript, $result, $examType, $difficulty, $customPrompt) {
            // Optional: delete previous quiz for clean fresh start, or keep history
            $quiz = $transcript->quizzes()->create([
                'tenant_id' => $request->user()->current_tenant_id,
                'user_id' => $request->user()->id,
                'title' => $result['title'],
                'exam_type' => $examType,
                'difficulty' => $difficulty,
                'mcq_count' => count(array_filter($result['questions'], fn ($q) => ($q['type'] ?? '') === 'mcq')),
                'written_count' => count(array_filter($result['questions'], fn ($q) => ($q['type'] ?? '') === 'written')),
                'max_full_attempts' => 3,
                'custom_prompt' => $customPrompt,
            ]);

            foreach ($result['questions'] as $idx => $qData) {
                $type = $qData['type'] ?? 'mcq';
                $quiz->questions()->create([
                    'sort_order' => $idx + 1,
                    'type' => $type,
                    'question_text' => $qData['question_text'] ?? '',
                    'options' => $qData['options'] ?? null,
                    'correct_option' => $qData['correct_option'] ?? null,
                    'explanation' => $qData['explanation'] ?? null,
                    'model_answer' => $qData['model_answer'] ?? null,
                    'grading_rubric' => $qData['grading_rubric'] ?? null,
                    'points' => (int) ($qData['points'] ?? ($type === 'written' ? 5 : 1)),
                ]);
            }
        });

        return back()->with('success', 'تم توليد الاختبار الذكي بنجاح! يمكنك الآن بدء الحل وتصحيح الامتحان.');
    }

    /**
     * Submit an exam attempt and grade it (تصحيح الامتحان).
     * Rule: Max 3 full attempts (grading written via AI). Attempt 4+ can retake MCQ only.
     */
    public function submitAttempt(Request $request, Quiz $quiz, GeminiStudyService $studyService)
    {
        $this->authorizeQuizAccess($request, $quiz);

        $userId = $request->user()->id;
        $fullAttemptsUsed = $quiz->fullAttemptsCountForUser($userId);
        $totalAttempts = $quiz->attempts()->where('user_id', $userId)->count();
        $attemptNumber = $totalAttempts + 1;

        // Determine mode based on 3-attempt limit
        if ($fullAttemptsUsed < 3) {
            $mode = 'full';
        } else {
            // Full attempts exhausted
            if (!$quiz->canRetakeMcqOnly()) {
                return back()->withErrors([
                    'quiz' => 'لقد استنفدت الحد الأقصى للمحاولات (3 محاولات) لهذا الاختبار المقالي. يمكنك إنشاء اختبار جديد بأسئلة مختلفة.',
                ]);
            }
            $mode = 'mcq_only';
        }

        $submittedAnswers = $request->input('answers', []);
        $questions = $quiz->questions()->get()->keyBy('id');

        $answersBreakdown = [];
        $writtenItemsToGrade = [];

        // 1. Grade MCQ questions deterministically in PHP (instant & reliable)
        foreach ($questions as $q) {
            if ($q->type === 'mcq') {
                $userAns = $submittedAnswers[$q->id]['selected_option'] ?? null;
                $isCorrect = false;

                if (!empty($userAns) && !empty($q->correct_option)) {
                    $isCorrect = (strtoupper(trim($userAns)) === strtoupper(trim($q->correct_option)));
                }

                $scoreAwarded = $isCorrect ? $q->points : 0;

                $answersBreakdown[$q->id] = [
                    'question_id' => $q->id,
                    'sort_order' => $q->sort_order,
                    'type' => 'mcq',
                    'question_text' => $q->question_text,
                    'options' => $q->options,
                    'selected_option' => $userAns,
                    'correct_option' => $q->correct_option,
                    'is_correct' => $isCorrect,
                    'score_awarded' => $scoreAwarded,
                    'max_points' => $q->points,
                    'explanation' => $q->explanation,
                ];
            } elseif ($q->type === 'written' && $mode === 'full') {
                $writtenItemsToGrade[] = [
                    'question_id' => $q->id,
                    'sort_order' => $q->sort_order,
                    'question_text' => $q->question_text,
                    'model_answer' => $q->model_answer,
                    'grading_rubric' => $q->grading_rubric,
                    'points' => $q->points,
                    'user_answer' => trim($submittedAnswers[$q->id]['written_answer'] ?? ''),
                ];
            }
        }

        // 2. Grade Written questions via Gemini AI batch if mode is full
        if ($mode === 'full' && !empty($writtenItemsToGrade)) {
            $aiGrading = $studyService->gradeWrittenAnswers($quiz->transcript, $writtenItemsToGrade);

            foreach ($writtenItemsToGrade as $item) {
                $qId = $item['question_id'];
                $grade = $aiGrading[$qId] ?? ['score_awarded' => 0, 'ai_feedback' => ''];
                $scoreAwarded = min((float) $item['points'], max(0, (float) ($grade['score_awarded'] ?? 0)));

                $answersBreakdown[$qId] = [
                    'question_id' => $qId,
                    'sort_order' => $item['sort_order'],
                    'type' => 'written',
                    'question_text' => $item['question_text'],
                    'written_answer' => $item['user_answer'],
                    'model_answer' => $item['model_answer'],
                    'score_awarded' => $scoreAwarded,
                    'max_points' => $item['points'],
                    'ai_feedback' => $grade['ai_feedback'] ?? 'تم تقييم الإجابة.',
                ];
            }
        }

        // Calculate score
        $totalPossible = 0;
        $scoreObtained = 0;
        foreach ($answersBreakdown as $b) {
            $totalPossible += (float) ($b['max_points'] ?? 0);
            $scoreObtained += (float) ($b['score_awarded'] ?? 0);
        }

        $percentage = $totalPossible > 0 ? round(($scoreObtained / $totalPossible) * 100, 1) : 0;

        $quiz->attempts()->create([
            'user_id' => $userId,
            'attempt_number' => $attemptNumber,
            'attempt_mode' => $mode,
            'status' => 'graded',
            'score_obtained' => $scoreObtained,
            'total_possible_score' => $totalPossible,
            'percentage' => $percentage,
            'answers' => $answersBreakdown,
            'submitted_at' => now(),
        ]);

        $notice = $mode === 'mcq_only'
            ? "تم تصحيح أسئلة الاختيار من متعدد بنجاح! نتيجتك: {$percentage}% (وضع إعادة MCQ فقط)."
            : "تم تصحيح الامتحان بنجاح وتقييم الإجابات المقالية بالذكاء الاصطناعي! نتيجتك: {$percentage}%.";

        return back()->with('success', $notice);
    }

    /**
     * Delete a quiz to re-generate anew.
     */
    public function destroy(Request $request, Quiz $quiz)
    {
        $this->authorizeQuizAccess($request, $quiz);

        $quiz->delete();

        return back()->with('success', 'تم حذف الاختبار بنجاح.');
    }

    protected function authorizeTranscriptAccess(Request $request, Transcript $transcript): void
    {
        if ($transcript->tenant_id !== $request->user()->current_tenant_id) {
            abort(403);
        }
    }

    protected function authorizeQuizAccess(Request $request, Quiz $quiz): void
    {
        if ($quiz->tenant_id !== $request->user()->current_tenant_id) {
            abort(403);
        }
    }
}
