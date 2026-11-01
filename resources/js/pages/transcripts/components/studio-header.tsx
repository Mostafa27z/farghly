import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Copy, FileText, Palette, Printer, SpellCheck, Sparkles, X } from 'lucide-react';
import React from 'react';

interface TranscriptData {
    id: string;
    title: string;
    channel_name: string;
    full_text: string;
    summary_html?: string | null;
    proofread_html?: string | null;
}

interface StudioHeaderProps {
    transcript: TranscriptData;
    docTheme: string;
    activeTab: 'transcript' | 'proofread' | 'summary';
    copied: boolean;
    onCopy: () => void;
    onOpenSummaryModal: () => void;
    onOpenProofreadModal: () => void;
}

export default function StudioHeader({
    transcript,
    docTheme,
    activeTab,
    copied,
    onCopy,
    onOpenSummaryModal,
    onOpenProofreadModal,
}: StudioHeaderProps) {
    const { isRtl } = useLanguage();

    return (
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-xs dark:shadow-lg">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
                <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                            <span className="hidden sm:inline">{isRtl ? 'العودة للمكتبة' : 'Back to Library'}</span>
                            <span className="sm:hidden">{isRtl ? 'المكتبة' : 'Library'}</span>
                        </Link>

                        <Link
                            href={route('themes.index')}
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-xs font-bold text-primary transition-all"
                        >
                            <Palette size={16} />
                            <span className="hidden sm:inline">{isRtl ? 'الهوية والقوالب' : 'Branding & Templates'}</span>
                            <span className="sm:hidden">{isRtl ? 'القوالب' : 'Templates'}</span>
                        </Link>
                    </div>

                    <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/20 hidden md:block" />

                    <div className="flex flex-col text-start max-w-[180px] sm:max-w-md">
                        <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">{transcript.title}</h1>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{transcript.channel_name}</span>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
                    <ThemeToggle />
                    <LanguageToggle />

                    <button
                        type="button"
                        onClick={onOpenProofreadModal}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-[11px] sm:text-xs transition-all cursor-pointer"
                    >
                        <SpellCheck size={16} className="shrink-0" />
                        <span>{transcript.proofread_html ? (isRtl ? 'إعادة التدقيق' : 'Re-Proofread') : (isRtl ? 'تدقيق النص (AI)' : 'AI Proofread')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onOpenSummaryModal}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-[11px] sm:text-xs transition-all cursor-pointer"
                    >
                        <Sparkles size={16} className="shrink-0" />
                        <span>{transcript.summary_html ? (isRtl ? 'إعادة التلخيص' : 'Re-Summarize') : (isRtl ? 'تلخيص PDF' : 'AI Summary PDF')}</span>
                    </button>

                    {transcript.proofread_html && (
                        <a
                            href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'proofread' })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/40 hover:bg-primary/20 text-[11px] sm:text-xs text-primary font-bold transition-all"
                        >
                            <FileText size={16} className="shrink-0" />
                            <span>{isRtl ? 'PDF التدقيق' : 'Proofread PDF'}</span>
                        </a>
                    )}

                    {transcript.summary_html && (
                        <a
                            href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'summary' })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-[#F59E0B]/15 border border-amber-300 dark:border-[#F59E0B]/40 hover:bg-amber-100 dark:hover:bg-[#F59E0B]/25 text-[11px] sm:text-xs text-amber-700 dark:text-[#FFB95F] font-bold transition-all"
                        >
                            <FileText size={16} className="shrink-0" />
                            <span>{isRtl ? 'PDF الملخص' : 'Summary PDF'}</span>
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={onCopy}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-[11px] sm:text-xs text-foreground transition-all cursor-pointer"
                    >
                        {copied ? <Check size={14} className="shrink-0" /> : <Copy size={14} className="shrink-0" />}
                        <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                    </button>

                    <a
                        href={route('transcripts.export.srt', transcript.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-[11px] sm:text-xs text-primary font-mono font-bold transition-all"
                    >
                        .SRT
                    </a>

                    <a
                        href={route('transcripts.export.vtt', transcript.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-[11px] sm:text-xs text-indigo-700 dark:text-[#C0C1FF] font-mono font-bold transition-all"
                    >
                        .VTT
                    </a>

                    <a
                        href={route('transcripts.export.txt', transcript.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-[11px] sm:text-xs text-foreground font-mono font-bold transition-all"
                    >
                        .TXT
                    </a>

                    <a
                        href={route('transcripts.export.docx', {
                            transcript: transcript.id,
                            type: transcript.proofread_html ? 'proofread' : transcript.summary_html ? 'summary' : 'transcript',
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-bold transition-all"
                    >
                        <FileText size={14} className="shrink-0" />
                        <span>Word</span>
                    </a>
                </div>
            </div>
        </header>
    );
}

