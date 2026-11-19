<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Shared Hosting Queue Worker: runs every minute to process Telegram and background jobs
Schedule::command('queue:work --stop-when-empty --max-time=50 --timeout=240')
    ->everyMinute()
    ->withoutOverlapping(5);

// Daily cleanup for expired Telegram link codes and temporary/archived audio
Schedule::command('telegram:cleanup')->dailyAt('03:30');
