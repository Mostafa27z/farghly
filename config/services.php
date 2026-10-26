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
