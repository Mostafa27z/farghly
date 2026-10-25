<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'is_super_admin' => (bool) $request->user()?->isSuperAdmin(),
                'is_sales' => (bool) $request->user()?->isSales(),
                'is_staff' => (bool) $request->user()?->isStaff(),
                'tenant' => $request->user()?->currentTenant ? [
                    'id' => $request->user()->currentTenant->id,
                    'name' => $request->user()->currentTenant->name,
                    'slug' => $request->user()->currentTenant->slug,
                    'plan_name' => $request->user()->currentTenant->plan_name,
                    'remaining_minutes' => $request->user()->currentTenant->remainingMinutes(),
                    'has_active_subscription' => $request->user()->currentTenant->hasActiveSubscription(),
                    'expires_at' => $request->user()->currentTenant->expires_at?->format('Y-m-d'),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
