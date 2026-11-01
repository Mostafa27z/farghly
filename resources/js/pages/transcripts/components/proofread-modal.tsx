import { Link } from '@inertiajs/react';
import { AlertCircle, Loader2, ShieldCheck, SpellCheck, X } from 'lucide-react';
import React from 'react';
import { type AvailableTheme } from './summary-modal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    proofreadData: {
        theme?: string;
        prompt: string;
    };
    setProofreadData: (key: string, value: any) => void;
    docTheme: string;
    setDocTheme: (theme: string) => void;
    proofreading: boolean;
    allAvailableThemes: AvailableTheme[];
    error?: string;
}

export default function ProofreadModal({
    isOpen,
    onClose,
    onSubmit,
    proofreadData,
    setProofreadData,
    docTheme,
    setDocTheme,
    proofreading,
    allAvailableThemes,
    error,
}: Props) {
    if (!isOpen) return null;

    return (
        <div
            dir="rtl"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
        >
            <div
                dir="rtl"
                className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 sm:p-7 shadow-2xl relative text-right max-h-[92dvh] sm:max-h-[88vh] flex flex-col my-auto sm:my-8 animate-in fade-in-0 zoom-in-95 duration-200"
            >
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <SpellCheck size={18} className="text-primary" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            التدقيق اللغوي الكامل وتجهيز ملف PDF
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
                        {/* Notice about fidelity */}
                        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 flex items-start gap-3">
                            <ShieldCheck size={20} className="shrink-0 text-primary mt-0.5" />
                            <p className="text-xs text-foreground leading-relaxed">
                                <strong>تدقيق شامل بدون اختصار:</strong> سيقوم الذكاء الاصطناعي بمراجعة كل كلمة في تفريغ الفيديو، وضبط القواعد النحوية والإملائية وعلامات الترقيم، وتقسيم المحتوى إلى فقرات وعناوين منسقة دون تلخيص أو حذف.
                            </p>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-destructive text-xs leading-relaxed">
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-destructive" />
                                <div>
                                    <strong className="block font-bold mb-0.5">خطأ في الاتصال بالذكاء الاصطناعي:</strong>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Visual Theme Picker */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-foreground">
                                    طابع وتصميم مستند الـ PDF المطبوع:
                                </label>
                                <Link
                                    href={route('themes.index')}
                                    className="text-[10px] text-primary hover:underline font-bold"
                                    target="_blank"
                                >
                                    + إدارة القوالب والشعار
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {allAvailableThemes.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setDocTheme(t.id)}
                                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer min-h-[44px] ${
                                            docTheme === t.id
                                                ? 'bg-primary/10 border-primary text-primary shadow-xs font-bold ring-1 ring-primary/20'
                                                : 'bg-muted border-border text-muted-foreground hover:border-border'
                                        }`}
                                    >
                                        <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: t.color }} />
                                        <div className="truncate">{t.name.split(' ')[0]}</div>
                                        {t.isCustom && <span className="text-[9px] text-primary block">مخصص</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Prompt / Directives */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5 text-right">
                                توجيهات تدقيق خاصة (اختياري):
                            </label>
                            <textarea
                                dir="rtl"
                                value={proofreadData.prompt}
                                onChange={(e) => setProofreadData('prompt', e.target.value)}
                                placeholder="مثال: حافظ على الأسماء والمصطلحات التقنية بين أقواس، صحح اللهجة إلى لغة عربية فصحى معاصرة رصينة..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs text-right placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit & Cancel - Sticky at Bottom */}
                    <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3.5 border-t border-border shrink-0 mt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[42px]"
                            disabled={proofreading}
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={proofreading}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-primary/30 transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
                        >
                            {proofreading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>جاري التدقيق...</span>
                                </>
                            ) : (
                                <>
                                    <SpellCheck size={16} />
                                    <span>بدء التدقيق اللغوي الآن</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
