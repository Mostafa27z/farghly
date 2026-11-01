<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // ==========================================
        // 1. Super Admin Account (المدير العام للمنصة)
        // ==========================================
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@farghly.com'],
            [
                'name' => 'المدير التنفيذي (Super Admin)',
                'password' => $defaultPassword,
                'system_role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // ==========================================
        // 2. Sales Agent Account (فريق المبيعات والتفعيل)
        // ==========================================
        $salesAgent = User::updateOrCreate(
            ['email' => 'sales@farghly.com'],
            [
                'name' => 'مسؤول المبيعات والتفعيل',
                'password' => $defaultPassword,
                'system_role' => 'sales',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // ==========================================
        // 3. Teacher Pro Workspace & Account (معلم محترف)
        // ==========================================
        $teacherTenant = Tenant::updateOrCreate(
            ['slug' => 'teacher-farooq'],
            [
                'name' => 'أكاديمية الفيزياء · أ. محمد فاروق',
                'plan_name' => 'Teacher Pro',
                'subscription_status' => 'active',
                'starts_at' => now()->subMonth(),
                'expires_at' => now()->addYear(),
                'monthly_videos_limit' => 50,
                'monthly_videos_used' => 6,
                'monthly_minutes_limit' => 3600, // 60 hours
                'monthly_minutes_used' => 240,
                'max_team_members' => 3,
                'created_by_sales_id' => $salesAgent->id,
            ]
        );

        $teacherUser = User::updateOrCreate(
            ['email' => 'teacher@farghly.com'],
            [
                'name' => 'أ.د/ محمد فاروق (معلم)',
                'password' => $defaultPassword,
                'system_role' => 'client',
                'current_tenant_id' => $teacherTenant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $teacherTenant->users()->syncWithoutDetaching([
            $teacherUser->id => ['role' => 'owner'],
        ]);

        // ==========================================
        // 4. Academy / Center Workspace (سنتر تعليمي)
        // ==========================================
        $centerTenant = Tenant::updateOrCreate(
            ['slug' => 'el-nokhba-center'],
            [
                'name' => 'مجموعة سناتر النخبة التعليمية',
                'plan_name' => 'Academy Enterprise',
                'subscription_status' => 'active',
                'starts_at' => now()->subWeeks(2),
                'expires_at' => now()->addYear(),
                'monthly_videos_limit' => 200,
                'monthly_videos_used' => 22,
                'monthly_minutes_limit' => 12000, // 200 hours
                'monthly_minutes_used' => 1350,
                'max_team_members' => 15,
                'created_by_sales_id' => $salesAgent->id,
            ]
        );

        $centerUser = User::updateOrCreate(
            ['email' => 'center@farghly.com'],
            [
                'name' => 'إدارة سنتر النخبة',
                'password' => $defaultPassword,
                'system_role' => 'client',
                'current_tenant_id' => $centerTenant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $centerTenant->users()->syncWithoutDetaching([
            $centerUser->id => ['role' => 'owner'],
        ]);

        // Connect Super Admin to Teacher Tenant as viewer/admin
        $teacherTenant->users()->syncWithoutDetaching([
            $superAdmin->id => ['role' => 'admin'],
        ]);
        if (!$superAdmin->current_tenant_id) {
            $superAdmin->current_tenant_id = $teacherTenant->id;
            $superAdmin->save();
        }
    }
}

