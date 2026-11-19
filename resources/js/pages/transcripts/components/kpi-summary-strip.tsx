import { useLanguage } from '@/hooks/use-language';
import { Clock, Layers, Mic, Sparkles, Video, Zap } from 'lucide-react';
import React from 'react';

interface Props {
    tenant: {
        monthly_videos_limit?: number;
        monthly_videos_used?: number;
        remaining_videos?: number;
        monthly_minutes_limit?: number;
        monthly_minutes_used?: number;
        remaining_minutes?: number;
        monthly_recording_minutes_limit?: number;
        monthly_recording_minutes_used?: number;
        remaining_recording_minutes?: number;
        expires_at?: string;
    };
    totalTranscripts: number;
}

export default function KpiSummaryStrip({ tenant, totalTranscripts }: Props) {
    const { isRtl } = useLanguage();

    // YouTube Video Quota
    const totalVideos = tenant?.monthly_videos_limit ?? tenant?.monthly_minutes_limit ?? 0;
    const usedVideos = tenant?.monthly_videos_used ?? tenant?.monthly_minutes_used ?? 0;
    const remainingVideos = tenant?.remaining_videos ?? tenant?.remaining_minutes ?? 0;
    const usagePercent = totalVideos > 0 ? Math.min(100, Math.round((usedVideos / totalVideos) * 100)) : 0;

    // Direct Voice/File Recording Minutes Quota
    const totalRecMinutes = tenant?.monthly_recording_minutes_limit ?? 300;
    const usedRecMinutes = tenant?.monthly_recording_minutes_used ?? 0;
    const remainingRecMinutes = tenant?.remaining_recording_minutes ?? Math.max(0, totalRecMinutes - usedRecMinutes);
    const recUsagePercent = totalRecMinutes > 0 ? Math.min(100, Math.round((usedRecMinutes / totalRecMinutes) * 100)) : 0;

    const estimatedHoursSaved = Math.max(Math.round((totalTranscripts * 45) / 60), 1);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
            {/* Card 1: YouTube Videos Quota */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'رصيد فيديوهات يوتيوب' : 'YouTube Video Quota'}
                    </span>
                    <div className="size-8 sm:size-9 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold border border-red-500/20 shrink-0">
                        <Video className="size-4" />
                    </div>
                </div>

                <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tracking-tight">
                            {remainingVideos.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                            / {totalVideos.toLocaleString()} {isRtl ? 'فيديو' : 'videos'}
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                usagePercent > 85 ? 'bg-destructive' : 'bg-red-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span className="font-semibold">{isRtl ? `مستهلك ${usagePercent}%` : `${usagePercent}% used`}</span>
                        <span>{tenant?.expires_at ? (isRtl ? `تجديد: ${tenant.expires_at}` : `Renews: ${tenant.expires_at}`) : ''}</span>
                    </div>
                </div>
            </div>

            {/* Card 2: Recording Minutes Quota (Dedicated Limit) */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'رصيد دقائق التسجيل الصوتي' : 'Audio Recording Quota'}
                    </span>
                    <div className="size-8 sm:size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
                        <Mic className="size-4" />
                    </div>
                </div>

                <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tracking-tight">
                            {remainingRecMinutes.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                            / {totalRecMinutes.toLocaleString()} {isRtl ? 'دقيقة تسجيل' : 'recording mins'}
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                recUsagePercent > 85 ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${recUsagePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span className="font-semibold">{isRtl ? `مستهلك ${recUsagePercent}%` : `${recUsagePercent}% used`}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRtl ? 'Groq Whisper' : 'Groq Whisper'}</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Library Count */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'المحاضرات في مكتبتك' : 'Extracted Lectures'}
                    </span>
                    <div className="size-8 sm:size-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 shrink-0">
                        <Layers className="size-4" />
                    </div>
                </div>

                <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tracking-tight">
                            {totalTranscripts.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isRtl ? 'محاضرة مفرغة' : 'lectures ready'}
                        </span>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{isRtl ? 'نصوص وملخصات سحابية' : 'Transcripts & notes cloud-saved'}</span>
                </div>
            </div>

            {/* Card 4: Saved Time */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 end-0 -mt-6 -me-6 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground">
                        {isRtl ? 'الوقت الموفر للمعلم' : 'Estimated Time Saved'}
                    </span>
                    <div className="size-8 sm:size-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 shrink-0">
                        <Clock className="size-4" />
                    </div>
                </div>

                <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tracking-tight">
                            ~{estimatedHoursSaved}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isRtl ? 'ساعة عمل وجهد' : 'hours manual effort'}
                        </span>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Zap className="size-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isRtl ? 'توفير ~45 دقيقة لكل مادة' : 'Saved ~45 mins per lesson'}</span>
                </div>
            </div>
        </div>
    );
}
