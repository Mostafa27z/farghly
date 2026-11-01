import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ThemeOption {
    id: string;
    name: string;
    type: 'builder' | 'custom_html';
    is_default: boolean;
}

interface TranscriptData {
    id: string;
    duration_seconds: number;
    summary_html?: string | null;
    summary_text?: string | null;
    summary_style?: string | null;
}

interface SummaryPreset {
    id: string;
    name: string;
    icon: string;
    desc: string;
}

interface SummaryTabProps {
    transcript: TranscriptData;
    docTheme: string;
    setDocTheme: (v: string) => void;
    themes: ThemeOption[];
    systemPresetsList: { id: string; name: string; color: string }[];
    summaryPresets: SummaryPreset[];
    formatDuration: (seconds: number) => string;
    onOpenSummaryModal: () => void;
}

export default function SummaryTab({
    transcript,
    docTheme,
    setDocTheme,
    themes,
    systemPresetsList,
    summaryPresets,
    formatDuration,
    onOpenSummaryModal,
}: SummaryTabProps) {
    if (transcript.summary_html) {
        return (
            <div className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-xs dark:shadow-xl max-h-[calc(100vh-230px)] overflow-y-auto">
                    {/* Document Header Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-foreground">
                                النمط: {summaryPresets.find((p) => p.id === transcript.summary_style)?.name || 'ملخص تنفيذي'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">تصميم المستند للطباعة:</span>
                            <Select dir="rtl" value={docTheme} onValueChange={setDocTheme}>
                                <SelectTrigger className="h-8 min-w-[200px] text-xs bg-muted/70 hover:bg-muted border-border rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-primary/30 focus:border-primary">
                                    <SelectValue placeholder="اختر طابع المستند" />
                                </SelectTrigger>
                                <SelectContent dir="rtl" className="bg-popover/95 backdrop-blur-md border-border text-xs rounded-xl shadow-xl min-w-[220px] z-50">
                                    {themes.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel className="text-[10px] font-bold text-muted-foreground/80 px-2 py-1">قوالب المؤسسة المخصصة</SelectLabel>
                                            {themes.map((t) => (
                                                <SelectItem key={t.id} value={t.id} className="text-xs py-2 cursor-pointer rounded-lg hover:bg-accent/60">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-primary/70 shrink-0" />
                                                        <span>{t.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">(مخصص)</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                            <SelectSeparator className="my-1 bg-border/50" />
                                        </SelectGroup>
                                    )}
                                    <SelectGroup>
                                        <SelectLabel className="text-[10px] font-bold text-muted-foreground/80 px-2 py-1">قوالب النظام القياسية</SelectLabel>
                                        {systemPresetsList.map((t) => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs py-2 cursor-pointer rounded-lg hover:bg-accent/60">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: t.color }} />
                                                    <span className="font-medium">{t.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Link
                                href={route('themes.index')}
                                className="text-[11px] text-primary hover:underline font-bold mr-1 whitespace-nowrap"
                                title="تخصيص الهوية والشعار"
                            >
                                تخصيص
                            </Link>
                        </div>
                    </div>

                    {/* Rendered Semantic HTML Summary */}
                    <div
                        className="prose dark:prose-invert max-w-none text-right leading-relaxed text-sm text-foreground
                                   [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_h2]:border-r-4 [&_h2]:border-primary [&_h2]:pr-3 [&_h2]:mt-6 [&_h2]:mb-3
                                   [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2
                                   [&_p]:mb-3 [&_p]:text-justify [&_p]:text-foreground/90
                                   [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-4 [&_li]:mb-1.5
                                   [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-muted [&_blockquote]:p-3 [&_blockquote]:rounded-l-lg [&_blockquote]:my-4 [&_blockquote]:italic
                                   [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:bg-muted [&_th]:p-2.5 [&_th]:border [&_th]:border-border [&_th]:text-primary
                                   [&_td]:p-2 [&_td]:border [&_td]:border-border [&_td]:text-xs"
                        dangerouslySetInnerHTML={{ __html: transcript.summary_html }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 rounded-2xl bg-card border border-border text-center flex flex-col items-center shadow-xs dark:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">
                توليد ملخص تنفيذي ومستند PDF بالذكاء الاصطناعي
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                يقوم الذكاء الاصطناعي بتحليل كامل مدة هذا الفيديو ({formatDuration(transcript.duration_seconds)}) واستخراج أهم الأفكار وتنسيقها في شكل مستند رسمي جاهز للتحميل والطباعة.
            </p>
            <button
                type="button"
                onClick={onOpenSummaryModal}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
                <Sparkles size={18} />
                <span>بدء التلخيص وتصميم المستند الآن</span>
            </button>
        </div>
    );
}

