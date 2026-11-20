import LanguageToggle from '@/components/language-toggle';
import ProcessingModeSelector, { getSavedProcessingMode } from '@/components/processing-mode-selector';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import {
    prepareMediaForTranscription,
    ProcessingMode,
    uploadFormDataWithProgress,
} from '@/utils/audio-extractor';
import { Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileAudio,
    FileVideo,
    Loader2,
    Sparkles,
    UploadCloud,
    X,
} from 'lucide-react';

interface Props {
    token: string;
    tenant: {
        name: string;
        plan_name: string;
        remaining_recording_minutes: number;
        monthly_recording_minutes_limit: number;
    };
    userName: string;
    maxServerUploadMb?: number;
}

export default function ScopedUpload({ token, tenant, userName, maxServerUploadMb = 100 }: Props) {
    const { isRtl } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState<'ar' | 'en' | 'auto'>('ar');
    const [processingMode, setProcessingMode] = useState<ProcessingMode>(() => getSavedProcessingMode('server'));

    // Processing / Upload states
    const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [jobId, setJobId] = useState<number | null>(null);
    const [studioUrl, setStudioUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setErrorMessage(null);

        // Automatically switch to local compression if file exceeds direct server upload limit
        if (file.size > maxServerUploadMb * 1024 * 1024) {
            setProcessingMode('local');
        }

        if (!title) {
            const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            setTitle(clean);
        }
    };

    const handleStartUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        const effectiveMode: ProcessingMode =
            selectedFile.size > maxServerUploadMb * 1024 * 1024 ? 'local' : processingMode;

        setErrorMessage(null);
        setStatus(effectiveMode === 'local' ? 'compressing' : 'uploading');
        setProgressPercent(5);
        setProgressText(
            effectiveMode === 'local'
                ? isRtl
                    ? 'جاري فحص الملف وضغط الصوت على جهازك...'
                    : 'Inspecting & compressing audio on your device...'
                : isRtl
                  ? 'جاري تجهيز الرفع المباشر السريع إلى الخادم...'
                  : 'Preparing fast direct upload to server...'
        );

        try {
            const extracted = await prepareMediaForTranscription(
                selectedFile,
                (p, text) => {
                    if (effectiveMode === 'local') {
                        setProgressPercent(Math.min(60, Math.round(p * 0.6)));
                        setProgressText(text);
                    }
                },
                { mode: effectiveMode, isRtl }
            );

            // Pre-flight duration check against remaining quota
            if (extracted.durationSeconds > 0) {
                const fileMinutes = Math.ceil(extracted.durationSeconds / 60);
                if (fileMinutes > tenant.remaining_recording_minutes) {
                    setStatus('idle');
                    setErrorMessage(
                        isRtl
                            ? `عذراً، مدة هذا الملف (${fileMinutes} دقيقة) تتجاوز رصيد دقائق التسجيل المتبقي في باقتك (${tenant.remaining_recording_minutes} دقيقة).`
                            : `File duration (${fileMinutes} min) exceeds remaining balance (${tenant.remaining_recording_minutes} min).`
                    );
                    return;
                }
            }

            setStatus('uploading');
            const uploadBasePct = effectiveMode === 'local' ? 60 : 5;
            const uploadRangePct = 95 - uploadBasePct;
            setProgressPercent(uploadBasePct);

            let compressionSummary = '';
            if (extracted.isExtracted && extracted.sizeBytes < selectedFile.size) {
                const origMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
                const compMb = (extracted.sizeBytes / (1024 * 1024)).toFixed(1);
                compressionSummary = isRtl
                    ? `تم الضغط (${origMb}MB ➔ ${compMb}MB) • `
                    : `Compressed (${origMb}MB ➔ ${compMb}MB) • `;
            }

            setProgressText(
                compressionSummary +
                    (isRtl ? 'جاري رفع الملف إلى الخادم...' : 'Uploading file to server...')
            );

            const formData = new FormData();
            formData.append('file', extracted.file);
            formData.append('title', title || selectedFile.name);
            formData.append('language', language);
            formData.append('duration_seconds', String(extracted.durationSeconds || 0));

            const { ok, data } = await uploadFormDataWithProgress<{
                success?: boolean;
                job_id?: number;
                message?: string;
            }>(
                `/telegram/upload/${token}`,
                formData,
                {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                ({ loadedBytes, totalBytes, percent }) => {
                    const overall = Math.min(95, uploadBasePct + Math.round((percent / 100) * uploadRangePct));
                    const loadedMb = (loadedBytes / (1024 * 1024)).toFixed(1);
                    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
                    setProgressPercent(overall);
                    setProgressText(
                        compressionSummary +
                            (isRtl
                                ? `جاري الرفع إلى الخادم (${loadedMb} / ${totalMb} MB)...`
                                : `Uploading to server (${loadedMb} / ${totalMb} MB)...`)
                    );
                }
            );

            if (!ok || !data.success || !data.job_id) {
                throw new Error(data.message || (isRtl ? 'فشل رفع الملف إلى الخادم.' : 'Upload failed.'));
            }

            setProgressPercent(100);
            setJobId(data.job_id);
            setStatus('queued');
            setProgressText(isRtl ? 'تم استلام الملف، جاري التفريغ بالذكاء الاصطناعي...' : 'File received, transcribing with AI...');
        } catch (err: any) {
            console.error(err);
            setStatus('failed');
            setErrorMessage(err.message || (isRtl ? 'حدث خطأ أثناء معالجة أو رفع الملف.' : 'An error occurred.'));
        }
    };

    // Polling for job completion
    useEffect(() => {
        if (!jobId || status === 'completed' || status === 'failed') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/telegram/upload/${token}/status/${jobId}`);
                if (!res.ok) return;

                const data = await res.json();
                if (data.status === 'processing') {
                    setStatus('processing');
                    setProgressText(isRtl ? 'جاري التفريغ الصوتي الآن عبر Groq Whisper...' : 'Transcribing audio now...');
                } else if (data.status === 'completed') {
                    setStatus('completed');
                    setStudioUrl(data.studio_url);
                    clearInterval(interval);
                } else if (data.status === 'failed') {
                    setStatus('failed');
                    setErrorMessage(data.error_message || (isRtl ? 'تعذر إتمام التفريغ الصوتي.' : 'Transcription failed.'));
                    clearInterval(interval);
                }
            } catch (err) {
                console.warn('Poll error:', err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId, status, token, isRtl]);

    const isProcessing = ['compressing', 'uploading', 'queued', 'processing'].includes(status);

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-4 sm:p-6 antialiased transition-colors relative">
            <Head title={isRtl ? 'رفع وتفريغ ملف كبير | فرغلي' : 'Upload Large File | Farghly'} />

            {/* Top Bar with Language & Theme Toggles */}
            <div className="absolute top-4 start-4 sm:top-6 sm:start-6 z-20 flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
            </div>

            <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden text-right">
                {/* Header branding */}
                <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                {isRtl ? 'فرغلي AI — رفع ملف كبير' : 'Farghly AI — Large File Upload'}
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                {isRtl ? `مساحة العمل: ${tenant.name}` : `Workspace: ${tenant.name}`}
                            </p>
                        </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-muted text-foreground border border-border">
                        {tenant.plan_name}
                    </span>
                </div>

                {/* Quota snapshot banner */}
                <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/70 mb-5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4 text-primary" />
                        <span>{isRtl ? 'رصيد دقائق التسجيل المتبقي:' : 'Remaining Balance:'}</span>
                    </div>
                    <strong className="text-foreground font-mono text-sm">
                        {tenant.remaining_recording_minutes} {isRtl ? 'دقيقة' : 'min'}
                    </strong>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs mb-5 flex items-start gap-3">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div>{errorMessage}</div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {status === 'completed' && (
                    <div className="py-6 text-center space-y-4">
                        <div className="size-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle2 size={36} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-foreground">
                                {isRtl ? 'تم تفريغ الملف الصوتي بنجاح!' : 'Transcription Completed Successfully!'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {isRtl
                                    ? 'تم إرسال إشعار بالنتيجة ومعاينة النص إلى محادثتك في تيليجرام، ويمكنك فتح الاستوديو الآن:'
                                    : 'A notification has also been sent to your Telegram chat.'}
                            </p>
                        </div>

                        {studioUrl && (
                            <a
                                href={studioUrl}
                                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                <Sparkles className="size-4" />
                                <span>{isRtl ? 'فتح في استوديو فرغلي (تلخيص • تدقيق • اختبارات)' : 'Open in Farghly Studio'}</span>
                            </a>
                        )}
                    </div>
                )}

                {/* PROCESSING / PROGRESS STATE */}
                {isProcessing && (
                    <div className="py-8 text-center space-y-5">
                        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                            <Loader2 className="size-7 animate-spin" />
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-foreground">
                                {progressText}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-mono">
                                {progressPercent}%
                            </p>
                        </div>

                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                            {processingMode === 'local'
                                ? isRtl
                                    ? 'يتم ضغط الصوت محلياً داخل جهازك لتوفير حتى 90% من باقة الإنترنت.'
                                    : 'Audio is being compressed on your device to save up to 90% internet data.'
                                : isRtl
                                  ? 'يتم رفع الملف مباشرة للخادم لأقصى سرعة ممكنة في التفريغ.'
                                  : 'Uploading directly to server for fastest possible transcription.'}
                        </p>
                    </div>
                )}

                {/* UPLOAD FORM (IDLE OR FAILED) */}
                {(status === 'idle' || status === 'failed') && (
                    <form onSubmit={handleStartUpload} className="space-y-4">
                        {/* Drop / Pick Zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer ${
                                selectedFile
                                    ? 'bg-primary/5 border-primary/40'
                                    : 'bg-muted/40 border-border hover:border-primary/40 hover:bg-muted/60'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*,video/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.webm,.mp4,.mov,.mkv,.flac"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex items-center justify-between gap-3 text-right">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            {selectedFile.type.startsWith('video') ? <FileVideo size={22} /> : <FileAudio size={22} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-xs font-bold text-foreground truncate">
                                                {selectedFile.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 py-3">
                                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                        <UploadCloud size={24} />
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                        {isRtl ? 'انقر لاختيار ملف صوت أو فيديو من جهازك' : 'Click to select audio or video'}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                        MP3, MP4, OGG, WAV, M4A, MOV, WEBM
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Title input */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1">
                                {isRtl ? 'عنوان التفريغ (اختياري):' : 'Title (optional):'}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={isRtl ? 'مثال: محاضرة علمية، بودكاست...' : 'e.g. Lecture, Podcast...'}
                                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                            />
                        </div>

                        {/* Language selection pills */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                {isRtl ? 'لغة التسجيل:' : 'Spoken Language:'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { code: 'ar', label: 'العربية 🇸🇦' },
                                    { code: 'en', label: 'English 🇬🇧' },
                                    { code: 'auto', label: 'تلقائي 🌐' },
                                ].map((opt) => (
                                    <button
                                        key={opt.code}
                                        type="button"
                                        onClick={() => setLanguage(opt.code as any)}
                                        className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                                            language === opt.code
                                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                : 'bg-muted border-border text-muted-foreground hover:border-border'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Processing Mode Selector (On Server vs On Device) */}
                        <ProcessingModeSelector
                            mode={processingMode}
                            onChange={setProcessingMode}
                            isRtl={isRtl}
                            selectedFile={selectedFile}
                            maxServerUploadMb={maxServerUploadMb}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!selectedFile}
                            className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                            <Sparkles size={16} />
                            <span>
                                {processingMode === 'server'
                                    ? isRtl
                                        ? 'رفع فوري وتفريغ على الخادم'
                                        : 'Fast Upload & Transcribe on Server'
                                    : isRtl
                                      ? 'ضغط على جهازك وتفريغ بالذكاء الاصطناعي'
                                      : 'Compress on Device & Transcribe'}
                            </span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
