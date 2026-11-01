import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    FileText,
    Play,
    Sparkles,
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

export default function TranscriptGridCard({ transcript }: Props) {
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
        <div className="group rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-lg flex flex-col overflow-hidden">
            {/* Thumbnail Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                    src={transcript.thumbnail_url || `https://img.youtube.com/vi/${transcript.youtube_id}/hqdefault.jpg`}
                    alt={transcript.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Duration Badge */}
                <span className="absolute bottom-2.5 end-2.5 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs">
                    <Clock className="size-3 text-primary" />
                    <span>{formatDuration(transcript.duration_seconds)}</span>
                </span>

                {/* Language Badge */}
                <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-lg bg-primary/90 text-primary-foreground text-[10px] font-mono font-bold uppercase shadow-xs">
                    {transcript.language || 'AR'}
                </span>

                {/* Play Hover Overlay */}
                <Link
                    href={route('transcripts.show', transcript.id)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-2xs"
                >
                    <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="size-5 fill-current ps-0.5" />
                    </div>
                </Link>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                    <Link
                        href={route('transcripts.show', transcript.id)}
                        className="font-extrabold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                        title={transcript.title}
                    >
                        {transcript.title}
                    </Link>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span className="truncate max-w-[150px] font-semibold flex items-center gap-1.5 text-foreground/80">
                            <Tv className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{transcript.channel_name || (isRtl ? 'قناة يوتيوب' : 'YouTube Channel')}</span>
                        </span>
                        <span className="text-[11px] font-mono shrink-0 flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span>{formatDate(transcript.created_at)}</span>
                        </span>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                    <Link
                        href={route('transcripts.show', transcript.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                        <span>{isRtl ? 'فتح الاستوديو والتعديل' : 'Open Studio'}</span>
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                    </Link>

                    <Link
                        href={route('transcripts.document', transcript.id)}
                        className="size-9 rounded-2xl border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors shadow-2xs"
                        title={isRtl ? 'عرض المذكرة المنسقة' : 'View Document'}
                    >
                        <FileText className="size-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
