<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY', env('GEMENI_API_KEY')),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
        'proxy' => env('GEMINI_PROXY'),
    ],

    'groq' => [
        'key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_WHISPER_MODEL', 'whisper-large-v3-turbo'),
        'budget_guard_enabled' => env('GROQ_BUDGET_GUARD_ENABLED', true),
        'max_audio_seconds_per_hour' => (int) env('GROQ_MAX_AUDIO_SECONDS_PER_HOUR', 7200),
        'max_audio_seconds_per_day' => (int) env('GROQ_MAX_AUDIO_SECONDS_PER_DAY', 28800),
        'max_single_file_minutes' => (int) env('GROQ_MAX_SINGLE_FILE_MINUTES', 90),
    ],

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'bot_username' => env('TELEGRAM_BOT_USERNAME', 'FarghlyAiBot'),
        'api_base_url' => rtrim(env('TELEGRAM_API_BASE_URL', 'https://api.telegram.org'), '/'),
        'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
        'admin_alert_chat_id' => env('TELEGRAM_ADMIN_ALERT_CHAT_ID'),
        'max_file_size_mb' => (int) env('TELEGRAM_MAX_FILE_SIZE_MB', 20),
        'media_retention_days' => (int) env('TELEGRAM_MEDIA_RETENTION_DAYS', 30),
    ],

    'youtube' => [
        // e.g. http://user:pass@host:port  (residential/rotating proxy recommended on shared hosting)
        'proxy' => env('YOUTUBE_PROXY'),
        // Optional raw cookie string exported from a logged-in browser
        'cookies' => env('YOUTUBE_COOKIES'),
        // Optional Supadata API key used as a fallback when YouTube blocks the server IP
        'fallback_api_key' => env('SUPADATA_API_KEY'),
    ],

];
