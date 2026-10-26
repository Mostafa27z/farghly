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
        Schema::table('transcripts', function (Blueprint $table) {
            $table->longText('proofread_html')->nullable()->after('summary_generated_at');
            $table->longText('proofread_text')->nullable()->after('proofread_html');
            $table->timestamp('proofread_generated_at')->nullable()->after('proofread_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transcripts', function (Blueprint $table) {
            $table->dropColumn([
                'proofread_html',
                'proofread_text',
                'proofread_generated_at',
            ]);
        });
    }
};
