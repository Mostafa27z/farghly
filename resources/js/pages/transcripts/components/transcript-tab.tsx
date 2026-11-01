import { useLanguage } from '@/hooks/use-language';
import { Search, X, Sparkles } from 'lucide-react';
import React from 'react';

interface Segment {
    index: number;
    text: string;
    offset_seconds: number;
    timestamp_formatted: string;
}

interface TranscriptTabProps {
    transcriptId: string;
    segments: Segment[];
    filteredSegments: Segment[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    activeTimestamp: number | null;
    seekTo: (seconds: number) => void;
}

export default function TranscriptTab({
    transcriptId,
    segments,
    filteredSegments,
    searchTerm,
    setSearchTerm,
    activeTimestamp,
    seekTo,
}: TranscriptTabProps) {
    const { isRtl } = useLanguage();

    return (
        <div className="space-y-3.5 w-full">
            {/* Search inside transcript */}
            <div className="relative flex items-center w-full">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                        isRtl
                            ? 'ابحث في نصوص وتوقيتات هذا الفيديو...'
                            : 'Search inside video transcript...'
                    }
                    className="w-full h-11 ps-10 pe-20 rounded-2xl bg-card border border-border/80 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-2xs"
                />

                {searchTerm ? (
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/20">
                            {filteredSegments.length} {isRtl ? 'نتيجة' : 'results'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="size-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                            title={isRtl ? 'مسح البحث' : 'Clear search'}
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Segments Stream */}
            <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pe-1.5 custom-scrollbar">
                {filteredSegments.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Search className="size-6 text-muted-foreground/50 stroke-[1.5]" />
                        <p className="font-semibold text-foreground">
                            {isRtl
                                ? `لا توجد نتائج تطابق «${searchTerm}»`
                                : `No matches found for "${searchTerm}"`}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="mt-1 px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            {isRtl ? 'مسح البحث وعرض الكل' : 'Clear Search'}
                        </button>
                    </div>
                ) : (
                    filteredSegments.map((seg) => {
                        const isActive = activeTimestamp === seg.offset_seconds;
                        return (
                            <div
                                key={seg.index}
                                onClick={() => seekTo(seg.offset_seconds)}
                                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                    isActive
                                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                                        : 'bg-card border-border/60 hover:border-primary/40 hover:bg-muted/40'
                                }`}
                            >
                                <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold shrink-0 transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'bg-muted/80 text-primary border border-border/70 hover:bg-primary hover:text-primary-foreground'
                                    }`}
                                >
                                    {seg.timestamp_formatted}
                                </button>
                                <p className="text-xs sm:text-sm text-foreground leading-relaxed flex-1 select-text">
                                    {seg.text}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
