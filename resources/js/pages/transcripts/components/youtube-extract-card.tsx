import ProcessingModeSelector, { getSavedProcessingMode } from '@/components/processing-mode-selector';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { prepareMediaForTranscription, ProcessingMode } from '@/utils/audio-extractor';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    ClipboardPaste,
    FileAudio,
    FileVideo,
    Loader2,
    Sparkles,
    UploadCloud,
    Video,
    Wand2,
    Zap,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

export default function YoutubeExtractCard() {
    const { isRtl } = useLanguage();
    const { tenant, maxServerUploadMb = 100 } = usePage().props as any;
    const [mode, setMode] = useState<'youtube' | 'upload'>('youtube');
    const [isFocused, setIsFocused] = useState(false);

    // YouTube Form
    const {
        data: ytData,
        setData: setYtData,
        post: postYt,
        processing: ytProcessing,
        errors: ytErrors,
        reset: resetYt,
    } = useForm({
        url: '',
    });

    // File Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [channelName, setChannelName] = useState('');
    const [language, setLanguage] = useState('ar');
    const [processingMode, setProcessingMode] = useState<ProcessingMode>(() => getSavedProcessingMode('server'));
    const [isConverting, setIsConverting] = useState(false);
    const [conversionProgress, setConversionProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleYoutubeExtract = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ytData.url.trim()) return;
        postYt(route('transcripts.store'), {
            onSuccess: () => resetYt('url'),
        });
    };

    const handlePasteClipboard = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
                    setYtData('url', text.trim());
                }
            }
        } catch {
            // ignore clipboard permission error
        }
    };

    const applySelectedFile = (file: File) => {
        setSelectedFile(file);
        setUploadError(null);
        if (file.size > maxServerUploadMb * 1024 * 1024) {
            setProcessingMode('local');
        }
        if (!title) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setTitle(cleanName);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            applySelectedFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            applySelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        const effectiveMode: ProcessingMode =
            selectedFile.size > maxServerUploadMb * 1024 * 1024 ? 'local' : processingMode;

        setUploadError(null);
        setIsConverting(effectiveMode === 'local');
        setIsUploading(effectiveMode === 'server');
        setConversionProgress(5);
        setStatusMessage(
            effectiveMode === 'local'
                ? isRtl
                    ? 'جارٍ فحص وضغط الملف على جهازك...'
                    : 'Inspecting & compressing file on device...'
                : isRtl
                  ? 'جارٍ تجهيز الرفع السريع إلى الخادم...'
                  : 'Preparing fast server upload...'
        );

        try {
            const extracted = await prepareMediaForTranscription(
                selectedFile,
                (pct, msg) => {
                    if (effectiveMode === 'local') {
                        setConversionProgress(Math.min(55, Math.round(pct * 0.55)));
                        setStatusMessage(msg);
                    }
                },
                { mode: effectiveMode, isRtl }
            );

            setIsConverting(false);
            setIsUploading(true);

            const uploadBasePct = effectiveMode === 'local' ? 55 : 5;
            const uploadRangePct = 95 - uploadBasePct;
            setConversionProgress(uploadBasePct);

            let compressionNote = '';
            if (extracted.isExtracted && extracted.sizeBytes < selectedFile.size) {
                const origMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
                const compMb = (extracted.sizeBytes / (1024 * 1024)).toFixed(1);
                compressionNote = isRtl
                    ? `تم الضغط (${origMb}MB ➔ ${compMb}MB) • `
                    : `Compressed (${origMb}MB ➔ ${compMb}MB) • `;
            }

            setStatusMessage(
                compressionNote +
                    (isRtl
                        ? 'جارٍ رفع الملف والتفريغ بالذكاء الاصطناعي...'
                        : 'Uploading and transcribing with AI...')
            );

            // 2. Submit to Laravel preserving exact file extension
            const formData = new FormData();
            const uploadFilename =
                extracted.file instanceof File ? extracted.file.name : extracted.originalName;
            formData.append('file', extracted.file, uploadFilename);
            formData.append('title', title || extracted.originalName);
            formData.append('channel_name', channelName || (isRtl ? 'تسجيل مرفوع' : 'Uploaded Media'));
            formData.append('language', language);
            formData.append('duration_seconds', String(extracted.durationSeconds));

            router.post(route('transcripts.upload'), formData, {
                forceFormData: true,
                onProgress: (progress) => {
                    if (progress?.percentage !== undefined) {
                        const pct = Math.min(
                            95,
                            uploadBasePct + Math.round((progress.percentage / 100) * uploadRangePct)
                        );
                        setConversionProgress(pct);
                        if (progress.percentage >= 100) {
                            setStatusMessage(
                                isRtl
                                    ? 'تم الرفع! جارٍ التفريغ بالذكاء الاصطناعي على الخادم...'
                                    : 'Uploaded! Transcribing with AI on server...'
                            );
                        } else {
                            setStatusMessage(
                                compressionNote +
                                    (isRtl
                                        ? `جارٍ الرفع إلى الخادم (${Math.round(progress.percentage)}%)...`
                                        : `Uploading to server (${Math.round(progress.percentage)}%)...`)
                            );
                        }
                    }
                },
                onSuccess: () => {
                    setSelectedFile(null);
                    setTitle('');
                    setChannelName('');
                    setIsUploading(false);
                },
                onError: (errs) => {
                    setIsUploading(false);
                    const msg = errs.file || errs.title || Object.values(errs)[0] || 'فشل في رفع وتفريغ الملف.';
                    setUploadError(String(msg));
                },
            });
        } catch (err: any) {
            setIsConverting(false);
            setIsUploading(false);
            setUploadError(err?.message || (isRtl ? 'حدث خطأ أثناء معالجة الملف في المتصفح.' : 'Error extracting media in browser.'));
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden transition-all duration-300">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 end-0 -mt-12 -me-12 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
                {/* Header with Title and Mode Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-foreground">
                                {isRtl ? 'تفريغ وتلخيص محاضرة جديدة' : 'Extract & Summarize New Lecture'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl
                                    ? 'استخرج نصوص الشروحات وحوّلها لمذكرات واختبارات دراسية ذكية بهويتك'
                                    : 'Extract word-level transcripts and build student handouts & quizzes'}
                            </p>
                        </div>
                    </div>

                    {/* Source Toggle Tabs */}
                    <div className="inline-flex p-1 rounded-2xl bg-muted/60 border border-border/70 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('youtube');
                                setUploadError(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                mode === 'youtube'
                                    ? 'bg-background text-foreground shadow-xs border border-border/60'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Video className="size-4 text-red-500" />
                            <span>{isRtl ? 'رابط يوتيوب' : 'YouTube URL'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode('upload');
                                setUploadError(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                mode === 'upload'
                                    ? 'bg-background text-primary shadow-xs border border-border/60'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <UploadCloud className="size-4 text-primary" />
                            <span>{isRtl ? 'رفع ملف صوت / فيديو' : 'Upload Audio / Video'}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                                {tenant?.remaining_recording_minutes !== undefined
                                    ? `${tenant.remaining_recording_minutes} ${isRtl ? 'دقيقة متاحة' : 'mins left'}`
                                    : 'Groq AI'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* MODE 1: YouTube Extraction */}
                {mode === 'youtube' && (
                    <form onSubmit={handleYoutubeExtract} className="space-y-3">
                        <div
                            className={`relative flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-background border transition-all duration-300 ${
                                isFocused
                                    ? 'border-primary ring-4 ring-primary/10 shadow-md'
                                    : 'border-border/80 hover:border-border'
                            }`}
                        >
                            <div className="flex items-center gap-3 w-full px-3">
                                <Video className="size-5 text-muted-foreground shrink-0" />
                                <input
                                    id="youtube-url-input"
                                    type="url"
                                    required
                                    value={ytData.url}
                                    onChange={(e) => setYtData('url', e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={
                                        isRtl
                                            ? 'ضع رابط فيديو اليوتيوب هنا (مثال: https://youtube.com/watch?v=...)'
                                            : 'Paste YouTube video URL here (e.g., https://youtube.com/watch?v=...)'
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden py-2.5"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                                <button
                                    type="button"
                                    onClick={handlePasteClipboard}
                                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                                    title={isRtl ? 'لصق من الحافظة' : 'Paste from clipboard'}
                                >
                                    <ClipboardPaste className="size-4 text-primary" />
                                    <span>{isRtl ? 'لصق' : 'Paste'}</span>
                                </button>

                                <Button
                                    type="submit"
                                    disabled={ytProcessing || !ytData.url.trim()}
                                    className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-extrabold shadow-md shadow-primary/25 shrink-0 cursor-pointer gap-2"
                                >
                                    {ytProcessing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>{isRtl ? 'جارٍ الاستخراج...' : 'Extracting...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="size-4" />
                                            <span>{isRtl ? 'تفريغ وتلخيص' : 'Extract & Summarize'}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {ytErrors.url && (
                            <p className="text-xs text-destructive font-bold ps-2">{ytErrors.url}</p>
                        )}
                    </form>
                )}

                {/* MODE 2: Upload Audio / Video (Client-Side Compression + Groq Whisper) */}
                {mode === 'upload' && (
                    <form onSubmit={handleFileUploadSubmit} className="space-y-4">
                        {/* Drag and Drop Zone */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                                selectedFile
                                    ? 'border-primary/60 bg-primary/5'
                                    : 'border-border/80 hover:border-primary/50 bg-background/50 hover:bg-background'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*,video/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.webm,.mp4,.mov,.mkv,.flac"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                                        {selectedFile.type.startsWith('video/') ? (
                                            <FileVideo className="size-6" />
                                        ) : (
                                            <FileAudio className="size-6" />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-extrabold text-foreground max-w-md truncate">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {formatBytes(selectedFile.size)} • {isRtl ? 'انقر لتغيير الملف' : 'Click to change'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-12 rounded-2xl bg-muted/70 text-muted-foreground flex items-center justify-center">
                                        <UploadCloud className="size-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs sm:text-sm font-bold text-foreground">
                                            {isRtl
                                                ? 'اسحب وأفلت ملف المحاضرة هنا أو انقر للاختيار'
                                                : 'Drag and drop your audio/video file here, or browse'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {isRtl
                                                ? 'يدعم MP4, MP3, OGG, WAV, M4A, MOV, WEBM (اختر المعالجة على الخادم أو الضغط على جهازك)'
                                                : 'Supports MP4, MP3, OGG, WAV, M4A, MOV, WEBM (choose Server or Local Device mode)'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Processing Mode Selector (On Server vs On Local Device) */}
                        <ProcessingModeSelector
                            mode={processingMode}
                            onChange={setProcessingMode}
                            isRtl={isRtl}
                            selectedFile={selectedFile}
                            maxServerUploadMb={maxServerUploadMb}
                            disabled={isConverting || isUploading}
                        />

                        {/* Title and Metadata Inputs (when file is chosen) */}
                        {selectedFile && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 rounded-2xl bg-background border border-border/80">
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[11px] font-bold text-muted-foreground">
                                        {isRtl ? 'عنوان المحاضرة' : 'Lecture Title'}
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={isRtl ? 'مثال: مقدمة في التشريح الطبي - المحاضرة 1' : 'e.g. Anatomy Lecture 1'}
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-muted/40 border border-border/70 text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground">
                                        {isRtl ? 'لغة المحاضرة' : 'Language'}
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-muted/40 border border-border/70 text-foreground focus:outline-hidden focus:border-primary"
                                    >
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="en">الإنجليزية (English)</option>
                                        <option value="auto">اكتشاف تلقائي (Auto Detect)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar during conversion/upload */}
                        {(isConverting || isUploading) && (
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-3.5 animate-spin text-primary" />
                                        <span>{statusMessage}</span>
                                    </span>
                                    <span className="font-mono text-primary">{conversionProgress}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-primary/15 overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${conversionProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {uploadError && (
                            <p className="text-xs text-destructive font-bold ps-2">{uploadError}</p>
                        )}

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <Zap className="size-3.5 text-emerald-500 shrink-0" />
                                <span>{isRtl ? 'معالجة فائقة السرعة عبر Groq Whisper Large v3' : 'Ultra-fast Groq Whisper Large v3'}</span>
                            </span>

                            <Button
                                type="submit"
                                disabled={!selectedFile || isConverting || isUploading}
                                className="rounded-xl px-6 py-2.5 text-xs font-extrabold shadow-md shadow-primary/25 cursor-pointer gap-2"
                            >
                                {isConverting || isUploading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>{isRtl ? 'جارٍ المعالجة والتفريغ...' : 'Processing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="size-4" />
                                        <span>
                                            {processingMode === 'server'
                                                ? isRtl
                                                    ? 'رفع سريع وتفريغ على الخادم'
                                                    : 'Fast Upload & Transcribe on Server'
                                                : isRtl
                                                  ? 'ضغط على جهازك وتفريغ بالذكاء الاصطناعي'
                                                  : 'Compress on Device & Transcribe'}
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
