<?php

namespace App\Services;

use App\Models\SubscriptionTransaction;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SubscriptionManagementService
{
    /**
     * Standard predefined plans for quick selection by sales.
     */
    public const PLANS = [
        'Starter' => [
            'name' => 'الباقة المبتدئة (Starter)',
            'videos' => 50,
            'minutes' => 1000,
            'default_price' => 29,
        ],
        'Creator Pro' => [
            'name' => 'صانع المحتوى الاحترافي (Creator Pro)',
            'videos' => 150,
            'minutes' => 3000,
            'default_price' => 59,
        ],
        'Agency' => [
            'name' => 'الوكالات والمؤسسات (Agency)',
            'videos' => 500,
            'minutes' => 10000,
            'default_price' => 149,
        ],
        'Enterprise' => [
            'name' => 'المشاريع والشركات (Enterprise)',
            'videos' => 1500,
            'minutes' => 30000,
            'default_price' => 299,
        ],
    ];

    /**
     * Quick extension periods.
     */
    public const PERIODS = [
        30 => 'شهر واحد (30 يوماً)',
        90 => '3 أشهر (ربع سنوي)',
        180 => '6 أشهر (نصف سنوي)',
        365 => 'سنة كاملة (365 يوماً)',
    ];

    /**
     * Onboard and create a new client account, tenant workspace, and initial subscription.
     */
    public function createClientAccount(User $salesAgent, array $data): array
    {
        return DB::transaction(function () use ($salesAgent, $data) {
            // 1. Create client user
            $user = User::create([
                'name' => $data['client_name'],
                'email' => $data['client_email'],
                'password' => Hash::make($data['client_password'] ?? '12345678'),
                'system_role' => 'client',
                'is_active' => true,
            ]);

            // 2. Create tenant workspace
            $companyName = $data['company_name'] ?: ($data['client_name'] . ' Workspace');
            $slug = Str::slug($companyName);
            if (empty($slug) || Tenant::where('slug', $slug)->exists()) {
                $slug = 'tenant-' . Str::random(8);
            }

            $durationDays = (int) ($data['duration_days'] ?? 30);
            $planName = $data['plan_name'] ?? 'Creator Pro';
            $videosLimit = (int) ($data['monthly_videos_limit'] ?? ($data['monthly_minutes_limit'] ? round($data['monthly_minutes_limit'] / 20) : 150));

            $startsAt = Carbon::now();
            $expiresAt = (clone $startsAt)->addDays($durationDays);

            $tenant = Tenant::create([
                'name' => $companyName,
                'slug' => $slug,
                'plan_name' => $planName,
                'subscription_status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'monthly_videos_limit' => $videosLimit,
                'monthly_videos_used' => 0,
                'monthly_minutes_limit' => $videosLimit * 20,
                'monthly_minutes_used' => 0,
                'max_team_members' => (int) ($data['max_team_members'] ?? 5),
                'created_by_sales_id' => $salesAgent->id,
            ]);

            // 3. Link user to tenant
            $user->tenants()->attach($tenant->id, ['role' => 'owner']);
            $user->update(['current_tenant_id' => $tenant->id]);

            // 4. Record initial subscription transaction
            SubscriptionTransaction::create([
                'sales_id' => $salesAgent->id,
                'tenant_id' => $tenant->id,
                'action_type' => 'new_account',
                'plan_name' => $planName,
                'duration_days' => $durationDays,
                'videos_added' => $videosLimit,
                'minutes_added' => $videosLimit * 20,
                'previous_expires_at' => null,
                'new_expires_at' => $expiresAt,
                'amount_collected' => !empty($data['amount_collected']) ? (float) $data['amount_collected'] : null,
                'notes' => $data['notes'] ?? 'اشتراك جديد تم إنشاؤه عبر فريق المبيعات',
                'created_at' => now(),
            ]);

            return [
                'user' => $user,
                'tenant' => $tenant,
            ];
        });
    }

    /**
     * Renew or extend an existing tenant's subscription.
     */
    public function renewSubscription(User $salesAgent, Tenant $tenant, array $data): SubscriptionTransaction
    {
        return DB::transaction(function () use ($salesAgent, $tenant, $data) {
            $prevExpiresAt = $tenant->expires_at;
            $durationDays = (int) ($data['duration_days'] ?? 30);

            // Extend from current expiry if it is still valid in the future, otherwise from today
            $baseDate = ($prevExpiresAt && $prevExpiresAt->isFuture()) ? (clone $prevExpiresAt) : Carbon::now();
            $newExpiresAt = $baseDate->addDays($durationDays);

            $planName = $data['plan_name'] ?? $tenant->plan_name;
            $videosToAdd = (int) ($data['videos_to_add'] ?? ($data['minutes_to_add'] ? round($data['minutes_to_add'] / 20) : 0));
            $resetUsed = !empty($data['reset_used_videos']) || !empty($data['reset_used_minutes']);

            $updateData = [
                'subscription_status' => 'active',
                'expires_at' => $newExpiresAt,
                'plan_name' => $planName,
            ];

            if ($resetUsed) {
                $updateData['monthly_videos_used'] = 0;
                $updateData['monthly_minutes_used'] = 0;
            }

            if ($videosToAdd > 0) {
                $currentLimit = $tenant->monthly_videos_limit ?: (int) round(($tenant->monthly_minutes_limit ?? 3000) / 20);
                $updateData['monthly_videos_limit'] = $currentLimit + $videosToAdd;
                $updateData['monthly_minutes_limit'] = ($currentLimit + $videosToAdd) * 20;
            } elseif (!empty($data['new_videos_limit'])) {
                $newLimit = (int) $data['new_videos_limit'];
                $updateData['monthly_videos_limit'] = $newLimit;
                $updateData['monthly_minutes_limit'] = $newLimit * 20;
            } elseif (!empty($data['new_minutes_limit'])) {
                $newLimit = (int) round($data['new_minutes_limit'] / 20);
                $updateData['monthly_videos_limit'] = $newLimit;
                $updateData['monthly_minutes_limit'] = (int) $data['new_minutes_limit'];
            }

            $tenant->update($updateData);

            $effectiveLimit = $tenant->monthly_videos_limit ?: 150;
            $recordedVideos = $videosToAdd > 0 ? $videosToAdd : ($resetUsed ? $effectiveLimit : 0);

            return SubscriptionTransaction::create([
                'sales_id' => $salesAgent->id,
                'tenant_id' => $tenant->id,
                'action_type' => 'renew',
                'plan_name' => $planName,
                'duration_days' => $durationDays,
                'videos_added' => $recordedVideos,
                'minutes_added' => $recordedVideos * 20,
                'previous_expires_at' => $prevExpiresAt,
                'new_expires_at' => $newExpiresAt,
                'amount_collected' => !empty($data['amount_collected']) ? (float) $data['amount_collected'] : null,
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Get performance summary for a specific sales agent or all agents.
     * Super admins are strictly excluded from sales revenue and performance.
     */
    public function getSalesAgentMetrics(int $salesId, string $period = 'this_month'): array
    {
        $user = User::find($salesId);
        if ($user && $user->system_role === 'super_admin') {
            return [
                'new_accounts' => 0,
                'renewals' => 0,
                'total_transactions' => 0,
                'total_collected' => 0.0,
                'total_minutes_granted' => 0,
                'recent_transactions' => collect(),
            ];
        }

        $query = SubscriptionTransaction::where('sales_id', $salesId);
        $tenantQuery = Tenant::where('created_by_sales_id', $salesId);

        $this->applyPeriodFilter($query, $period);
        $this->applyPeriodFilter($tenantQuery, $period);

        $newAccountsCount = (clone $query)->where('action_type', 'new_account')->count();
        $renewalsCount = (clone $query)->where('action_type', 'renew')->count();
        $totalCollected = (clone $query)->sum('amount_collected');
        $totalVideosGranted = (clone $query)->sum(DB::raw('COALESCE(videos_added, ROUND(minutes_added / 20))'));
        $totalMinutesGranted = (clone $query)->sum('minutes_added');

        $recentTransactions = (clone $query)
            ->with(['tenant'])
            ->latest('created_at')
            ->take(10)
            ->get();

        return [
            'new_accounts' => $newAccountsCount,
            'renewals' => $renewalsCount,
            'total_transactions' => $newAccountsCount + $renewalsCount,
            'total_collected' => (float) $totalCollected,
            'total_videos_granted' => (int) $totalVideosGranted,
            'total_minutes_granted' => (int) $totalMinutesGranted,
            'recent_transactions' => $recentTransactions,
        ];
    }

    /**
     * Get comparative leaderboard of sales agents for the Super Admin.
     * Strictly includes ONLY actual sales representatives (excludes super_admin).
     */
    public function getSalesLeaderboard(string $period = 'this_month'): Collection
    {
        $salesAgents = User::where('system_role', 'sales')
            ->where('is_active', true)
            ->get();

        return $salesAgents->map(function ($agent) use ($period) {
            $metrics = $this->getSalesAgentMetrics($agent->id, $period);

            return [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'system_role' => $agent->system_role,
                'new_accounts' => $metrics['new_accounts'],
                'renewals' => $metrics['renewals'],
                'total_transactions' => $metrics['total_transactions'],
                'total_collected' => $metrics['total_collected'],
                'total_videos_granted' => $metrics['total_videos_granted'],
                'total_minutes_granted' => $metrics['total_minutes_granted'],
                'last_transaction' => $metrics['recent_transactions']->first()?->created_at?->diffForHumans(),
            ];
        })->sortByDesc('total_transactions')->values();
    }

    /**
     * System-wide subscription overview for Super Admin.
     * Excludes super admin internal accounts and only counts sales revenue.
     */
    public function getSystemOverviewMetrics(): array
    {
        // Exclude internal super admin tenant accounts from commercial client statistics
        $commercialTenantsQuery = Tenant::whereDoesntHave('users', function ($q) {
            $q->where('system_role', 'super_admin');
        });

        $totalTenants = (clone $commercialTenantsQuery)->count();
        $activeTenants = (clone $commercialTenantsQuery)->where('subscription_status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })->count();

        $expiredTenants = (clone $commercialTenantsQuery)->where(function ($q) {
            $q->where('subscription_status', 'expired')
              ->orWhere('expires_at', '<=', now());
        })->count();

        $expiringIn7Days = (clone $commercialTenantsQuery)->where('subscription_status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->count();

        $salesCount = User::where('system_role', 'sales')->where('is_active', true)->count();

        // Count ONLY transactions performed by sales representatives (super_admin transactions excluded from revenue)
        $thisMonthTransactions = SubscriptionTransaction::whereHas('salesAgent', function ($q) {
                $q->where('system_role', 'sales');
            })
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);

        return [
            'total_tenants' => $totalTenants,
            'active_tenants' => $activeTenants,
            'expired_tenants' => $expiredTenants,
            'expiring_soon' => $expiringIn7Days,
            'sales_agents_count' => $salesCount,
            'month_renewals' => (clone $thisMonthTransactions)->where('action_type', 'renew')->count(),
            'month_new_clients' => (clone $thisMonthTransactions)->where('action_type', 'new_account')->count(),
            'month_revenue' => (float) (clone $thisMonthTransactions)->sum('amount_collected'),
        ];
    }

    protected function applyPeriodFilter($query, string $period): void
    {
        match ($period) {
            'today' => $query->whereDate('created_at', Carbon::today()),
            'this_week' => $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]),
            'this_month' => $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year),
            'last_month' => $query->whereMonth('created_at', Carbon::now()->subMonth()->month)->whereYear('created_at', Carbon::now()->subMonth()->year),
            'last_90_days' => $query->where('created_at', '>=', Carbon::now()->subDays(90)),
            'all_time' => null,
            default => $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year),
        };
    }
}
