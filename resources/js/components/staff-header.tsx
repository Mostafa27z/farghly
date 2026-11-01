import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Link, usePage } from '@inertiajs/react';
import { Activity, DollarSign, Receipt, ShieldCheck } from 'lucide-react';
import React from 'react';

interface Props {
    title?: string;
}

export default function StaffHeader({ title }: Props) {
    const { auth } = usePage().props as any;
    const { lang, setLang, isRtl } = useLanguage();
    const isSuperAdmin = auth?.is_super_admin || auth?.user?.system_role === 'super_admin';

    return (
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
                {/* Brand & Main Staff Nav */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-3 sm:gap-5">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="size-8 sm:size-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 shrink-0 group-hover:scale-105 transition-all">
                                <ShieldCheck className="size-4 sm:size-5 text-primary-foreground stroke-[2.2]" />
                            </div>
                            <div className="flex flex-col text-start">
                                <span className="font-extrabold text-sm sm:text-base text-foreground leading-tight">{isRtl ? 'فرغلي' : 'Farghly'}</span>
                                <span className="text-[9px] sm:text-[10px] text-primary font-mono font-bold tracking-wider">{isRtl ? 'بوابة الإدارة والمبيعات' : 'MANAGEMENT PORTAL'}</span>
                            </div>
                        </Link>

                        <div className="lg:hidden flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageToggle />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-[11px] text-muted-foreground hover:text-destructive font-bold transition-colors cursor-pointer px-1 py-0.5"
                            >
                                {isRtl ? 'خروج' : 'Logout'}
                            </Link>
                        </div>
                    </div>

                    <div className="h-4 w-px bg-border hidden lg:block" />

                    {/* Navigation Items */}
                    <nav className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                        {isSuperAdmin && (
                            <>
                                <Link
                                    href={route('admin.dashboard')}
                                    className={`nav-link-animated px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.dashboard')
                                            ? 'text-primary active'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isRtl ? 'نظرة عامة' : 'Overview'}
                                </Link>

                                <Link
                                    href={route('admin.performance')}
                                    className={`nav-link-animated px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.performance')
                                            ? 'text-primary active'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isRtl ? 'أداء المبيعات' : 'Sales Analytics'}
                                </Link>

                                <Link
                                    href={route('admin.sales-team.index')}
                                    className={`nav-link-animated px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.sales-team.*')
                                            ? 'text-primary active'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isRtl ? 'فريق المبيعات' : 'Sales Team'}
                                </Link>

                                <Link
                                    href={route('admin.audit-logs')}
                                    className={`nav-link-animated px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.audit-logs')
                                            ? 'text-primary active'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isRtl ? 'سجل العمليات' : 'Audit Logs'}
                                </Link>
                            </>
                        )}

                        {/* Available to both Sales & Super Admin */}
                        <Link
                            href={route('sales.index')}
                            className={`nav-link-animated px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                                route().current('sales.*')
                                    ? 'text-primary active'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Receipt className="size-3.5" />
                            <span>{isRtl ? 'العملاء والتجديد' : 'Clients & Renewals'}</span>
                        </Link>
                    </nav>
                </div>

                {/* Right controls */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-3 text-xs w-full lg:w-auto">
                    {/* Switch back to transcription studio ONLY for Super Admin */}
                    {isSuperAdmin && (
                        <Link
                            href={route('dashboard')}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted hover:bg-secondary text-foreground font-medium transition-all flex items-center gap-1 sm:gap-1.5 border border-border text-[11px] sm:text-xs"
                        >
                            <Activity className="size-3.5 text-primary" />
                            <span className="hidden sm:inline">{isRtl ? 'استوديو التفريغ' : 'Studio'}</span>
                            <span className="sm:hidden">{isRtl ? 'الاستوديو' : 'Studio'}</span>
                        </Link>
                    )}

                    <div className="hidden lg:flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border">
                        <span className="text-foreground font-bold text-[11px] sm:text-xs truncate max-w-[100px] sm:max-w-none">{auth.user?.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 whitespace-nowrap">
                            {isSuperAdmin ? <ShieldCheck className="size-3" /> : <DollarSign className="size-3" />}
                            <span>{isSuperAdmin ? (isRtl ? 'مدير عام' : 'Super Admin') : (isRtl ? 'مبيعات' : 'Sales')}</span>
                        </span>
                    </div>

                    <div className="hidden lg:block">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
                        >
                            {isRtl ? 'تسجيل الخروج' : 'Log out'}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
