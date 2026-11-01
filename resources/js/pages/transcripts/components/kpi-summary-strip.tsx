import { useLanguage } from '@/hooks/use-language';
import { Clock, TrendingUp, Video, Sparkles, Zap, Layers } from 'lucide-react';
import React from 'react';

interface Props {
    tenant: {
        monthly_videos_limit?: number;
        monthly_videos_used?: number;
        remaining_videos?: number;
        monthly_minutes_limit?: number;
        monthly_minutes_used?: number;
        remaining_minutes?: number;
        expires_at?: string;
    };
    totalTranscripts: number;
}

export default function KpiSummaryStrip({ tenant, totalTranscripts }: Props) {
    const { isRtl } = useLanguage();

    const totalVideos = tenant?.monthly_videos_limit ?? tenant?.monthly_minutes_limit ?? 0;
    const usedVideos = tenant?.monthly_videos_used ?? tenant?.monthly_minutes_used ?? 0;
    const remainingVideos = tenant?.remaining_videos ?? tenant?.remaining_minutes ?? 0;
    const usagePercent = totalVideos > 0 ? Math.min(100, Math.round((usedVideos / totalVideos) * 100)) : 0;
    const estimatedHoursSaved = Math.max(Math.round((totalTranscripts * 45) / 60), 1);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full">
            {/* Card 1: Quota */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'رصيد الفيديوهات المتبقي' : 'Remaining Video Quota'}
                    </span>
                    <div className="size-9 sm:size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
                        <Video className="size-4.5 sm:size-5" />
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl sm:text-4xl font-black text-foreground font-mono tracking-tight">
                            {remainingVideos.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                            / {totalVideos.toLocaleString()} {isRtl ? 'فيديو شهرياً' : 'videos monthly'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                usagePercent > 85 ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span className="font-semibold">{isRtl ? `تم استهلاك ${usagePercent}%` : `${usagePercent}% used`}</span>
                        <span>{tenant?.expires_at ? (isRtl ? `تجديد: ${tenant.expires_at}` : `Renews: ${tenant.expires_at}`) : ''}</span>
                    </div>
                </div>
            </div>

            {/* Card 2: Library Count */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'المحاضرات في مكتبتك' : 'Extracted Lectures'}
                    </span>
                    <div className="size-9 sm:size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
                        <Layers className="size-4.5 sm:size-5" />
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-4xl font-black text-foreground font-mono tracking-tight">
                            {totalTranscripts.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isRtl ? 'محاضرة مفرغة' : 'lectures ready'}
                        </span>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{isRtl ? 'نصوص وملخصات ومذكرات محفوظة سحابياً' : 'All transcripts and summaries cloud-saved'}</span>
                </div>
            </div>

            {/* Card 3: Saved Time */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'الوقت الموفر للمعلم' : 'Estimated Time Saved'}
                    </span>
                    <div className="size-9 sm:size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
                        <Clock className="size-4.5 sm:size-5" />
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-4xl font-black text-foreground font-mono tracking-tight">
                            ~{estimatedHoursSaved}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isRtl ? 'ساعة عمل وجهد' : 'hours manual effort'}
                        </span>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Zap className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{isRtl ? 'بناءً على تفريغ وصياغة ~45 دقيقة لكل محاضرة' : 'Based on ~45 mins per lecture preparation'}</span>
                </div>
            </div>
        </div>
    );
}
