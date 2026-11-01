import {
    AudioWaveform,
    BookOpen,
    Captions,
    CheckCircle2,
    Copy,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Play,
    Printer,
    Search,
    Sparkles,
    Volume2,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function StudioPreviewSection({ isRtl }: Props) {
    const [activeStudioTab, setActiveStudioTab] = useState<'memo' | 'summary' | 'transcript'>('memo');
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <section id="studio-workflow" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-28 scroll-mt-24">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Sparkles className="size-3.5" />
                    <span>{isRtl ? 'بيئة عمل تفاعلية حية' : 'Live Interactive Studio'}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    {isRtl ? 'استوديو التفريغ والمذكرات: تجربة تفاعلية متكاملة' : 'The Memo Studio: A Seamless Workspace'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-3">
                    {isRtl
                        ? 'شاهد كيف يتحول شرح الفيديو في ثوانٍ إلى نص مفرغ، مذكرة مدققة لغوياً، وملخص استراتيجي للطباعة.'
                        : 'Watch lecture videos instantly convert into timestamped transcripts, proofread study notes, and print-ready PDFs.'}
                </p>
            </div>

            {/* Studio Workspace Window Container */}
            <div className="rounded-3xl bg-card border border-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden max-w-6xl mx-auto">
                {/* 1. Window Browser Toolbar */}
                <div className="bg-muted/90 px-4 sm:px-6 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3 select-none">
                    {/* Window Controls & Document Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="size-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors" />
                            <span className="size-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
                            <span className="size-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
                        </div>
                        <span className="text-border hidden sm:inline">|</span>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-xs font-mono">
                                lecture-physics-ch3-final.mp4
                            </span>
                        </div>
                    </div>

                    {/* Interactive Tab Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border text-xs font-semibold shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setActiveStudioTab('memo')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeStudioTab === 'memo'
                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <BookOpen className="size-3.5" />
                            <span>{isRtl ? 'المذكرة المدققة' : 'Proofread Memo'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveStudioTab('summary')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeStudioTab === 'summary'
                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sparkles className="size-3.5" />
                            <span>{isRtl ? 'الملخص والقوانين' : 'Key Formulas'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveStudioTab('transcript')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeStudioTab === 'transcript'
                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Captions className="size-3.5" />
                            <span>{isRtl ? 'النص المتزامن (Timestamps)' : 'Timestamps'}</span>
                        </button>
                    </div>

                    {/* Print Status Badge */}
                    <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                            300 DPI A4
                        </span>
                    </div>
                </div>

                {/* 2. Split Workspace Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
                    {/* Left Pane (RTL Right): Embedded Video Player + Audio Waveform + Chapters (5 Cols) */}
                    <div className="lg:col-span-5 p-5 sm:p-6 bg-muted/30 border-b lg:border-b-0 lg:border-inline-end border-border flex flex-col justify-between gap-5 text-start">
                        <div className="space-y-4">
                            {/* Video Screen Preview */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-lg aspect-video flex flex-col justify-between p-3.5 group select-none">
                                {/* Authentic 16:9 Lecture Video Frame / Thumbnail */}
                                <img
                                    src="/images/physics-lecture-thumb.jpg"
                                    alt={isRtl ? 'محاضرة الفيزياء العامة' : 'General Physics Lecture'}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                                />

                                {/* Contrast Vignette & Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />

                                {/* Top Overlay Tags */}
                                <div className="flex items-center justify-between text-xs text-white z-10">
                                    <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1.5 text-red-400 border border-white/10 shadow-sm">
                                        <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                        YouTube 1080p
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono border border-white/10 shadow-sm">
                                        02:14 / 18:35
                                    </span>
                                </div>

                                {/* Center Video Canvas simulation */}
                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                    <button
                                        type="button"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="size-13 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 group-hover:ring-4 group-hover:ring-primary/30 transition-all cursor-pointer pointer-events-auto"
                                    >
                                        <Play className="size-5.5 fill-current ms-0.5" />
                                    </button>
                                </div>

                                {/* Bottom Video Title & Controls */}
                                <div className="relative z-10 flex flex-col gap-1.5 text-white">
                                    <span className="text-xs font-bold truncate drop-shadow-md">
                                        {isRtl
                                            ? 'الفيزياء العامة: قوانين نيوتن ومفهوم القصور الذاتي'
                                            : 'General Physics: Newton’s Laws & Inertia'}
                                    </span>
                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden backdrop-blur-xs">
                                        <div className="h-full bg-primary rounded-full w-2/5 shadow-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Live Audio Waveform Indicator */}
                            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Volume2 className="size-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-foreground block">
                                            {isRtl ? 'المحاضر: د. حسام فاروق' : 'Speaker: Dr. Hossam'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {isRtl ? 'جودة صوت نقية 48kHz' : 'Audio 48kHz High-fidelity'}
                                        </span>
                                    </div>
                                </div>

                                {/* Animated Equalizer Bars */}
                                <div className="flex items-end gap-1 h-5 pe-1">
                                    {[12, 18, 8, 20, 14, 10, 16, 6].map((height, i) => (
                                        <span
                                            key={i}
                                            className="w-1 bg-primary rounded-full animate-pulse"
                                            style={{
                                                height: `${height}px`,
                                                animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Video Chapters List */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                                    {isRtl ? 'فصول المحاضرة المستخرجة:' : 'Auto Chapters:'}
                                </span>

                                <div className="space-y-1.5 text-xs">
                                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-muted-foreground">
                                        <span>{isRtl ? '00:00 · مقدمة وشروط التوازن' : '00:00 · Intro & Balance'}</span>
                                        <span className="text-[10px] font-mono">02:14</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-primary animate-ping" />
                                            <span>{isRtl ? '02:14 · القانون الأول والقصور الذاتي' : '02:14 · Newton’s First Law'}</span>
                                        </div>
                                        <span className="text-[10px] font-mono">06:30</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-muted-foreground">
                                        <span>{isRtl ? '08:44 · مسائل وحسابات القوة والتسارع' : '08:44 · Force & Accel Calculations'}</span>
                                        <span className="text-[10px] font-mono">09:50</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Quick Feature Stat */}
                        <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{isRtl ? 'نسبة دقة التفريغ:' : 'Accuracy:'}</span>
                            <span className="text-primary font-mono font-bold">99.8% Arabic High-Fidelity</span>
                        </div>
                    </div>

                    {/* Right Pane (RTL Left): Rich Document & Transcript Content (7 Cols) */}
                    <div className="lg:col-span-7 p-5 sm:p-7 bg-card flex flex-col justify-between text-start">
                        {/* TAB 1: Complete Proofread Memo (مذكرة مطبوعة منسقة) */}
                        {activeStudioTab === 'memo' && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                {/* Printed Memo Document Header Simulation */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border relative overflow-hidden">
                                    <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <GraduationCap className="size-4.5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-extrabold text-foreground block">
                                                    {isRtl ? 'مذكرة الفيزياء الحديثة · الفصل الثالث' : 'Modern Physics Memo · Chapter 3'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {isRtl ? 'إعداد: أكاديمية النخبة التعليمية' : 'Instructor: Al-Nokhba Academy'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold border border-primary/20">
                                            A4 VERIFIED
                                        </span>
                                    </div>

                                    {/* Document Body Simulation */}
                                    <div className="pt-3.5 space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                            <span>
                                                {isRtl
                                                    ? '١. نص القانون الأول لنيوتن (مبدأ القصور الذاتي)'
                                                    : "1. Newton's First Law (Principle of Inertia)"}
                                            </span>
                                        </h4>
                                        <p className="text-justify text-muted-foreground leading-normal">
                                            {isRtl
                                                ? '«يظل الجسم على حالته من السكون أو الحركة في خط مستقيم بسرعة منتظمة ما لم تؤثر عليه قوة خارجية محصلة تغير من حالته». وهذا يعني أن الأجسام عاجزة بذاتها عن تغيير حالتها الحركية، وتسمى هذه الخاصية الذاتية بـ '
                                                : '«An object at rest stays at rest, and an object in uniform rectilinear motion continues its state unless acted upon by a net external force». This innate tendency of objects is defined as '}
                                            <strong className="text-primary font-bold">
                                                {isRtl ? 'القصور الذاتي (Inertia)' : 'Inertia'}
                                            </strong>.
                                        </p>

                                        {/* Formula Callout Box with Emerald Accent */}
                                        <div className="p-3.5 rounded-xl bg-card border-r-4 border-r-primary border border-border/80 text-xs shadow-2xs space-y-1">
                                            <span className="font-bold text-primary block">
                                                {isRtl ? '✦ صيغة قانون الحركة المحصلة:' : '✦ Newton’s Force Law:'}
                                            </span>
                                            <div className="font-mono text-foreground font-bold text-sm bg-muted/60 p-2 rounded-lg text-center">
                                                ∑ F = m · a  &nbsp; [ N = kg · m/s² ]
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-normal">
                                            {isRtl
                                                ? 'تم تدقيق كافة الكلمات الإملائية والنحوية وتصحيح علامات الترقيم تلقائياً بنسبة 100% دون اختصار أو حذف أي شرح تفصيلي.'
                                                : 'All Arabic grammar, diacritics, and terminology verified without altering the original speech.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Document Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="size-4 text-primary" />
                                        <span>{isRtl ? 'جاهز للطباعة المباشرة والتجليد' : 'Ready for instant print & bind'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-bold border border-border flex items-center gap-1.5 cursor-pointer hover:bg-muted/80">
                                            <Printer className="size-3.5 text-primary" />
                                            <span>PDF A4</span>
                                        </span>
                                        <span className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer">
                                            <Download className="size-3.5" />
                                            <span>Word (.docx)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: AI Summary & Formulas (الملخص واستخراج القوانين) */}
                        {activeStudioTab === 'summary' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <span className="text-xs font-bold text-foreground">
                                            {isRtl ? 'ملخص القوانين والمعادلات المستخرجة بالذكاء الاصطناعي:' : 'AI Extracted Formulas & Takeaways:'}
                                        </span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                                        EXAM CHEATSHEET
                                    </span>
                                </div>

                                {/* Formulas 2x2 Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                        <span className="text-primary font-bold block">
                                            {isRtl ? '١. القوة والتسارع (قانون نيوتن ٢)' : '1. Force & Acceleration'}
                                        </span>
                                        <span className="font-mono text-sm font-bold text-foreground block">F = m × a</span>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {isRtl ? 'الكتلة بالكيلوجرام، التسارع بوحدة m/s²' : 'Mass in kg, acceleration in m/s²'}
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                        <span className="text-primary font-bold block">
                                            {isRtl ? '٢. الوزن وقوة الجاذبية' : '2. Weight & Gravity'}
                                        </span>
                                        <span className="font-mono text-sm font-bold text-foreground block">W = m × g</span>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {isRtl ? 'عجلة الجاذبية g ≈ 9.8 م/ث²' : 'Gravitational constant g ≈ 9.8 m/s²'}
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                        <span className="text-primary font-bold block">
                                            {isRtl ? '٣. كمية التحرك الخطي' : '3. Linear Momentum'}
                                        </span>
                                        <span className="font-mono text-sm font-bold text-foreground block">P = m × v</span>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {isRtl ? 'حاصل ضرب الكتلة في السرعة المتجهة' : 'Mass times velocity vector'}
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                        <span className="text-primary font-bold block">
                                            {isRtl ? '٤. القصور الذاتي' : '4. Law of Inertia'}
                                        </span>
                                        <span className="font-mono text-sm font-bold text-foreground block">∑ F = 0 ⟹ v = const</span>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {isRtl ? 'إذا تلاشت القوة المحصلة تثبت السرعة' : 'Net zero force implies constant velocity'}
                                        </span>
                                    </div>
                                </div>

                                {/* Exam Question Callout */}
                                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <Sparkles className="size-3.5" />
                                        <span>{isRtl ? 'سؤال امتحان متوقع مستخرج من الشرح:' : 'Predicted Exam Question:'}</span>
                                    </span>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {isRtl
                                            ? '«علل: يندفع الركاب للأمام عند توقف الحافلة فجأة؟» ➜ الإجابة: بسبب القصور الذاتي للركاب الذي يقاوم التغير المفاجئ في حالة الحركة.'
                                            : '«Explain: Why do passengers lurch forward on sudden brake?» ➜ Due to inertia resisting the abrupt change in motion.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Timestamps & Subtitles (النص المتزامن بالثواني) */}
                        {activeStudioTab === 'transcript' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                                {/* Search in Transcript & Export Chips */}
                                <div className="flex items-center justify-between pb-2 border-b border-border gap-2">
                                    <div className="relative flex-1 max-w-xs">
                                        <Search className="size-3.5 absolute inset-inline-start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={isRtl ? 'بحث: القصور الذاتي...' : 'Search: Inertia...'}
                                            className="w-full ps-8 pe-2.5 py-1.5 rounded-lg bg-muted text-[11px] text-foreground border border-border outline-none font-sans"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 font-mono text-[10px]">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                                            .SRT
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold border border-border">
                                            .VTT
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold border border-border">
                                            .TXT
                                        </span>
                                    </div>
                                </div>

                                {/* Rich Timestamp Rows with Active Highlight */}
                                <div className="space-y-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 hover:bg-muted/70 transition-colors cursor-pointer">
                                        <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold shrink-0 text-[11px]">
                                            00:05
                                        </span>
                                        <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                                            {isRtl
                                                ? 'السلام عليكم يا شباب، النهاردة هنشرح الباب التالت في الفيزياء العامة ومفهوم التوازن الميكانيكي.'
                                                : 'Welcome students, today we cover Chapter 3 in General Physics and equilibrium principles.'}
                                        </p>
                                    </div>

                                    {/* Active Playing Row Highlight */}
                                    <div className="p-2.5 rounded-xl bg-primary/10 border-2 border-primary/40 flex items-start gap-2.5 shadow-xs">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="size-1.5 rounded-full bg-primary animate-ping" />
                                            <span className="font-mono text-primary bg-primary/20 px-2 py-0.5 rounded font-extrabold text-[11px]">
                                                02:14
                                            </span>
                                        </div>
                                        <p className="text-foreground font-bold text-[11px] sm:text-xs leading-relaxed">
                                            {isRtl
                                                ? 'القانون الأول لنيوتن بيتكرر في كل الامتحانات، ولازم نفهم يعني إيه قصور ذاتي وكيف يقاوم الجسم تغيير حركته.'
                                                : 'Newton’s First Law appears in every exam; we must thoroughly understand inertia and resistance to motion changes.'}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 hover:bg-muted/70 transition-colors cursor-pointer">
                                        <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold shrink-0 text-[11px]">
                                            04:30
                                        </span>
                                        <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                                            {isRtl
                                                ? 'لو طبقنا القوة على جسم كتلته m وحسبنا التسارع a، هنلاحظ العلاقة الخطية المباشرة بين القوة والتسارع.'
                                                : 'When force is applied on mass m with acceleration a, a linear direct proportionality is clearly noticed.'}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 hover:bg-muted/70 transition-colors cursor-pointer">
                                        <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold shrink-0 text-[11px]">
                                            06:12
                                        </span>
                                        <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                                            {isRtl
                                                ? 'وهنا بيجي دور وحدات القياس، القوة بالنيوتن تكافئ كيلوجرام مضروباً في متر لكل ثانية مربعة.'
                                                : 'Here measurement units come in: Newton equals kilogram times meter per second squared.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Utility Bar */}
                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono text-[10px]">
                                {isRtl ? '✦ متصل بالذكاء الاصطناعي ومحدث لحظياً' : '✦ AI Synchronized & Auto-Saved'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold">
                                    <Copy className="size-3" />
                                    <span>{isRtl ? 'نسخ النص' : 'Copy'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
