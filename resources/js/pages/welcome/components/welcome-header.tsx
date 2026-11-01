import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    LayoutDashboard,
    Lock,
    Menu,
    Receipt,
    ShieldCheck,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    lang: 'ar' | 'en';
    setLang: (lang: 'ar' | 'en') => void;
    isRtl: boolean;
}

export default function WelcomeHeader({ lang, setLang, isRtl }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', hash);
        }
    };

    const navItems = [
        { hash: '#features', labelAr: 'المميزات', labelEn: 'Features' },
        { hash: '#for-who', labelAr: 'للطلاب والمدرسين', labelEn: 'Audience' },
        { hash: '#studio-workflow', labelAr: 'استوديو المذكرات', labelEn: 'Studio Preview' },
        { hash: '#custom-themes', labelAr: 'الهوية وقوالب الطباعة', labelEn: 'Branding & Themes' },
        { hash: '#plans', labelAr: 'باقات الاشتراك', labelEn: 'Pricing' },
        { hash: '#faq', labelAr: 'الأسئلة الشائعة', labelEn: 'FAQ' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border transition-colors">
            <div className="max-w-[1400px] mx-auto h-16 sm:h-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <div className="size-10 sm:size-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-all shrink-0">
                            <BookOpen className="size-5 text-primary-foreground stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col text-start">
                            <span className="font-extrabold text-base sm:text-xl text-foreground tracking-tight leading-tight">
                                {isRtl ? 'فرغلي' : 'Farghly'}
                            </span>
                            <span className="text-[10px] text-primary tracking-widest font-mono font-bold uppercase">
                                {isRtl ? 'ذكاء اصطناعي' : 'AI STUDIO'}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navItems.map((item) => (
                            <a
                                key={item.hash}
                                href={item.hash}
                                onClick={(e) => handleNavClick(e, item.hash)}
                                className="nav-link-animated text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {isRtl ? item.labelAr : item.labelEn}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Actions & Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Theme & Language Controls */}
                    <div className="hidden sm:flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    {/* Auth Status Buttons */}
                    {auth.user ? (
                        auth.is_super_admin || auth.user.system_role === 'super_admin' ? (
                            <Link href={route('admin.dashboard')}>
                                <Button size="sm">
                                    <ShieldCheck className="size-4" />
                                    <span>{isRtl ? 'لوحة الإدارة' : 'Admin'}</span>
                                </Button>
                            </Link>
                        ) : auth.is_sales || auth.user.system_role === 'sales' ? (
                            <Link href={route('sales.index')}>
                                <Button size="sm">
                                    <Receipt className="size-4" />
                                    <span>{isRtl ? 'بوابة المبيعات' : 'Sales'}</span>
                                </Button>
                            </Link>
                        ) : (
                            <Link href={route('dashboard')}>
                                <Button size="sm">
                                    <LayoutDashboard className="size-4" />
                                    <span>{isRtl ? 'مساحة العمل' : 'Workspace'}</span>
                                </Button>
                            </Link>
                        )
                    ) : (
                        <>
                            <Link href={route('login')} className="hidden sm:inline-block">
                                <Button variant="outline" size="sm">
                                    <Lock className="size-3.5" />
                                    <span>{isRtl ? 'دخول المشتركين' : 'Member Login'}</span>
                                </Button>
                            </Link>

                            <a href="#plans" onClick={(e) => handleNavClick(e, '#plans')} className="hidden sm:inline-block">
                                <Button size="sm">
                                    <span>{isRtl ? 'ابدأ الآن' : 'Get Started'}</span>
                                    {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                                </Button>
                            </a>
                        </>
                    )}

                    {/* Mobile Hamburger */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                        aria-label="القائمة"
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-card/98 backdrop-blur-xl border-b border-border px-4 py-4 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    {navItems.map((item) => (
                        <a
                            key={item.hash}
                            href={item.hash}
                            onClick={(e) => handleNavClick(e, item.hash)}
                            className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            {isRtl ? item.labelAr : item.labelEn}
                        </a>
                    ))}

                    {/* Mobile-only theme + language in drawer */}
                    <div className="flex items-center gap-2 px-3.5 pt-2 pb-1">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    {!auth.user && (
                        <Link
                            href={route('login')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block mt-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-primary bg-primary/10 border border-primary/20 text-center"
                        >
                            {isRtl ? 'دخول المشتركين' : 'Member Login'}
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}

