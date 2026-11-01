import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { ArrowLeft, ArrowRight, Loader2, Mail, MailCheck } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { isRtl } = useLanguage();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title={isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
            description={
                isRtl
                    ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور فوراً.'
                    : 'Enter your registered email and we will send you a secure link to reset your password.'
            }
            badgeText={isRtl ? 'استعادة الحساب' : 'Account Recovery'}
        >
            <Head title={isRtl ? 'استعادة كلمة المرور | فرغلي' : 'Forgot Password | Farghly'} />

            {status && (
                <div className="mb-5 text-center text-xs font-mono font-medium text-primary bg-primary/10 p-3.5 rounded-xl border border-primary/25">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5 text-start">
                <FormInput
                    id="email"
                    type="email"
                    name="email"
                    label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                    icon={Mail}
                    required
                    autoComplete="email"
                    value={data.email}
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="name@company.com"
                    error={errors.email}
                    disabled={processing}
                />

                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full mt-1 shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري إرسال الرابط...' : 'Sending link...'}</span>
                        </>
                    ) : (
                        <>
                            <MailCheck className="size-4" />
                            <span>{isRtl ? 'إرسال رابط استعادة المرور' : 'Send Reset Link'}</span>
                        </>
                    )}
                </Button>

                <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <span>{isRtl ? 'تذكرت كلمة المرور؟ ' : 'Remember your password? '}</span>
                    <TextLink href={route('login')} className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                        <span>{isRtl ? 'العودة لتسجيل الدخول' : 'Back to sign in'}</span>
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
