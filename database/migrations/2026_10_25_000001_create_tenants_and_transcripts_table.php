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
        // 1. Tenants (Organizations / Workspaces)
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('plan_name')->default('Creator Pro');
            $table->string('subscription_status')->default('active'); // active, expired, suspended
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('monthly_minutes_limit')->default(3000);
            $table->unsignedInteger('monthly_minutes_used')->default(0);
            $table->unsignedInteger('max_team_members')->default(5);
            $table->timestamps();
        });

        // 2. Tenant - User Pivot
        Schema::create('tenant_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('member'); // owner, admin, member
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id']);
        });

        // 3. User's active tenant pointer
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_tenant_id')->nullable()->after('id')->constrained('tenants')->nullOnDelete();
        });

        // 4. Transcripts
        Schema::create('transcripts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('youtube_id', 32)->index();
            $table->string('video_url', 512);
            $table->string('title');
            $table->string('channel_name')->nullable();
            $table->string('thumbnail_url', 1024)->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('language', 16)->default('ar');
            $table->json('segments');
            $table->longText('full_text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transcripts');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_tenant_id']);
            $table->dropColumn('current_tenant_id');
        });
        Schema::dropIfExists('tenant_user');
        Schema::dropIfExists('tenants');
    }
};
