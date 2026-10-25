<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantHasActiveSubscription
{
    /**
     * Handle an incoming request and ensure current tenant holds an active, paid license.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Sales users are strictly restricted to managing subscriptions and finance
        if ($user->isSales()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'code' => 'SALES_RESTRICTED',
                    'message_ar' => 'حساب المبيعات مخصص لإدارة اشتراكات العملاء والماليات فقط، ولا يملك صلاحية استخدام استوديو التفريغ.',
                ], 403);
            }

            return redirect()->route('sales.index')->with(
                'error',
                'حساب المبيعات مخصص لإدارة اشتراكات العملاء والماليات فقط، ولا يملك صلاحية استخدام استوديو التفريغ.'
            );
        }

        // If super admin has no tenant assigned, redirect to admin panel instead of subscription gate
        if ($user->isSuperAdmin() && !$user->currentTenant && !$user->tenants()->exists()) {
            return redirect()->route('admin.dashboard');
        }

        // Determine current workspace
        $tenant = $user->currentTenant;

        if (!$tenant) {
            // Auto-assign first tenant if user belongs to one
            $firstTenant = $user->tenants()->first();
            if ($firstTenant) {
                $user->update(['current_tenant_id' => $firstTenant->id]);
                $tenant = $firstTenant;
            } else {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'code' => 'NO_WORKSPACE',
                        'message_ar' => 'حسابك غير مرتبط بأي مساحة عمل مشتركة. يرجى التواصل مع مسؤول مؤسستك.',
                        'message_en' => 'Your account is not linked to any active workspace.',
                    ], 403);
                }

                return Inertia::render('subscription/inactive', [
                    'reason' => 'no_workspace',
                    'message_ar' => 'حسابك غير مرتبط بأي مساحة عمل مشتركة. يرجى التواصل مع مسؤول مؤسستك.',
                ])->toResponse($request);
            }
        }

        // Check if subscription is valid and unexpired
        if (!$tenant->hasActiveSubscription()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'code' => 'SUBSCRIPTION_EXPIRED',
                    'message_ar' => 'انتهت صلاحية اشتراك مساحة العمل هذه. يرجى التواصل مع المبيعات لتجديد الترخيص.',
                    'message_en' => 'This workspace subscription has expired. Please contact sales to renew.',
                    'tenant_name' => $tenant->name,
                    'expires_at' => $tenant->expires_at?->toIso8601String(),
                ], 403);
            }

            return Inertia::render('subscription/inactive', [
                'reason' => 'expired',
                'tenant' => [
                    'name' => $tenant->name,
                    'plan_name' => $tenant->plan_name,
                    'expires_at' => $tenant->expires_at?->format('Y-m-d'),
                ],
                'message_ar' => 'انتهت صلاحية اشتراك مساحة العمل هذه. يرجى التواصل مع إدارة المبيعات لتجديد الترخيص ومواصلة تفريغ الفيديوهات.',
            ])->toResponse($request);
        }

        return $next($request);
    }
}
