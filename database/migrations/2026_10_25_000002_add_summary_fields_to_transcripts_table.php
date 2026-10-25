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
            $table->longText('summary_html')->nullable()->after('full_text');
            $table->longText('summary_text')->nullable()->after('summary_html');
            $table->string('summary_style', 64)->nullable()->after('summary_text');
            $table->text('summary_prompt')->nullable()->after('summary_style');
            $table->timestamp('summary_generated_at')->nullable()->after('summary_prompt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transcripts', function (Blueprint $table) {
            $table->dropColumn([
                'summary_html',
                'summary_text',
                'summary_style',
                'summary_prompt',
                'summary_generated_at',
            ]);
        });
    }
};
