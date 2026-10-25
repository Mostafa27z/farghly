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
        // 1. Add system roles and active flag to users
        Schema::table('users', function (Blueprint $table) {
            $table->enum('system_role', ['client', 'sales', 'super_admin'])->default('client')->after('email');
            $table->boolean('is_active')->default(true)->after('system_role');
        });

        // 2. Add sales agent attribution to tenants
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('created_by_sales_id')->nullable()->after('max_team_members')->constrained('users')->nullOnDelete();
        });

        // 3. Create subscription transactions & sales audit log table
        Schema::create('subscription_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->enum('action_type', ['new_account', 'renew', 'add_minutes', 'change_plan', 'suspend', 'activate'])->default('renew');
            $table->string('plan_name', 100);
            $table->unsignedInteger('duration_days')->default(30);
            $table->unsignedInteger('minutes_added')->default(0);
            $table->timestamp('previous_expires_at')->nullable();
            $table->timestamp('new_expires_at')->nullable();
            $table->decimal('amount_collected', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['sales_id', 'created_at']);
            $table->index(['tenant_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_transactions');

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['created_by_sales_id']);
            $table->dropColumn('created_by_sales_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['system_role', 'is_active']);
        });
    }
};
