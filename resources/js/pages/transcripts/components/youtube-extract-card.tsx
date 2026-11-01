import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useForm } from '@inertiajs/react';
import { ClipboardPaste, HelpCircle, Loader2, Sparkles, Video, Wand2 } from 'lucide-react';
import React, { useState } from 'react';

export default function YoutubeExtractCard() {
    const { isRtl } = useLanguage();
    const [isFocused, setIsFocused] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
    });

    const handleExtract = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.url.trim()) return;
        post(route('transcripts.store'), {
            onSuccess: () => reset('url'),
        });
    };

    const handlePasteClipboard = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
                    setData('url', text.trim());
                }
            }
        } catch {
            // ignore clipboard permission error
        }
    };

    return (
        <div className="w-full p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden transition-all duration-300">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 end-0 -mt-12 -me-12 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-foreground">
                                {isRtl ? 'تفريغ وتلخيص محاضرة جديدة' : 'Extract & Summarize New Lecture'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl
                                    ? 'الصق رابط أي فيديو أو شرح من يوتيوب لتحويله فورياً لنص دقيق ومذكرة دراسية'
                                    : 'Paste any YouTube video URL to automatically extract transcripts and build student handouts'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-muted-foreground text-[11px] font-medium border border-border/70">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {isRtl ? 'شروحات طويلة و Shorts' : 'Long videos & Shorts'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-muted-foreground text-[11px] font-medium border border-border/70">
                            <span className="size-1.5 rounded-full bg-primary" />
                            {isRtl ? 'توقيت زمني بالثواني' : 'Word-level timestamps'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleExtract} className="space-y-3">
                    <div
                        className={`relative flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-background border transition-all duration-300 ${
                            isFocused
                                ? 'border-primary ring-4 ring-primary/10 shadow-md'
                                : 'border-border/80 hover:border-border'
                        }`}
                    >
                        <div className="flex items-center gap-3 w-full px-3">
                            <Video className="size-5 text-muted-foreground shrink-0" />
                            <input
                                id="youtube-url-input"
                                type="url"
                                required
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={
                                    isRtl
                                        ? 'ضع رابط فيديو اليوتيوب هنا (مثال: https://youtube.com/watch?v=...)'
                                        : 'Paste YouTube video URL here (e.g., https://youtube.com/watch?v=...)'
                                }
                                className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden py-2.5"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                                type="button"
                                onClick={handlePasteClipboard}
                                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                                title={isRtl ? 'لصق من الحافظة' : 'Paste from clipboard'}
                            >
                                <ClipboardPaste className="size-4 text-primary" />
                                <span>{isRtl ? 'لصق' : 'Paste'}</span>
                            </button>

                            <Button
                                type="submit"
                                disabled={processing || !data.url.trim()}
                                className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-extrabold shadow-md shadow-primary/25 shrink-0 cursor-pointer gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>{isRtl ? 'جارٍ الاستخراج...' : 'Extracting...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="size-4" />
                                        <span>{isRtl ? 'تفريغ وتلخيص' : 'Extract & Summarize'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {errors.url && (
                        <p className="text-xs text-destructive font-bold ps-2">
                            {errors.url}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
