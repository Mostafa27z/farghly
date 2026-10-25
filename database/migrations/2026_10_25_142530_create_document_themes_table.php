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
        Schema::create('document_themes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['builder', 'custom_html'])->default('builder');
            $table->string('logo_path')->nullable();
            $table->longText('logo_base64')->nullable();
            $table->json('colors')->nullable(); // primary, accent, bg, text
            $table->string('font_family', 100)->default('Cairo');
            $table->string('header_text')->nullable();
            $table->string('footer_text')->nullable();
            $table->longText('custom_html')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_themes');
    }
};
