<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSalesOrAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isStaff() || !$user->is_active) {
            abort(403, 'غير مصرح: هذه الصفحة مخصصة لفريق المبيعات والإدارة فقط.');
        }

        return $next($request);
    }
}
