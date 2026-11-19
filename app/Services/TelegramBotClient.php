<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotClient
{
    protected ?string $botToken;
    protected string $apiBaseUrl;
    protected ?string $adminAlertChatId;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->apiBaseUrl = rtrim(config('services.telegram.api_base_url', 'https://api.telegram.org'), '/');
        $this->adminAlertChatId = config('services.telegram.admin_alert_chat_id');
    }

    public function isConfigured(): bool
    {
        return !empty($this->botToken);
    }

    /**
     * Send a text message to a Telegram chat.
     */
    public function sendMessage(int|string $chatId, string $text, array $options = []): array
    {
        $payload = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => false,
        ], $options);

        return $this->callApi('sendMessage', $payload);
    }

    /**
     * Edit an existing message text.
     */
    public function editMessageText(int|string $chatId, int $messageId, string $text, array $options = []): array
    {
        $payload = array_merge([
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $text,
            'parse_mode' => 'HTML',
        ], $options);

        return $this->callApi('editMessageText', $payload);
    }

    /**
     * Delete a message (e.g. user's pasted secret).
     */
    public function deleteMessage(int|string $chatId, int $messageId): bool
    {
        $result = $this->callApi('deleteMessage', [
            'chat_id' => $chatId,
            'message_id' => $messageId,
        ]);

        return $result['ok'] ?? false;
    }

    /**
     * Answer a callback query from an inline keyboard tap.
     */
    public function answerCallbackQuery(string $callbackQueryId, ?string $text = null, bool $showAlert = false): bool
    {
        $payload = [
            'callback_query_id' => $callbackQueryId,
            'show_alert' => $showAlert,
        ];

        if ($text !== null) {
            $payload['text'] = $text;
        }

        $result = $this->callApi('answerCallbackQuery', $payload);

        return $result['ok'] ?? false;
    }

    /**
     * Send a typing / upload action.
     */
    public function sendChatAction(int|string $chatId, string $action = 'typing'): bool
    {
        $result = $this->callApi('sendChatAction', [
            'chat_id' => $chatId,
            'action' => $action,
        ]);

        return $result['ok'] ?? false;
    }

    /**
     * React with an emoji (e.g. 👀 or 👍).
     */
    public function setMessageReaction(int|string $chatId, int $messageId, string $emoji = '👀'): bool
    {
        $result = $this->callApi('setMessageReaction', [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'reaction' => [
                [
                    'type' => 'emoji',
                    'emoji' => $emoji,
                ],
            ],
        ]);

        return $result['ok'] ?? false;
    }

    /**
     * Send a document (e.g. .txt transcript).
     */
    public function sendDocument(int|string $chatId, string $filePath, string $filename, ?string $caption = null, array $options = []): array
    {
        if (!file_exists($filePath)) {
            return ['ok' => false, 'description' => 'File not found on disk'];
        }

        try {
            $endpoint = "{$this->apiBaseUrl}/bot{$this->botToken}/sendDocument";

            $request = Http::timeout(60)
                ->attach('document', fopen($filePath, 'r'), $filename);

            $payload = array_merge([
                'chat_id' => $chatId,
                'parse_mode' => 'HTML',
            ], $options);

            if ($caption) {
                $payload['caption'] = $caption;
            }

            $response = $request->post($endpoint, $payload);

            return $response->json() ?: ['ok' => false];
        } catch (\Throwable $e) {
            Log::error('Telegram sendDocument exception: ' . $e->getMessage());
            return ['ok' => false, 'description' => $e->getMessage()];
        }
    }

    /**
     * Fetch file metadata (path and size) for download.
     */
    public function getFile(string $fileId): array
    {
        $res = $this->callApi('getFile', ['file_id' => $fileId]);

        if (empty($res['ok']) || empty($res['result']['file_path'])) {
            return [
                'success' => false,
                'error' => $res['description'] ?? 'Failed to retrieve file metadata from Telegram',
            ];
        }

        return [
            'success' => true,
            'file_path' => $res['result']['file_path'],
            'file_size' => (int) ($res['result']['file_size'] ?? 0),
        ];
    }

    /**
     * Stream download file to destination path without buffering into PHP memory.
     */
    public function downloadFile(string $filePath, string $destinationAbsolutePath): bool
    {
        try {
            $downloadUrl = "{$this->apiBaseUrl}/file/bot{$this->botToken}/{$filePath}";

            $directory = dirname($destinationAbsolutePath);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $response = Http::timeout(180)
                ->sink($destinationAbsolutePath)
                ->get($downloadUrl);

            return $response->successful() && file_exists($destinationAbsolutePath) && filesize($destinationAbsolutePath) > 0;
        } catch (\Throwable $e) {
            Log::error("Failed to download Telegram file '{$filePath}': " . $e->getMessage());
            return false;
        }
    }

    /**
     * Configure Telegram webhook URL with optional secret token.
     */
    public function setWebhook(string $url, ?string $secretToken = null, array $allowedUpdates = ['message', 'callback_query']): array
    {
        $payload = [
            'url' => $url,
            'allowed_updates' => json_encode($allowedUpdates),
            'drop_pending_updates' => false,
        ];

        if (!empty($secretToken)) {
            $payload['secret_token'] = $secretToken;
        }

        return $this->callApi('setWebhook', $payload);
    }

    /**
     * Delete webhook (e.g. for teardown or local polling).
     */
    public function deleteWebhook(bool $dropPendingUpdates = false): array
    {
        return $this->callApi('deleteWebhook', [
            'drop_pending_updates' => $dropPendingUpdates,
        ]);
    }

    /**
     * Get webhook info.
     */
    public function getWebhookInfo(): array
    {
        return $this->callApi('getWebhookInfo');
    }

    /**
     * Set bot command list.
     */
    public function setMyCommands(array $commands, ?string $languageCode = null): array
    {
        $payload = [
            'commands' => json_encode($commands),
        ];

        if (!empty($languageCode)) {
            $payload['language_code'] = $languageCode;
        }

        return $this->callApi('setMyCommands', $payload);
    }

    /**
     * Alert administrator on Telegram if alert chat ID is configured.
     */
    public function notifyAdmin(string $text): bool
    {
        if (empty($this->adminAlertChatId)) {
            return false;
        }

        $res = $this->sendMessage($this->adminAlertChatId, "🚨 <b>تنبيه منصة فرغلي AI:</b>\n" . $text);

        return $res['ok'] ?? false;
    }

    /**
     * Low-level helper to execute Telegram Bot API calls.
     */
    protected function callApi(string $method, array $params = []): array
    {
        if (empty($this->botToken)) {
            Log::warning("TelegramBotClient::{$method} called but TELEGRAM_BOT_TOKEN is not configured.");
            return ['ok' => false, 'description' => 'TELEGRAM_BOT_TOKEN is not configured'];
        }

        try {
            $url = "{$this->apiBaseUrl}/bot{$this->botToken}/{$method}";

            $response = Http::timeout(25)->post($url, $params);

            return $response->json() ?: ['ok' => false, 'description' => 'Empty response from Telegram'];
        } catch (\Throwable $e) {
            Log::error("Telegram API Exception on '{$method}': " . $e->getMessage());
            return ['ok' => false, 'description' => $e->getMessage()];
        }
    }
}
