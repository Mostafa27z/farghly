<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\Tenant;
use App\Models\Transcript;
use App\Models\User;
use App\Services\GeminiStudyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class QuizAndFlashcardTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Tenant $tenant;
    protected Transcript $transcript;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'name' => 'Test Academy',
            'slug' => 'test-academy',
            'plan_name' => 'Creator Pro',
            'subscription_status' => 'active',
            'monthly_videos_limit' => 50,
            'monthly_minutes_limit' => 1000,
        ]);

        $this->user = User::factory()->create([
            'current_tenant_id' => $this->tenant->id,
            'system_role' => 'client',
        ]);

        $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);

        $this->transcript = Transcript::create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'youtube_id' => 'dQw4w9WgXcQ',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'title' => 'مقدمة في الذكاء الاصطناعي',
            'channel_name' => 'Tech Channel',
            'duration_seconds' => 1200,
            'language' => 'ar',
            'segments' => [],
            'full_text' => 'الذكاء الاصطناعي هو فرع من علوم الحاسب يهدف إلى محاكاة القدرات الذهنية البشرية. ينقسم إلى تعلم آلي وتعلم عميق.',
        ]);
    }

    public function test_can_generate_quiz_via_service_mock()
    {
        $mockStudyService = Mockery::mock(GeminiStudyService::class);
        $mockStudyService->shouldReceive('generateQuiz')
            ->once()
            ->andReturn([
                'success' => true,
                'title' => 'اختبار الذكاء الاصطناعي',
                'questions' => [
                    [
                        'type' => 'mcq',
                        'question_text' => 'ما هو الذكاء الاصطناعي؟',
                        'options' => [
                            ['key' => 'A', 'text' => 'فرع من علوم الحاسب'],
                            ['key' => 'B', 'text' => 'لغة برمجة قديمة'],
                            ['key' => 'C', 'text' => 'نظام تشغيل'],
                            ['key' => 'D', 'text' => 'معالج رسومي'],
                        ],
                        'correct_option' => 'A',
                        'explanation' => 'لأنه يحاكي القدرات الذهنية البشرية.',
                        'points' => 1,
                    ],
                    [
                        'type' => 'written',
                        'question_text' => 'اشرح الفرق بين التعلم الآلي والتعلم العميق.',
                        'model_answer' => 'التعلم الآلي يعتمد على خوارزميات إحصائية بينما التعلم العميق يستخدم شبكات عصبية عميقة.',
                        'grading_rubric' => 'نقطتان للمفهوم، 3 نقاط للمقارنة.',
                        'points' => 5,
                    ],
                ],
            ]);

        $this->app->instance(GeminiStudyService::class, $mockStudyService);

        $response = $this->actingAs($this->user)
            ->post(route('transcripts.quizzes.store', $this->transcript->id), [
                'exam_type' => 'both',
                'difficulty' => 'medium',
                'mcq_count' => 1,
                'written_count' => 1,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('quizzes', [
            'transcript_id' => $this->transcript->id,
            'exam_type' => 'both',
        ]);

        $this->assertDatabaseCount('quiz_questions', 2);
    }

    public function test_grades_mcq_deterministically_and_written_via_ai_for_attempts_1_to_3()
    {
        $quiz = $this->transcript->quizzes()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'title' => 'اختبار تجريبي',
            'exam_type' => 'both',
            'difficulty' => 'medium',
            'mcq_count' => 1,
            'written_count' => 1,
            'max_full_attempts' => 3,
        ]);

        $mcqQ = $quiz->questions()->create([
            'sort_order' => 1,
            'type' => 'mcq',
            'question_text' => 'سؤال اختيار؟',
            'options' => [
                ['key' => 'A', 'text' => 'الخيار أ'],
                ['key' => 'B', 'text' => 'الخيار ب'],
            ],
            'correct_option' => 'A',
            'points' => 1,
        ]);

        $writtenQ = $quiz->questions()->create([
            'sort_order' => 2,
            'type' => 'written',
            'question_text' => 'سؤال مقالي؟',
            'model_answer' => 'إجابة نموذجية',
            'points' => 5,
        ]);

        $mockStudyService = Mockery::mock(GeminiStudyService::class);
        $mockStudyService->shouldReceive('gradeWrittenAnswers')
            ->once()
            ->andReturn([
                $writtenQ->id => [
                    'score_awarded' => 4.5,
                    'ai_feedback' => 'إجابة ممتازة.',
                ],
            ]);

        $this->app->instance(GeminiStudyService::class, $mockStudyService);

        // Submit Attempt 1 (Correct MCQ 'A' + Written)
        $response = $this->actingAs($this->user)
            ->post(route('quizzes.submit', $quiz->id), [
                'answers' => [
                    $mcqQ->id => ['selected_option' => 'A'],
                    $writtenQ->id => ['written_answer' => 'إجابة الطالب'],
                ],
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $this->user->id,
            'attempt_number' => 1,
            'attempt_mode' => 'full',
            'score_obtained' => 5.5, // 1 for MCQ + 4.5 for Written
            'total_possible_score' => 6.0,
        ]);

        $this->assertEquals(2, $quiz->remainingFullAttemptsForUser($this->user->id));
    }

    public function test_attempt_4_forces_mcq_only_mode_and_does_not_call_ai_for_written()
    {
        $quiz = $this->transcript->quizzes()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'title' => 'اختبار تجريبي',
            'exam_type' => 'both',
            'difficulty' => 'medium',
            'mcq_count' => 1,
            'written_count' => 1,
            'max_full_attempts' => 3,
        ]);

        $mcqQ = $quiz->questions()->create([
            'sort_order' => 1,
            'type' => 'mcq',
            'question_text' => 'سؤال اختيار؟',
            'options' => [
                ['key' => 'A', 'text' => 'الخيار أ'],
                ['key' => 'B', 'text' => 'الخيار ب'],
            ],
            'correct_option' => 'B',
            'points' => 2,
        ]);

        $writtenQ = $quiz->questions()->create([
            'sort_order' => 2,
            'type' => 'written',
            'question_text' => 'سؤال مقالي؟',
            'model_answer' => 'إجابة نموذجية',
            'points' => 5,
        ]);

        // Create 3 existing full attempts
        for ($i = 1; $i <= 3; $i++) {
            $quiz->attempts()->create([
                'user_id' => $this->user->id,
                'attempt_number' => $i,
                'attempt_mode' => 'full',
                'status' => 'graded',
                'score_obtained' => 5,
                'total_possible_score' => 7,
                'percentage' => 71.4,
                'answers' => [],
            ]);
        }

        $this->assertEquals(0, $quiz->remainingFullAttemptsForUser($this->user->id));

        // Ensure GeminiStudyService gradeWrittenAnswers is NEVER called on attempt 4
        $mockStudyService = Mockery::mock(GeminiStudyService::class);
        $mockStudyService->shouldReceive('gradeWrittenAnswers')->never();
        $this->app->instance(GeminiStudyService::class, $mockStudyService);

        // Submit Attempt 4 with MCQ correct answer 'B'
        $response = $this->actingAs($this->user)
            ->post(route('quizzes.submit', $quiz->id), [
                'answers' => [
                    $mcqQ->id => ['selected_option' => 'B'],
                    $writtenQ->id => ['written_answer' => 'any answer'],
                ],
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $this->user->id,
            'attempt_number' => 4,
            'attempt_mode' => 'mcq_only',
            'score_obtained' => 2.0, // Only MCQ graded
            'total_possible_score' => 2.0,
            'percentage' => 100.0,
        ]);
    }

    public function test_flashcards_enforces_plan_limit()
    {
        // Creator Pro allows max 25 cards
        $this->assertEquals(25, $this->tenant->maxFlashcardsPerVideo());

        // Requesting 30 cards should fail validation
        $response = $this->actingAs($this->user)
            ->post(route('transcripts.flashcards.store', $this->transcript->id), [
                'count' => 30,
            ]);

        $response->assertSessionHasErrors('count');

        // Requesting 15 cards should succeed
        $mockStudyService = Mockery::mock(GeminiStudyService::class);
        $mockStudyService->shouldReceive('generateFlashcards')
            ->once()
            ->withArgs(function ($t, $count) {
                return $count === 15;
            })
            ->andReturn([
                'success' => true,
                'cards' => array_fill(0, 15, [
                    'id' => 1,
                    'front' => 'سؤال؟',
                    'back' => 'جواب.',
                    'category' => 'مفاهيم',
                    'difficulty' => 'متوسط',
                ]),
            ]);

        $this->app->instance(GeminiStudyService::class, $mockStudyService);

        $response = $this->actingAs($this->user)
            ->post(route('transcripts.flashcards.store', $this->transcript->id), [
                'count' => 15,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('flashcard_sets', [
            'transcript_id' => $this->transcript->id,
            'cards_count' => 15,
        ]);
    }
}
