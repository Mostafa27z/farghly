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
            $table->string('youtube_id', 32)->nullable()->change();
            $table->string('video_url', 512)->nullable()->change();
            $table->string('source_type', 32)->default('youtube')->after('user_id')->index();
            $table->string('original_filename')->nullable()->after('thumbnail_url');
            $table->string('media_path')->nullable()->after('original_filename');
            $table->unsignedBigInteger('file_size_bytes')->nullable()->after('media_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transcripts', function (Blueprint $table) {
            $table->dropColumn(['source_type', 'original_filename', 'media_path', 'file_size_bytes']);
            $table->string('youtube_id', 32)->nullable(false)->change();
            $table->string('video_url', 512)->nullable(false)->change();
        });
    }
};
