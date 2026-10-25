import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [faqOpen, setFaqOpen] = useState<number | null>(null);
    const [activeStudioTab, setActiveStudioTab] = useState<'memo' | 'summary' | 'transcript'>('memo');
    const [audienceTab, setAudienceTab] = useState<'students' | 'teachers'>('students');

    const isRtl = lang === 'ar';

    const { data, setData, post, processing, errors } = useForm({
        url: '',
    });

    const handleQuickTranscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.url) return;

        if (auth?.is_sales || auth?.user?.system_role === 'sales') {
            alert('حساب المبيعات مخصص لإدارة الاشتراكات والماليات فقط، ولا يملك صلاحية استخدام استوديو التفريغ.');
            return;
        }

        if (auth?.user) {
            post(route('transcripts.store'));
        } else {
            // Redirect to login
            window.location.href = route('login');
        }
    };

    const toggleFaq = (idx: number) => {
        setFaqOpen(faqOpen === idx ? null : idx);
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] selection:bg-[#10B981] selection:text-[#003824] font-sans antialiased overflow-x-hidden">
            <Head title="نَص تيوب | من ساعات مشاهدة إلى دقائق من المذاكرة - استوديو تلخيص الفيديوهات والمذكرات الذكية" />

            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E16]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[#003824] text-2xl font-bold">menu_book</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="font-extrabold text-xl text-white tracking-tight leading-tight">نَص تيوب</span>
                                <span className="text-[10px] text-[#4EDEA3] tracking-widest font-mono font-bold uppercase">NASSTUBE AI</span>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            <a href="#features" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'الأدوات التعليمية' : 'Features'}
                            </a>
                            <a href="#for-who" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'للطلاب والمدرسين' : 'Students & Teachers'}
                            </a>
                            <a href="#studio-workflow" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'استوديو المذكرات' : 'Smart Studio'}
                            </a>
                            <a href="#custom-themes" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'تصميم مذكرتك' : 'Themes & Branding'}
                            </a>
                            <a href="#plans" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'باقات الاشتراك' : 'Plans'}
                            </a>
                            <a href="#faq" className="px-3.5 py-1.5 rounded-lg text-sm text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all">
                                {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
                            </a>
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <button
                            type="button"
                            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2028] border border-white/10 text-xs font-mono text-[#BBCAFF] hover:text-white hover:border-[#10B981]/40 transition-all cursor-pointer"
                        >
                            <span className={isRtl ? 'text-[#4EDEA3] font-bold' : ''}>العربية</span>
                            <span className="text-white/20">|</span>
                            <span className={!isRtl ? 'text-[#4EDEA3] font-bold' : ''}>EN</span>
                        </button>

                        {auth.user ? (
                            auth.is_super_admin || auth.user.system_role === 'super_admin' ? (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-l from-[#10B981] to-[#4EDEA3] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                    <span>لوحة الإدارة</span>
                                </Link>
                            ) : auth.is_sales || auth.user.system_role === 'sales' ? (
                                <Link
                                    href={route('sales.index')}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-l from-[#10B981] to-[#4EDEA3] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">point_of_sale</span>
                                    <span>بوابة المبيعات والاشتراكات</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-l from-[#10B981] to-[#4EDEA3] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">space_dashboard</span>
                                    <span>{isRtl ? 'مساحة العمل' : 'Workspace'}</span>
                                </Link>
                            )
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C2028] border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[#4EDEA3] text-base">lock</span>
                                    <span>{isRtl ? 'دخول المشتركين' : 'Member Login'}</span>
                                </Link>

                                <a
                                    href="#plans"
                                    className="flex items-center justify-center px-4.5 py-2 rounded-xl bg-gradient-to-l from-[#10B981] to-[#4EDEA3] text-[#003824] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all"
                                >
                                    <span>{isRtl ? 'ابدأ الآن' : 'Get Started'}</span>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24">
                {/* 1. Hero Section */}
                <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col items-center justify-center">
                    {/* Ambient Glow Backdrops */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-[#10B981]/12 rounded-full blur-[150px] pointer-events-none" />
                    <div className="absolute top-20 -right-20 w-[450px] h-[350px] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none" />

                    <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
                        {/* Audience Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1C2028]/80 backdrop-blur-md border border-white/10 shadow-lg mb-8">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4EDEA3] shadow-[0_0_10px_#4edea3] animate-pulse" />
                            <span className="text-xs sm:text-sm font-mono text-[#BBCAFF]">
                                {isRtl
                                    ? '✦ منصة الذكاء الاصطناعي الأولى للتعليم • مصمم للطلاب والمدرسين وصناع المحتوى'
                                    : '✦ AI Education Suite • Built for Students, Teachers & Educators'}
                            </span>
                        </div>

                        {/* Hook Badge */}
                        <div className="mb-4">
                            <span className="inline-block px-4 py-1 rounded-full bg-[#10B981]/15 text-[#4EDEA3] border border-[#10B981]/30 font-bold text-xs sm:text-sm tracking-wide">
                                {isRtl ? 'من ساعات مشاهدة إلى دقائق من المذاكرة ⏱️' : 'From Hours of Watching to Minutes of Studying ⏱️'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-[1.25] max-w-4xl mb-6">
                            {isRtl ? (
                                <>
                                    حوّل فيديوهاتك التعليمية إلى{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#4EDEA3] via-[#10B981] to-[#34D399]">
                                        ملخصات ومذكرات
                                    </span>{' '}
                                    جاهزة للمذاكرة والطباعة بالذكاء الاصطناعي
                                </>
                            ) : (
                                <>
                                    Turn Educational Videos into{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4EDEA3] via-[#10B981] to-[#34D399]">
                                        Print-Ready Study Notes
                                    </span>{' '}
                                    with Advanced AI
                                </>
                            )}
                        </h1>

                        {/* Subtitle / Pain-point copy */}
                        <p className="text-base sm:text-lg text-[#BBCAFF] max-w-3xl leading-relaxed mb-10">
                            {isRtl
                                ? 'عندك امتحانات وفيديوهات شرح بالساعات ومش عارف تلحق تسمعها كلها؟ أو أنت مدرس وعندك محاضرات ومصادر كتير ومحتاج تحوّلها لمذكرات منظمة في وقت أقل؟ مع نَص تيوب، حوّل المحتوى الطويل إلى نصوص مفرّغة، ملخصات ذكية، ومستندات PDF أنيقة بتصميمك الخاص في مكان واحد.'
                                : 'Drowning in hours of lectures before exams? Or a teacher needing structured study guides fast? NassTube turns long video content into synchronized transcripts, AI summaries, and beautiful branded PDF memos in minutes.'}
                        </p>

                        {/* Quick Interactive YouTube URL Input Bar */}
                        <form onSubmit={handleQuickTranscribe} className="w-full max-w-3xl p-3 rounded-2xl bg-[#181C24]/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] group relative mb-6">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="flex items-center gap-3 flex-1 w-full px-3">
                                    <span className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl">smart_display</span>
                                    </span>
                                    <div className="flex flex-col text-right w-full overflow-hidden">
                                        <span className="text-[11px] font-mono text-[#BBCAFF]/70">
                                            {isRtl ? 'ضع رابط محاضرة أو فيديو يوتيوب هنا' : 'Paste YouTube Lecture URL here'}
                                        </span>
                                        <input
                                            type="text"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder={isRtl ? 'https://www.youtube.com/watch?v=...' : 'https://www.youtube.com/watch?v=...'}
                                            className="bg-transparent border-0 text-white font-mono text-sm outline-none w-full placeholder:text-white/30 focus:ring-0 p-0 py-1"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all shrink-0 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                    <span>{isRtl ? 'تفريغ وتلخيص المذكرة فوراً' : 'Transcribe & Generate Memo'}</span>
                                </button>
                            </div>

                            {errors.url && (
                                <p className="text-xs text-red-400 text-right mt-2 px-3">{errors.url}</p>
                            )}
                        </form>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                            <a
                                href="#plans"
                                className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                <span>{isRtl ? 'ابدأ الآن' : 'Start Now'}</span>
                            </a>
                            <a
                                href="#for-who"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg text-[#4EDEA3]">explore</span>
                                <span>{isRtl ? 'اكتشف المميزات' : 'Explore Features'}</span>
                            </a>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#BBCAFF]">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-sm">verified</span>
                                {isRtl ? 'تفريغ يوتيوب فوري بالتوقيت الزمني' : 'Instant YouTube captions'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-sm">psychology</span>
                                {isRtl ? 'تلخيص ذكي بالـ Gemini AI' : 'Gemini AI summaries'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-sm">print</span>
                                {isRtl ? 'مذكرات PDF جاهزة للطباعة' : 'Print-ready PDF exports'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-sm">palette</span>
                                {isRtl ? 'تخصيص كامل للشعار والألوان' : 'Custom branding & themes'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* 2. Problem/Solution Section: "مش لازم تسمع كل دقيقة عشان تفهم المنهج" */}
                <section id="for-who" className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3">
                            {isRtl ? 'مش لازم تسمع كل دقيقة عشان تفهم المنهج' : 'Stop Wasting Hours Watching Every Minute'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                            {isRtl ? 'وقتك للمذاكرة أهم من وقتك في مشاهدة الفيديوهات' : 'Your Study Time is Too Valuable to Waste'}
                        </h2>
                        <p className="text-sm text-[#BBCAFF] max-w-2xl mx-auto mt-3">
                            {isRtl
                                ? 'سواء كنت طالباً تسابق الوقت ليلة الامتحان، أو مدرساً يريد توفير ساعات التحضير، نَص تيوب مصمم خصيصاً لاحتياجك.'
                                : 'Whether you are a student preparing for finals or an educator creating class handouts, NassTube gives you hours back.'}
                        </p>

                        {/* Audience Interactive Switcher Buttons */}
                        <div className="inline-flex p-1.5 rounded-2xl bg-[#141822] border border-white/10 mt-8">
                            <button
                                type="button"
                                onClick={() => setAudienceTab('students')}
                                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    audienceTab === 'students'
                                        ? 'bg-[#10B981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                        : 'text-[#BBCAFF] hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">school</span>
                                <span>{isRtl ? 'للطلاب: مراجعة ذكية' : 'For Students'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudienceTab('teachers')}
                                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    audienceTab === 'teachers'
                                        ? 'bg-[#10B981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                        : 'text-[#BBCAFF] hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">co_present</span>
                                <span>{isRtl ? 'للمدرسين: تجهيز المذكرات' : 'For Teachers'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Comparative Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        {/* Students Card */}
                        <div
                            className={`p-8 rounded-3xl bg-[#141822] border transition-all flex flex-col justify-between text-right relative overflow-hidden ${
                                audienceTab === 'students'
                                    ? 'border-[#10B981] ring-2 ring-[#10B981]/20 shadow-[0_0_40px_rgba(16,185,129,0.12)]'
                                    : 'border-white/10 opacity-80 hover:opacity-100'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/10 rounded-full blur-[70px] pointer-events-none" />

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 text-[#4EDEA3] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">school</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#4EDEA3] font-mono text-xs font-bold">
                                        {isRtl ? 'للطلاب الجامعيين والثانوية' : 'University & High School'}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-extrabold text-white mb-3">
                                    {isRtl ? 'للطلاب: ذاكر بذكاء قبل الامتحانات' : 'For Students: Study Smart Before Finals'}
                                </h3>

                                <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed mb-6">
                                    {isRtl
                                        ? 'عندك كورسات ومحاضرات مسجلة بالساعات؟ بدل ما تعيد مشاهدة الفيديو أكثر من مرة، حوّل محتواه إلى نص وملخص يساعدك تراجع أهم المعلومات وتستغل وقتك بشكل أفضل.'
                                        : 'Hours of recorded lectures? Instead of re-watching endless videos, generate instant study summaries to review the essential concepts.'}
                                </p>

                                <ul className="space-y-3.5 text-xs sm:text-sm text-white mb-8">
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تفريغ الفيديوهات والمحاضرات:</strong> تحويل الشرح إلى نصوص مكتوبة كاملة مع التوقيت.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تلخيص ذكي بالذكاء الاصطناعي:</strong> استخراج أهم القوانين، الأفكار الأساسية، والتعريفات.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>مذكرات منظمة للمراجعة:</strong> تحويل المحتوى إلى مذكرات خفيفة وسهلة القراءة ليلة الامتحان.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تصدير PDF للموبايل أو الطباعة:</strong> ذاكر من شاشتك المفضلة أو اطبع الورق مباشرة.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تنظيم المكتبة التعليمية:</strong> ترتيب المحاضرات حسب المادة أو الكورس لتصل إليها فوراً.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                                <p className="text-xs text-[#4EDEA3] font-bold">
                                    {isRtl ? '💡 ركّز في الفهم والمراجعة، وسيب تنظيم المحتوى لنَص تيوب.' : 'Focus on learning, let NassTube organize the content.'}
                                </p>
                                <a
                                    href="#plans"
                                    className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs sm:text-sm text-center shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                                    <span>{isRtl ? 'ابدأ تجهيز مذكراتك الدراسية' : 'Start Preparing Your Study Notes'}</span>
                                </a>
                            </div>
                        </div>

                        {/* Teachers Card */}
                        <div
                            className={`p-8 rounded-3xl bg-[#141822] border transition-all flex flex-col justify-between text-right relative overflow-hidden ${
                                audienceTab === 'teachers'
                                    ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20 shadow-[0_0_40px_rgba(99,102,241,0.12)]'
                                    : 'border-white/10 opacity-80 hover:opacity-100'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6366F1]/10 rounded-full blur-[70px] pointer-events-none" />

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/20 text-[#C0C1FF] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">co_present</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#6366F1]/15 text-[#C0C1FF] font-mono text-xs font-bold">
                                        {isRtl ? 'للمعلمين والمحاضرين والسناتر' : 'Teachers & Educational Studios'}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-extrabold text-white mb-3">
                                    {isRtl ? 'للمدرسين: جهّز مذكراتك في وقت أقل' : 'For Teachers: Create Course Notes in Minutes'}
                                </h3>

                                <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed mb-6">
                                    {isRtl
                                        ? 'بدل ما تقضي ساعات في الاستماع للمحاضرات وتفريغ المحتوى وإعادة تنسيقه، استخدم نَص تيوب لتحويل مصادر الشرح إلى مسودات مذكرات تعليمية منظمة، قابلة للمراجعة والتعديل قبل توزيعها على الطلاب.'
                                        : 'Skip tedious transcription and formatting. Transform video lectures into polished educational memos with your custom branding, logo, and colors ready for print distribution.'}
                                </p>

                                <ul className="space-y-3.5 text-xs sm:text-sm text-white mb-8">
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#C0C1FF] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تحويل المحاضرات لنصوص:</strong> تفريغ دقيق لفيديوهات الشرح والكورسات بنقرة زر.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#C0C1FF] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>مسودات مذكرات فورية:</strong> صياغة التعريفات، النقاط الأساسية، وتلخيص الفصول تلقائياً.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#C0C1FF] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>تخصيص الهوية والشعار:</strong> وضع لوجو الأستاذ أو السنتر والترويسة والفوتر على كل ورقة.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#C0C1FF] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>قوالب جاهزة أو HTML خاص:</strong> ألوان وخطوط عربية فاخرة (أميري، تجوال، القاهرة).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#C0C1FF] text-lg shrink-0 mt-0.5">check_circle</span>
                                        <span><strong>ملفات PDF جاهزة للمطبعة:</strong> مستندات عالية الجودة جاهزة للتوزيع الفوري لطلابك.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                                <p className="text-xs text-[#C0C1FF] font-bold">
                                    {isRtl ? '💼 وفّر وقت الإعداد، ووجّهه لشرح أفضل ومحتوى تعليمي أقوى.' : 'Save prep time and dedicate your focus to inspiring students.'}
                                </p>
                                <a
                                    href="#plans"
                                    className="w-full py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold text-xs sm:text-sm text-center shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">palette</span>
                                    <span>{isRtl ? 'ابدأ إعداد مذكراتك بهويتك التعليمية' : 'Design Your Branded Course Notes'}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Core Tools Suite: "كل أدواتك التعليمية في منصة واحدة" */}
                <section id="features" className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono text-[#4EDEA3] uppercase tracking-wider font-bold">
                            {isRtl ? 'منظومة متكاملة' : 'Complete Toolchain'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            {isRtl ? 'كل أدواتك التعليمية في منصة واحدة' : 'All Your Educational Tools in One Platform'}
                        </h2>
                        <p className="text-sm text-[#BBCAFF] max-w-xl mx-auto mt-2">
                            {isRtl ? 'من رابط الفيديو إلى مذكرة PDF جاهزة للطباعة والمذاكرة في 6 ركائز أساسية:' : 'From YouTube URL to a completed, print-ready PDF memo in 6 steps:'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
                        {/* 01 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#4EDEA3] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                01
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-xl">subtitles</span>
                                <span>{isRtl ? 'تفريغ الفيديوهات التعليمية' : 'Video Transcription'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'الصق رابط فيديو يوتيوب (محاضرة، درس، كورس)، وحوّل الكلام إلى نص مكتوب مع التوقيت الزمني الدقيق بدقة 100%.'
                                    : 'Paste any YouTube video link to extract spoken words into synchronized transcripts with timestamps.'}
                            </p>
                        </div>

                        {/* 02 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/15 text-[#C0C1FF] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                02
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#C0C1FF] text-xl">psychology</span>
                                <span>{isRtl ? 'تلخيص المحتوى بالذكاء الاصطناعي' : 'AI Study Summarization'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'حوّل المحاضرات الطويلة إلى ملخصات مركزة تستخرج التعريفات، النقاط الأساسية، والأفكار المحورية للامتحانات.'
                                    : 'Condense hour-long lectures into structured study summaries with key definitions and takeaways.'}
                            </p>
                        </div>

                        {/* 03 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 text-[#FFB95F] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                03
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FFB95F] text-xl">picture_as_pdf</span>
                                <span>{isRtl ? 'تحويل النصوص والملخصات إلى PDF' : 'Print-Ready PDF Generation'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'أنشئ مستندات تعليمية بتنسيق احترافي وعناوين مرتبة، جاهزة للحفظ على جهازك أو الطباعة الورقية الفورية.'
                                    : 'Generate cleanly structured, formatted documents ready to save on mobile or print directly on paper.'}
                            </p>
                        </div>

                        {/* 04 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#4EDEA3] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                04
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-xl">design_services</span>
                                <span>{isRtl ? 'اختر تصميم مذكرتك بنفسك' : 'Choose Your Theme'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'استخدم قوالب نَص تيوب الجاهزة (الأكاديمي، العصري، الكلاسيكي)، أو نسق خطوطك وألوانك المفضلة للمذاكرة.'
                                    : 'Pick from curated styles (Academic, Modern, Minimal) or customize fonts and colors to match your style.'}
                            </p>
                        </div>

                        {/* 05 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/15 text-[#C0C1FF] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                05
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#C0C1FF] text-xl">verified</span>
                                <span>{isRtl ? 'أضف شعارك وهويتك البصرية' : 'Branding & Logo'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'للمدرسين والأكاديميات: ارفع شعارك الخاص واسمك وبيانات التواصل لتبدو مذكرتك ككتاب رسمي يحمل علامتك.'
                                    : 'Upload your teacher logo and contact info so each printed memo proudly carries your educational brand.'}
                            </p>
                        </div>

                        {/* 06 */}
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 text-[#FFB95F] flex items-center justify-center font-mono font-bold text-base group-hover:scale-105 transition-transform">
                                06
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FFB95F] text-xl">folder_managed</span>
                                <span>{isRtl ? 'نظّم مكتبتك التعليمية' : 'Organized Library'}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'احتفظ بجميع محاضراتك السابقة، ونظّم الفيديوهات والنصوص والمذكرات في مكان واحد يسهل البحث فيه والرجوع إليه.'
                                    : 'Keep all your transcribed lectures and memos archived in your dedicated workspace library.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. Interactive Studio Mockup & Workflow: "استوديو المذكرات الذكي" */}
                <section id="studio-workflow" className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <span className="text-xs font-mono text-[#4EDEA3] uppercase tracking-wider font-bold">
                            {isRtl ? 'تجربة حية' : 'Live Interactive Preview'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            {isRtl ? 'استوديو المذكرات الذكي' : 'The Smart Memo Studio'}
                        </h2>
                        <p className="text-sm text-[#BBCAFF] max-w-xl mx-auto mt-2">
                            {isRtl
                                ? 'تخيّل أنك انتهيت من محاضرة مدتها ساعتان. بدلاً من قضاء وقت إضافي في كتابة كل شيء يدوياً، هذا ما يحدث في ثوانٍ:'
                                : 'Imagine finishing a 2-hour lecture. Instead of spending hours taking manual notes, see the output in seconds:'}
                        </p>
                    </div>

                    {/* Interactive Studio Card */}
                    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
                        {/* Tab Switcher */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                                <span className="text-sm font-bold text-white">
                                    {isRtl ? 'معاينة المخرجات التعليمية' : 'Output Preview'}
                                </span>
                            </div>

                            <div className="inline-flex p-1 rounded-xl bg-[#0F131C] border border-white/10 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveStudioTab('memo')}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        activeStudioTab === 'memo'
                                            ? 'bg-[#10B981] text-[#003824] shadow'
                                            : 'text-[#BBCAFF] hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                    <span>{isRtl ? 'المذكرة المطبوعة (PDF)' : 'PDF Memo'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveStudioTab('summary')}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        activeStudioTab === 'summary'
                                            ? 'bg-[#10B981] text-[#003824] shadow'
                                            : 'text-[#BBCAFF] hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">psychology</span>
                                    <span>{isRtl ? 'الملخص الذكي (AI)' : 'AI Summary'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveStudioTab('transcript')}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        activeStudioTab === 'transcript'
                                            ? 'bg-[#10B981] text-[#003824] shadow'
                                            : 'text-[#BBCAFF] hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span>{isRtl ? 'التفريغ بالتوقيت' : 'Transcript'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Studio Content View */}
                        <div className="mt-6">
                            {/* Tab 1: PDF Document / Memo Preview */}
                            {activeStudioTab === 'memo' && (
                                <div className="rounded-2xl bg-[#0F131C] border border-white/10 p-6 sm:p-8 text-right max-w-3xl mx-auto shadow-inner relative">
                                    {/* Paper Top Accent */}
                                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center font-bold text-[#4EDEA3]">
                                                أكاديمية
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-white text-sm">أكاديمية التفوق التعليمية</h4>
                                                <p className="text-[11px] text-[#BBCAFF]">إعداد: أ. محمد عبد الرحمن • مادة الفيزياء</p>
                                            </div>
                                        </div>
                                        <div className="text-left font-mono text-[11px] text-[#4EDEA3] bg-[#10B981]/10 px-2.5 py-1 rounded-md border border-[#10B981]/20">
                                            قالب: أكاديمي رسمي • جاهز للطباعة
                                        </div>
                                    </div>

                                    {/* Document Header */}
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                                        مذكرة شاملة: قوانين الحركة والجاذبية فيزياء عامة
                                    </h3>
                                    <p className="text-xs text-[#BBCAFF] mb-6">
                                        مستخلصة ومفرغة من محاضرة الشرح على يوتيوب (المدة: 01:45:00)
                                    </p>

                                    {/* Section 1 */}
                                    <div className="p-4 rounded-xl bg-[#141822] border-r-4 border-[#10B981] mb-4 text-xs sm:text-sm">
                                        <h5 className="font-bold text-[#4EDEA3] mb-1">📌 المفاهيم والتعريفات الأساسية:</h5>
                                        <p className="text-[#DFE2EE] leading-relaxed">
                                            قانون نيوتن الأول ينص على أن الجسم الساكن يبقى ساكناً، والجسم المتحرك يستمر في حركته بسرعة ثابتة في خط مستقيم ما لم تؤثر عليه قوة خارجية تغير من حالته.
                                        </p>
                                    </div>

                                    {/* Section 2 */}
                                    <div className="p-4 rounded-xl bg-[#141822] border-r-4 border-[#6366F1] mb-6 text-xs sm:text-sm">
                                        <h5 className="font-bold text-[#C0C1FF] mb-1">⚖️ أهم القوانين الرياضية المستخرجة:</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs font-mono text-white">
                                            <div className="p-2 bg-[#0A0E16] rounded border border-white/5">القوة (F) = الكتلة (m) × التسارع (a)</div>
                                            <div className="p-2 bg-[#0A0E16] rounded border border-white/5">الوزن (W) = الكتلة (m) × عجلة الجاذبية (g)</div>
                                        </div>
                                    </div>

                                    {/* Footer Watermark */}
                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#BBCAFF]/70">
                                        <span>نَص تيوب | تم التوليد بنظام الذكاء الاصطناعي</span>
                                        <span>صفحة 1 من 4 • جميع الحقوق محفوظة للمعلم</span>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: AI Summary */}
                            {activeStudioTab === 'summary' && (
                                <div className="rounded-2xl bg-[#0F131C] border border-white/10 p-6 sm:p-8 text-right max-w-3xl mx-auto space-y-4">
                                    <div className="flex items-center gap-2 text-[#4EDEA3] text-sm font-bold">
                                        <span className="material-symbols-outlined text-lg">psychology</span>
                                        <span>ملخص Gemini الذكي للدرس</span>
                                    </div>
                                    <div className="space-y-3 text-xs sm:text-sm text-[#DFE2EE]">
                                        <div className="p-3.5 rounded-xl bg-[#141822] border border-white/5">
                                            <strong className="text-white block mb-1">1. الفكرة المحورية للمحاضرة:</strong>
                                            ركزت المحاضرة على التطبيقات الحياتية لقوانين نيوتن وكيفية حساب التسارع والقوة المحصلة في مختلف المسائل.
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-[#141822] border border-white/5">
                                            <strong className="text-white block mb-1">2. أسئلة امتحانات متوقعة مستخلصة من الشرح:</strong>
                                            ما الفرق بين الكتلة والوزن؟ وكيف تتغير قيمة الوزن بتغير موقع الجسم من سطح الأرض؟
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-[#141822] border border-white/5">
                                            <strong className="text-white block mb-1">3. نصيحة المدرس للطلاب:</strong>
                                            ضرورة الانتباه لوحدات القياس قبل التعويض في القوانين، خصوصاً تحويل الكيلومتر إلى متر.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Transcript */}
                            {activeStudioTab === 'transcript' && (
                                <div className="rounded-2xl bg-[#0F131C] border border-white/10 p-6 sm:p-8 text-right max-w-3xl mx-auto space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                        <span className="text-xs text-[#BBCAFF]">النص الكامل المفرغ مع التوقيت الزمني:</span>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#4EDEA3]">.SRT</span>
                                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#4EDEA3]">.VTT</span>
                                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#4EDEA3]">.TXT</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        <div className="p-2.5 rounded-lg bg-[#141822] flex items-start gap-3 text-xs">
                                            <span className="font-mono text-[#4EDEA3] bg-[#0A0E16] px-2 py-0.5 rounded border border-white/5">00:05</span>
                                            <span className="text-white">السلام عليكم يا شباب، النهاردة هنشرح الباب التالت في الفيزياء العامة بالتفصيل.</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-[#141822] flex items-start gap-3 text-xs">
                                            <span className="font-mono text-[#4EDEA3] bg-[#0A0E16] px-2 py-0.5 rounded border border-white/5">02:14</span>
                                            <span className="text-white">القانون الأول لنيوتن بيتكرر في كل الامتحانات، ولازم نفهم يعني إيه قصور ذاتي.</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-[#141822] flex items-start gap-3 text-xs">
                                            <span className="font-mono text-[#4EDEA3] bg-[#0A0E16] px-2 py-0.5 rounded border border-white/5">08:45</span>
                                            <span className="text-white">ركز معايا في المسألة دي عشان فيها فكرة تحويل الوحدات المهمة جداً.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6 Step Walkthrough Summary */}
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <h4 className="text-center text-sm font-bold text-white mb-6">
                                {isRtl ? 'خطوات العمل الست البسيطة من الرابط إلى المذكرة:' : '6 Simple Steps from Link to Memo:'}
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">1</div>
                                    <p className="font-bold text-white mb-1">أضف الرابط</p>
                                    <p className="text-[10px] text-[#BBCAFF]">الصق رابط الفيديو</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">2</div>
                                    <p className="font-bold text-white mb-1">استخرج النص</p>
                                    <p className="text-[10px] text-[#BBCAFF]">تفريغ فوري دقيق</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">3</div>
                                    <p className="font-bold text-white mb-1">لخّص بالـ AI</p>
                                    <p className="text-[10px] text-[#BBCAFF]">استخراج أهم النقاط</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">4</div>
                                    <p className="font-bold text-white mb-1">اختر القالب</p>
                                    <p className="text-[10px] text-[#BBCAFF]">قوالب وألوان أنيقة</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">5</div>
                                    <p className="font-bold text-white mb-1">أضف شعارك</p>
                                    <p className="text-[10px] text-[#BBCAFF]">هويتك واسمك</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5">
                                    <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#4EDEA3] mx-auto flex items-center justify-center font-bold mb-2">6</div>
                                    <p className="font-bold text-white mb-1">صدّر PDF</p>
                                    <p className="text-[10px] text-[#BBCAFF]">اطبع وذاكر فوراً</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Custom Themes & Branding: "مذكراتك بتصميمك أنت" */}
                <section id="custom-themes" className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono text-[#FFB95F] uppercase tracking-wider font-bold">
                            {isRtl ? 'هوية بصرية مخصصة' : 'Unique Styling'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            {isRtl ? 'مذكراتك بتصميمك أنت' : 'Your Notes in Your Own Signature Style'}
                        </h2>
                        <p className="text-sm text-[#BBCAFF] max-w-xl mx-auto mt-2">
                            {isRtl ? 'لأن كل مدرس له أسلوبه، وكل طالب له طريقته في المذاكرة:' : 'Because every teacher has their teaching identity, and every student has their study flow:'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-right">
                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#FFB95F]/40 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-3xl text-[#FFB95F]">palette</span>
                            <h3 className="text-base font-bold text-white">{isRtl ? 'قوالب جاهزة للاستخدام' : 'Pre-built Templates'}</h3>
                            <p className="text-xs text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'اختر من مجموعة تصميمات متنوعة للمذكرات، مع تنسيقات جاهزة للعناوين، الفقرات، القوائم، والجداول.'
                                    : 'Choose from academic, modern, and minimal presets with clean heading and table hierarchies.'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/40 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-3xl text-[#10B981]">brush</span>
                            <h3 className="text-base font-bold text-white">{isRtl ? 'تصميم خاص بك' : 'Custom Builder'}</h3>
                            <p className="text-xs text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'خصص شكل مذكرتك بما يناسبك: اختر ألوانك المفضلة والخطوط العربية المريحة للعين (كالقاهرة، أميري، وتجوال).'
                                    : 'Customize your primary colors, margins, and select beautiful Arabic print fonts like Cairo and Amiri.'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#6366F1]/40 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-3xl text-[#6366F1]">badge</span>
                            <h3 className="text-base font-bold text-white">{isRtl ? 'أضف شعارك واسمك' : 'Logo & Watermarks'}</h3>
                            <p className="text-xs text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'أنشئ هوية بصرية مميزة لمذكراتك بإضافة شعارك، اسم مؤسستك، وبيانات التواصل لتصبح ملفاتك متسقة ومحمية.'
                                    : 'Add your logo on covers and headers to protect your intellectual property and build recognition.'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#141822] border border-white/10 hover:border-red-400/40 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-3xl text-red-400">print</span>
                            <h3 className="text-base font-bold text-white">{isRtl ? 'ملفات PDF جاهزة للطباعة' : '300 DPI Print Ready'}</h3>
                            <p className="text-xs text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'احصل على مستندات عالية الدقة يسهل قراءتها على الهاتف والكمبيوتر، أو إرسالها لمطابع السناتر والمدارس مباشرة.'
                                    : 'Produce ultra-sharp PDFs that look stunning on tablets and print flawlessly on standard paper.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. Target Audience Breakdown: "لمن صُممت منصة نَص تيوب؟" */}
                <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono text-[#4EDEA3] uppercase tracking-wider font-bold">
                            {isRtl ? 'الشرائح المستهدفة' : 'Who is it for?'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            {isRtl ? 'لمن صُممت منصة نَص تيوب؟' : 'Who is NassTube Built For?'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-right">
                        {/* 1 */}
                        <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/30 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-2xl text-[#10B981]">account_balance</span>
                            <h3 className="text-sm font-bold text-white">{isRtl ? 'طلاب الجامعات' : 'University Students'}</h3>
                            <p className="text-[11px] text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'لمن لديهم محاضرات طويلة ومصادر كثيرة ويحتاجون إلى تنظيم المحتوى ومراجعته قبل امتحانات الفاينل.'
                                    : 'Students dealing with massive lecture videos needing rapid exam revision summaries.'}
                            </p>
                        </div>

                        {/* 2 */}
                        <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#10B981]/30 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-2xl text-[#10B981]">school</span>
                            <h3 className="text-sm font-bold text-white">{isRtl ? 'طلاب الثانوية العامة' : 'High School Seniors'}</h3>
                            <p className="text-[11px] text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'لتجهيز ملخصات المراجعة النهائية من مصادر الشرح على يوتيوب دون إضاعة الساعات في إعادة المشاهدة.'
                                    : 'Fast chapter recaps from top tutor videos without wasting daylight watching.'}
                            </p>
                        </div>

                        {/* 3 */}
                        <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#6366F1]/30 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-2xl text-[#6366F1]">co_present</span>
                            <h3 className="text-sm font-bold text-white">{isRtl ? 'المدرسون والمعلمون' : 'Teachers & Tutors'}</h3>
                            <p className="text-[11px] text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'لإعداد مذكرات وشروحات تعليمية منظمة ومطبوعة انطلاقاً من محاضراتهم ومصادرهم المختلفة.'
                                    : 'Teachers converting their spoken classes into clean student workbooks.'}
                            </p>
                        </div>

                        {/* 4 */}
                        <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#FFB95F]/30 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-2xl text-[#FFB95F]">apartment</span>
                            <h3 className="text-sm font-bold text-white">{isRtl ? 'الأكاديميات والسناتر' : 'Academies & Centers'}</h3>
                            <p className="text-[11px] text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'لتحويل المحتوى التعليمي والكورسات المسجلة إلى مستندات موحدة تحمل هوية الأكاديمية وشعارها.'
                                    : 'Institutions requiring standardized, branded syllabus handouts at scale.'}
                            </p>
                        </div>

                        {/* 5 */}
                        <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 hover:border-[#4EDEA3]/30 transition-all flex flex-col gap-3">
                            <span className="material-symbols-outlined text-2xl text-[#4EDEA3]">video_camera_front</span>
                            <h3 className="text-sm font-bold text-white">{isRtl ? 'صناع المحتوى التعليمي' : 'Edu Content Creators'}</h3>
                            <p className="text-[11px] text-[#BBCAFF] leading-relaxed">
                                {isRtl
                                    ? 'لاستخراج النصوص من الفيديوهات وإعادة استخدامها في مقالات وتدوينات ومذكرات رقمية.'
                                    : 'YouTubers turning educational videos into blogs, ebooks, and cheat sheets.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. Pricing / Subscription Plans */}
                <section id="plans" className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <span className="text-xs font-mono text-[#4EDEA3] uppercase tracking-wider font-bold">
                            {isRtl ? 'باقات تناسب احتياجاتك' : 'Flexible Subscriptions'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            {isRtl ? 'ابدأ بما تحتاج إليه، وطوّر استخدامك مع الوقت' : 'Start with What You Need, Upgrade Anytime'}
                        </h2>
                        <p className="text-xs text-[#FFB95F] mt-2 font-mono">
                            {isRtl ? '✦ يتم تفعيل الاشتراكات والتجديد مباشرة بالتنسيق مع إدارة المبيعات' : '✦ Direct activation and renewal via dedicated sales desk'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Plan 1: Student */}
                        <div className="p-8 rounded-3xl bg-[#141822] border border-white/10 flex flex-col justify-between text-right">
                            <div>
                                <span className="text-xs font-mono text-[#BBCAFF] uppercase font-bold">
                                    {isRtl ? 'باقة الطالب' : 'Student Pack'}
                                </span>
                                <h3 className="text-2xl font-bold text-white mt-2">
                                    {isRtl ? 'رصيد المذاكرة والامتحانات' : 'Exam Study Quota'}
                                </h3>
                                <p className="text-xs text-[#BBCAFF] mt-2">
                                    {isRtl ? 'لطلاب المدارس والجامعات الذين يريدون تنظيم محاضراتهم والاستعداد للامتحانات.' : 'For students organizing lectures and studying smart.'}
                                </p>

                                <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#BBCAFF]">
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>رصيد شهري مخصص لتفريغ المحاضرات</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تلخيص المحتوى التعليمي بالذكاء الاصطناعي</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تحويل النصوص والملخصات إلى PDF للموبايل</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>قوالب جاهزة ومريحة للمذكرات</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تنظيم المحتوى وحفظه في مساحتك</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8%20%D9%81%D9%8A%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm text-center transition-all block"
                            >
                                {isRtl ? 'اشترك في باقة الطالب' : 'Get Student Pack'}
                            </a>
                        </div>

                        {/* Plan 2: Teacher (Highlighted) */}
                        <div className="p-8 rounded-3xl bg-[#181C24] border-2 border-[#10B981] relative shadow-[0_0_40px_rgba(16,185,129,0.18)] flex flex-col justify-between text-right">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#10B981] text-[#003824] font-mono text-xs font-bold uppercase">
                                {isRtl ? 'الأكثر اختياراً للمدرسين' : 'Most Popular for Teachers'}
                            </div>

                            <div>
                                <span className="text-xs font-mono text-[#4EDEA3] uppercase font-bold">
                                    {isRtl ? 'باقة المدرس' : 'Teacher Pro'}
                                </span>
                                <h3 className="text-2xl font-bold text-white mt-2">
                                    {isRtl ? 'إعداد وطباعة المذكرات' : 'Full Course Builder'}
                                </h3>
                                <p className="text-xs text-[#BBCAFF] mt-2">
                                    {isRtl ? 'للمدرسين الذين يريدون إعداد المذكرات التعليمية بشكل أسرع وأكثر تنظيماً بهويتهم.' : 'For teachers creating rapid, beautifully branded course notes.'}
                                </p>

                                <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#BBCAFF]">
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>رصيد مضاعف لتفريغ عشرات الساعات</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تلخيص المحتوى وإنشاء مسودات المذكرات</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تصدير ملفات PDF بدقة طباعة 300 DPI جاهزة للمطبعة</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تخصيص كامل لألوان المذكرة والخطوط العربية</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-white font-bold">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>إضافة شعار المدرس واسمه وهويته البصرية</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تصدير ترجمات SRT و VTT لقناة اليوتيوب</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D8%B1%D8%B3%20%D9%81%D9%8A%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs sm:text-sm text-center shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all block"
                            >
                                {isRtl ? 'اشترك في باقة المدرس' : 'Get Teacher Pro'}
                            </a>
                        </div>

                        {/* Plan 3: Academy */}
                        <div className="p-8 rounded-3xl bg-[#141822] border border-white/10 flex flex-col justify-between text-right">
                            <div>
                                <span className="text-xs font-mono text-[#FFB95F] uppercase font-bold">
                                    {isRtl ? 'باقة الأكاديميات والمؤسسات' : 'Academy Enterprise'}
                                </span>
                                <h3 className="text-2xl font-bold text-white mt-2">
                                    {isRtl ? 'سعة مؤسسية ضخمة' : 'High Volume'}
                                </h3>
                                <p className="text-xs text-[#BBCAFF] mt-2">
                                    {isRtl ? 'للمؤسسات والسناتر التي تحتاج لتجهيز وتنظيم كميات كبيرة من المحتوى التعليمي.' : 'For schools, platforms & centers producing continuous courseware.'}
                                </p>

                                <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#BBCAFF]">
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>سعة استخدام شهرية موسعة تناسب حجم عملكم</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>تنظيم المحتوى ومساحات عمل متعددة للمدرسين</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>قوالب HTML وهوية بصرية مخصصة بالكامل</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>إضافة شعارات الأكاديمية والسنتر على كافة الأوراق</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-sm">check</span>
                                        <span>مدير حساب مخصص وفواتير دورية معتمدة</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%86%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D8%A3%D9%83%D8%A7%D8%AF%D9%8A%D9%85%D9%8A%D8%A7%D8%AA%20%D9%81%D9%8A%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm text-center transition-all block"
                            >
                                {isRtl ? 'تواصل معنا للأكاديميات' : 'Contact Enterprise Sales'}
                            </a>
                        </div>
                    </div>
                </section>

                {/* 8. FAQ Section */}
                <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <span className="text-xs font-mono text-[#4EDEA3] uppercase tracking-wider font-bold">
                            {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
                        </span>
                        <h2 className="text-3xl font-extrabold text-white mt-2">
                            {isRtl ? 'إجابات على كل ما يهمك' : 'Frequently Asked Questions'}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'هل يمكنني تحويل فيديو يوتيوب إلى نص مكتوب؟',
                                a: 'نعم، بمجرد إدخال رابط أي فيديو يوتيوب، تستخرج المنصة النص بالكامل مع التوقيت الزمني الدقيق بالملي ثانية إذا كانت الترجمة والتفريغ الصوتي متاحين على الفيديو.',
                            },
                            {
                                q: 'هل يمكنني تلخيص المحاضرات الطويلة؟',
                                a: 'نعم، توفر المنصة تقنية ذكاء اصطناعي متقدمة تقوم بتحليل النص واستخراج أهم النقاط، القوانين، والتعريفات الأساسية في ملخص منظم يسهل مراجعته في دقائق.',
                            },
                            {
                                q: 'هل يمكنني تحويل الملخص إلى مستند PDF جاهز؟',
                                a: 'بالتأكيد. يمكنك بنقرة زر واحدة توليد ملف PDF فائق الجودة، منسق بعناوين واضحة وفقرات مرتبة، جاهز للحفظ على الموبايل والتابلت أو للطباعة الورقية فوراً.',
                            },
                            {
                                q: 'هل أستطيع تصميم المذكرة بنفسي واختيار ألوانها؟',
                                a: 'نعم، يتضمن نَص تيوب محرك ثيمات متكاملاً يتيح لك الاختيار بين قوالب جاهزة (أكاديمي، عصري، كلاسيكي) أو تخصيص الألوان، العناوين، والخطوط العربية مثل القاهرة وأميري وتجوال.',
                            },
                            {
                                q: 'هل يمكنني استخدام شعاري وبياناتي الخاصة على المذكرة؟',
                                a: 'نعم! يمكن للمدرسين والمؤسسات رفع الشعار (Logo) وإضافة الاسم ومعلومات التواصل لتظهر كترويسة رسمية على غلاف وصفحات المذكرة المطبوعة.',
                            },
                            {
                                q: 'هل الملخص يغني عن مشاهدة المحاضرة بالكامل؟',
                                a: 'الملخص الذكي أداة جبارة لتوفير ساعات المشاهدة ومراجعة ليلة الامتحان، لكنه يركز على جوهر الشرح والمعلومات الأساسية. يمكنك دائماً العودة للدقيقة المحددة في الفيديو عبر التوقيت الزمني المرفق مع كل فقرة للاستزادة.',
                            },
                            {
                                q: 'هل يمكنني استخدام المنصة من الهاتف المحمول؟',
                                a: 'نعم، المنصة متوافقة تماماً وتعمل بسلاسة من متصفح الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر، وملفات PDF الناتجة مهيأة للقراءة على أي شاشة.',
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="rounded-2xl bg-[#141822] border border-white/10 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-5 text-right font-bold text-white flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    <span>{item.q}</span>
                                    <span className="material-symbols-outlined text-[#4EDEA3] transition-transform">
                                        {faqOpen === idx ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>
                                {faqOpen === idx && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#BBCAFF] text-right leading-relaxed border-t border-white/5 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. Final High Impact Call to Action */}
                <section id="contact-sales" className="max-w-4xl mx-auto px-6 pb-28">
                    <div className="rounded-3xl bg-gradient-to-tr from-[#141822] to-[#1C2028] border border-[#10B981]/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/15 rounded-full blur-[90px] pointer-events-none" />

                        <span className="text-xs font-mono text-[#4EDEA3] font-bold uppercase tracking-wider">
                            {isRtl ? 'ابدأ الآن واستغل وقتك بشكل أفضل' : 'Start Today & Learn Faster'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
                            {isRtl ? 'عندك محاضرات كثيرة؟ أو مذكرات محتاج تجهزها؟' : 'Have Piles of Lectures to Watch or Notes to Prepare?'}
                        </h2>
                        <p className="text-sm sm:text-base text-[#BBCAFF] max-w-2xl mx-auto mb-8 leading-relaxed">
                            {isRtl
                                ? 'لا تجعل الساعات الطويلة التي تقضيها في مشاهدة الفيديوهات أو تفريغها يدوياً تستهلك وقت المذاكرة أو التحضير للشرح. حوّل المحتوى إلى مذكرات منظمة بهويتك الخاصة الآن.'
                                : 'Stop spending entire days manually listening and typing. Transform videos into organized, branded study memos in minutes.'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">chat</span>
                                <span>{isRtl ? 'تواصل عبر واتساب المبيعات فوراً' : 'Chat with Sales on WhatsApp'}</span>
                            </a>

                            <Link
                                href={route('login')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">lock</span>
                                <span>{isRtl ? 'دخول المشتركين' : 'Subscriber Login'}</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#070A10] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#BBCAFF]/70">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center text-[#003824] font-black text-sm">
                            ن
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="font-bold text-white text-sm">نَص تيوب | NassTube</span>
                            <span className="text-[10px] text-[#4EDEA3]">من ساعات مشاهدة إلى دقائق من المذاكرة</span>
                        </div>
                    </div>

                    <p className="text-center md:text-right max-w-md">
                        {isRtl
                            ? 'منصة تساعد الطلاب والمدرسين على تفريغ المحتوى التعليمي وتلخيصه وتنظيمه وتحويله إلى مستندات قابلة للتخصيص والطباعة.'
                            : 'An AI platform empowering students and educators to transcribe, summarize, and transform video lectures into branded study memos.'}
                    </p>

                    <div className="flex items-center gap-4">
                        <a href="#plans" className="hover:text-white transition-colors">{isRtl ? 'الباقات' : 'Plans'}</a>
                        <a href="#faq" className="hover:text-white transition-colors">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</a>
                        <Link href={route('login')} className="hover:text-white transition-colors">{isRtl ? 'دخول المشتركين' : 'Login'}</Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/5 text-center text-[11px] text-[#BBCAFF]/50 font-mono">
                    © {new Date().getFullYear()} NassTube. جميع الحقوق محفوظة.
                </div>
            </footer>
        </div>
    );
}
