<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isSuperAdmin() || !$user->is_active) {
            abort(403, 'غير مصرح: هذه الصفحة مخصصة للمدير العام فقط.');
        }

        return $next($request);
    }
}
