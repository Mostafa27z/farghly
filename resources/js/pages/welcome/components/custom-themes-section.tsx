import { Button } from '@/components/ui/button';
import {
    Award,
    Check,
    CheckCircle2,
    Eye,
    FileCheck2,
    FileDown,
    FileSpreadsheet,
    FileText,
    Layers,
    Palette,
    Printer,
    QrCode,
    Settings2,
    Shield,
    Sparkles,
    UploadCloud,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function CustomThemesSection({ isRtl }: Props) {
    const [selectedTheme, setSelectedTheme] = useState<'teacher' | 'academy' | 'custom'>('teacher');
    const [customColor, setCustomColor] = useState<string>('#10b981');

    const handleScrollToPlans = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.querySelector('#plans');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const colorPalette = [
        { id: 'emerald', hex: '#10b981', labelAr: 'الزمردي الأكاديمي', labelEn: 'Emerald' },
        { id: 'navy', hex: '#2563eb', labelAr: 'الأزرق الملكي', labelEn: 'Royal Navy' },
        { id: 'purple', hex: '#8b5cf6', labelAr: 'البنفسجي الحديث', labelEn: 'Violet' },
        { id: 'amber', hex: '#d97706', labelAr: 'الذهبي المؤسسي', labelEn: 'Amber Gold' },
        { id: 'slate', hex: '#334155', labelAr: 'الرمادي المطبعي', labelEn: 'Print Slate' },
    ];

    return (
        <section id="custom-themes" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 scroll-mt-24">
            {/* 1. Header */}
            <div className="text-center mb-12 sm:mb-16">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Palette className="size-3.5" />
                    <span>{isRtl ? 'هندسة المذكرات والمطابع' : 'Print & Brand Engineering'}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    {isRtl ? 'مذكرات مطبوعة تليق باسمك وهويتك الأكاديمية' : 'Print-Ready Handouts Built for Your Brand'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mt-3 leading-relaxed">
                    {isRtl
                        ? 'ليست مجرد ملفات PDF عادية؛ قوالبنا مصممة وفق المعايير المطبعية التجارية (A4 · 300 DPI · هوامش تجليد مخصصة) مع ترويسة وعلامة مائية باسمك وبيانات تواصلك.'
                        : 'Not just basic PDFs. Our engine outputs commercial print-ready A4 handouts at 300 DPI with gutter margins, teacher watermarks, and custom headers.'}
                </p>

                {/* Interactive Template Selector Switcher */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    <button
                        type="button"
                        onClick={() => setSelectedTheme('teacher')}
                        className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            selectedTheme === 'teacher'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Award className="size-3.5" />
                        <span>{isRtl ? 'قالب المعلم المحترف' : 'Teacher Pro Template'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTheme('academy')}
                        className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            selectedTheme === 'academy'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Shield className="size-3.5" />
                        <span>{isRtl ? 'قالب السناتر والمؤسسات (أعمدة مزدوجة)' : 'Academy Dual-Column'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTheme('custom')}
                        className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            selectedTheme === 'custom'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Settings2 className="size-3.5" />
                        <span>{isRtl ? 'محرر هويتك وشعارك الخاص' : 'Custom Brand Engine'}</span>
                    </button>
                </div>
            </div>

            {/* 2. Interactive Realistic Preview & Specs Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
                {/* Right / Left (7 Cols): Realistic A4 Sheet Mockup */}
                <div className="lg:col-span-7 flex justify-center">
                    <div className={`w-full max-w-[500px] bg-white text-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] border border-slate-200 p-6 sm:p-8 relative overflow-hidden select-none font-sans ${isRtl ? 'text-right' : 'text-left'} transition-all`}>
                        {/* 300 DPI / Commercial Print Corner Badge */}
                        <div className="absolute top-0 end-0 bg-emerald-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl shadow-xs">
                            A4 · 300 DPI · PRINT READY
                        </div>

                        {/* Faint Background Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-25deg]">
                            <span className="text-6xl sm:text-7xl font-extrabold text-slate-900 tracking-widest uppercase">
                                {selectedTheme === 'academy'
                                    ? (isRtl ? 'أكاديمية التفوق' : 'Excellence Academy')
                                    : (isRtl ? 'أ. محمد فاروق' : 'Prof. M. Farouk')}
                            </span>
                        </div>

                        {/* A4 Sheet Header */}
                        <div
                            className="pb-4 mb-4 border-b-2 flex items-center justify-between"
                            style={{ borderColor: selectedTheme === 'custom' ? customColor : selectedTheme === 'academy' ? '#2563eb' : '#10b981' }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="size-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                                    style={{ backgroundColor: selectedTheme === 'custom' ? customColor : selectedTheme === 'academy' ? '#2563eb' : '#10b981' }}
                                >
                                    {selectedTheme === 'academy' ? (isRtl ? 'سنتر' : 'Center') : (isRtl ? 'مذكرة' : 'Memo')}
                                </div>
                                <div className={isRtl ? 'text-right' : 'text-left'}>
                                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                                        {selectedTheme === 'academy'
                                            ? (isRtl ? 'سنتر النخبة التعليمي · الفرع الرئيسي' : 'Elite Academy Center · Main Campus')
                                            : selectedTheme === 'custom'
                                            ? (isRtl ? 'أكاديمية الفكر · أ. أحمد الشافعي' : 'Al-Fikr Academy · Prof. Ahmed')
                                            : (isRtl ? 'الأستاذ / محمد فاروق · كبير معلمي الفيزياء' : 'Prof. Mohamed Farouk · Senior Physics Specialist')}
                                    </h4>
                                    <span className="text-[11px] text-slate-500 block">
                                        {selectedTheme === 'academy'
                                            ? (isRtl ? 'سلسلة المراجعة النهائية المشتركة لشهادة الثانوية العامة' : 'Joint Final Review Series · High School Diploma')
                                            : (isRtl ? 'الفيزياء العامة · الفصل الثالث: الحث الكهرومغناطيسي' : 'General Physics · Chapter 3: Electromagnetic Induction')}
                                    </span>
                                </div>
                            </div>

                            {/* Mini QR Code Mockup */}
                            <div className="hidden sm:flex flex-col items-center gap-1 border border-slate-200 p-1 rounded-lg bg-slate-50">
                                <QrCode className="size-6 text-slate-700" />
                                <span className="text-[8px] font-mono text-slate-500">
                                    {isRtl ? 'فيديو الشرح' : 'Video QR'}
                                </span>
                            </div>
                        </div>

                        {/* Chapter Banner */}
                        <div
                            className="p-3 rounded-xl mb-4 text-white flex items-center justify-between"
                            style={{ backgroundColor: selectedTheme === 'custom' ? customColor : selectedTheme === 'academy' ? '#1e40af' : '#059669' }}
                        >
                            <span className="font-bold text-xs sm:text-sm">
                                {isRtl ? 'الدرس الثاني: قوانين فاراداي ولينز وتطبيقات المحول' : 'Lecture 2: Faraday and Lenz Laws'}
                            </span>
                            <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded">
                                {isRtl ? 'المحاضرة #04' : 'Lecture #04'}
                            </span>
                        </div>

                        {/* Realistic Mock Content */}
                        {selectedTheme === 'academy' ? (
                            /* Dual-Column Institutional Layout */
                            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-700 leading-relaxed mb-6">
                                <div className={`space-y-2 ${isRtl ? 'border-l pl-2' : 'border-r pr-2'} border-slate-200`}>
                                    <span className="font-bold text-slate-900 block text-xs text-blue-700">
                                        {isRtl ? '١. ظاهرة الحث الكهرومغناطيسي:' : '1. Electromagnetic Induction:'}
                                    </span>
                                    <p className="text-[10px] text-slate-600 leading-normal text-justify">
                                        {isRtl
                                            ? 'تتولد قوة دافعة كهربائية مستحثة في موصل عند حدوث تغير في الفيض المغناطيسي الذي يقطعه عبر وحدة الزمن.'
                                            : 'An induced electromotive force is produced in a conductor when magnetic flux varies with time.'}
                                    </p>
                                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-mono text-[10px] font-bold text-center whitespace-nowrap">
                                        e.m.f = -N · (ΔΦ / Δt)
                                    </div>
                                </div>

                                <div className={`space-y-2 ${isRtl ? 'pr-1' : 'pl-1'}`}>
                                    <span className="font-bold text-slate-900 block text-xs text-blue-700">
                                        {isRtl ? '٢. قاعدة لنز لتحديد الاتجاه:' : "2. Lenz's Directional Law:"}
                                    </span>
                                    <p className="text-[10px] text-slate-600 leading-normal text-justify">
                                        {isRtl
                                            ? 'يكون اتجاه التيار الكهربائي المستحث بحيث يعاكس التغير في الفيض المغناطيسي المسبب له، وهي تطبيق مباشر لمبدأ حفظ الطاقة.'
                                            : 'The induced electric current flows to oppose the magnetic flux change causing it (energy conservation).'}
                                    </p>
                                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[10px] text-center font-bold">
                                        {isRtl ? 'الإشارة السالبة تعبر عن اتجاه المعاكسة' : 'Negative sign indicates opposition'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Standard Single-Column Teacher Memo */
                            <div className="space-y-3 text-xs text-slate-700 leading-relaxed mb-6">
                                <p className="text-justify text-[11px] sm:text-xs text-slate-700">
                                    {isRtl
                                        ? 'السلام عليكم يا أبطال، في هذا الباب نركز على استنتاج العلاقة الرياضية لحساب القوة الدافعة الكهربائية المستحثة، وأهم الملاحظات العملية لحل مسائل الامتحانات السابقة:'
                                        : 'Welcome students. In this unit, we derive the mathematical relation for induced electromotive force, alongside crucial practical exam tips:'}
                                </p>

                                {/* Formula Callout Box with Authentic Math Fraction */}
                                <div
                                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRtl ? 'text-right' : 'text-left'}`}
                                    style={{
                                        backgroundColor: selectedTheme === 'custom' ? `${customColor}10` : '#ecfdf5',
                                        borderColor: selectedTheme === 'custom' ? `${customColor}40` : '#a7f3d0',
                                    }}
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="size-1.5 rounded-full"
                                                style={{ backgroundColor: selectedTheme === 'custom' ? customColor : '#059669' }}
                                            />
                                            <span
                                                className="font-bold text-xs"
                                                style={{ color: selectedTheme === 'custom' ? customColor : '#047857' }}
                                            >
                                                {isRtl ? 'قانون فاراداي الأساسي:' : "Faraday's Fundamental Law:"}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 leading-normal">
                                            {isRtl
                                                ? 'الـ e.m.f بالفولت، N عدد اللفات، ΔΦ التغير في الفيض (Wb).'
                                                : 'e.m.f in Volts, N coil turns, ΔΦ flux change (Wb).'}
                                        </p>
                                    </div>

                                    {/* High-Precision Mathematical Fraction Card */}
                                    <div
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs whitespace-nowrap shrink-0 self-start sm:self-center"
                                        style={{ color: selectedTheme === 'custom' ? customColor : '#047857' }}
                                    >
                                        <span className="font-mono font-extrabold text-sm tracking-tight">e = -N ·</span>
                                        <span className="inline-flex flex-col items-center font-mono font-bold text-xs leading-none">
                                            <span className="border-b border-current pb-0.5 px-1">ΔΦ</span>
                                            <span className="pt-0.5 px-1">Δt</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
                                    <span className="font-bold">{isRtl ? '✦ تذكير الامتحان:' : '✦ Exam Alert:'}</span>{' '}
                                    {isRtl
                                        ? 'لا تنسَ تحويل المساحة من cm² إلى m² بالضرب في 10⁻⁴ لتجنب فقدان درجات المسألة.'
                                        : 'Remember to convert area from cm² to m² by multiplying by 10⁻⁴ to preserve full problem score.'}
                                </div>
                            </div>
                        )}

                        {/* A4 Sheet Footer with Contacts & Page Number */}
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{isRtl ? 'واتساب الطلاب: ٠١١٢٩٢٧٤٩٣٠' : 'Student Hotline: +20 112 927 4930'}</span>
                            <span className="font-bold text-slate-700">{isRtl ? 'صفحة ٠٣ من ١٢' : 'Page 03 of 12'}</span>
                            <span>{isRtl ? 'حقوق الطبع والتوزيع محفوظة ©' : 'All Rights Reserved © Farghly'}</span>
                        </div>
                    </div>
                </div>

                {/* Left / Right (5 Cols): Features & Value Proposition */}
                <div className="lg:col-span-5 space-y-6 text-start">
                    {selectedTheme === 'custom' ? (
                        /* Custom Theme Engine Interactive Controls */
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mb-1">
                                    {isRtl ? 'تخصيص مباشر بدون مصمم' : 'No Designer Needed'}
                                </span>
                                <h3 className="text-2xl font-extrabold text-foreground">
                                    {isRtl ? 'تحكم في ألوانك وعلامتك المائية' : 'Full Palette & Watermark Control'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {isRtl
                                        ? 'اختر لون هوية سنترك، وارفع لوجو القناة، وسيقوم النظام بتطبيقه تلقائياً على كل مذكراتك بنقرة زر.'
                                        : 'Select your signature brand tone, upload your high-resolution logo, and our engine automatically applies it to every export.'}
                                </p>
                            </div>

                            {/* Color Selector */}
                            <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                                <span className="text-xs font-bold text-foreground block">
                                    {isRtl ? 'اختر لون الهوية للورقة:' : 'Pick Accent Tone:'}
                                </span>
                                <div className="flex items-center gap-2.5">
                                    {colorPalette.map((col) => (
                                        <button
                                            key={col.id}
                                            type="button"
                                            onClick={() => setCustomColor(col.hex)}
                                            style={{ backgroundColor: col.hex }}
                                            title={isRtl ? col.labelAr : col.labelEn}
                                            className={`size-8 rounded-full cursor-pointer transition-transform flex items-center justify-center text-white ${
                                                customColor === col.hex ? 'ring-4 ring-primary/30 scale-110' : 'hover:scale-105'
                                            }`}
                                        >
                                            {customColor === col.hex && <Check className="size-4 stroke-[3]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Bullets */}
                            <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'تضمين رمز QR ذكي يفتح فيديو اليوتيوب للطلاب' : 'Smart QR codes linking directly to video chapters'}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'هوامش أمان تمنع اقتطاع الكلمات عند التجليد بالسلك' : 'Gutter margins engineered to protect bound documents'}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'تصدير Word (.docx) قابل للتعديل الفوري' : 'Fully editable Word (.docx) source downloads'}</span>
                                </li>
                            </ul>

                            <a href="#plans" onClick={handleScrollToPlans} className="inline-block pt-2">
                                <Button size="lg" className="shadow-lg shadow-primary/25">
                                    <span>{isRtl ? 'ابدأ بتصميم هويتك الآن' : 'Craft Your Theme'}</span>
                                </Button>
                            </a>
                        </div>
                    ) : selectedTheme === 'academy' ? (
                        /* Academy Dual-Column Specs */
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                                    {isRtl ? 'اقتصادي للمطابع والسناتر' : 'Bulk Printing Optimized'}
                                </span>
                                <h3 className="text-2xl font-extrabold text-foreground">
                                    {isRtl ? 'تنسيق الأعمدة المزدوجة (Dual-Column)' : 'Dual-Column Dense Typography'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {isRtl
                                        ? 'مصمم خصيصاً للمراكز التي تطبع كميات ضخمة. يقلل عدد الصفحات بنسبة تصل إلى 40% مع الحفاظ على وضوح الخط وقابلية القراءة للطلاب.'
                                        : 'Built for institutions printing thousands of copies monthly. Saves up to 40% paper costs without compromising font legibility.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'توفير تكلفة الورق:' : 'Paper Cost Savings:'}</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">~35% - 40%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'التوافق مع ماكينات التصوير:' : 'Printer Compatibility:'}</span>
                                    <span className="font-bold text-foreground font-mono">Ricoh · Canon · Xerox</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'حجم الخط الأساسي:' : 'Optimal Reading Size:'}</span>
                                    <span className="font-bold text-foreground font-mono">11pt Bold Contrast</span>
                                </div>
                            </div>

                            <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'وضع شعار السنتر واسم المادة في ترويسة كل ورقة' : 'Center logo and subject title on every page'}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'أرقام صفحات تلقائية وجداول تسليم ومتابعة' : 'Automatic pagination and assignment review slots'}</span>
                                </li>
                            </ul>

                            <a href="#plans" onClick={handleScrollToPlans} className="inline-block pt-2">
                                <Button size="lg" className="shadow-lg shadow-primary/25">
                                    <span>{isRtl ? 'تفعيل باقة السناتر' : 'Get Academy License'}</span>
                                </Button>
                            </a>
                        </div>
                    ) : (
                        /* Teacher Pro Template Specs */
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mb-1">
                                    {isRtl ? 'مذكرات المدرسين الخصوصية' : 'Private Tutoring Standard'}
                                </span>
                                <h3 className="text-2xl font-extrabold text-foreground">
                                    {isRtl ? 'تصميم أكاديمي مريح للعين' : 'Clean Single-Column Layout'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {isRtl
                                        ? 'يركز على ترك مساحات هوامش بيضاء للملاحظات والتدوينات بخط اليد من قِبل الطلاب، مع صناديق بارزة تلخص القوانين والمعادلات الرياضية.'
                                        : 'Prioritizes study readability with dedicated margin space for student handwritten notes and standout formula blocks.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'دقة مخرجات الـ PDF:' : 'Export Resolution:'}</span>
                                    <span className="font-bold text-primary font-mono">300 DPI Vector PDF</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'صناديق القوانين التلقائية:' : 'Formula Highlighting:'}</span>
                                    <span className="font-bold text-foreground font-mono">AI LaTeX & Arabic</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{isRtl ? 'العلامة المائية المانعة للتسريب:' : 'Security Watermark:'}</span>
                                    <span className="font-bold text-foreground">{isRtl ? 'مدعومة بالكامل' : 'Included'}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'بيانات اتصالك على تذييل كل صفحة لحفظ حقوقك' : 'Teacher contacts on every page footer'}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-3 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'جاهزة للطباعة بالألوان أو الأبيض والأسود' : 'Perfect for color or monochrome printing'}</span>
                                </li>
                            </ul>

                            <a href="#plans" onClick={handleScrollToPlans} className="inline-block pt-2">
                                <Button size="lg" className="shadow-lg shadow-primary/25">
                                    <span>{isRtl ? 'تفعيل باقة المعلم' : 'Get Teacher Pro'}</span>
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
