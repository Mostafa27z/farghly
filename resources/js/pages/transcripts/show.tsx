import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import ProofreadModal from '@/pages/transcripts/components/proofread-modal';
import SummaryModal from '@/pages/transcripts/components/summary-modal';
import VideoPanel from '@/pages/transcripts/components/video-panel';
import WorkspacePanel from '@/pages/transcripts/components/workspace-panel';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Palette,
    Printer,
    Sparkles,
    SpellCheck,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

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
    video_url: string;
    title: string;
    channel_name: string;
    thumbnail_url: string;
    duration_seconds: number;
    language: string;
    segments: Segment[];
    full_text: string;
    summary_html?: string | null;
    summary_text?: string | null;
    summary_style?: string | null;
    summary_prompt?: string | null;
    summary_generated_at?: string | null;
    proofread_html?: string | null;
    proofread_text?: string | null;
    proofread_generated_at?: string | null;
    created_at: string;
}

interface ThemeOption {
    id: string;
    name: string;
    type: 'builder' | 'custom_html';
    is_default: boolean;
    colors?: any;
    logo_url?: string | null;
}

interface Props {
    transcript: TranscriptData;
    tenant: {
        name: string;
        plan_name: string;
        remaining_minutes: number;
    };
    themes?: ThemeOption[];
    systemPresets?: Record<string, any>;
}

export default function TranscriptShow({ transcript, tenant, themes = [], systemPresets = {} }: Props) {
    const { lang, setLang, isRtl } = useLanguage();
    const [activeTab, setActiveTab] = useState<'transcript' | 'proofread' | 'summary'>(
        transcript.proofread_html ? 'proofread' : (transcript.summary_html ? 'summary' : 'transcript')
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);
    const [copiedSummary, setCopiedSummary] = useState(false);
    const [copiedProofread, setCopiedProofread] = useState(false);
    const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showProofreadModal, setShowProofreadModal] = useState(false);

    const initialThemeId = themes.find(t => t.is_default)?.id || 'obsidian';
    const [docTheme, setDocTheme] = useState<string>(initialThemeId);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const pageProps = usePage().props as { errors?: Record<string, string> };

    const {
        data: summaryData,
        setData: setSummaryData,
        post: postSummary,
        processing: summarizing,
        errors: summaryErrors,
    } = useForm({
        style: transcript.summary_style || 'executive',
        prompt: transcript.summary_prompt || '',
        theme: initialThemeId,
    });

    const {
        data: proofreadData,
        setData: setProofreadData,
        post: postProofread,
        processing: proofreading,
        errors: proofreadErrors,
    } = useForm({
        prompt: '',
    });

    const proofreadError = pageProps.errors?.proofread || (proofreadErrors as Record<string, string | undefined>).proofread;
    const summaryError = pageProps.errors?.summary || (summaryErrors as Record<string, string | undefined>).summary;

    const segments = transcript.segments || [];
    const filteredSegments = segments.filter((seg) =>
        seg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const seekTo = (seconds: number) => {
        setActiveTimestamp(seconds);
        if (iframeRef.current) {
            iframeRef.current.src = `https://www.youtube.com/embed/${transcript.youtube_id}?autoplay=1&start=${Math.floor(seconds)}`;
        }
    };

    const copySummary = () => {
        if (!transcript.summary_text) return;
        navigator.clipboard.writeText(transcript.summary_text);
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2500);
    };

    const copyProofread = () => {
        if (!transcript.proofread_text) return;
        navigator.clipboard.writeText(transcript.proofread_text);
        setCopiedProofread(true);
        setTimeout(() => setCopiedProofread(false), 2500);
    };

    const handleGenerateSummary = (e: React.FormEvent) => {
        e.preventDefault();
        postSummary(route('transcripts.summarize', transcript.id), {
            onSuccess: () => {
                setShowSummaryModal(false);
                setActiveTab('summary');
            },
        });
    };

    const handleGenerateProofread = (e: React.FormEvent) => {
        e.preventDefault();
        postProofread(route('transcripts.proofread', transcript.id), {
            onSuccess: () => {
                setShowProofreadModal(false);
                setActiveTab('proofread');
            },
        });
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const summaryPresets = [
        { id: 'executive', name: 'ملخص تنفيذي', icon: 'executive', desc: 'نظرة عامة ورؤى استراتيجية لصناع القرار' },
        { id: 'academic', name: 'دليل أكاديمي ودراسي', icon: 'academic', desc: 'فصول، مفاهيم عميقة، وأسئلة مراجعة' },
        { id: 'corporate', name: 'تقرير رسمي وجداول', icon: 'corporate', desc: 'صياغة مؤسسية مع مخرجات وجداول بيانات' },
        { id: 'meeting', name: 'محضر وقرارات عملية', icon: 'meeting', desc: 'نقاط اتفاق، قرارات، وتوزيع مهام' },
        { id: 'custom', name: 'أمر وتصميم مخصص', icon: 'custom', desc: 'حدد شروطك الخاصة بدقة للذكاء الاصطناعي' },
    ];

    const systemPresetsList = [
        { id: 'obsidian', name: 'الزمردي الحديث (Obsidian)', color: '#10B981' },
        { id: 'navy', name: 'الأزرق الملكي (Royal Navy)', color: '#1E3A8A' },
        { id: 'academic', name: 'الأكاديمي العلمي (Academic)', color: '#D97706' },
        { id: 'minimal', name: 'البسيط النقي (Minimalist)', color: '#4B5563' },
    ];

    const allAvailableThemes = [
        ...themes.map(t => ({
            id: t.id,
            name: `${t.name} (مخصص)`,
            color: t.colors?.accent || '#10B981',
            isCustom: true,
        })),
        ...systemPresetsList.map(p => ({
            ...p,
            isCustom: false,
        })),
    ];

    const topActionSlot = (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
            {/* Back to Library (Visible on Tablets and Desktops; on Mobile, the sidebar drawer provides Library navigation) */}
            <Link
                href={route('dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/70 text-xs font-semibold text-foreground transition-all cursor-pointer shrink-0"
                title={isRtl ? 'الرجوع للمكتبة' : 'Back to Library'}
            >
                {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                <span>{isRtl ? 'المكتبة' : 'Library'}</span>
            </Link>

            {/* Themes & Branding shortcut */}
            <Link
                href={route('themes.index')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-xs font-bold text-primary transition-all"
            >
                <Palette className="size-3.5" />
                <span>{isRtl ? 'الهوية والقوالب' : 'Branding'}</span>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* AI Proofread Button */}
            <button
                type="button"
                onClick={() => setShowProofreadModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-xs transition-all cursor-pointer"
                title={transcript.proofread_html ? (isRtl ? 'إعادة التدقيق اللغوي' : 'Re-Proofread') : (isRtl ? 'بدء التدقيق اللغوي' : 'AI Proofread')}
            >
                <SpellCheck className="size-3.5" />
                <span className="hidden sm:inline">
                    {transcript.proofread_html ? (isRtl ? 'إعادة التدقيق' : 'Re-Proofread') : (isRtl ? 'تدقيق لغوي (AI)' : 'AI Proofread')}
                </span>
                <span className="sm:hidden text-[11px]">
                    {isRtl ? 'تدقيق' : 'Proof'}
                </span>
            </button>

            {/* AI Summary Button */}
            <button
                type="button"
                onClick={() => setShowSummaryModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 hover:opacity-95 transition-all cursor-pointer"
                title={transcript.summary_html ? (isRtl ? 'إعادة التلخيص' : 'Re-Summarize') : (isRtl ? 'توليد ملخص ذكي' : 'AI Summary')}
            >
                <Sparkles className="size-3.5" />
                <span className="hidden sm:inline">
                    {transcript.summary_html ? (isRtl ? 'إعادة التلخيص' : 'Re-Summarize') : (isRtl ? 'تلخيص ذكي (PDF)' : 'AI Summary PDF')}
                </span>
                <span className="sm:hidden text-[11px]">
                    {isRtl ? 'تلخيص' : 'Summary'}
                </span>
            </button>

            {/* View / Print PDF direct link if available */}
            {(transcript.summary_html || transcript.proofread_html) && (
                <a
                    href={route('transcripts.document', {
                        transcript: transcript.id,
                        theme: docTheme,
                        type: transcript.proofread_html ? 'proofread' : 'summary',
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-bold transition-all"
                >
                    <Printer className="size-3.5" />
                    <span>{isRtl ? 'معاينة PDF' : 'PDF Preview'}</span>
                </a>
            )}
        </div>
    );

    return (
        <DashboardLayout
            title={transcript.title}
            subtitle={`${transcript.channel_name || (isRtl ? 'قناة يوتيوب' : 'YouTube Channel')} • ${formatDuration(transcript.duration_seconds)}`}
            actionSlot={topActionSlot}
        >
            <Head title={isRtl ? `استوديو التفريغ | ${transcript.title}` : `Transcript Studio | ${transcript.title}`} />

            {/* Main Studio Body inside DashboardLayout */}
            <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Side: Video Player, Meta & Quick Downloads */}
                <VideoPanel
                    transcript={transcript}
                    iframeRef={iframeRef}
                    formatDuration={formatDuration}
                    docTheme={docTheme}
                    activeTab={activeTab}
                />

                {/* Right Side: Tabbed Workspace Component */}
                <WorkspacePanel
                    transcript={transcript}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredSegments={filteredSegments}
                    activeTimestamp={activeTimestamp}
                    seekTo={seekTo}
                    docTheme={docTheme}
                    setDocTheme={setDocTheme}
                    themes={themes}
                    systemPresetsList={systemPresetsList}
                    summaryPresets={summaryPresets}
                    copied={copied}
                    copiedSummary={copiedSummary}
                    copiedProofread={copiedProofread}
                    onCopySummary={copySummary}
                    onCopyProofread={copyProofread}
                    onOpenSummaryModal={() => setShowSummaryModal(true)}
                    onOpenProofreadModal={() => setShowProofreadModal(true)}
                    formatDuration={formatDuration}
                />
            </div>

            {/* Modals */}
            <SummaryModal
                isOpen={showSummaryModal}
                onClose={() => setShowSummaryModal(false)}
                onSubmit={handleGenerateSummary}
                summaryData={summaryData}
                setSummaryData={setSummaryData}
                docTheme={docTheme}
                setDocTheme={setDocTheme}
                summarizing={summarizing}
                summaryPresets={summaryPresets}
                allAvailableThemes={allAvailableThemes}
                error={summaryError}
            />

            <ProofreadModal
                isOpen={showProofreadModal}
                onClose={() => setShowProofreadModal(false)}
                onSubmit={handleGenerateProofread}
                proofreadData={proofreadData}
                setProofreadData={setProofreadData}
                docTheme={docTheme}
                setDocTheme={setDocTheme}
                proofreading={proofreading}
                allAvailableThemes={allAvailableThemes}
                error={proofreadError}
            />
        </DashboardLayout>
    );
}
