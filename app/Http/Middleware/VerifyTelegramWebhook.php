<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyTelegramWebhook
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedSecret = config('services.telegram.webhook_secret');

        if (!empty($expectedSecret)) {
            $receivedSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');

            if (empty($receivedSecret) || !hash_equals($expectedSecret, $receivedSecret)) {
                Log::warning('Unauthorized Telegram webhook attempt', [
                    'ip' => $request->ip(),
                    'has_token_header' => !empty($receivedSecret),
                ]);

                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        return $next($request);
    }
}
