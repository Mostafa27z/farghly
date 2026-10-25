import ThemeToggle from '@/components/theme-toggle';
import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const [isRtl, setIsRtl] = useState(true);

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="min-h-screen bg-slate-50 dark:bg-[#0A0E16] text-slate-800 dark:text-[#DFE2EE] flex flex-col justify-between p-6 relative overflow-hidden font-sans antialiased selection:bg-[#10B981] selection:text-[#003824] transition-colors"
        >
            {/* Ambient Glows */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#10B981]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-32 right-10 w-[500px] h-[350px] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none" />

            {/* Top Navigation */}
            <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 relative z-10">
                <Link href={route('home')} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[#003824] text-2xl font-bold">graphic_eq</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight">فرغلي</span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#4EDEA3] tracking-widest font-mono font-bold uppercase">FARGHLY AI</span>
                    </div>
                </Link>

                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={() => setIsRtl(!isRtl)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:border-[#10B981]/40 transition-all cursor-pointer"
                    >
                        <span className={isRtl ? 'text-emerald-600 dark:text-[#4EDEA3] font-bold' : ''}>العربية</span>
                        <span className="text-slate-300 dark:text-white/20">|</span>
                        <span className={!isRtl ? 'text-emerald-600 dark:text-[#4EDEA3] font-bold' : ''}>EN</span>
                    </button>

                    <Link
                        href={route('home')}
                        className="text-xs text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
                        <span className="material-symbols-outlined text-sm">{isRtl ? 'arrow_back' : 'arrow_forward'}</span>
                    </Link>
                </div>
            </header>

            {/* Card Form Center */}
            <div className="w-full max-w-md mx-auto my-8 relative z-10">
                <div className="p-8 sm:p-10 rounded-3xl bg-white/95 dark:bg-[#141822]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative group">
                    {/* Glowing highlight border on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B981]/25 to-[#6366F1]/20 rounded-3xl blur-lg opacity-30 dark:opacity-40 group-hover:opacity-60 transition duration-500 pointer-events-none" />

                    <div className="relative">
                        {/* Members Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#4EDEA3] animate-pulse" />
                            <span className="text-[11px] font-mono text-slate-600 dark:text-[#BBCAFF]">
                                {isRtl ? 'بوابة المشتركين والمؤسسات' : 'Subscriber Portal'}
                            </span>
                        </div>

                        {/* Title and Description */}
                        <div className="text-right mb-8">
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-slate-600 dark:text-[#BBCAFF] leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Injected Form */}
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full max-w-6xl mx-auto py-4 text-center relative z-10">
                <p className="text-xs text-slate-500 dark:text-[#BBCAFF]/60 font-mono">
                    © {new Date().getFullYear()} Farghly AI. جميع الحقوق محفوظة للطلاب والمعلمين وصناع المحتوى.
                </p>
            </footer>
        </div>
    );
}
