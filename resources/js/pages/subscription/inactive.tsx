import ThemeToggle from '@/components/theme-toggle';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

interface Props {
    reason?: 'expired' | 'no_workspace';
    tenant?: {
        name: string;
        plan_name: string;
        expires_at: string;
    };
    message_ar?: string;
}

export default function SubscriptionInactive({ reason = 'expired', tenant, message_ar }: Props) {
    const isExpired = reason === 'expired';

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-[#0A0E16] text-slate-800 dark:text-[#DFE2EE] font-sans flex flex-col items-center justify-center p-6 antialiased transition-colors relative">
            <Head title="حالة الاشتراك | فرغلي" />

            {/* Top Bar with Theme Toggle */}
            <div className="absolute top-6 left-6 z-20">
                <ThemeToggle />
            </div>

            <div className="max-w-lg w-full p-8 rounded-3xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#F59E0B]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-[#F59E0B]/15 text-amber-600 dark:text-[#FFB95F] flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">
                        {isExpired ? 'history_toggle_off' : 'lock'}
                    </span>
                </div>

                <span className="text-xs font-mono text-amber-600 dark:text-[#FFB95F] font-bold uppercase tracking-wider">
                    {isExpired ? 'الاشتراك منتهي' : 'لا يوجد اشتراك نشط'}
                </span>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 mb-3">
                    {isExpired ? 'انتهت صلاحية اشتراك مساحة العمل' : 'مساحة العمل غير مفعلة'}
                </h1>

                <p className="text-sm text-slate-600 dark:text-[#BBCAFF] leading-relaxed mb-6">
                    {message_ar ||
                        (isExpired
                            ? 'لقد انتهت فترة الاشتراك المدفوع لمساحة العمل الخاصة بك. لتجديد الترخيص ومتابعة تفريغ الفيديوهات، يرجى التواصل مع إدارة المبيعات.'
                            : 'حسابك غير مرتبط بأي مساحة عمل أو ترخيص مدفوع فعال حالياً.')}
                </p>

                {tenant && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C2028] border border-slate-200 dark:border-white/5 mb-6 text-xs text-right space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-[#BBCAFF]">مساحة العمل:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{tenant.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-[#BBCAFF]">الباقة:</span>
                            <span className="text-emerald-600 dark:text-[#4EDEA3] font-bold font-mono">{tenant.plan_name}</span>
                        </div>
                        {tenant.expires_at && (
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-[#BBCAFF]">تاريخ الانتهاء:</span>
                                <span className="font-mono text-red-500 dark:text-red-400">{tenant.expires_at}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <a
                        href={`https://wa.me/201129274930?text=${encodeURIComponent('مرحباً، أرغب في تجديد اشتراك مساحة العمل في منصة فرغلي')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">chat</span>
                        <span>تواصل مع المبيعات لتجديد الترخيص</span>
                    </a>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-[#BBCAFF] transition-all cursor-pointer"
                    >
                        تسجيل الخروج والتبديل لحساب آخر
                    </Link>
                </div>
            </div>
        </div>
    );
}
