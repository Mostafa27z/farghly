import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BrainCircuit,
    Check,
    CheckCircle2,
    Eye,
    Grid,
    HelpCircle,
    Layers,
    RotateCw,
    Shuffle,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface FlashcardItem {
    id: number | string;
    front: string;
    back: string;
    category?: string;
    difficulty?: string;
}

export interface FlashcardSetData {
    id: string;
    cards: FlashcardItem[];
    cards_count: number;
    created_at?: string;
}

interface Props {
    flashcardSet?: FlashcardSetData | null;
    onOpenFlashcardsModal: () => void;
    maxCards: number;
    planName: string;
}

export default function FlashcardsTab({
    flashcardSet,
    onOpenFlashcardsModal,
    maxCards,
    planName,
}: Props) {
    if (!flashcardSet || !flashcardSet.cards || flashcardSet.cards.length === 0) {
        return (
            <div className="p-10 rounded-2xl bg-card border border-border text-center flex flex-col items-center shadow-xs dark:shadow-xl">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
                    <Layers size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-2">
                    البطاقات التعليمية الذكية (AI Flashcards)
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                    استخرج أهم المفاهيم، المصطلحات، والتعريفات من المحاضرة في شكل بطاقات تعليمية تفاعلية ثنائية الوجه تعتمد أسلوب التكرار المتباعد لترسيخ المعلومات في الذاكرة.
                </p>
                <button
                    type="button"
                    onClick={onOpenFlashcardsModal}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                    <Sparkles size={18} />
                    <span>توليد البطاقات التعليمية الآن</span>
                </button>
            </div>
        );
    }

    const [cards, setCards] = useState<FlashcardItem[]>(flashcardSet.cards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mode, setMode] = useState<'card' | 'grid'>('card');

    // Mastery tracker: map card id to 'mastered' | 'review'
    const [statusMap, setStatusMap] = useState<Record<string | number, 'mastered' | 'review'>>({});

    const currentCard = cards[currentIndex] || cards[0];
    const totalCards = cards.length;

    const masteredCount = Object.values(statusMap).filter((s) => s === 'mastered').length;
    const reviewCount = Object.values(statusMap).filter((s) => s === 'review').length;

    const handleFlip = () => {
        setIsFlipped((prev) => !prev);
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1 < totalCards ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalCards - 1));
    };

    const handleMark = (status: 'mastered' | 'review') => {
        if (!currentCard) return;
        setStatusMap((prev) => ({
            ...prev,
            [currentCard.id]: status,
        }));
        // Auto-advance to next card
        handleNext();
    };

    const handleShuffle = () => {
        setIsFlipped(false);
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
    };

    const handleDelete = () => {
        if (!confirm('هل أنت متأكد من حذف هذه المجموعة من البطاقات؟')) return;
        router.delete(route('flashcards.destroy', flashcardSet.id));
    };

    // Keyboard support: Space to flip, ArrowLeft / ArrowRight to navigate
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (mode !== 'card') return;
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowLeft') {
                // In RTL, left arrow moves to next
                e.preventDefault();
                handleNext();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, currentIndex, isFlipped, cards]);

    return (
        <div className="space-y-4">
            {/* Top Stats & Controls Header */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            {totalCards} بطاقة تعليمية
                        </span>
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted font-medium">
                            باقة {planName} (الحد الأقصى {maxCards})
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>متقن: {masteredCount}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <span className="size-2 rounded-full bg-amber-500" />
                            <span>يحتاج مراجعة: {reviewCount}</span>
                        </span>
                        <span className="text-muted-foreground">
                            متبقي: {Math.max(0, totalCards - masteredCount - reviewCount)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    {/* Mode Toggle */}
                    <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border">
                        <button
                            type="button"
                            onClick={() => setMode('card')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                mode === 'card'
                                    ? 'bg-card text-primary shadow-xs font-extrabold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <RotateCw size={13} />
                            <span>بطاقة تفاعلية</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('grid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                mode === 'grid'
                                    ? 'bg-card text-primary shadow-xs font-extrabold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Grid size={13} />
                            <span>عرض الكل</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenFlashcardsModal}
                        className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="توليد بطاقات جديدة"
                    >
                        <Sparkles size={14} />
                        <span className="hidden sm:inline">توليد جديد</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="حذف البطاقات"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* VIEW MODE 1: 3D INTERACTIVE FLIP CARD                   */}
            {/* ======================================================== */}
            {mode === 'card' && currentCard && (
                <div className="space-y-4">
                    {/* The Flip Card Container */}
                    <div
                        onClick={handleFlip}
                        className="w-full min-h-[280px] sm:min-h-[320px] rounded-3xl bg-card border-2 border-border/80 shadow-md p-6 sm:p-8 cursor-pointer flex flex-col justify-between transition-all hover:border-primary/50 relative select-none group"
                        style={{
                            perspective: '1000px',
                        }}
                    >
                        {/* Top bar on card */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary" />
                                <span>{currentCard.category || 'مفاهيم أساسية'}</span>
                            </span>

                            <div className="flex items-center gap-2">
                                {currentCard.difficulty && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                        {currentCard.difficulty}
                                    </span>
                                )}
                                <span className="text-xs font-mono font-bold text-muted-foreground">
                                    {currentIndex + 1} / {totalCards}
                                </span>
                            </div>
                        </div>

                        {/* Card Content Center */}
                        <div className="my-auto py-6 text-center">
                            {!isFlipped ? (
                                <div className="space-y-3">
                                    <span className="text-[11px] font-bold text-primary px-3 py-1 rounded-full bg-primary/10">
                                        السؤال / المصطلح
                                    </span>
                                    <h3 className="text-lg sm:text-2xl font-bold text-foreground leading-relaxed">
                                        {currentCard.front}
                                    </h3>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in-0 duration-200">
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10">
                                        الإجابة والشرح
                                    </span>
                                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed max-w-xl mx-auto">
                                        {currentCard.back}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Hint */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                            <span className="flex items-center gap-1.5 text-[11px]">
                                <RotateCw size={13} className="text-primary group-hover:rotate-180 transition-transform duration-300" />
                                <span>انقر على البطاقة (أو اضغط مسافة Space) للقلب</span>
                            </span>

                            {statusMap[currentCard.id] && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    statusMap[currentCard.id] === 'mastered'
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                }`}>
                                    {statusMap[currentCard.id] === 'mastered' ? 'تم الإتقان' : 'يحتاج مراجعة'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Navigation & Self-Assessment Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
                        {/* Prev / Next */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="البطاقة السابقة"
                            >
                                <ArrowRight size={16} />
                                <span>السابقة</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleShuffle}
                                className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border text-xs transition-all cursor-pointer"
                                title="خلط البطاقات عشوائياً"
                            >
                                <Shuffle size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="البطاقة التالية"
                            >
                                <span>التالية</span>
                                <ArrowLeft size={16} />
                            </button>
                        </div>

                        {/* Self Assessment Marking Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={() => handleMark('review')}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                            >
                                <X size={15} />
                                <span>أحتاج لمراجعتها</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleMark('mastered')}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                <Check size={15} />
                                <span>أتقنتها تماماً</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE 2: GRID OVERVIEW                              */}
            {/* ======================================================== */}
            {mode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card, idx) => (
                        <div
                            key={card.id || idx}
                            className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary">
                                    {card.category || 'مفهوم رئيسي'}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    #{idx + 1}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground leading-relaxed">
                                    {card.front}
                                </h4>
                                <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground/90 leading-relaxed">
                                    {card.back}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                                <span>{card.difficulty || 'متوسط'}</span>
                                {statusMap[card.id] && (
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                                        statusMap[card.id] === 'mastered'
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    }`}>
                                        {statusMap[card.id] === 'mastered' ? 'تم الإتقان' : 'يحتاج مراجعة'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
