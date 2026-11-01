import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { KeyRound, Loader2, Mail } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { isRtl } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={isRtl ? 'تعيين كلمة المرور الجديدة' : 'Set New Password'}
            description={
                isRtl
                    ? 'أدخل كلمة المرور الجديدة لتأمين حسابك ومتابعة الدخول لمساحة العمل.'
                    : 'Enter your new password to secure your account and access your workspace.'
            }
            badgeText={isRtl ? 'تحديث الأمان' : 'Security Update'}
        >
            <Head title={isRtl ? 'إعادة تعيين كلمة المرور | فرغلي' : 'Reset Password | Farghly'} />

            <form onSubmit={submit} className="flex flex-col gap-4 text-start">
                {/* 1. Readonly Email */}
                <FormInput
                    id="email"
                    type="email"
                    name="email"
                    label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                    icon={Mail}
                    value={data.email}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed opacity-80"
                    error={errors.email}
                />

                {/* 2. New Password */}
                <FormInput
                    id="password"
                    label={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                    isPassword
                    required
                    autoFocus
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
                    disabled={processing}
                />

                {/* 3. Confirm Password */}
                <FormInput
                    id="password_confirmation"
                    label={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    isPassword
                    required
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password_confirmation}
                    disabled={processing}
                />

                {/* 4. Submit CTA */}
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full mt-3 shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري حفظ كلمة المرور...' : 'Saving password...'}</span>
                        </>
                    ) : (
                        <>
                            <KeyRound className="size-4" />
                            <span>{isRtl ? 'تحديث كلمة المرور والدخول' : 'Update Password & Sign In'}</span>
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
