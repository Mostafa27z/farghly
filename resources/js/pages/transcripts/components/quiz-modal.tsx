import { AlertCircle, CheckCircle2, FileQuestion, HelpCircle, Loader2, Sparkles, X } from 'lucide-react';
import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    data: {
        exam_type: 'mcq' | 'written' | 'both';
        difficulty: 'easy' | 'medium' | 'hard';
        mcq_count: number;
        written_count: number;
        prompt: string;
    };
    setData: (key: string, value: any) => void;
    generating: boolean;
    error?: string;
}

export default function QuizModal({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    generating,
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
                {/* Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            إعداد وتوليد اختبار الذكاء الاصطناعي
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
                                    <strong className="block font-bold mb-0.5">خطأ في توليد الاختبار:</strong>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* 1. Exam Type Selection */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-2">
                                نوع أسئلة الاختبار:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('exam_type', 'both');
                                        setData('mcq_count', 8);
                                        setData('written_count', 3);
                                    }}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                                        data.exam_type === 'both'
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary/20 text-primary font-bold shadow-xs'
                                            : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                                    }`}
                                >
                                    <Sparkles size={20} className={data.exam_type === 'both' ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="text-xs font-bold">اختبار شامل</span>
                                    <span className="text-[10px] text-muted-foreground">MCQ + مقالي</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('exam_type', 'mcq');
                                        setData('mcq_count', 10);
                                        setData('written_count', 0);
                                    }}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                                        data.exam_type === 'mcq'
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary/20 text-primary font-bold shadow-xs'
                                            : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                                    }`}
                                >
                                    <CheckCircle2 size={20} className={data.exam_type === 'mcq' ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="text-xs font-bold">اختيار من متعدد</span>
                                    <span className="text-[10px] text-muted-foreground">تصحيح فوري</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('exam_type', 'written');
                                        setData('mcq_count', 0);
                                        setData('written_count', 5);
                                    }}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                                        data.exam_type === 'written'
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary/20 text-primary font-bold shadow-xs'
                                            : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                                    }`}
                                >
                                    <FileQuestion size={20} className={data.exam_type === 'written' ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="text-xs font-bold">أسئلة مقالية</span>
                                    <span className="text-[10px] text-muted-foreground">تصحيح ذكي (AI)</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Difficulty Level */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-2">
                                مستوى الصعوبة:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'easy', label: 'سهل ومباشر', desc: 'استرجاع المفاهيم' },
                                    { id: 'medium', label: 'متوسط متوازن', desc: 'فهم وتطبيق' },
                                    { id: 'hard', label: 'متقدم وعميق', desc: 'تحليل ونقد' },
                                ].map((diff) => (
                                    <button
                                        key={diff.id}
                                        type="button"
                                        onClick={() => setData('difficulty', diff.id)}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                            data.difficulty === diff.id
                                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs ring-1 ring-primary/20'
                                                : 'bg-muted/50 hover:bg-muted border-border text-muted-foreground'
                                        }`}
                                    >
                                        <div className="text-xs">{diff.label}</div>
                                        <div className="text-[10px] opacity-75">{diff.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Question Count Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.exam_type !== 'written' && (
                                <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        عدد أسئلة الاختيار من متعدد (MCQ):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[5, 8, 10, 15].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setData('mcq_count', num)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    data.mcq_count === num
                                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                                        : 'bg-background hover:bg-muted border border-border text-foreground'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.exam_type !== 'mcq' && (
                                <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        عدد الأسئلة المقالية (Written):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[2, 3, 5, 7].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setData('written_count', num)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    data.written_count === num
                                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                                        : 'bg-background hover:bg-muted border border-border text-foreground'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notice on 3 attempts policy */}
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                            <HelpCircle size={16} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <strong>نظام المحاولات والتصحيح:</strong> يتاح لك أداء وتصحيح هذا الامتحان الكامل حتى <strong>3 محاولات</strong> (مع تصحيح الذكاء الاصطناعي للأسئلة المقالية). بعد استنفاد الـ 3 محاولات يمكنك إعادة حل أسئلة الاختيار من متعدد (MCQ) لعدد غير محدود.
                            </div>
                        </div>

                        {/* 4. Custom Directives */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                توجيهات إضافية للاختبار (اختياري):
                            </label>
                            <textarea
                                dir="rtl"
                                value={data.prompt}
                                onChange={(e) => setData('prompt', e.target.value)}
                                placeholder="مثال: ركّز الأسئلة على النصف الثاني من المحاضرة، أو أضف سؤالاً عن تطبيق عملي للخطوات..."
                                rows={2}
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
                                    <span>جاري توليد الأسئلة...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>توليد الاختبار الآن</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
