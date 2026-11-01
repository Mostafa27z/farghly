import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    KeyRound,
    Loader2,
    Lock,
    Shield,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import React, { FormEventHandler, useRef } from 'react';

export default function Password() {
    const { isRtl } = useLanguage();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <SettingsLayout
            title={isRtl ? 'الأمان وكلمة المرور' : 'Security & Password'}
            subtitle={isRtl ? 'تحديث وتأمين كلمة المرور الخاصة بحسابك ومساحة العمل' : 'Update and secure your account credentials'}
        >
            <Head title={isRtl ? 'تغيير كلمة المرور | فرغلي' : 'Password Settings | Farghly'} />

            <div className="w-full space-y-6">
                {/* ── Security Card (Full Width) ── */}
                <div className="w-full rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                <KeyRound className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-base font-extrabold text-foreground">
                                    {isRtl ? 'تحديث كلمة المرور' : 'Update Password'}
                                </h2>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {isRtl
                                        ? 'احرص على استخدام كلمة مرور قوية ومعقدة لحماية حسابك ومحتوى محاضراتك من الوصول غير المصرح به.'
                                        : 'Ensure your account is using a long, random password to maintain the highest level of security.'}
                                </p>
                            </div>
                        </div>

                        <form id="password-form" onSubmit={updatePassword} className="space-y-6">
                            {/* Current Password Field */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password" className="text-xs font-bold text-foreground">
                                        {isRtl ? 'كلمة المرور الحالية:' : 'Current Password:'}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            type="password"
                                            className="ps-10 rounded-2xl text-xs h-11 bg-muted/20 border-border/70 focus:border-primary"
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="hidden md:flex items-center">
                                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground flex items-center gap-2.5">
                                        <Shield className="size-4 text-primary shrink-0" />
                                        <span>
                                            {isRtl
                                                ? 'يلزم إدخال كلمة المرور الحالية للتحقق من هويتك قبل تعيين كلمة جديدة.'
                                                : 'Current password verification is required before setting new credentials.'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* New Password & Confirmation Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/50">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold text-foreground">
                                        {isRtl ? 'كلمة المرور الجديدة:' : 'New Password:'}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            type="password"
                                            className="ps-10 rounded-2xl text-xs h-11 bg-muted/20 border-border/70 focus:border-primary"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-xs font-bold text-foreground">
                                        {isRtl ? 'تأكيد كلمة المرور الجديدة:' : 'Confirm New Password:'}
                                    </Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            className="ps-10 rounded-2xl text-xs h-11 bg-muted/20 border-border/70 focus:border-primary"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            {/* Password Requirements Guide */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                                <span className="text-[11px] font-bold text-foreground">
                                    {isRtl ? 'إرشادات كلمة المرور القوية:' : 'Strong Password Guidelines:'}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{isRtl ? '8 أحرف على الأقل' : 'At least 8 characters'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{isRtl ? 'مزيج من أحرف وأرقام' : 'Letters and numbers'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{isRtl ? 'رموز خاصة (!@#$)' : 'Special symbols (!@#$)'}</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Integrated Bottom Action Footer */}
                    <div className="border-t border-border/70 bg-muted/20 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-[11px] text-muted-foreground">
                            {isRtl
                                ? 'يتم تحديث كلمة المرور وتأمين حسابك مباشرة فور الضغط على حفظ.'
                                : 'Your credentials will be updated immediately upon saving.'}
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
                                    <span>{isRtl ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully'}</span>
                                </span>
                            </Transition>

                            <Button
                                type="submit"
                                form="password-form"
                                disabled={processing}
                                className="rounded-2xl px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer shadow-md shadow-primary/20"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>{isRtl ? 'جارٍ التحديث...' : 'Updating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="size-3.5" />
                                        <span>{isRtl ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
