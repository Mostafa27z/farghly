import { ProcessingMode } from '@/utils/audio-extractor';
import { Server, Smartphone, Wifi, Zap } from 'lucide-react';
import React from 'react';

interface ProcessingModeSelectorProps {
    mode: ProcessingMode;
    onChange: (mode: ProcessingMode) => void;
    isRtl: boolean;
    selectedFile?: File | null;
    maxServerUploadMb?: number;
    disabled?: boolean;
}

export const PROCESSING_MODE_STORAGE_KEY = 'farghly_media_processing_mode';

export function getSavedProcessingMode(fallback: ProcessingMode = 'server'): ProcessingMode {
    if (typeof window === 'undefined') return fallback;
    try {
        const saved = window.localStorage.getItem(PROCESSING_MODE_STORAGE_KEY);
        if (saved === 'server' || saved === 'local') {
            return saved;
        }
    } catch {
        // ignore storage restrictions
    }
    return fallback;
}

export function saveProcessingMode(mode: ProcessingMode): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(PROCESSING_MODE_STORAGE_KEY, mode);
    } catch {
        // ignore storage restrictions
    }
}

export default function ProcessingModeSelector({
    mode,
    onChange,
    isRtl,
    selectedFile,
    maxServerUploadMb = 100,
    disabled = false,
}: ProcessingModeSelectorProps) {
    const fileSizeMb = selectedFile ? selectedFile.size / (1024 * 1024) : 0;
    const exceedsServerLimit = Boolean(selectedFile && fileSizeMb > maxServerUploadMb);

    const handleSelect = (nextMode: ProcessingMode) => {
        if (disabled) return;
        if (nextMode === 'server' && exceedsServerLimit) return;
        saveProcessingMode(nextMode);
        onChange(nextMode);
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-foreground">
                    {isRtl ? 'طريقة معالجة الملف:' : 'File Processing Mode:'}
                </label>
                {exceedsServerLimit && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {isRtl
                            ? `الملف (${fileSizeMb.toFixed(1)} MB) أكبر من حد الرفع المباشر (${maxServerUploadMb} MB)`
                            : `File (${fileSizeMb.toFixed(1)} MB) exceeds direct server limit (${maxServerUploadMb} MB)`}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: On Server (Faster) */}
                <button
                    type="button"
                    disabled={disabled || exceedsServerLimit}
                    onClick={() => handleSelect('server')}
                    className={`relative p-3 rounded-2xl border text-start transition-all flex items-start gap-2.5 ${
                        exceedsServerLimit
                            ? 'opacity-50 cursor-not-allowed bg-muted/40 border-border/60'
                            : mode === 'server'
                              ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30 cursor-pointer'
                              : 'bg-muted/40 border-border/80 hover:border-primary/40 hover:bg-muted/70 cursor-pointer'
                    }`}
                >
                    <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            mode === 'server' && !exceedsServerLimit
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background text-muted-foreground border border-border/70'
                        }`}
                    >
                        <Server className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-extrabold text-foreground truncate">
                                {isRtl ? 'على الخادم' : 'On Server'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-bold shrink-0">
                                <Zap className="size-2.5" />
                                {isRtl ? 'أسرع' : 'Faster'}
                            </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted-foreground">
                            {isRtl
                                ? 'رفع ومعالجة فورية على الخادم بدون انتظار ضغط الملف على جهازك.'
                                : 'Direct upload & instant server processing with no local wait.'}
                        </p>
                    </div>
                </button>

                {/* Option 2: On Local Device (Conserves Internet Quota) */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect('local')}
                    className={`relative p-3 rounded-2xl border text-start transition-all flex items-start gap-2.5 ${
                        mode === 'local'
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30 cursor-pointer'
                            : 'bg-muted/40 border-border/80 hover:border-emerald-500/40 hover:bg-muted/70 cursor-pointer'
                    }`}
                >
                    <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            mode === 'local'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-background text-muted-foreground border border-border/70'
                        }`}
                    >
                        <Smartphone className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-extrabold text-foreground truncate">
                                {isRtl ? 'على جهازك' : 'On Your Device'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold shrink-0">
                                <Wifi className="size-2.5" />
                                {isRtl ? 'يوفر الباقة' : 'Saves Quota'}
                            </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted-foreground">
                            {isRtl
                                ? 'يضغط الصوت على جهازك قبل الرفع لتوفير حتى 90% من باقة الإنترنت.'
                                : 'Compresses audio on your device first to save up to 90% internet data.'}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}
