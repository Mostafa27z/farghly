import { useLanguage } from '@/hooks/use-language';
import { LayoutGrid, List, Search, X } from 'lucide-react';
import React from 'react';

interface Props {
    search: string;
    onSearchChange: (value: string) => void;
    onSubmitSearch: (e: React.FormEvent) => void;
    totalCount: number;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function TranscriptsFilterBar({
    search,
    onSearchChange,
    onSubmitSearch,
    totalCount,
    viewMode,
    onViewModeChange,
}: Props) {
    const { isRtl } = useLanguage();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
            {/* Left/Right Header & Count */}
            <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-foreground">
                    {isRtl ? 'المحاضرات والمكتبة' : 'Lecture Library'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
                    {totalCount} {isRtl ? (totalCount === 1 ? 'محاضرة' : 'محاضرات') : (totalCount === 1 ? 'lecture' : 'lectures')}
                </span>
            </div>

            {/* Right/Left Controls: Search + View Mode Toggle */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Search Bar */}
                <form onSubmit={onSubmitSearch} className="relative flex-1 sm:w-72 sm:flex-initial">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={isRtl ? 'بحث في العناوين أو القنوات...' : 'Search titles or channels...'}
                        className="w-full h-10 ps-9 pe-8 rounded-xl bg-card border border-border/70 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute end-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </form>

                {/* View Mode Toggle: Grid vs List */}
                <div className="flex items-center p-1 rounded-xl bg-card border border-border/70 shrink-0 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => onViewModeChange('grid')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            viewMode === 'grid'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title={isRtl ? 'عرض شبكي' : 'Grid View'}
                    >
                        <LayoutGrid className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange('list')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            viewMode === 'list'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title={isRtl ? 'عرض قائمة' : 'List View'}
                    >
                        <List className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
