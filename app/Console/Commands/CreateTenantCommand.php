<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:create 
                            {name : Name of the Workspace/Tenant} 
                            {--email= : Admin User email} 
                            {--password=password : Admin User password}
                            {--plan=Creator Pro : Plan Name}
                            {--months=12 : Validity period in months}
                            {--videos=150 : Monthly videos quota}
                            {--minutes= : Monthly minutes quota (legacy)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Provision a new Tenant workspace with an active paid subscription and owner';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $slug = Str::slug($name) . '-' . Str::random(4);
        $email = $this->option('email') ?: (Str::slug($name) . '@example.com');
        $password = $this->option('password') ?: 'password';
        $plan = $this->option('plan');
        $months = (int) $this->option('months');
        $videos = $this->option('videos') !== null ? (int) $this->option('videos') : null;
        $legacyMinutes = $this->option('minutes') !== null ? (int) $this->option('minutes') : null;

        if ($videos === null) {
            $videos = $legacyMinutes ? (int) round($legacyMinutes / 20) : 150;
        }
        $minutes = $legacyMinutes ?: ($videos * 20);

        $tenant = Tenant::create([
            'name' => $name,
            'slug' => $slug,
            'plan_name' => $plan,
            'subscription_status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonths($months),
            'monthly_videos_limit' => $videos,
            'monthly_videos_used' => 0,
            'monthly_minutes_limit' => $minutes,
            'monthly_minutes_used' => 0,
            'max_team_members' => 5,
        ]);

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => "{$name} Admin",
                'password' => Hash::make($password),
                'current_tenant_id' => $tenant->id,
            ]
        );

        $user->update(['current_tenant_id' => $tenant->id]);
        $tenant->users()->syncWithoutDetaching([$user->id => ['role' => 'owner']]);

        $this->info("✓ Tenant [{$tenant->name}] created successfully!");
        $this->table(
            ['Tenant ID', 'Slug', 'Plan', 'Expires At', 'Monthly Videos', 'Owner Email'],
            [
                [
                    $tenant->id,
                    $tenant->slug,
                    $tenant->plan_name,
                    $tenant->expires_at->format('Y-m-d'),
                    $tenant->monthly_videos_limit,
                    $user->email,
                ],
            ]
        );

        return 0;
    }
}
