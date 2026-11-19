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
        Schema::dropIfExists('groq_usage_logs');
        Schema::dropIfExists('telegram_pending_transcriptions');
        Schema::dropIfExists('telegram_connections');
        Schema::dropIfExists('telegram_link_codes');

        // 1. One-time link and scoped upload codes
        Schema::create('telegram_link_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->bigInteger('telegram_chat_id')->nullable()->index();
            $table->string('purpose', 32)->default('connect')->index(); // 'connect' or 'scoped_upload'
            $table->string('code_hash', 64)->unique();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('used_at')->nullable()->index();
            $table->timestamps();
        });

        // 2. Active Telegram account connections (1 per Farghly user)
        Schema::create('telegram_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->bigInteger('telegram_chat_id')->nullable()->unique();
            $table->bigInteger('telegram_user_id')->nullable()->unique();
            $table->string('telegram_username')->nullable();
            $table->string('telegram_first_name')->nullable();
            $table->string('preferred_language', 10)->default('ar');
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();
        });

        // 3. Pending & In-Flight Telegram Transcriptions
        Schema::create('telegram_pending_transcriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_connection_id')->constrained('telegram_connections')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->bigInteger('telegram_chat_id')->nullable();
            $table->string('source', 24)->default('bot')->index(); // 'bot', 'scoped_upload', 'mini_app'
            $table->bigInteger('source_message_id')->nullable();
            $table->bigInteger('prompt_message_id')->nullable();
            $table->string('file_id', 255)->nullable();
            $table->string('file_unique_id', 128)->nullable()->index();
            $table->string('local_temp_path', 512)->nullable();
            $table->string('media_type', 32)->default('audio');
            $table->string('file_name', 255)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('suggested_title', 255);
            $table->string('language', 10)->default('ar');
            $table->string('status', 24)->default('pending')->index(); // 'pending', 'queued', 'processing', 'delayed', 'completed', 'cancelled', 'failed', 'expired'
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->foreignUuid('transcript_id')->nullable()->constrained('transcripts')->nullOnDelete();
            $table->text('error_message')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        // 4. Groq & Gemini usage tracking for budget guards
        Schema::create('groq_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 24)->default('groq')->index();
            $table->unsignedInteger('audio_seconds');
            $table->foreignUuid('transcript_id')->nullable()->constrained('transcripts')->nullOnDelete();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groq_usage_logs');
        Schema::dropIfExists('telegram_pending_transcriptions');
        Schema::dropIfExists('telegram_connections');
        Schema::dropIfExists('telegram_link_codes');
    }
};
