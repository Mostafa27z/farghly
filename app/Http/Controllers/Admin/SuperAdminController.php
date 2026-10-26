<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionTransaction;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SubscriptionManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function __construct(
        protected SubscriptionManagementService $subscriptionService
    ) {}

    /**
     * Super Admin Overview Dashboard.
     */
    public function dashboard(): Response
    {
        $overview = $this->subscriptionService->getSystemOverviewMetrics();

        // Recent 8 transactions across all sales reps
        $recentTransactions = SubscriptionTransaction::with(['salesAgent', 'tenant'])
            ->latest('created_at')
            ->take(8)
            ->get()
            ->map(fn($tx) => [
                'id' => $tx->id,
                'action_type' => $tx->action_type,
                'plan_name' => $tx->plan_name,
                'duration_days' => $tx->duration_days,
                'videos_added' => $tx->videos_added ?? (int) round(($tx->minutes_added ?? 0) / 20),
                'minutes_added' => $tx->minutes_added,
                'amount_collected' => (float) $tx->amount_collected,
                'is_admin_action' => (bool) ($tx->salesAgent?->system_role === 'super_admin'),
                'notes' => $tx->notes,
                'created_at_human' => $tx->created_at->diffForHumans(),
                'sales_agent' => $tx->salesAgent ? [
                    'id' => $tx->salesAgent->id,
                    'name' => $tx->salesAgent->name,
                    'system_role' => $tx->salesAgent->system_role,
                ] : null,
                'tenant' => $tx->tenant ? [
                    'id' => $tx->tenant->id,
                    'name' => $tx->tenant->name,
                ] : null,
            ]);

        // Monthly breakdown
        $leaderboard = $this->subscriptionService->getSalesLeaderboard('this_month');

        return Inertia::render('admin/dashboard', [
            'metrics' => $overview,
            'recentTransactions' => $recentTransactions,
            'topPerformers' => $leaderboard->take(4)->values(),
        ]);
    }

    /**
     * Sales Team Performance Leaderboard & Comparative Analytics.
     */
    public function performance(Request $request): Response
    {
        $period = $request->input('period', 'this_month'); // today, this_week, this_month, last_month, last_90_days, all_time
        $selectedSalesId = $request->input('sales_id');

        $leaderboard = $this->subscriptionService->getSalesLeaderboard($period);

        $selectedAgentMetrics = null;
        if ($selectedSalesId) {
            $agent = User::find($selectedSalesId);
            if ($agent && $agent->isSales()) {
                $raw = $this->subscriptionService->getSalesAgentMetrics($agent->id, $period);
                $selectedAgentMetrics = [
                    'agent' => [
                        'id' => $agent->id,
                        'name' => $agent->name,
                        'email' => $agent->email,
                        'system_role' => $agent->system_role,
                    ],
                    'new_accounts' => $raw['new_accounts'],
                    'renewals' => $raw['renewals'],
                    'total_collected' => (float) $raw['total_collected'],
                    'total_minutes_granted' => (int) $raw['total_minutes_granted'],
                    'transactions' => $raw['recent_transactions']->map(fn($tx) => [
                        'id' => $tx->id,
                        'action_type' => $tx->action_type,
                        'plan_name' => $tx->plan_name,
                        'duration_days' => $tx->duration_days,
                        'amount_collected' => (float) $tx->amount_collected,
                        'notes' => $tx->notes,
                        'created_at_human' => $tx->created_at->diffForHumans(),
                        'tenant_name' => $tx->tenant?->name,
                    ]),
                ];
            }
        }

        return Inertia::render('admin/performance', [
            'leaderboard' => $leaderboard,
            'period' => $period,
            'selectedAgent' => $selectedAgentMetrics,
        ]);
    }

    /**
     * Full System Audit Trail / Subscription Logs.
     */
    public function auditLogs(Request $request): Response
    {
        $query = SubscriptionTransaction::with(['salesAgent', 'tenant'])->latest('created_at');

        if ($salesId = $request->input('sales_id')) {
            $query->where('sales_id', $salesId);
        }

        if ($actionType = $request->input('action_type')) {
            $query->where('action_type', $actionType);
        }

        $logs = $query->paginate(20)->through(fn($tx) => [
            'id' => $tx->id,
            'action_type' => $tx->action_type,
            'plan_name' => $tx->plan_name,
            'duration_days' => $tx->duration_days,
            'videos_added' => $tx->videos_added ?? (int) round(($tx->minutes_added ?? 0) / 20),
            'minutes_added' => $tx->minutes_added,
            'previous_expires_at' => $tx->previous_expires_at?->format('Y-m-d'),
            'new_expires_at' => $tx->new_expires_at?->format('Y-m-d'),
            'amount_collected' => (float) $tx->amount_collected,
            'is_super_admin_action' => (bool) ($tx->salesAgent?->system_role === 'super_admin'),
            'notes' => $tx->notes,
            'created_at' => $tx->created_at->format('Y-m-d H:i'),
            'created_at_human' => $tx->created_at->diffForHumans(),
            'sales_agent' => $tx->salesAgent ? [
                'id' => $tx->salesAgent->id,
                'name' => $tx->salesAgent->name,
                'email' => $tx->salesAgent->email,
                'system_role' => $tx->salesAgent->system_role,
            ] : null,
            'tenant' => $tx->tenant ? [
                'id' => $tx->tenant->id,
                'name' => $tx->tenant->name,
            ] : null,
        ])->withQueryString();

        $salesAgents = User::where('system_role', 'sales')->get(['id', 'name']);

        return Inertia::render('admin/audit-logs', [
            'logs' => $logs,
            'salesAgents' => $salesAgents,
            'filters' => [
                'sales_id' => $request->input('sales_id'),
                'action_type' => $request->input('action_type'),
            ],
        ]);
    }
}
