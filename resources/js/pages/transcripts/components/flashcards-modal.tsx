import { AlertCircle, HelpCircle, Layers, Loader2, Sparkles, X } from 'lucide-react';
import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    data: {
        count: number;
        prompt: string;
    };
    setData: (key: string, value: any) => void;
    maxCards: number;
    planName: string;
    generating: boolean;
    error?: string;
}

export default function FlashcardsModal({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    maxCards,
    planName,
    generating,
    error,
}: Props) {
    if (!isOpen) return null;

    // Available presets within plan limits
    const possiblePresets = [5, 10, 15, 20, 25, 30, 50, 100];
    const presets = possiblePresets.filter((p) => p <= maxCards);
    if (!presets.includes(maxCards) && maxCards >= 3) {
        presets.push(maxCards);
        presets.sort((a, b) => a - b);
    }

    return (
        <div
            dir="rtl"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
        >
            <div
                dir="rtl"
                className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 sm:p-7 shadow-2xl relative text-right max-h-[92dvh] sm:max-h-[88vh] flex flex-col my-auto sm:my-8 animate-in fade-in-0 zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-primary" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            توليد البطاقات التعليمية الذكية (Flashcards)
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-lg hover:bg-muted"
                        aria-label="إغلاق"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-5 px-0.5 pe-1.5 pb-2">
                        {/* Error Banner */}
                        {error && (
                            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-destructive text-xs leading-relaxed">
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-destructive" />
                                <div>
                                    <strong className="block font-bold mb-0.5">خطأ في توليد البطاقات:</strong>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Plan Limits Banner */}
                        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 flex items-start gap-2.5 text-xs text-foreground leading-relaxed">
                            <Sparkles size={16} className="shrink-0 mt-0.5 text-primary" />
                            <div>
                                <strong>باقة ({planName}):</strong> الحد الأقصى المتاح لك لكل فيديو هو <strong>{maxCards} بطاقة تعليمية</strong> ذكية وفقاً لخطة اشتراكك.
                            </div>
                        </div>

                        {/* 1. Card Count Selection */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-2">
                                اختر عدد البطاقات المراد توليدها:
                            </label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {presets.map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setData('count', num)}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            data.count === num
                                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                                        }`}
                                    >
                                        {num} بطاقة
                                    </button>
                                ))}
                            </div>
                            <input
                                type="range"
                                min={3}
                                max={maxCards}
                                value={data.count}
                                onChange={(e) => setData('count', parseInt(e.target.value, 10))}
                                className="w-full accent-primary cursor-pointer mt-2"
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                <span>3 بطاقات (الحد الأدنى)</span>
                                <span>العدد المحدد: <strong className="text-primary font-bold">{data.count}</strong></span>
                                <span>{maxCards} بطاقة (حد باقتك)</span>
                            </div>
                        </div>

                        {/* 2. Custom Instructions */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                توجيهات لمحتوى البطاقات (اختياري):
                            </label>
                            <textarea
                                dir="rtl"
                                value={data.prompt}
                                onChange={(e) => setData('prompt', e.target.value)}
                                placeholder="مثال: ركّز على المصطلحات والتعريفات، أو اصنع بطاقات بصيغة سؤال وجواب سريع..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs text-right placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3.5 border-t border-border shrink-0 mt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[42px]"
                            disabled={generating}
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={generating}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>جاري إعداد البطاقات...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>توليد {data.count} بطاقة الآن</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
