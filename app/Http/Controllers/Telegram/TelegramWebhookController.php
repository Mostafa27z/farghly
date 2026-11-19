<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Services\TelegramWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Handle incoming webhook updates from Telegram Bot API.
     */
    public function handle(Request $request, TelegramWorkflowService $workflowService)
    {
        $update = $request->all();

        if (empty($update)) {
            return response()->json(['ok' => false], 400);
        }

        try {
            $workflowService->handleUpdate($update);
        } catch (\Throwable $e) {
            Log::error('Exception in TelegramWebhookController: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
        }

        // Telegram always expects a quick 200 OK
        return response()->json(['ok' => true]);
    }
}
