<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\TelegramLinkCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramSettingsController extends Controller
{
    /**
     * Display Telegram integration settings.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->currentTenant;
        $connection = $user->telegramConnection;

        $botUsername = config('services.telegram.bot_username', 'FarghlyAiBot');

        return Inertia::render('settings/telegram', [
            'connection' => $connection ? [
                'id' => $connection->id,
                'telegram_username' => $connection->telegram_username,
                'telegram_first_name' => $connection->telegram_first_name,
                'preferred_language' => $connection->preferred_language,
                'connected_at' => $connection->connected_at?->format('Y-m-d H:i'),
                'last_interaction_at' => $connection->last_interaction_at?->diffForHumans(),
            ] : null,
            'tenant' => [
                'name' => $tenant->name,
                'plan_name' => $tenant->plan_name,
                'remaining_recording_minutes' => $tenant->remainingRecordingMinutes(),
                'monthly_recording_minutes_limit' => $tenant->monthly_recording_minutes_limit ?? 300,
            ],
            'botUsername' => $botUsername,
            'flashCodeData' => session('link_code_data'),
        ]);
    }

    /**
     * Generate a new 10-minute link code.
     */
    public function generateCode(Request $request)
    {
        $user = $request->user();
        $tenant = $user->currentTenant;

        $codeData = TelegramLinkCode::generate($user, $tenant, 'connect', 10);

        return back()->with('link_code_data', [
            'plain_code' => $codeData['plain_code'],
            'deep_link' => $codeData['deep_link'],
            'expires_at' => $codeData['expires_at']->toISOString(),
        ])->with('success', 'تم إنشاء كود ربط جديد صالح لمدة 10 دقائق!');
    }

    /**
     * Disconnect active Telegram account.
     */
    public function disconnect(Request $request)
    {
        $connection = $request->user()->telegramConnection;
        if ($connection) {
            $connection->disconnect();
        }

        return back()->with('success', 'تم فك ارتباط حساب تيليجرام بنجاح.');
    }

    /**
     * Update preferred language.
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'preferred_language' => ['required', 'string', 'in:ar,en,auto'],
        ]);

        $connection = $request->user()->telegramConnection;
        if ($connection) {
            $connection->update([
                'preferred_language' => $request->input('preferred_language'),
            ]);
        }

        return back()->with('success', 'تم تحديث التفضيلات بنجاح.');
    }
}
