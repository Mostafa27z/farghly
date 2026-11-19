<?php

namespace App\Console\Commands;

use App\Services\TelegramBotClient;
use Illuminate\Console\Command;

class SetupTelegramBotCommand extends Command
{
    protected $signature = 'telegram:setup {--info : Only display current webhook info}';
    protected $description = 'Register Telegram Bot webhook URL, secret token, and commands';

    public function handle(TelegramBotClient $botClient): int
    {
        if (!$botClient->isConfigured()) {
            $this->error('TELEGRAM_BOT_TOKEN is not configured in .env file.');
            return 1;
        }

        if ($this->option('info')) {
            $info = $botClient->getWebhookInfo();
            $this->info('Current Telegram Webhook Info:');
            $this->line(json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            return 0;
        }

        $appUrl = rtrim(config('app.url'), '/');
        $webhookUrl = "{$appUrl}/webhooks/telegram";
        $secretToken = config('services.telegram.webhook_secret');

        $this->info("Registering webhook URL: {$webhookUrl}");

        $res = $botClient->setWebhook($webhookUrl, $secretToken);
        if (empty($res['ok'])) {
            $this->error('Failed to set webhook: ' . ($res['description'] ?? 'Unknown error'));
            return 1;
        }
        $this->info('✓ Webhook registered successfully!');

        // Set commands
        $commands = [
            ['command' => 'start', 'description' => 'بدء استخدام البوت أو ربط الحساب'],
            ['command' => 'quota', 'description' => 'استعراض رصيد باقتك والمتبقي من الدقائق'],
            ['command' => 'recent', 'description' => 'استعراض آخر التفريغات في مساحة عملك'],
            ['command' => 'disconnect', 'description' => 'فك ارتباط حساب تيليجرام'],
            ['command' => 'help', 'description' => 'دليل الاستخدام والمساعدة'],
        ];

        $botClient->setMyCommands($commands);
        $this->info('✓ Bot commands registered successfully!');

        return 0;
    }
}
