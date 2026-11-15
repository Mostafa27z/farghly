<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('transcript_id')->constrained('transcripts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('exam_type')->default('both'); // mcq, written, both
            $table->string('difficulty')->default('medium'); // easy, medium, hard
            $table->unsignedInteger('mcq_count')->default(0);
            $table->unsignedInteger('written_count')->default(0);
            $table->unsignedInteger('max_full_attempts')->default(3);
            $table->text('custom_prompt')->nullable();
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('type'); // mcq, written
            $table->text('question_text');
            $table->json('options')->nullable(); // [{key: 'A', text: '...'}, ...]
            $table->string('correct_option', 8)->nullable(); // A, B, C, D
            $table->text('explanation')->nullable();
            $table->text('model_answer')->nullable();
            $table->text('grading_rubric')->nullable();
            $table->unsignedInteger('points')->default(1);
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->string('attempt_mode')->default('full'); // full, mcq_only
            $table->string('status')->default('graded');
            $table->decimal('score_obtained', 6, 2)->default(0);
            $table->decimal('total_possible_score', 6, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->json('answers')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('flashcard_sets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('transcript_id')->constrained('transcripts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('cards');
            $table->unsignedInteger('cards_count')->default(0);
            $table->text('custom_prompt')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flashcard_sets');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
