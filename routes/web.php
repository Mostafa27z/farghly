<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DocumentThemeController;
use App\Http\Controllers\TranscriptController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/subscription/inactive', function (\Illuminate\Http\Request $request) {
    if ($request->user()?->isSuperAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    if ($request->user()?->isSales()) {
        return redirect()->route('sales.index');
    }
    return Inertia::render('subscription/inactive');
})->name('subscription.inactive');

Route::middleware(['auth', 'tenant.active'])->group(function () {
    Route::get('/dashboard', [TranscriptController::class, 'index'])->name('dashboard');
    Route::post('/transcripts', [TranscriptController::class, 'store'])->name('transcripts.store');
    Route::get('/transcripts/{transcript}', [TranscriptController::class, 'show'])->name('transcripts.show');
    Route::get('/transcripts/{transcript}/export/srt', [TranscriptController::class, 'exportSrt'])->name('transcripts.export.srt');
    Route::get('/transcripts/{transcript}/export/vtt', [TranscriptController::class, 'exportVtt'])->name('transcripts.export.vtt');
    Route::get('/transcripts/{transcript}/export/txt', [TranscriptController::class, 'exportTxt'])->name('transcripts.export.txt');
    Route::post('/transcripts/{transcript}/summarize', [TranscriptController::class, 'summarize'])->name('transcripts.summarize');
    Route::get('/transcripts/{transcript}/document', [TranscriptController::class, 'document'])->name('transcripts.document');

    // Document Themes & Branding routes
    Route::get('/themes', [DocumentThemeController::class, 'index'])->name('themes.index');
    Route::post('/themes', [DocumentThemeController::class, 'store'])->name('themes.store');
    Route::post('/themes/{theme}/default', [DocumentThemeController::class, 'setDefault'])->name('themes.default');
    Route::delete('/themes/{theme}', [DocumentThemeController::class, 'destroy'])->name('themes.destroy');
    Route::get('/themes/sample-download', [DocumentThemeController::class, 'downloadSample'])->name('themes.sample.download');
    Route::get('/themes/preview/{theme?}', [DocumentThemeController::class, 'preview'])->name('themes.preview');
});

// ==========================================
// Sales Portal (Staff: Sales & Super Admin)
// ==========================================
Route::middleware(['auth', 'role.staff'])->prefix('sales')->name('sales.')->group(function () {
    Route::get('/', [\App\Http\Controllers\SalesController::class, 'index'])->name('index');
    Route::post('/clients', [\App\Http\Controllers\SalesController::class, 'storeClient'])->name('clients.store');
    Route::post('/clients/{tenant}/renew', [\App\Http\Controllers\SalesController::class, 'renew'])->name('clients.renew');
});

// ==========================================
// Super Admin Panel (Super Admin Only)
// ==========================================
Route::middleware(['auth', 'role.super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/performance', [\App\Http\Controllers\Admin\SuperAdminController::class, 'performance'])->name('performance');
    Route::get('/audit-logs', [\App\Http\Controllers\Admin\SuperAdminController::class, 'auditLogs'])->name('audit-logs');

    // Sales Team Management
    Route::get('/sales-team', [\App\Http\Controllers\Admin\SalesTeamController::class, 'index'])->name('sales-team.index');
    Route::post('/sales-team', [\App\Http\Controllers\Admin\SalesTeamController::class, 'store'])->name('sales-team.store');
    Route::post('/sales-team/{user}/toggle', [\App\Http\Controllers\Admin\SalesTeamController::class, 'toggleStatus'])->name('sales-team.toggle');
    Route::post('/sales-team/{user}/password', [\App\Http\Controllers\Admin\SalesTeamController::class, 'updatePassword'])->name('sales-team.password');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
