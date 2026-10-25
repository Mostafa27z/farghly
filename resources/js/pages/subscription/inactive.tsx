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
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans flex items-center justify-center p-6 antialiased">
            <Head title="حالة الاشتراك | نَص تيوب" />

            <div className="max-w-lg w-full p-8 rounded-3xl bg-[#141822] border border-white/10 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#F59E0B]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/15 text-[#FFB95F] flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">
                        {isExpired ? 'history_toggle_off' : 'lock'}
                    </span>
                </div>

                <span className="text-xs font-mono text-[#FFB95F] font-bold uppercase tracking-wider">
                    {isExpired ? 'الاشتراك منتهي' : 'لا يوجد اشتراك نشط'}
                </span>

                <h1 className="text-2xl font-extrabold text-white mt-2 mb-3">
                    {isExpired ? 'انتهت صلاحية اشتراك مساحة العمل' : 'مساحة العمل غير مفعلة'}
                </h1>

                <p className="text-sm text-[#BBCAFF] leading-relaxed mb-6">
                    {message_ar ||
                        (isExpired
                            ? 'لقد انتهت فترة الاشتراك المدفوع لمساحة العمل الخاصة بك. لتجديد الترخيص ومتابعة تفريغ الفيديوهات، يرجى التواصل مع إدارة المبيعات.'
                            : 'حسابك غير مرتبط بأي مساحة عمل أو ترخيص مدفوع فعال حالياً.')}
                </p>

                {tenant && (
                    <div className="p-4 rounded-xl bg-[#1C2028] border border-white/5 mb-6 text-xs text-right space-y-2">
                        <div className="flex justify-between">
                            <span className="text-[#BBCAFF]">مساحة العمل:</span>
                            <span className="font-bold text-white">{tenant.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#BBCAFF]">الباقة:</span>
                            <span className="text-[#4EDEA3] font-bold font-mono">{tenant.plan_name}</span>
                        </div>
                        {tenant.expires_at && (
                            <div className="flex justify-between">
                                <span className="text-[#BBCAFF]">تاريخ الانتهاء:</span>
                                <span className="font-mono text-red-400">{tenant.expires_at}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <a
                        href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%85%D8%B3%D8%A7%D8%AD%D8%A9%20%D8%A7%D9%84%D8%B9%D9%85%D9%84%20%D9%81%D9%8A%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
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
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#BBCAFF] transition-all cursor-pointer"
                    >
                        تسجيل الخروج والتبديل لحساب آخر
                    </Link>
                </div>
            </div>
        </div>
    );
}
