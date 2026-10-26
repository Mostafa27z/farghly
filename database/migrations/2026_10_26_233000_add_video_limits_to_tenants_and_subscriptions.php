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
            $table->unsignedInteger('monthly_videos_limit')->default(150)->after('expires_at');
            $table->unsignedInteger('monthly_videos_used')->default(0)->after('monthly_videos_limit');
        });

        Schema::table('subscription_transactions', function (Blueprint $table) {
            $table->unsignedInteger('videos_added')->nullable()->after('minutes_added');
        });

        // Migrate existing tenant data based on actual transcripts and existing minute limits
        try {
            $tenants = DB::table('tenants')->get();
            foreach ($tenants as $tenant) {
                $actualUsed = DB::table('transcripts')->where('tenant_id', $tenant->id)->count();
                // If they had 1000 minutes -> 50 videos; 3000 -> 150; 10000 -> 500; 30000 -> 1500
                $calcLimit = max(50, (int) round(($tenant->monthly_minutes_limit ?? 3000) / 20));

                DB::table('tenants')->where('id', $tenant->id)->update([
                    'monthly_videos_limit' => $calcLimit,
                    'monthly_videos_used' => $actualUsed,
                ]);
            }

            // Also update subscription transactions
            $transactions = DB::table('subscription_transactions')->get();
            foreach ($transactions as $tx) {
                if ($tx->minutes_added) {
                    $videos = max(1, (int) round($tx->minutes_added / 20));
                    DB::table('subscription_transactions')->where('id', $tx->id)->update([
                        'videos_added' => $videos,
                    ]);
                }
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
            $table->dropColumn('videos_added');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['monthly_videos_limit', 'monthly_videos_used']);
        });
    }
};
