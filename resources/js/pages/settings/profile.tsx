import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import SettingsLayout from '@/layouts/settings/layout';
import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Crown,
    Loader2,
    Mail,
    Save,
    Shield,
    Sparkles,
    User,
} from 'lucide-react';
import React, { FormEventHandler } from 'react';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const { isRtl } = useLanguage();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <SettingsLayout
            title={isRtl ? 'الملف الشخصي' : 'Profile Settings'}
            subtitle={isRtl ? 'إدارة بياناتك الشخصية، رتبة الحساب وخطة مساحة العمل' : 'Manage your personal details, workspace plan and permissions'}
        >
            <Head title={isRtl ? 'الملف الشخصي | فرغلي' : 'Profile Settings | Farghly'} />

            <div className="w-full space-y-6">
                {/* ── 1. Top Identity & Workspace Overview Card ── */}
                <div className="w-full rounded-2xl sm:rounded-3xl bg-card border border-border/80 p-4 sm:p-8 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 end-0 -mt-8 -me-8 size-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                        {/* Avatar & User Details */}
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border-2 border-primary/25 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-inner shrink-0">
                                {auth.user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                                        {auth.user.name}
                                    </h2>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {isRtl ? 'حساب نشط' : 'Active Account'}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {auth.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Meta Badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {auth.tenant && (
                                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border/80">
                                    <Crown className="size-4 text-primary" />
                                    <div className="flex flex-col text-start">
                                        <span className="text-[10px] text-muted-foreground font-semibold">
                                            {isRtl ? 'خطة الاشتراك' : 'Plan'}
                                        </span>
                                        <span className="text-xs font-black text-primary font-mono">
                                            {auth.tenant.plan_name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {auth.tenant?.name && (
                                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border/80">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    <div className="flex flex-col text-start">
                                        <span className="text-[10px] text-muted-foreground font-semibold">
                                            {isRtl ? 'مساحة العمل' : 'Workspace'}
                                        </span>
                                        <span className="text-xs font-bold text-foreground">
                                            {auth.tenant.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {auth.is_super_admin && (
                                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                                    <Shield className="size-4 text-amber-600 dark:text-amber-400" />
                                    <div className="flex flex-col text-start">
                                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-semibold">
                                            {isRtl ? 'الصلاحية' : 'Role'}
                                        </span>
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                            {isRtl ? 'مشرف عام النظام' : 'Super Admin'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 2. Profile Information Form Card (Full Width) ── */}
                <div className="w-full rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-8 space-y-6">
                        <div>
                            <h3 className="text-base font-extrabold text-foreground">
                                {isRtl ? 'البيانات الشخصية والحساب' : 'Personal & Account Information'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl
                                    ? 'تُستخدم هذه البيانات لتوثيق ملكية المحاضرات والمذكرات المفرغة والتواصل معك.'
                                    : 'Update your contact name and email address associated with your workspace.'}
                            </p>
                        </div>

                        <form id="profile-form" onSubmit={submit} className="space-y-6">
                            {/* 2-Column Responsive Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>{isRtl ? 'الاسم الكامل:' : 'Full Name:'}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {isRtl ? 'يظهر في المذكرات' : 'Appears on handouts'}
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="name"
                                            className="ps-10 rounded-2xl text-xs h-11 bg-muted/20 border-border/70 focus:border-primary"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder={isRtl ? 'أدخل اسمك الكامل' : 'Your full name'}
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>{isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {isRtl ? 'لتسجيل الدخول والإشعارات' : 'For login and alerts'}
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="ps-10 rounded-2xl text-xs h-11 bg-muted/20 border-border/70 focus:border-primary"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="example@domain.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            {/* Verification Warning if unverified */}
                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between flex-wrap gap-2">
                                    <span>
                                        {isRtl
                                            ? 'بريدك الإلكتروني غير مفعّل حتى الآن.'
                                            : 'Your email address is unverified.'}
                                    </span>
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="underline font-bold hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                                    >
                                        {isRtl ? 'إعادة إرسال رابط التفعيل' : 'Resend verification link'}
                                    </Link>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Integrated Bottom Action Footer */}
                    <div className="border-t border-border/70 bg-muted/20 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-[11px] text-muted-foreground">
                            {isRtl
                                ? 'يتم حفظ التغييرات وتطبيقها مباشرة على حسابك الحالي ومخرجات الطباعة.'
                                : 'Changes are saved immediately and reflected in your exports and profile.'}
                        </p>

                        <div className="flex items-center gap-3">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-bold">
                                    <CheckCircle2 className="size-4" />
                                    <span>{isRtl ? 'تم الحفظ بنجاح' : 'Saved'}</span>
                                </span>
                            </Transition>

                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={processing}
                                className="rounded-2xl px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer shadow-md shadow-primary/20"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>{isRtl ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-3.5" />
                                        <span>{isRtl ? 'حفظ التغييرات' : 'Save Changes'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── 3. Danger Zone Card (Full Width) ── */}
                <DeleteUser />
            </div>
        </SettingsLayout>
    );
}
