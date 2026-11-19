<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->unsignedInteger('monthly_videos_limit')->default(150);
            $table->unsignedInteger('monthly_recording_minutes_limit')->default(300);
            $table->unsignedInteger('monthly_minutes_limit')->default(3000);
            $table->decimal('price', 8, 2)->default(59.00);
            $table->unsignedInteger('max_team_members')->default(5);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed initial plans
        $defaultPlans = [
            [
                'name' => 'Starter',
                'display_name' => 'الباقة المبتدئة (Starter)',
                'description' => 'مناسبة للمعلمين والمدربين المستقلين للبدء بتفريغ المحاضرات',
                'monthly_videos_limit' => 50,
                'monthly_recording_minutes_limit' => 120, // 2 hours
                'monthly_minutes_limit' => 1000,
                'price' => 29.00,
                'max_team_members' => 2,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Creator Pro',
                'display_name' => 'صانع المحتوى الاحترافي (Creator Pro)',
                'description' => 'الخطة الأكثر شعبية للأكاديميين وصناع المحتوى التعليمي',
                'monthly_videos_limit' => 150,
                'monthly_recording_minutes_limit' => 300, // 5 hours
                'monthly_minutes_limit' => 3000,
                'price' => 59.00,
                'max_team_members' => 5,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Agency',
                'display_name' => 'الوكالات والمؤسسات (Agency)',
                'description' => 'للجامعات والمراكز التدريبية وفرق العمل التي تحتاج إنتاجية عالية',
                'monthly_videos_limit' => 500,
                'monthly_recording_minutes_limit' => 1200, // 20 hours
                'monthly_minutes_limit' => 10000,
                'price' => 149.00,
                'max_team_members' => 15,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'display_name' => 'المشاريع والشركات (Enterprise)',
                'description' => 'أقصى حدود للاستخدام المكثف، وتكامل غير محدود ودعم مخصص',
                'monthly_videos_limit' => 1500,
                'monthly_recording_minutes_limit' => 3000, // 50 hours
                'monthly_minutes_limit' => 30000,
                'price' => 299.00,
                'max_team_members' => 50,
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plans')->insert($defaultPlans);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
