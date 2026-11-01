import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    FileText,
    Play,
    Tv,
} from 'lucide-react';
import React from 'react';

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

interface Props {
    transcript: TranscriptItem;
}

export default function TranscriptListCard({ transcript }: Props) {
    const { isRtl } = useLanguage();

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="group w-full rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-md p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Thumbnail + Title Details */}
            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="relative w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden bg-muted shrink-0 shadow-inner">
                    <img
                        src={transcript.thumbnail_url || `https://img.youtube.com/vi/${transcript.youtube_id}/hqdefault.jpg`}
                        alt={transcript.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 end-1.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                        {formatDuration(transcript.duration_seconds)}
                    </span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">
                            {transcript.language || 'AR'}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tv className="size-3 text-muted-foreground" />
                            <span className="truncate max-w-[140px] font-medium">{transcript.channel_name || (isRtl ? 'قناة يوتيوب' : 'YouTube Channel')}</span>
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span>{formatDate(transcript.created_at)}</span>
                        </span>
                    </div>

                    <Link
                        href={route('transcripts.show', transcript.id)}
                        className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                        title={transcript.title}
                    >
                        {transcript.title}
                    </Link>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                <Link
                    href={route('transcripts.show', transcript.id)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                    <span>{isRtl ? 'فتح الاستوديو' : 'Open Studio'}</span>
                    {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                </Link>

                <Link
                    href={route('transcripts.document', transcript.id)}
                    className="size-10 rounded-2xl border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors shadow-2xs"
                    title={isRtl ? 'عرض المذكرة المنسقة' : 'View Document'}
                >
                    <FileText className="size-4" />
                </Link>
            </div>
        </div>
    );
}

