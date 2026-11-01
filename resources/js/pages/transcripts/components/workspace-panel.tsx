import { Check, Copy, FileText, Printer } from 'lucide-react';
import { Captions, SpellCheck, Sparkles } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import ProofreadTab from './proofread-tab';
import SummaryTab from './summary-tab';
import TranscriptTab from './transcript-tab';

interface Segment {
    index: number;
    text: string;
    offset_seconds: number;
    timestamp_formatted: string;
}

interface ThemeOption {
    id: string;
    name: string;
    type: 'builder' | 'custom_html';
    is_default: boolean;
}

interface TranscriptData {
    id: string;
    duration_seconds: number;
    segments: Segment[];
    full_text: string;
    summary_html?: string | null;
    summary_text?: string | null;
    summary_style?: string | null;
    proofread_html?: string | null;
    proofread_text?: string | null;
}

interface WorkspacePanelProps {
    transcript: TranscriptData;
    activeTab: 'transcript' | 'proofread' | 'summary';
    setActiveTab: (tab: 'transcript' | 'proofread' | 'summary') => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    filteredSegments: Segment[];
    activeTimestamp: number | null;
    seekTo: (seconds: number) => void;
    docTheme: string;
    setDocTheme: (v: string) => void;
    themes: ThemeOption[];
    systemPresetsList: { id: string; name: string; color: string }[];
    summaryPresets: { id: string; name: string; icon: string; desc: string }[];
    copied: boolean;
    copiedSummary: boolean;
    copiedProofread: boolean;
    onCopySummary: () => void;
    onCopyProofread: () => void;
    onOpenSummaryModal: () => void;
    onOpenProofreadModal: () => void;
    formatDuration: (seconds: number) => string;
}

export default function WorkspacePanel({
    transcript,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredSegments,
    activeTimestamp,
    seekTo,
    docTheme,
    setDocTheme,
    themes,
    systemPresetsList,
    summaryPresets,
    copied,
    copiedSummary,
    copiedProofread,
    onCopySummary,
    onCopyProofread,
    onOpenSummaryModal,
    onOpenProofreadModal,
    formatDuration,
}: WorkspacePanelProps) {
    const { isRtl } = useLanguage();
    const segments = transcript.segments || [];

    return (
        <div className="w-full lg:w-7/12 flex flex-col gap-4 min-w-0">
            {/* Workspace Tabs + Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                {/* Tab Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-muted/40 border border-border/70">
                    <button
                        type="button"
                        onClick={() => setActiveTab('transcript')}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeTab === 'transcript'
                                ? 'bg-card text-primary shadow-xs font-extrabold border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Captions size={16} />
                        <span>{isRtl ? `النص المتزامن (${segments.length})` : `Timestamps (${segments.length})`}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('proofread')}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeTab === 'proofread'
                                ? 'bg-card text-primary shadow-xs font-extrabold border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <SpellCheck size={16} />
                        <span>{isRtl ? 'التدقيق اللغوي' : 'Proofread Text'}</span>
                        {transcript.proofread_html && (
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('summary')}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                            activeTab === 'summary'
                                ? 'bg-card text-primary shadow-xs font-extrabold border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Sparkles size={16} />
                        <span>{isRtl ? 'الملخص الذكي (AI)' : 'Smart Summary'}</span>
                        {transcript.summary_html && (
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Per-tab Quick Export Actions */}
                {activeTab === 'transcript' && (
                    <div className="flex items-center gap-2">
                        <a
                            href={route('transcripts.export.txt', transcript.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground font-mono font-bold transition-all"
                        >
                            TXT
                        </a>
                        <a
                            href={route('transcripts.export.docx', { transcript: transcript.id, type: 'transcript' })}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 font-bold transition-all flex items-center gap-1 hover:bg-blue-100"
                        >
                            <FileText size={14} />
                            <span>Word</span>
                        </a>
                    </div>
                )}

                {activeTab === 'proofread' && transcript.proofread_html && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCopyProofread}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                            {copiedProofread ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <a
                            href={route('transcripts.export.txt', { transcript: transcript.id, type: 'proofread' })}
                            className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground font-mono font-bold transition-all"
                        >
                            TXT
                        </a>
                        <a
                            href={route('transcripts.export.docx', { transcript: transcript.id, type: 'proofread' })}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 font-bold transition-all flex items-center gap-1 hover:bg-blue-100"
                        >
                            <FileText size={14} />
                            <span>Word</span>
                        </a>
                        <a
                            href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'proofread' })}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center gap-1"
                        >
                            <Printer size={14} />
                            <span>PDF كامل</span>
                        </a>
                    </div>
                )}

                {activeTab === 'summary' && transcript.summary_html && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCopySummary}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                            {copiedSummary ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <a
                            href={route('transcripts.export.docx', { transcript: transcript.id, type: 'summary' })}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 font-bold transition-all flex items-center gap-1 hover:bg-blue-100"
                        >
                            <FileText size={14} />
                            <span>Word</span>
                        </a>
                        <a
                            href={route('transcripts.document', { transcript: transcript.id, theme: docTheme, type: 'summary' })}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center gap-1"
                        >
                            <Printer size={14} />
                            <span>PDF ملخص</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'transcript' && (
                <TranscriptTab
                    transcriptId={transcript.id}
                    segments={segments}
                    filteredSegments={filteredSegments}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeTimestamp={activeTimestamp}
                    seekTo={seekTo}
                />
            )}

            {activeTab === 'proofread' && (
                <ProofreadTab
                    transcript={transcript}
                    docTheme={docTheme}
                    setDocTheme={setDocTheme}
                    themes={themes}
                    systemPresetsList={systemPresetsList}
                    copiedProofread={copiedProofread}
                    onCopyProofread={onCopyProofread}
                    onOpenProofreadModal={onOpenProofreadModal}
                />
            )}

            {activeTab === 'summary' && (
                <SummaryTab
                    transcript={transcript}
                    docTheme={docTheme}
                    setDocTheme={setDocTheme}
                    themes={themes}
                    systemPresetsList={systemPresetsList}
                    summaryPresets={summaryPresets}
                    formatDuration={formatDuration}
                    onOpenSummaryModal={onOpenSummaryModal}
                />
            )}
        </div>
    );
}

