import { useLanguage } from '@/hooks/use-language';
import {
    Calendar,
    Check,
    Clock,
    Copy,
    Download,
    FileCode,
    FileSpreadsheet,
    FileText,
    Globe,
    Layers,
    Printer,
    Sparkles,
    SpellCheck,
} from 'lucide-react';
import React, { useState } from 'react';

interface Segment {
    index: number;
    text: string;
    offset_seconds: number;
    duration_seconds: number;
    timestamp_formatted: string;
}

interface TranscriptData {
    id: string;
    youtube_id: string;
    title: string;
    channel_name: string;
    duration_seconds: number;
    language: string;
    segments: Segment[];
    full_text: string;
    proofread_html?: string | null;
    proofread_generated_at?: string | null;
    summary_html?: string | null;
    summary_generated_at?: string | null;
}

interface VideoPanelProps {
    transcript: TranscriptData;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    formatDuration: (seconds: number) => string;
    docTheme?: string;
    activeTab?: 'transcript' | 'proofread' | 'summary';
}

export default function VideoPanel({
    transcript,
    iframeRef,
    formatDuration,
    docTheme = 'obsidian',
    activeTab = 'transcript',
}: VideoPanelProps) {
    const { isRtl } = useLanguage();
    const [copied, setCopied] = useState(false);
    const segments = transcript.segments || [];

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript.full_text || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full lg:w-5/12 flex flex-col gap-5 shrink-0">
            {/* Embedded YouTube Player */}
            <div className="rounded-3xl overflow-hidden bg-black border border-border/80 shadow-xl aspect-video static lg:sticky lg:top-24">
                <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${transcript.youtube_id}`}
                    title={transcript.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                />
            </div>

            {/* Video Metadata Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>{isRtl ? 'بيانات وإحصاءات المحاضرة' : 'Lecture Metadata'}</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" />
                            <span>{isRtl ? 'المدة' : 'Duration'}</span>
                        </span>
                        <span className="font-mono text-foreground font-bold">{formatDuration(transcript.duration_seconds)}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Globe className="size-3.5 text-primary" />
                            <span>{isRtl ? 'اللغة' : 'Language'}</span>
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded-md bg-primary/15 text-primary font-bold text-[10px] uppercase">
                            {transcript.language || 'AR'}
                        </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between col-span-2">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Layers className="size-3.5 text-primary" />
                            <span>{isRtl ? 'المقاطع الزمنية' : 'Segments'}</span>
                        </span>
                        <span className="font-mono text-foreground font-bold">
                            {segments.length} {isRtl ? 'مقطع مسجل' : 'timed segments'}
                        </span>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="pt-2 border-t border-border/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <SpellCheck className="size-3.5 text-muted-foreground" />
                            <span>{isRtl ? 'التدقيق اللغوي:' : 'Proofread:'}</span>
                        </span>
                        {transcript.proofread_html ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span>{isRtl ? 'تم التدقيق الكامل' : 'Ready'}</span>
                            </span>
                        ) : (
                            <span className="text-[11px] text-muted-foreground">{isRtl ? 'لم يتم بعد' : 'Not generated'}</span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-muted-foreground" />
                            <span>{isRtl ? 'الملخص الذكي:' : 'AI Summary:'}</span>
                        </span>
                        {transcript.summary_html ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span>{isRtl ? 'الملخص متاح' : 'Ready'}</span>
                            </span>
                        ) : (
                            <span className="text-[11px] text-muted-foreground">{isRtl ? 'لم يتم بعد' : 'Not generated'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Export & Downloads Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                    <Download className="size-3.5 text-primary" />
                    <span>{isRtl ? 'تصدير وتنزيل الملفات' : 'Export & Downloads'}</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                    {/* Word DOCX */}
                    <a
                        href={route('transcripts.export.docx', {
                            transcript: transcript.id,
                            type: transcript.proofread_html ? 'proofread' : (transcript.summary_html ? 'summary' : 'transcript'),
                        })}
                        className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/25 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                    >
                        <FileText className="size-4" />
                        <span>Word (.docx)</span>
                    </a>

                    {/* PDF Document Print View */}
                    <a
                        href={route('transcripts.document', {
                            transcript: transcript.id,
                            theme: docTheme,
                            type: transcript.proofread_html ? 'proofread' : 'summary',
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                    >
                        <Printer className="size-4" />
                        <span>{isRtl ? 'طباعة / PDF' : 'PDF / Print'}</span>
                    </a>

                    {/* SRT Subtitles */}
                    <a
                        href={route('transcripts.export.srt', transcript.id)}
                        className="p-3 rounded-2xl bg-muted/40 hover:bg-muted text-foreground border border-border/70 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all"
                    >
                        <FileCode className="size-4 text-primary" />
                        <span>.SRT</span>
                    </a>

                    {/* TXT Plain Text */}
                    <a
                        href={route('transcripts.export.txt', {
                            transcript: transcript.id,
                            type: activeTab,
                        })}
                        className="p-3 rounded-2xl bg-muted/40 hover:bg-muted text-foreground border border-border/70 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all"
                    >
                        <FileSpreadsheet className="size-4 text-muted-foreground" />
                        <span>.TXT</span>
                    </a>
                </div>

                {/* Copy Full Text */}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-2.5 px-4 rounded-2xl bg-muted/50 hover:bg-muted text-foreground border border-border/70 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                >
                    {copied ? (
                        <>
                            <Check className="size-4 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRtl ? 'تم نسخ النص الكامل للحافظة!' : 'Copied to clipboard!'}</span>
                        </>
                    ) : (
                        <>
                            <Copy className="size-4 text-muted-foreground" />
                            <span>{isRtl ? 'نسخ النص الكامل للمحاضرة' : 'Copy Full Transcript Text'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
