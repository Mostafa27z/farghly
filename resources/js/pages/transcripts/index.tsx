import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FolderOpen, Plus, Sparkles, Video } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import KpiSummaryStrip from './components/kpi-summary-strip';
import TranscriptGridCard from './components/transcript-grid-card';
import TranscriptListCard from './components/transcript-list-card';
import TranscriptsFilterBar from './components/transcripts-filter-bar';
import YoutubeExtractCard from './components/youtube-extract-card';

interface TranscriptItem {
    id: string;
    youtube_id: string;
    title: string;
    channel_name: string;
    thumbnail_url: string;
    duration_seconds: number;
    language: string;
    created_at: string;
}

interface TenantInfo {
    name: string;
    plan_name: string;
    monthly_videos_limit?: number;
    monthly_videos_used?: number;
    remaining_videos?: number;
    monthly_minutes_limit?: number;
    monthly_minutes_used?: number;
    remaining_minutes?: number;
    expires_at: string;
}

interface PaginatedTranscripts {
    data: TranscriptItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    transcripts: PaginatedTranscripts;
    tenant: TenantInfo;
    filters: { search?: string };
}

export default function TranscriptsIndex({ transcripts, tenant, filters }: Props) {
    const { isRtl } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('farghly_library_view_mode');
            if (saved === 'grid' || saved === 'list') {
                setViewMode(saved);
            }
        } catch {
            // ignore
        }
    }, []);

    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        try {
            localStorage.setItem('farghly_library_view_mode', mode);
        } catch {
            // ignore
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('dashboard'), { search }, { preserveState: true });
    };

    const focusUrlInput = () => {
        const input = document.getElementById('youtube-url-input') as HTMLInputElement;
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <DashboardLayout
            title={isRtl ? 'المكتبة والتفريغ الذكي' : 'Library & Transcripts'}
            subtitle={
                isRtl
                    ? 'تفريغ وتلخيص المحاضرات وتحويلها لمذكرات قابلة للطباعة بهويتك الأكاديمية'
                    : 'AI-powered lecture extraction, summarization, and branding'
            }
        >
            <Head title={isRtl ? `المكتبة والتفريغ | ${tenant?.name || 'فرغلي'}` : `Transcripts | ${tenant?.name || 'Farghly'}`} />

            <div className="w-full space-y-6 sm:space-y-8">
                {/* 1. Metric Cards Strip (Full Width) */}
                <KpiSummaryStrip tenant={tenant} totalTranscripts={transcripts.total} />

                {/* 2. YouTube Instant Extraction Form (Full Width) */}
                <YoutubeExtractCard />

                {/* 3. Search and Header Controls */}
                <div className="pt-2">
                    <TranscriptsFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        onSubmitSearch={handleSearch}
                        totalCount={transcripts.total}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                    />
                </div>

                {/* 4. Transcripts Cards (Grid or List View) */}
                {transcripts.data.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 w-full">
                            {transcripts.data.map((item) => (
                                <TranscriptGridCard key={item.id} transcript={item} />
                            ))}

                            {/* Add More Lecture Action Card (when 1 or 2 items exist to balance the row) */}
                            {transcripts.data.length <= 2 && (
                                <button
                                    type="button"
                                    onClick={focusUrlInput}
                                    className="rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-card/40 hover:bg-card p-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 min-h-[260px] group cursor-pointer"
                                >
                                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                                            {isRtl ? 'إضافة محاضرة جديدة' : 'Add Another Lecture'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground max-w-[200px]">
                                            {isRtl
                                                ? 'الصق رابط يوتيوب بالأعلى لبدء تفريغ وصياغة ملخص جديد'
                                                : 'Paste another YouTube link above to expand your workspace'}
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 w-full">
                            {transcripts.data.map((item) => (
                                <TranscriptListCard key={item.id} transcript={item} />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="w-full p-8 sm:p-14 text-center rounded-3xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center gap-3">
                        <div className="size-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
                            <FolderOpen className="size-7 stroke-[1.8]" />
                        </div>
                        <h4 className="font-extrabold text-base text-foreground">
                            {search
                                ? (isRtl ? 'لم يتم العثور على محاضرات تطابق بحثك' : 'No lectures match your search')
                                : (isRtl ? 'لا توجد محاضرات مفرغة حتى الآن' : 'No transcripts in your library yet')}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-md">
                            {isRtl
                                ? 'ضع رابط أي فيديو يوتيوب في النموذج بالأعلى لبدء استخراج النص فورياً وصياغة المذكرات الذكية.'
                                : 'Paste any YouTube URL in the form above to start extracting word-level transcripts and smart notes.'}
                        </p>
                    </div>
                )}

                {/* 5. Pagination Controls */}
                {transcripts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                        {transcripts.links.map((link, idx) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={idx}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-3 py-1.5 text-xs text-muted-foreground/50 rounded-xl"
                                    />
                                );
                            }
                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'bg-card border border-border/70 text-foreground hover:bg-muted'
                                    }`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
