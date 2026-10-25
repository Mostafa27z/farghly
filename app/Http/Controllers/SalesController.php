<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\SubscriptionManagementService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function __construct(
        protected SubscriptionManagementService $subscriptionService
    ) {}

    /**
     * Display the sales dashboard with clients and personal metrics.
     */
    public function index(Request $request): Response
    {
        $salesUser = $request->user();
        $filter = $request->input('filter', 'all'); // all, active, expiring_soon, expired
        $search = $request->input('search');

        $query = Tenant::whereDoesntHave('users', function ($uq) {
            $uq->where('system_role', 'super_admin');
        })
        ->with(['salesAgent'])
        ->withCount(['transcripts', 'users'])
        ->latest('created_at');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('plan_name', 'like', "%{$search}%")
                  ->orWhereHas('users', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        match ($filter) {
            'active' => $query->where('subscription_status', 'active')
                ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now())),
            'expiring_soon' => $query->where('subscription_status', 'active')
                ->whereBetween('expires_at', [now(), now()->addDays(7)]),
            'expired' => $query->where(fn($q) => $q->where('subscription_status', 'expired')->orWhere('expires_at', '<=', now())),
            default => null,
        };

        $clients = $query->paginate(15)->through(function ($tenant) {
            $owner = $tenant->users()->wherePivot('role', 'owner')->first() ?? $tenant->users()->first();

            $daysLeft = null;
            $isExpired = false;
            if ($tenant->expires_at) {
                $daysLeft = Carbon::now()->diffInDays($tenant->expires_at, false);
                $isExpired = $daysLeft < 0;
            }

            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'plan_name' => $tenant->plan_name,
                'subscription_status' => $isExpired ? 'expired' : $tenant->subscription_status,
                'expires_at' => $tenant->expires_at?->format('Y-m-d'),
                'expires_at_human' => $tenant->expires_at?->diffForHumans(),
                'days_left' => $daysLeft !== null ? (int) $daysLeft : null,
                'monthly_minutes_limit' => $tenant->monthly_minutes_limit,
                'monthly_minutes_used' => $tenant->monthly_minutes_used,
                'remaining_minutes' => $tenant->remainingMinutes(),
                'transcripts_count' => $tenant->transcripts_count,
                'owner' => $owner ? [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                ] : null,
                'sales_agent' => $tenant->salesAgent ? [
                    'id' => $tenant->salesAgent->id,
                    'name' => $tenant->salesAgent->name,
                ] : null,
            ];
        })->withQueryString();

        // Performance metrics: Super admin is strictly excluded from revenue
        if ($salesUser->isSuperAdmin()) {
            $salesTransactionsQuery = \App\Models\SubscriptionTransaction::whereHas('salesAgent', fn($q) => $q->where('system_role', 'sales'))
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);

            $metrics = [
                'is_super_admin' => true,
                'title' => 'إجمالي أداء فريق المبيعات (هذا الشهر)',
                'subtitle' => 'المدير العام مستبعد تماماً من إيرادات وإحصاءات المبيعات',
                'new_accounts' => (clone $salesTransactionsQuery)->where('action_type', 'new_account')->count(),
                'renewals' => (clone $salesTransactionsQuery)->where('action_type', 'renew')->count(),
                'total_transactions' => (clone $salesTransactionsQuery)->count(),
                'total_collected' => (float) (clone $salesTransactionsQuery)->sum('amount_collected'),
                'total_minutes_granted' => (int) (clone $salesTransactionsQuery)->sum('minutes_added'),
            ];
        } else {
            $raw = $this->subscriptionService->getSalesAgentMetrics($salesUser->id, 'this_month');
            $metrics = [
                'is_super_admin' => false,
                'title' => 'أدائي الشخصي بالمبيعات (هذا الشهر)',
                'subtitle' => 'إحصاءات العقود والتجديدات المسجلة باسمك',
                'new_accounts' => $raw['new_accounts'],
                'renewals' => $raw['renewals'],
                'total_transactions' => $raw['total_transactions'],
                'total_collected' => (float) $raw['total_collected'],
                'total_minutes_granted' => (int) $raw['total_minutes_granted'],
            ];
        }

        return Inertia::render('sales/index', [
            'clients' => $clients,
            'filters' => [
                'filter' => $filter,
                'search' => $search,
            ],
            'myMetrics' => $metrics,
            'availablePlans' => SubscriptionManagementService::PLANS,
            'availablePeriods' => SubscriptionManagementService::PERIODS,
        ]);
    }

    /**
     * Create a new client and workspace from sales.
     */
    public function storeClient(Request $request)
    {
        $request->validate([
            'client_name' => 'required|string|max:120',
            'client_email' => 'required|email|max:150|unique:users,email',
            'client_password' => 'nullable|string|min:6|max:64',
            'company_name' => 'nullable|string|max:120',
            'plan_name' => 'required|string|max:80',
            'duration_days' => 'required|integer|in:30,90,180,365',
            'monthly_minutes_limit' => 'required|integer|min:100|max:100000',
            'amount_collected' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ], [
            'client_name.required' => 'اسم العميل مطلوب.',
            'client_email.required' => 'البريد الإلكتروني للعميل مطلوب.',
            'client_email.unique' => 'هذا البريد الإلكتروني مسجل بالفعل لدى عميل آخر.',
            'plan_name.required' => 'يرجى اختيار الباقة.',
            'monthly_minutes_limit.required' => 'يرجى تحديد رصيد الدقائق.',
        ]);

        $result = $this->subscriptionService->createClientAccount($request->user(), $request->all());

        return redirect()->route('sales.index')->with(
            'success',
            "تم إنشاء وتفعيل حساب العميل «{$result['user']->name}» مع مساحة العمل «{$result['tenant']->name}» بنجاح!"
        );
    }

    /**
     * Renew an existing tenant's subscription.
     */
    public function renew(Request $request, Tenant $tenant)
    {
        $request->validate([
            'duration_days' => 'required|integer|in:30,90,180,365',
            'plan_name' => 'nullable|string|max:80',
            'minutes_to_add' => 'nullable|integer|min:0|max:100000',
            'reset_used_minutes' => 'nullable|boolean',
            'amount_collected' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $transaction = $this->subscriptionService->renewSubscription($request->user(), $tenant, $request->all());

        return redirect()->route('sales.index')->with(
            'success',
            "تم تجديد اشتراك العميل «{$tenant->name}» بنجاح حتى تاريخ {$tenant->expires_at->format('Y-m-d')}!"
        );
    }
}
