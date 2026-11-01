import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardPaste,
    FileText,
    FileType,
    Sparkles,
    Timer,
    Video,
    Wand2,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function HeroSection({ isRtl }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post, processing } = useForm({
        url: '',
    });
    const [isFocused, setIsFocused] = useState(false);

    const handleQuickTranscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.url) return;

        if (auth?.is_sales || auth?.user?.system_role === 'sales') {
            alert(
                isRtl
                    ? 'حساب المبيعات مخصص لإدارة الاشتراكات والماليات فقط، ولا يملك صلاحية استخدام استوديو التفريغ.'
                    : 'Sales accounts are dedicated to managing subscriptions and billing only, without studio access.'
            );
            return;
        }

        if (auth?.user) {
            post(route('transcripts.store'));
        } else {
            window.location.href = route('login');
        }
    };

    // Quick Paste from Clipboard feature
    const handlePasteClipboard = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
                    setData('url', text.trim());
                }
            }
        } catch {
            // Ignore clipboard permission errors silently
        }
    };

    const badges = [
        {
            icon: Timer,
            titleAr: 'تفريغ فوري متزامن',
            titleEn: 'Instant Sync Transcript',
            descAr: 'توقيت زمني بالثواني لكل كلمة',
            descEn: 'Word-level precise timestamps',
        },
        {
            icon: Wand2,
            titleAr: 'تدقيق لغوي ونحوي',
            titleEn: 'Arabic Grammar Engine',
            descAr: 'تصحيح نحوي وإملائي فائق الدقة',
            descEn: 'Flawless Arabic spelling & grammar',
        },
        {
            icon: FileText,
            titleAr: 'مستندات جاهزة للطباعة',
            titleEn: 'Print-Ready PDF Handouts',
            descAr: 'مقاس A4 وهوية احترافية للمطبعة',
            descEn: '300 DPI A4 sheets ready for press',
        },
        {
            icon: FileType,
            titleAr: 'تصدير Word و SRT',
            titleEn: 'Export Word & SRT',
            descAr: 'جاهز للتعديل والترجمة والمونتاج',
            descEn: 'Editable docs and subtitle sync',
        },
    ];

    return (
        <section className="relative px-4 sm:px-8 lg:px-12 pt-8 pb-20 sm:pt-20 sm:pb-32 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Subtle Precision Grid Pattern (Replacing generic AI blurry orb) */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_60%,transparent_100%)] opacity-50 dark:opacity-25 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-2xs mb-8 hover:border-primary/40 transition-colors">
                    <Sparkles className="size-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                        {isRtl
                            ? 'استوديو تفريغ وتلخيص يوتيوب الأكاديمي'
                            : 'Academic YouTube Lecture Transcription & Memo Studio'}
                    </span>
                </div>

                {/* Hero Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground leading-[1.18] mb-6">
                    {isRtl ? (
                        <>
                            حوّل فيديوهاتك التعليمية إلى{' '}
                            <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                                مذكرات وملخصات ذكية
                            </span>{' '}
                            جاهزة للمذاكرة والطباعة
                        </>
                    ) : (
                        <>
                            Transform Video Lectures into{' '}
                            <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                                Smart Study Memos
                            </span>{' '}
                            Ready to Print
                        </>
                    )}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-10">
                    {isRtl
                        ? 'ضع رابط أي فيديو يوتيوب تعليمي؛ يقوم الذكاء الاصطناعي بتفريغ المحتوى بالكامل بدقة زمنية، وتدقيقه لغوياً ونحوياً، وتلخيصه كملف PDF رسمي مصمم بهويتك وشعارك.'
                        : 'Paste any educational YouTube link. AI transcribes word-for-word, proofreads Arabic grammar, and formats structured PDF handouts with your custom branding.'}
                </p>

                {/* Modern Unified Command / Transcribe Bar */}
                <div className="w-full max-w-3xl mb-8">
                    <form
                        onSubmit={handleQuickTranscribe}
                        className={`group relative p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-card border transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
                            isFocused
                                ? 'border-primary ring-4 ring-primary/15 shadow-primary/10'
                                : 'border-border/90 hover:border-primary/40'
                        }`}
                    >
                        {/* Input Container */}
                        <div className="relative flex-1 w-full flex items-center">
                            {/* YouTube / Video Brand Icon */}
                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 ms-1 me-2 sm:ms-2">
                                <Video className="size-5" />
                            </div>

                            {/* Clean Input Field */}
                            <input
                                type="url"
                                required
                                value={data.url}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder={
                                    isRtl
                                        ? 'ضع رابط يوتيوب هنا (محاضرة، درس، كورس)...'
                                        : 'Paste YouTube link here (lecture, course, lesson)...'
                                }
                                className="w-full py-2.5 sm:py-3 pe-3 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 border-0 outline-none focus:ring-0 font-sans"
                            />

                            {/* Quick Paste Button when URL is empty */}
                            {!data.url && (
                                <button
                                    type="button"
                                    onClick={handlePasteClipboard}
                                    title={isRtl ? 'لصق من الحافظة' : 'Paste from clipboard'}
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono border border-border/60 transition-all me-2 cursor-pointer shrink-0"
                                >
                                    <ClipboardPaste className="size-3.5 text-primary" />
                                    <span>{isRtl ? 'لصق' : 'Paste'}</span>
                                </button>
                            )}
                        </div>

                        {/* Submit Action Button */}
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="w-full sm:w-auto rounded-xl sm:rounded-full px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 shrink-0"
                        >
                            <Sparkles className="size-4" />
                            <span>{isRtl ? 'تفريغ وتلخيص فوري' : 'Extract & Summarize'}</span>
                        </Button>
                    </form>
                </div>

                {/* Professional Feature Bento Card Grid */}
                <div className="w-full max-w-4xl mx-auto p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/80 shadow-sm mt-2 sm:mt-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                        {badges.map((badge, idx) => {
                            const BadgeIcon = badge.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group relative p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-background/70 dark:bg-muted/20 border border-border/60 hover:border-primary/50 hover:bg-card transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2.5 sm:gap-3 hover:shadow-xs"
                                >
                                    <div className="size-9 sm:size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <BadgeIcon className="size-4.5 stroke-[2.2]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-xs text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                            {isRtl ? badge.titleAr : badge.titleEn}
                                        </span>
                                        <span className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1 leading-normal">
                                            {isRtl ? badge.descAr : badge.descEn}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
