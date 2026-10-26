<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$svc = new App\Services\YouTubeTranscriptService();
$m = new ReflectionMethod($svc, 'extractViaGetTranscript');
$m->setAccessible(true);
$r = $m->invoke($svc, '1sEGuLpIl-8');
print_r($svc->diagnostics);
echo $r ? "OK segments={$r['segment_count']} first=" . mb_substr($r['segments'][0]['text'], 0, 60) . "\n" : "NULL\n";
