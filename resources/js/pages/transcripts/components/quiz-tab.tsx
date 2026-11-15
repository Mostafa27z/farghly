import { useForm, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowPathIcon,
    Award,
    Check,
    CheckCircle2,
    Clock,
    FileQuestion,
    GraduationCap,
    HelpCircle,
    Info,
    Loader2,
    RotateCcw,
    Sparkles,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

export interface QuizOption {
    key: string;
    text: string;
}

export interface QuizQuestionItem {
    id: number;
    sort_order: number;
    type: 'mcq' | 'written';
    question_text: string;
    options?: QuizOption[] | null;
    points: number;
}

export interface QuizAttemptItem {
    id: string;
    attempt_number: number;
    attempt_mode: 'full' | 'mcq_only';
    status: string;
    score_obtained: number;
    total_possible_score: number;
    percentage: number;
    answers: Record<string, any>;
    submitted_at: string;
}

export interface QuizData {
    id: string;
    title: string;
    exam_type: 'mcq' | 'written' | 'both';
    difficulty: 'easy' | 'medium' | 'hard';
    mcq_count: number;
    written_count: number;
    max_full_attempts: number;
    full_attempts_used: number;
    remaining_full_attempts: number;
    can_take_full_exam: boolean;
    can_retake_mcq_only: boolean;
    questions: QuizQuestionItem[];
    attempts: QuizAttemptItem[];
    created_at?: string;
}

interface Props {
    quiz?: QuizData | null;
    onOpenQuizModal: () => void;
}

export default function QuizTab({ quiz, onOpenQuizModal }: Props) {
    if (!quiz) {
        return (
            <div className="p-10 rounded-2xl bg-card border border-border text-center flex flex-col items-center shadow-xs dark:shadow-xl">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
                    <GraduationCap size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-2">
                    اختبار الذكاء الاصطناعي وتصحيح الامتحان
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                    قم بتوليد اختبار تفاعلي فوري (اختيار من متعدد MCQ، أسئلة مقالية، أو اختبار شامل) استناداً إلى محتوى المحاضرة، مع إمكانية تصحيح الامتحان وتقييم إجاباتك المقالية بملاحظات مفصلة بالذكاء الاصطناعي.
                </p>
                <button
                    type="button"
                    onClick={onOpenQuizModal}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                    <Sparkles size={18} />
                    <span>إنشاء الاختبار الآن</span>
                </button>
            </div>
        );
    }

    const latestAttempt = quiz.attempts && quiz.attempts.length > 0 ? quiz.attempts[0] : null;

    // View mode: 'taking' or 'results'
    const [viewMode, setViewMode] = useState<'taking' | 'results'>(
        latestAttempt ? 'results' : 'taking'
    );

    const [selectedAttemptId, setSelectedAttemptId] = useState<string>(
        latestAttempt ? latestAttempt.id : ''
    );

    const activeAttempt = quiz.attempts.find((a) => a.id === selectedAttemptId) || latestAttempt;

    // Student Answers state during exam taking
    const [studentAnswers, setStudentAnswers] = useState<Record<number, { selected_option?: string; written_answer?: string }>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isMcqOnlyRetake = !quiz.can_take_full_exam && quiz.can_retake_mcq_only;

    // Active questions for current exam mode
    const activeQuestions = isMcqOnlyRetake
        ? quiz.questions.filter((q) => q.type === 'mcq')
        : quiz.questions;

    const handleSelectOption = (questionId: number, key: string) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                selected_option: key,
            },
        }));
    };

    const handleWriteAnswer = (questionId: number, text: string) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                written_answer: text,
            },
        }));
    };

    const handleGradeExam = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        router.post(
            route('quizzes.submit', quiz.id),
            { answers: studentAnswers },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    setViewMode('results');
                },
                onError: (errs) => {
                    setSubmitting(false);
                    setSubmitError(errs.quiz || 'تعذر تصحيح الامتحان. يرجى المحاولة لاحقاً.');
                },
            }
        );
    };

    const handleStartNewAttempt = () => {
        setStudentAnswers({});
        setViewMode('taking');
    };

    const handleDeleteQuiz = () => {
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الاختبار وتوليد أسئلة جديدة؟')) return;
        router.delete(route('quizzes.destroy', quiz.id));
    };

    // Calculate how many questions answered
    const answeredCount = activeQuestions.filter((q) => {
        if (q.type === 'mcq') {
            return !!studentAnswers[q.id]?.selected_option;
        }
        return !!studentAnswers[q.id]?.written_answer?.trim();
    }).length;

    const getGradeInfo = (percentage: number) => {
        if (percentage >= 90) return { label: 'ممتاز', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' };
        if (percentage >= 75) return { label: 'جيد جداً', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
        if (percentage >= 60) return { label: 'جيد', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
        return { label: 'يحتاج إلى مراجعة', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
    };

    return (
        <div className="space-y-4">
            {/* Top Exam Header Strip */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            {quiz.exam_type === 'both' ? 'اختبار شامل (MCQ + مقالي)' : quiz.exam_type === 'mcq' ? 'اختيار من متعدد (MCQ)' : 'أسئلة مقالية (Written)'}
                        </span>
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted font-medium">
                            المستوى: {quiz.difficulty === 'easy' ? 'سهل' : quiz.difficulty === 'hard' ? 'متقدم' : 'متوسط'}
                        </span>
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted font-medium">
                            {quiz.questions.length} سؤال
                        </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                        {quiz.title}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    {/* Remaining Attempts Badge */}
                    <div
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                            quiz.remaining_full_attempts > 0
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
                        }`}
                        title="عدد المحاولات الكاملة المتاحة لتصحيح المقالي بالذكاء الاصطناعي"
                    >
                        <Clock size={14} />
                        <span>
                            {quiz.remaining_full_attempts > 0
                                ? `المحاولات الكاملة المتبقية: ${quiz.remaining_full_attempts} من ${quiz.max_full_attempts}`
                                : 'استنفدت المحاولات الكاملة (متاح إعادة MCQ فقط)'}
                        </span>
                    </div>

                    {/* Mode toggle / New Quiz */}
                    <div className="flex items-center gap-1.5">
                        {latestAttempt && (
                            <button
                                type="button"
                                onClick={() => setViewMode(viewMode === 'taking' ? 'results' : 'taking')}
                                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer"
                            >
                                {viewMode === 'taking' ? 'عرض النتائج السابقة' : 'أداء محاولة جديدة'}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onOpenQuizModal}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="توليد اختبار جديد"
                        >
                            <Sparkles size={14} />
                            <span className="hidden sm:inline">اختبار جديد</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteQuiz}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="حذف الاختبار"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notice if Full Attempts are exhausted */}
            {isMcqOnlyRetake && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                        <strong>تنبيه المحاولات:</strong> لقد استنفدت الحد الأقصى للمحاولات الكاملة (3 محاولات) المخصصة لتصحيح الأسئلة المقالية بالذكاء الاصطناعي. يمكنك الآن إعادة حل واختبار <strong>أسئلة الاختيار من متعدد (MCQ) فقط</strong> لعدد غير محدود من المرات مع تصحيح فوري مجاني.
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {submitError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-destructive text-xs leading-relaxed">
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-destructive" />
                    <div>
                        <strong className="block font-bold mb-0.5">خطأ في التصحيح:</strong>
                        <span>{submitError}</span>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE A: EXAM RESULTS & REVIEW (تصحيح الامتحان)     */}
            {/* ======================================================== */}
            {viewMode === 'results' && activeAttempt && (
                <div className="space-y-4">
                    {/* Score Summary Card */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-xs text-center relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Award className="text-primary size-5" />
                                <span className="text-sm font-bold text-foreground">
                                    نتيجة تصحيح الامتحان - {activeAttempt.attempt_mode === 'mcq_only' ? 'إعادة MCQ فقط' : 'المحاولة الكاملة'}
                                </span>
                            </div>

                            {/* Attempt Switcher if multiple attempts exist */}
                            {quiz.attempts.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">اختر المحاولة:</span>
                                    <select
                                        value={selectedAttemptId}
                                        onChange={(e) => setSelectedAttemptId(e.target.value)}
                                        className="h-8 rounded-lg bg-muted border border-border text-xs px-2.5 py-1 text-foreground font-medium focus:border-primary outline-none cursor-pointer"
                                    >
                                        {quiz.attempts.map((att) => (
                                            <option key={att.id} value={att.id}>
                                                المحاولة #{att.attempt_number} ({att.percentage}%) {att.attempt_mode === 'mcq_only' ? '- MCQ' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Big Score Display */}
                        <div className="flex flex-col items-center justify-center my-3">
                            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground flex items-baseline gap-1">
                                <span>{activeAttempt.percentage}</span>
                                <span className="text-xl sm:text-2xl text-muted-foreground">%</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                الدرجة المحصلة: <strong className="text-foreground">{activeAttempt.score_obtained}</strong> من إجمالي <strong>{activeAttempt.total_possible_score}</strong> نقطة
                            </div>
                            <div className="mt-3">
                                {(() => {
                                    const g = getGradeInfo(activeAttempt.percentage);
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${g.bg} ${g.color}`}>
                                            <CheckCircle2 size={14} />
                                            <span>التقدير العام: {g.label}</span>
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Retake Button Bar */}
                        <div className="pt-4 mt-4 border-t border-border flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleStartNewAttempt}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                <RotateCcw size={15} />
                                <span>
                                    {quiz.can_take_full_exam
                                        ? `إعادة الاختبار الكامل (متبقي ${quiz.remaining_full_attempts} محاولات)`
                                        : 'إعادة اختبار أسئلة الاختيار من متعدد (MCQ Only)'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Question by Question Detailed Review */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
                            <span>المراجعة التفصيلية للإجابات والتصحيح:</span>
                        </h3>

                        {Object.values(activeAttempt.answers || {}).map((item: any, idx: number) => {
                            if (item.type === 'mcq') {
                                return (
                                    <div
                                        key={item.question_id || idx}
                                        className={`p-4 sm:p-5 rounded-2xl bg-card border shadow-xs transition-all ${
                                            item.is_correct ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    item.is_correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                                }`}>
                                                    {item.is_correct ? <Check size={14} /> : <X size={14} />}
                                                </span>
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    سؤال #{item.sort_order || (idx + 1)} (اختيار من متعدد)
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold font-mono">
                                                {item.score_awarded} / {item.max_points} نقطة
                                            </span>
                                        </div>

                                        <p className="text-sm font-bold text-foreground mb-3 leading-relaxed">
                                            {item.question_text}
                                        </p>

                                        {/* Options Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                            {(item.options || []).map((opt: QuizOption) => {
                                                const isUserSelected = item.selected_option === opt.key;
                                                const isCorrectOption = item.correct_option === opt.key;

                                                let style = 'bg-muted/40 border-border text-foreground';
                                                if (isCorrectOption) {
                                                    style = 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/30';
                                                } else if (isUserSelected && !item.is_correct) {
                                                    style = 'bg-rose-500/15 border-rose-500 text-rose-950 dark:text-rose-200 font-bold';
                                                }

                                                return (
                                                    <div
                                                        key={opt.key}
                                                        className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}
                                                    >
                                                        <span className="size-6 rounded-lg bg-background border border-border flex items-center justify-center text-xs font-bold shrink-0">
                                                            {opt.key}
                                                        </span>
                                                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                                                        {isCorrectOption && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold shrink-0">
                                                                الإجابة الصحيحة
                                                            </span>
                                                        )}
                                                        {isUserSelected && !isCorrectOption && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold shrink-0">
                                                                إجابتك الخاطئة
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Explanation Box */}
                                        {item.explanation && (
                                            <div className="p-3 rounded-xl bg-background/80 border border-border/80 text-xs leading-relaxed text-muted-foreground flex items-start gap-2">
                                                <Info size={15} className="shrink-0 text-primary mt-0.5" />
                                                <div>
                                                    <strong className="text-foreground">التوضيح والشرح: </strong>
                                                    <span>{item.explanation}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Written Question Review
                            return (
                                <div
                                    key={item.question_id || idx}
                                    className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                {item.sort_order || (idx + 1)}
                                            </span>
                                            <span className="text-xs font-bold text-muted-foreground">
                                                سؤال مقالي (تصحيح الذكاء الاصطناعي)
                                            </span>
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold">
                                            الدرجة الممنوحة: {item.score_awarded} / {item.max_points}
                                        </div>
                                    </div>

                                    <p className="text-sm font-bold text-foreground leading-relaxed">
                                        {item.question_text}
                                    </p>

                                    {/* Student's written answer */}
                                    <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground leading-relaxed">
                                        <div className="text-[11px] font-bold text-muted-foreground mb-1">
                                            إجابتك المدونة:
                                        </div>
                                        <div className="whitespace-pre-wrap">
                                            {item.written_answer ? item.written_answer : <span className="text-muted-foreground italic">(لم يتم تقديم إجابة)</span>}
                                        </div>
                                    </div>

                                    {/* AI Grading & Feedback Callout */}
                                    {item.ai_feedback && (
                                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs leading-relaxed text-foreground flex items-start gap-2.5">
                                            <Sparkles size={16} className="shrink-0 text-primary mt-0.5" />
                                            <div>
                                                <strong className="block text-primary font-bold mb-1">تقييم وملاحظات المصحح الذكي:</strong>
                                                <span>{item.ai_feedback}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Model Answer */}
                                    {item.model_answer && (
                                        <details className="group rounded-xl border border-border bg-muted/20 p-3 text-xs cursor-pointer">
                                            <summary className="font-bold text-primary flex items-center justify-between list-none">
                                                <span>عرض الإجابة النموذجية المرجعية</span>
                                                <span className="text-[10px] text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <div className="mt-2.5 pt-2.5 border-t border-border/60 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {item.model_answer}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE B: TAKING THE EXAM (أداء الاختبار)             */}
            {/* ======================================================== */}
            {viewMode === 'taking' && (
                <form onSubmit={handleGradeExam} className="space-y-4">
                    {activeQuestions.map((q, idx) => (
                        <div
                            key={q.id}
                            className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">
                                    السؤال {idx + 1} من {activeQuestions.length} ({q.type === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'})
                                </span>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                    {q.points} {q.points > 2 ? 'نقاط' : 'نقطة'}
                                </span>
                            </div>

                            <p className="text-sm font-bold text-foreground leading-relaxed">
                                {q.question_text}
                            </p>

                            {/* MCQ Options */}
                            {q.type === 'mcq' && q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                    {q.options.map((opt) => {
                                        const isSelected = studentAnswers[q.id]?.selected_option === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => handleSelectOption(q.id, opt.key)}
                                                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                                                    isSelected
                                                        ? 'bg-primary/10 border-primary ring-1 ring-primary/25 text-primary font-bold shadow-xs'
                                                        : 'bg-muted/40 hover:bg-muted border-border text-foreground'
                                                }`}
                                            >
                                                <span
                                                    className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-background border border-border text-muted-foreground'
                                                    }`}
                                                >
                                                    {opt.key}
                                                </span>
                                                <span className="text-xs leading-relaxed flex-1">{opt.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Written Open Answer */}
                            {q.type === 'written' && (
                                <div className="pt-1">
                                    <textarea
                                        dir="rtl"
                                        rows={4}
                                        value={studentAnswers[q.id]?.written_answer || ''}
                                        onChange={(e) => handleWriteAnswer(q.id, e.target.value)}
                                        placeholder="اكتب إجابتك هنا بدقة ووضوح..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background outline-none transition-all leading-relaxed"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        سيقوم الذكاء الاصطناعي بتحليل إجابتك ومقارنتها بالإجابة النموذجية ومعايير توزيع الدرجات.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Bar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-md sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                            تمت الإجابة على <strong className="text-foreground">{answeredCount}</strong> من أصل <strong className="text-foreground">{activeQuestions.length}</strong> سؤال.
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>جاري تصحيح الامتحان وتقييم الإجابات...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    <span>تصحيح الامتحان (Grade Exam)</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
