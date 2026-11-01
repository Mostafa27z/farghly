import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, MailCheck, Send } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { isRtl } = useLanguage();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title={isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Email Address'}
            description={
                isRtl
                    ? 'شكراً لانضمامك! يرجى التحقق من صندوق الوارد الخاص بك والنقر على الرابط المرسل لتفعيل حسابك بالكامل.'
                    : 'Thanks for signing up! Please check your inbox and click the verification link to activate your account.'
            }
            badgeText={isRtl ? 'تفعيل الحساب' : 'Account Activation'}
        >
            <Head title={isRtl ? 'تأكيد البريد الإلكتروني | فرغلي' : 'Verify Email | Farghly'} />

            {status === 'verification-link-sent' && (
                <div className="mb-5 text-center text-xs font-mono font-medium text-primary bg-primary/10 p-3.5 rounded-xl border border-primary/25">
                    {isRtl
                        ? 'تم إرسال رابط تأكيد جديد بنجاح إلى عنوان بريدك الإلكتروني.'
                        : 'A fresh verification link has been sent to your email address.'}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5 text-center">
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري إرسال الرابط...' : 'Sending link...'}</span>
                        </>
                    ) : (
                        <>
                            <Send className="size-4" />
                            <span>{isRtl ? 'إعادة إرسال رابط التأكيد' : 'Resend Verification Link'}</span>
                        </>
                    )}
                </Button>

                <div className="pt-4 border-t border-border">
                    <TextLink
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                        {isRtl ? 'تسجيل الخروج' : 'Log out'}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
