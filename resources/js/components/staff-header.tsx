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
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-sm dark:shadow-lg transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Brand & Main Staff Nav */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-3 sm:gap-6">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                                <span className="material-symbols-outlined text-[#003824] text-lg sm:text-xl font-bold">admin_panel_settings</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">فرغلي</span>
                                <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-[#4EDEA3] font-mono font-bold">بوابة الإدارة والمبيعات</span>
                            </div>
                        </Link>

                        <div className="lg:hidden flex items-center gap-2">
                            <ThemeToggle />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-[11px] text-slate-500 hover:text-red-500 font-bold transition-colors cursor-pointer px-1 py-0.5"
                            >
                                خروج
                            </Link>
                        </div>
                    </div>

                    <div className="h-5 w-[1px] bg-slate-300 dark:bg-white/20 hidden lg:block" />

                    {/* Navigation Items */}
                    <nav className="flex items-center gap-1 sm:gap-1.5 text-xs overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                        {isSuperAdmin && (
                            <>
                                <Link
                                    href={route('admin.dashboard')}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.dashboard')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    نظرة عامة
                                </Link>

                                <Link
                                    href={route('admin.performance')}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.performance')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    أداء المبيعات
                                </Link>

                                <Link
                                    href={route('admin.sales-team.index')}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                                        route().current('admin.sales-team.*')
                                            ? 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30 shadow-sm'
                                            : 'text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    فريق المبيعات
                                </Link>

                                <Link
                                    href={route('admin.audit-logs')}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
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
                            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
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
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-3 text-xs w-full lg:w-auto">
                    {/* Switch back to transcription studio ONLY for Super Admin */}
                    {isSuperAdmin && (
                        <Link
                            href={route('dashboard')}
                            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-medium transition-all flex items-center gap-1 sm:gap-1.5 border border-slate-200 dark:border-transparent text-[11px] sm:text-xs"
                        >
                            <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-[#4EDEA3]">graphic_eq</span>
                            <span className="hidden sm:inline">استوديو التفريغ (تجريبي)</span>
                            <span className="sm:hidden">الاستوديو</span>
                        </Link>
                    )}

                    <div className="hidden lg:block">
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10">
                        <span className="text-slate-800 dark:text-white font-bold text-[11px] sm:text-xs truncate max-w-[100px] sm:max-w-none">{auth.user?.name}</span>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold font-mono uppercase bg-emerald-100 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#4EDEA3] flex items-center gap-0.5 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[11px] sm:text-[12px]">
                                {isSuperAdmin ? 'shield_person' : 'payments'}
                            </span>
                            <span>{isSuperAdmin ? 'مدير عام' : 'مبيعات'}</span>
                        </span>
                    </div>

                    <div className="hidden lg:block">
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
            </div>
        </header>
    );
}
