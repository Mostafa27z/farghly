import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    badgeText?: string;
    badgeTextEn?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    titleEn,
    description,
    descriptionEn,
    badgeText = 'بوابة المشتركين والمؤسسات',
    badgeTextEn = 'Subscriber & Institutional Portal',
}: AuthLayoutProps) {
    const { lang, setLang, isRtl } = useLanguage();

    const displayedTitle = isRtl ? title : (titleEn || title);
    const displayedDescription = isRtl ? description : (descriptionEn || description);
    const displayedBadge = isRtl ? badgeText : badgeTextEn;

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans antialiased selection:bg-primary selection:text-primary-foreground transition-colors"
        >
            {/* Top Navigation Bar */}
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
                <Link href={route('home')} className="flex items-center gap-3 group">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
                        <BookOpen className="size-5 text-primary-foreground stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col text-start">
                        <span className="font-extrabold text-base text-foreground tracking-tight leading-tight">
                            {isRtl ? 'فرغلي' : 'Farghly'}
                        </span>
                        <span className="text-[10px] text-primary tracking-widest font-mono font-bold uppercase">
                            FARGHLY AI
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageToggle />

                    <Link
                        href={route('home')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium px-2.5 py-1.5 rounded-xl hover:bg-muted"
                    >
                        <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
                        {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                    </Link>
                </div>
            </header>

            {/* Centered Auth Card */}
            <div className="w-full max-w-[480px] mx-auto my-8 relative z-10">
                <div className="p-8 sm:p-10 rounded-3xl bg-card border border-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Top Accent Gradient Border */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <div className="relative">
                        {/* Status Micro-Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[11px] font-mono font-bold text-primary">
                                {displayedBadge}
                            </span>
                        </div>

                        {/* Title and Description */}
                        <div className="text-start mb-8">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2.5 leading-snug">
                                {displayedTitle}
                            </h1>
                            {displayedDescription && (
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {displayedDescription}
                                </p>
                            )}
                        </div>

                        {/* Injected Form Component */}
                        {children}
                    </div>
                </div>

                {/* Trust & Security Badge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>{isRtl ? 'اتصال مشفر وآمن بالكامل 256-bit SSL' : 'End-to-end 256-bit encrypted'}</span>
                </div>
            </div>

            {/* Page Footer */}
            <footer className="w-full max-w-5xl mx-auto py-3 text-center relative z-10">
                <p className="text-xs text-muted-foreground font-mono">
                    © {new Date().getFullYear()} فرغلي · منصة الذكاء الاصطناعي للمذكرات والتفريغ الأكاديمي
                </p>
            </footer>
        </div>
    );
}
