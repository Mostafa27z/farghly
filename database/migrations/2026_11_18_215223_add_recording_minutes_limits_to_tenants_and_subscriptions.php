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
        Schema::table('tenants', function (Blueprint $table) {
            $table->unsignedInteger('monthly_recording_minutes_limit')->default(300)->after('monthly_minutes_used');
            $table->unsignedInteger('monthly_recording_minutes_used')->default(0)->after('monthly_recording_minutes_limit');
        });

        Schema::table('subscription_transactions', function (Blueprint $table) {
            $table->unsignedInteger('recording_minutes_added')->nullable()->after('videos_added');
        });

        try {
            $tenants = DB::table('tenants')->get();
            foreach ($tenants as $tenant) {
                $plan = strtolower($tenant->plan_name ?? '');
                $recLimit = match (true) {
                    str_contains($plan, 'starter') => 120,
                    str_contains($plan, 'agency') => 1200,
                    str_contains($plan, 'enterprise') => 3000,
                    default => 300,
                };

                $usedSeconds = DB::table('transcripts')
                    ->where('tenant_id', $tenant->id)
                    ->where('source_type', 'file')
                    ->sum('duration_seconds') ?: 0;

                DB::table('tenants')->where('id', $tenant->id)->update([
                    'monthly_recording_minutes_limit' => $recLimit,
                    'monthly_recording_minutes_used' => (int) ceil($usedSeconds / 60),
                ]);
            }
        } catch (\Throwable $e) {
            // Ignore if tables are empty
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_transactions', function (Blueprint $table) {
            $table->dropColumn('recording_minutes_added');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['monthly_recording_minutes_limit', 'monthly_recording_minutes_used']);
        });
    }
};
