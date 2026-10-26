import ThemeToggle from '@/components/theme-toggle';
import { Head, Link, useForm } from '@inertiajs/react';
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

    // Default to the tenant's default theme if set, otherwise 'obsidian'
    const initialThemeId = themes.find(t => t.is_default)?.id || 'obsidian';
    const [docTheme, setDocTheme] = useState<string>(initialThemeId);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const { data: summaryData, setData: setSummaryData, post: postSummary, processing: summarizing } = useForm({
        style: transcript.summary_style || 'executive',
        prompt: transcript.summary_prompt || '',
        theme: initialThemeId,
    });

    const { data: proofreadData, setData: setProofreadData, post: postProofread, processing: proofreading } = useForm({
        prompt: '',
    });

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

    const copyFullText = () => {
        navigator.clipboard.writeText(transcript.full_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
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
        { id: 'executive', name: 'ملخص تنفيذي', icon: 'analytics', desc: 'نظرة عامة ورؤى استراتيجية لصناع القرار' },
        { id: 'academic', name: 'دليل أكاديمي ودراسي', icon: 'school', desc: 'فصول، مفاهيم عميقة، وأسئلة مراجعة' },
        { id: 'corporate', name: 'تقرير رسمي وجداول', icon: 'domain', desc: 'صياغة مؤسسية مع مخرجات وجداول بيانات' },
        { id: 'meeting', name: 'محضر وقرارات عملية', icon: 'checklist', desc: 'نقاط اتفاق، قرارات، وتوزيع مهام' },
        { id: 'custom', name: 'أمر وتصميم مخصص', icon: 'tune', desc: 'حدد شروطك الخاصة بدقة للذكاء الاصطناعي' },
    ];

    const systemPresetsList = [
        { id: 'obsidian', name: 'الزمردي الحديث (Obsidian)', color: '#10B981' },
        { id: 'navy', name: 'الأزرق الملكي (Royal Navy)', color: '#1E3A8A' },
        { id: 'academic', name: 'الأكاديمي العلمي (Academic)', color: '#D97706' },
        { id: 'minimal', name: 'البسيط النقي (Minimalist)', color: '#4B5563' },
    ];

    // Combine custom tenant themes and system presets
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

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-[#0A0E16] text-slate-800 dark:text-[#DFE2EE] font-sans antialiased flex flex-col selection:bg-[#10B981] selection:text-[#003824] transition-colors">
            <Head title={`استوديو التفريغ | ${transcript.title}`} />

            {/* Top Studio Bar */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-3.5 shadow-xs dark:shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                            <span>العودة للمكتبة</span>
                        </Link>

                        <Link
                            href={route('themes.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/25 text-xs font-bold text-emerald-700 dark:text-[#4EDEA3] transition-all"
                        >
                            <span className="material-symbols-outlined text-base">palette</span>
                            <span>الهوية والقوالب</span>
                        </Link>

                        <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/20 hidden md:block" />

                        <div className="flex flex-col text-right">
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white max-w-md truncate">{transcript.title}</h1>
                            <span className="text-[11px] text-slate-500 dark:text-[#BBCAFF]">{transcript.channel_name}</span>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Theme Toggle Button */}
                        <ThemeToggle />

                        {/* Full Text Linguistic Proofread Button */}
                        <button
                            type="button"
                            onClick={() => setShowProofreadModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-[#4EDEA3] font-bold text-xs transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">spellcheck</span>
                            <span>{transcript.proofread_html ? 'إعادة التدقيق اللغوي الكامل' : 'تدقيق النص بالكامل (AI)'}</span>
                        </button>

                        {/* Gemini Summary Button */}
                        <button
                            type="button"
                            onClick={() => setShowSummaryModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-[#10B981] to-[#4EDEA3] text-[#003824] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                            <span>{transcript.summary_html ? 'إعادة التلخيص' : 'توليد ملخص PDF'}</span>
                        </button>

                        {/* Direct PDF print for Full Proofread */}
                        {transcript.proofread_html && (
                            <a
                                href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'proofread' })}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#10B981]/15 border border-emerald-300 dark:border-[#10B981]/40 hover:bg-emerald-100 dark:hover:bg-[#10B981]/25 text-xs text-emerald-800 dark:text-[#4EDEA3] font-bold transition-all"
                                title="فتح ملف PDF للنص الكامل المدقق جاهز للطباعة"
                            >
                                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                <span>PDF النص الكامل المدقق</span>
                            </a>
                        )}

                        {/* Direct PDF print if summary exists */}
                        {transcript.summary_html && (
                            <a
                                href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'summary' })}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-[#F59E0B]/15 border border-amber-300 dark:border-[#F59E0B]/40 hover:bg-amber-100 dark:hover:bg-[#F59E0B]/25 text-xs text-amber-700 dark:text-[#FFB95F] font-bold transition-all"
                                title="فتح ملف PDF للملخص التنفيذي"
                            >
                                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                <span>PDF الملخص</span>
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={copyFullText}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-white transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-emerald-600 dark:text-[#4EDEA3] text-sm">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                        </button>

                        {/* Export Dropdown / Subtitle links */}
                        <a
                            href={route('transcripts.export.srt', transcript.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-emerald-700 dark:text-[#4EDEA3] font-mono font-bold transition-all"
                            title="تحميل ملف الترجمة للبرامج"
                        >
                            .SRT
                        </a>

                        <a
                            href={route('transcripts.export.vtt', transcript.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-indigo-700 dark:text-[#C0C1FF] font-mono font-bold transition-all"
                        >
                            .VTT
                        </a>
                    </div>
                </div>
            </header>

            {/* Split Studio Body */}
            <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full flex flex-col lg:flex-row gap-6">
                {/* Left Side (RTL Right): Embedded Video & Metadata */}
                <div className="lg:w-5/12 flex flex-col gap-4">
                    <div className="rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-white/10 shadow-2xl aspect-video sticky top-24">
                        <iframe
                            ref={iframeRef}
                            src={`https://www.youtube.com/embed/${transcript.youtube_id}`}
                            title={transcript.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                        />
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-[#BBCAFF]">مدة الفيديو:</span>
                            <span className="font-mono text-slate-900 dark:text-white font-bold">{formatDuration(transcript.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-[#BBCAFF]">لغة التفريغ الأصلية:</span>
                            <span className="font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#4EDEA3] font-bold uppercase">
                                {transcript.language}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-[#BBCAFF]">عدد المقاطع النصية:</span>
                            <span className="font-mono text-slate-900 dark:text-white">{segments.length} مقطع</span>
                        </div>
                        {transcript.proofread_generated_at && (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                                <span className="text-slate-500 dark:text-[#BBCAFF]">التدقيق اللغوي الكامل:</span>
                                <span className="font-mono text-emerald-600 dark:text-[#4EDEA3] text-[11px]">
                                    {new Date(transcript.proofread_generated_at).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}
                        {transcript.summary_generated_at && (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                                <span className="text-slate-500 dark:text-[#BBCAFF]">آخر تلخيص بالذكاء الاصطناعي:</span>
                                <span className="font-mono text-emerald-600 dark:text-[#4EDEA3] text-[11px]">
                                    {new Date(transcript.summary_generated_at).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side (RTL Left): Tabbed Workspace (Transcript vs AI Summary) */}
                <div className="lg:w-7/12 flex flex-col gap-3">
                    {/* Workspace Tabs */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('transcript')}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeTab === 'transcript'
                                        ? 'bg-emerald-50 dark:bg-[#1C2028] text-emerald-700 dark:text-[#4EDEA3] border border-emerald-300 dark:border-[#10B981]/40 shadow-xs'
                                        : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">subtitles</span>
                                <span>النص المتزامن ({segments.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('proofread')}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeTab === 'proofread'
                                        ? 'bg-emerald-50 dark:bg-[#1C2028] text-emerald-700 dark:text-[#4EDEA3] border border-emerald-300 dark:border-[#10B981]/40 shadow-xs'
                                        : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">spellcheck</span>
                                <span>النص الكامل المدقق لغوياً</span>
                                {transcript.proofread_html && (
                                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('summary')}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeTab === 'summary'
                                        ? 'bg-emerald-50 dark:bg-[#1C2028] text-emerald-700 dark:text-[#4EDEA3] border border-emerald-300 dark:border-[#10B981]/40 shadow-xs'
                                        : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">auto_awesome</span>
                                <span>الملخص الذكي (AI)</span>
                                {transcript.summary_html && (
                                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                )}
                            </button>
                        </div>

                        {/* Top quick actions per active tab */}
                        {activeTab === 'proofread' && transcript.proofread_html && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={copyProofread}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                    title="نسخ النص الكامل المدقق"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedProofread ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                                <a
                                    href={route('transcripts.export.txt', { transcript: transcript.id, type: 'proofread' })}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-xs text-slate-700 dark:text-[#BBCAFF] font-mono font-bold transition-all"
                                    title="تحميل النص المدقق كملف TXT"
                                >
                                    TXT
                                </a>
                                <a
                                    href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'proofread' })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    <span>PDF كامل</span>
                                </a>
                            </div>
                        )}

                        {activeTab === 'summary' && transcript.summary_html && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={copySummary}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                    title="نسخ نص الملخص"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedSummary ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                                <a
                                    href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'summary' })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    <span>PDF ملخص</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* TAB 1: TRANSCRIPT SEGMENTS */}
                    {activeTab === 'transcript' && (
                        <div className="space-y-3">
                            {/* Search inside transcript */}
                            <div className="relative">
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 material-symbols-outlined text-lg">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث في نص هذا الفيديو..."
                                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] outline-none shadow-xs"
                                />
                            </div>

                            {/* Segments Stream */}
                            <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pl-1">
                                {filteredSegments.length === 0 ? (
                                    <div className="p-8 text-center rounded-xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#BBCAFF]">
                                        لم يتم العثور على نتائج تطابق كلمة البحث.
                                    </div>
                                ) : (
                                    filteredSegments.map((seg) => {
                                        const isActive = activeTimestamp === seg.offset_seconds;

                                        return (
                                            <div
                                                key={seg.index}
                                                onClick={() => seekTo(seg.offset_seconds)}
                                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-right ${
                                                    isActive
                                                        ? 'bg-emerald-50 dark:bg-[#10B981]/15 border-emerald-500 dark:border-[#10B981] shadow-xs'
                                                        : 'bg-white dark:bg-[#141822] border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-[#181C24]'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    className={`px-2.5 py-1 rounded font-mono text-xs font-bold shrink-0 transition-colors ${
                                                        isActive
                                                            ? 'bg-[#10B981] text-[#003824]'
                                                            : 'bg-slate-100 dark:bg-[#0A0E16] text-emerald-700 dark:text-[#4EDEA3] border border-slate-200 dark:border-[#10B981]/25 hover:bg-[#10B981] hover:text-[#003824]'
                                                    }`}
                                                >
                                                    {seg.timestamp_formatted}
                                                </button>

                                                <p className="text-sm text-slate-800 dark:text-white leading-relaxed flex-1 select-text">
                                                    {seg.text}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: FULL LINGUISTIC PROOFREAD */}
                    {activeTab === 'proofread' && (
                        <div className="space-y-4">
                            {transcript.proofread_html ? (
                                <div className="rounded-2xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 p-6 shadow-xs dark:shadow-xl max-h-[calc(100vh-230px)] overflow-y-auto">
                                    {/* Document Header Controls */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                النص الكامل بعد التدقيق اللغوي والنحوي والتنسيق
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-slate-500 dark:text-[#BBCAFF]">قالب المستند:</span>
                                            <select
                                                value={docTheme}
                                                onChange={(e) => setDocTheme(e.target.value)}
                                                className="bg-slate-50 dark:bg-[#0F131C] border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-[#10B981]"
                                            >
                                                {themes.length > 0 && (
                                                    <optgroup label="قوالب المؤسسة المخصصة">
                                                        {themes.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name} (مخصص)</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                <optgroup label="قوالب النظام القياسية">
                                                    {systemPresetsList.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => setShowProofreadModal(true)}
                                                className="text-[11px] text-emerald-600 dark:text-[#4EDEA3] hover:underline font-bold mr-1"
                                            >
                                                إعادة التدقيق
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rendered Semantic HTML Proofread Text */}
                                    <div
                                        className="prose dark:prose-invert max-w-none text-right leading-relaxed text-sm text-slate-800 dark:text-[#DFE2EE]
                                                   [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h1]:mb-4
                                                   [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-emerald-700 dark:[&_h2]:text-[#4EDEA3] [&_h2]:border-r-4 [&_h2]:border-[#10B981] [&_h2]:pr-3 [&_h2]:mt-6 [&_h2]:mb-3
                                                   [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                                                   [&_p]:mb-3.5 [&_p]:text-justify [&_p]:text-slate-700 dark:[&_p]:text-white/90 [&_p]:leading-7
                                                   [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-4 [&_li]:mb-1.5
                                                   [&_blockquote]:border-r-4 [&_blockquote]:border-[#10B981] [&_blockquote]:bg-slate-50 dark:[&_blockquote]:bg-white/5 [&_blockquote]:p-3 [&_blockquote]:rounded-l-lg [&_blockquote]:my-4 [&_blockquote]:italic"
                                        dangerouslySetInnerHTML={{ __html: transcript.proofread_html }}
                                    />
                                </div>
                            ) : (
                                /* No Proofread Yet CTA Card */
                                <div className="p-10 rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-[#141822] dark:to-[#1C2028] border border-slate-200 dark:border-white/10 text-center flex flex-col items-center shadow-xs dark:shadow-xl">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl">spellcheck</span>
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                                        تدقيق النص كاملاً وتجهيزه كملف PDF رسمي
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#BBCAFF] max-w-md mb-6 leading-relaxed">
                                        يقوم الذكاء الاصطناعي بتدقيق النص كاملاً بدون أي اختصار أو تلخيص، مع تصحيح الأخطاء اللغوية والنحوية والإملائية وضبط علامات الترقيم وتقسيم النص إلى فقرات وعناوين منسقة وجاهزة للتصدير كملف PDF رسمي.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setShowProofreadModal(true)}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-lg">spellcheck</span>
                                        <span>بدء التدقيق اللغوي للنص كاملاً الآن</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: AI SUMMARY & DOCUMENT */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4">
                            {transcript.summary_html ? (
                                <div className="rounded-2xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 p-6 shadow-xs dark:shadow-xl max-h-[calc(100vh-230px)] overflow-y-auto">
                                    {/* Document Header Controls */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                النمط: {summaryPresets.find(p => p.id === transcript.summary_style)?.name || 'ملخص تنفيذي'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-slate-500 dark:text-[#BBCAFF]">تصميم المستند للطباعة:</span>
                                            <select
                                                value={docTheme}
                                                onChange={(e) => setDocTheme(e.target.value)}
                                                className="bg-slate-50 dark:bg-[#0F131C] border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-[#10B981]"
                                            >
                                                {themes.length > 0 && (
                                                    <optgroup label="قوالب المؤسسة المخصصة">
                                                        {themes.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name} (مخصص)</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                <optgroup label="قوالب النظام القياسية">
                                                    {systemPresetsList.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                            <Link
                                                href={route('themes.index')}
                                                className="text-[11px] text-emerald-600 dark:text-[#4EDEA3] hover:underline font-bold mr-1"
                                                title="تخصيص الهوية والشعار"
                                            >
                                                تخصيص
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Rendered Semantic HTML Summary */}
                                    <div
                                        className="prose dark:prose-invert max-w-none text-right leading-relaxed text-sm text-slate-800 dark:text-[#DFE2EE]
                                                   [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-emerald-700 dark:[&_h2]:text-[#4EDEA3] [&_h2]:border-r-4 [&_h2]:border-[#10B981] [&_h2]:pr-3 [&_h2]:mt-6 [&_h2]:mb-3
                                                   [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                                                   [&_p]:mb-3 [&_p]:text-justify [&_p]:text-slate-700 dark:[&_p]:text-white/90
                                                   [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-4 [&_li]:mb-1.5
                                                   [&_blockquote]:border-r-4 [&_blockquote]:border-[#10B981] [&_blockquote]:bg-slate-50 dark:[&_blockquote]:bg-white/5 [&_blockquote]:p-3 [&_blockquote]:rounded-l-lg [&_blockquote]:my-4 [&_blockquote]:italic
                                                   [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:bg-slate-100 dark:[&_th]:bg-[#1C2028] [&_th]:p-2.5 [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-white/10 [&_th]:text-emerald-700 dark:[&_th]:text-[#4EDEA3]
                                                   [&_td]:p-2 [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-white/10 [&_td]:text-xs"
                                        dangerouslySetInnerHTML={{ __html: transcript.summary_html }}
                                    />
                                </div>
                            ) : (
                                /* No Summary Yet CTA Card */
                                <div className="p-10 rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-[#141822] dark:to-[#1C2028] border border-slate-200 dark:border-white/10 text-center flex flex-col items-center shadow-xs dark:shadow-xl">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                                        توليد ملخص تنفيذي ومستند PDF بالذكاء الاصطناعي
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#BBCAFF] max-w-md mb-6 leading-relaxed">
                                        يقوم نموذج Gemini بتحليل كامل مدة هذا الفيديو ({formatDuration(transcript.duration_seconds)}) واستخراج أهم الأفكار وتنسيقها في شكل مستند رسمي جاهز للتحميل والطباعة.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setShowSummaryModal(true)}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                        <span>بدء التلخيص وتصميم المستند الآن</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* AI Summary Configuration Modal */}
            {showSummaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-[#4EDEA3] text-2xl">auto_awesome</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">إعدادات التلخيص الذكي وتصميم المستند</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSummaryModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleGenerateSummary} className="space-y-5">
                            {/* 1. Style Presets */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE] mb-2.5">
                                    اختر نمط التلخيص:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {summaryPresets.map((preset) => {
                                        const isSelected = summaryData.style === preset.id;
                                        return (
                                            <div
                                                key={preset.id}
                                                onClick={() => setSummaryData('style', preset.id)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                                    isSelected
                                                        ? 'bg-emerald-50 dark:bg-[#10B981]/15 border-emerald-500 dark:border-[#10B981] shadow-xs'
                                                        : 'bg-slate-50 dark:bg-[#0F131C] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-xl ${isSelected ? 'text-emerald-600 dark:text-[#4EDEA3]' : 'text-slate-400 dark:text-white/40'}`}>
                                                    {preset.icon}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700 dark:text-[#4EDEA3]' : 'text-slate-800 dark:text-white'}`}>
                                                        {preset.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 dark:text-[#BBCAFF] leading-normal">
                                                        {preset.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Visual Theme Picker */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE]">
                                        طابع وتصميم مستند الـ PDF المطبوع:
                                    </label>
                                    <Link
                                        href={route('themes.index')}
                                        className="text-[10px] text-emerald-600 dark:text-[#4EDEA3] hover:underline font-bold"
                                        target="_blank"
                                    >
                                        + إدارة القوالب والشعار
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {allAvailableThemes.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                                setDocTheme(t.id);
                                                setSummaryData('theme', t.id);
                                            }}
                                            className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                                                docTheme === t.id
                                                    ? 'bg-emerald-50 dark:bg-[#1C2028] border-emerald-500 dark:border-[#10B981] text-emerald-800 dark:text-[#4EDEA3] shadow-xs font-bold'
                                                    : 'bg-slate-50 dark:bg-[#0F131C] border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#BBCAFF] hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: t.color }} />
                                            <div className="truncate">{t.name.split(' ')[0]}</div>
                                            {t.isCustom && <span className="text-[9px] text-[#10B981] block">مخصص</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Custom Prompt Instructions */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE] mb-1.5">
                                    توجيهات إضافية مخصصة للذكاء الاصطناعي (اختياري):
                                </label>
                                <textarea
                                    value={summaryData.prompt}
                                    onChange={(e) => setSummaryData('prompt', e.target.value)}
                                    placeholder="مثال: ركّز على ذكر كافة التواريخ والأرقام، أو لخّص النقاط القانونية بشكل جدول مقارنات..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F131C] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] outline-none"
                                />
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowSummaryModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    disabled={summarizing}
                                >
                                    إلغاء
                                </button>

                                <button
                                    type="submit"
                                    disabled={summarizing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {summarizing ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            <span>جاري التوليد بواسطة Gemini...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                                            <span>توليد المستند الآن</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Full Text Proofreading Configuration Modal */}
            {showProofreadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-[#4EDEA3] text-2xl">spellcheck</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">التدقيق اللغوي الكامل وتجهيز ملف PDF</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProofreadModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Notice about fidelity */}
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#10B981]/10 border border-emerald-200 dark:border-[#10B981]/25 mb-5 flex items-start gap-3">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-[#4EDEA3] text-xl shrink-0 mt-0.5">verified</span>
                            <p className="text-xs text-emerald-900 dark:text-[#DFE2EE] leading-relaxed">
                                <strong>تدقيق شامل بدون اختصار:</strong> سيقوم الذكاء الاصطناعي بمراجعة كل كلمة في تفريغ الفيديو، وضبط القواعد النحوية والإملائية وعلامات الترقيم، وتقسيم المحتوى إلى فقرات وعناوين منسقة دون تلخيص أو حذف.
                            </p>
                        </div>

                        <form onSubmit={handleGenerateProofread} className="space-y-5">
                            {/* Visual Theme Picker */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE]">
                                        طابع وتصميم مستند الـ PDF المطبوع:
                                    </label>
                                    <Link
                                        href={route('themes.index')}
                                        className="text-[10px] text-emerald-600 dark:text-[#4EDEA3] hover:underline font-bold"
                                        target="_blank"
                                    >
                                        + إدارة القوالب والشعار
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {allAvailableThemes.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setDocTheme(t.id)}
                                            className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                                                docTheme === t.id
                                                    ? 'bg-emerald-50 dark:bg-[#1C2028] border-emerald-500 dark:border-[#10B981] text-emerald-800 dark:text-[#4EDEA3] shadow-xs font-bold'
                                                    : 'bg-slate-50 dark:bg-[#0F131C] border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#BBCAFF] hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: t.color }} />
                                            <div className="truncate">{t.name.split(' ')[0]}</div>
                                            {t.isCustom && <span className="text-[9px] text-[#10B981] block">مخصص</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Prompt / Directives */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE] mb-1.5">
                                    توجيهات تدقيق خاصة (اختياري):
                                </label>
                                <textarea
                                    value={proofreadData.prompt}
                                    onChange={(e) => setProofreadData('prompt', e.target.value)}
                                    placeholder="مثال: حافظ على الأسماء والمصطلحات التقنية بين أقواس، صحح اللهجة إلى لغة عربية فصحى معاصرة رصينة..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F131C] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] outline-none"
                                />
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowProofreadModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    disabled={proofreading}
                                >
                                    إلغاء
                                </button>

                                <button
                                    type="submit"
                                    disabled={proofreading}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {proofreading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            <span>جاري التدقيق الشامل بواسطة Gemini...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">spellcheck</span>
                                            <span>بدء التدقيق اللغوي الكامل الآن</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
