import ThemeToggle from '@/components/theme-toggle';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

interface Props {
    title?: string;
}

export default function StaffHeader({ title }: Props) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth?.is_super_admin || auth?.user?.system_role === 'super_admin';
    const isSales = auth?.is_sales || auth?.user?.system_role === 'sales';

    return (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-3.5 shadow-sm dark:shadow-lg transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Brand & Main Staff Nav */}
                <div className="flex flex-wrap items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <span className="material-symbols-outlined text-[#003824] text-xl font-bold">admin_panel_settings</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">فرغلي</span>
                            <span className="text-[10px] text-emerald-600 dark:text-[#4EDEA3] font-mono font-bold">بوابة الإدارة والمبيعات</span>
                        </div>
                    </Link>

                    <div className="h-5 w-[1px] bg-slate-300 dark:bg-white/20 hidden lg:block" />

                    {/* Navigation Items */}
                    <nav className="flex flex-wrap items-center gap-1.5 text-xs">
                        {isSuperAdmin && (
                            <>
                                <Link
                                    href={route('admin.dashboard')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                        route().current('admin.dashboard')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    نظرة عامة
                                </Link>

                                <Link
                                    href={route('admin.performance')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                        route().current('admin.performance')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    أداء المبيعات
                                </Link>

                                <Link
                                    href={route('admin.sales-team.index')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                        route().current('admin.sales-team.*')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    فريق المبيعات
                                </Link>

                                <Link
                                    href={route('admin.audit-logs')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                        route().current('admin.audit-logs')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    سجل العمليات
                                </Link>
                            </>
                        )}

                        {/* Available to both Sales & Super Admin */}
                        <Link
                            href={route('sales.index')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                                route().current('sales.*')
                                    ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                    : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">point_of_sale</span>
                            <span>العملاء والتجديد</span>
                        </Link>
                    </nav>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 text-xs">
                    {/* Switch back to transcription studio ONLY for Super Admin */}
                    {isSuperAdmin && (
                        <Link
                            href={route('dashboard')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-medium transition-all flex items-center gap-1.5 border border-slate-200 dark:border-transparent"
                        >
                            <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-[#4EDEA3]">graphic_eq</span>
                            <span>استوديو التفريغ (تجريبي)</span>
                        </Link>
                    )}

                    {/* Theme Toggle Button */}
                    <ThemeToggle />

                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10">
                        <span className="text-slate-800 dark:text-white font-bold">{auth.user?.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-100 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#4EDEA3] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                                {isSuperAdmin ? 'shield_person' : 'payments'}
                            </span>
                            <span>{isSuperAdmin ? 'مدير عام' : 'مبيعات ومالية'}</span>
                        </span>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-slate-500 hover:text-slate-900 dark:text-[#BBCAFF] dark:hover:text-white text-xs transition-colors cursor-pointer"
                    >
                        تسجيل الخروج
                    </Link>
                </div>
            </div>
        </header>
    );
}
