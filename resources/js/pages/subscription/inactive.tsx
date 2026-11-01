import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Clock, Lock, MessageCircle } from 'lucide-react';

interface Props {
    reason?: 'expired' | 'no_workspace';
    tenant?: {
        name: string;
        plan_name: string;
        expires_at: string;
    };
    message_ar?: string;
    message_en?: string;
}

export default function SubscriptionInactive({ reason = 'expired', tenant, message_ar, message_en }: Props) {
    const { lang, setLang, isRtl } = useLanguage();
    const isExpired = reason === 'expired';

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-6 antialiased transition-colors relative">
            <Head title={isRtl ? 'حالة الاشتراك | فرغلي' : 'Subscription Status | Farghly'} />

            {/* Top Bar with Theme Toggle & Language Toggle */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
            </div>

            <div className="max-w-lg w-full p-8 rounded-3xl bg-card border border-border shadow-xl text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
                    {isExpired ? <Clock size={36} /> : <Lock size={36} />}
                </div>

                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    {isExpired ? (isRtl ? 'الاشتراك منتهي' : 'Subscription Expired') : (isRtl ? 'لا يوجد اشتراك نشط' : 'No Active License')}
                </span>

                <h1 className="text-2xl font-extrabold text-foreground mt-2 mb-3">
                    {isExpired
                        ? (isRtl ? 'انتهت صلاحية اشتراك مساحة العمل' : 'Workspace License Has Expired')
                        : (isRtl ? 'مساحة العمل غير مفعلة' : 'Workspace Not Activated')}
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {isRtl
                        ? (message_ar || (isExpired
                            ? 'لقد انتهت فترة الاشتراك المدفوع لمساحة العمل الخاصة بك. لتجديد الترخيص ومتابعة تفريغ الفيديوهات، يرجى التواصل مع إدارة المبيعات.'
                            : 'حسابك غير مرتبط بأي مساحة عمل أو ترخيص مدفوع فعال حالياً.'))
                        : (message_en || (isExpired
                            ? 'Your paid workspace license has expired. To renew your license and continue transcribing videos, please contact our sales desk.'
                            : 'Your account is not linked to an active workspace license.'))}
                </p>

                {tenant && (
                    <div className={`p-4 rounded-xl bg-muted border border-border/50 mb-6 text-xs ${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{isRtl ? 'مساحة العمل:' : 'Workspace:'}</span>
                            <span className="font-bold text-foreground">{tenant.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{isRtl ? 'الباقة:' : 'Plan:'}</span>
                            <span className="text-primary font-bold font-mono">{tenant.plan_name}</span>
                        </div>
                        {tenant.expires_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{isRtl ? 'تاريخ الانتهاء:' : 'Expiration Date:'}</span>
                                <span className="font-mono text-red-500 dark:text-red-400">{tenant.expires_at}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <a
                        href={`https://wa.me/201129274930?text=${encodeURIComponent(isRtl ? 'مرحباً، أرغب في تجديد اشتراك مساحة العمل في منصة فرغلي' : 'Hello, I want to renew my Farghly workspace license')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all"
                    >
                        <MessageCircle size={20} />
                        <span>{isRtl ? 'تواصل مع المبيعات لتجديد الترخيص' : 'Contact Sales to Renew'}</span>
                    </a>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-xs text-muted-foreground transition-all cursor-pointer"
                    >
                        {isRtl ? 'تسجيل الخروج والتبديل لحساب آخر' : 'Log out and switch account'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
