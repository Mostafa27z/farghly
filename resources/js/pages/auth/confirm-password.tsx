import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const { isRtl } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            description={
                isRtl
                    ? 'هذه منطقة آمنة ومحمية من التطبيق. يرجى تأكيد كلمة المرور الخاصة بك للمتابعة.'
                    : 'This is a secure area of the application. Please confirm your password before continuing.'
            }
            badgeText={isRtl ? 'تأكيد أمني' : 'Security Confirmation'}
        >
            <Head title={isRtl ? 'تأكيد كلمة المرور | فرغلي' : 'Confirm Password | Farghly'} />

            <form onSubmit={submit} className="flex flex-col gap-5 text-start">
                <FormInput
                    id="password"
                    label={isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                    isPassword
                    required
                    autoFocus
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
                    disabled={processing}
                />

                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full mt-2 shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري التحقق...' : 'Verifying...'}</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="size-4" />
                            <span>{isRtl ? 'تأكيد المتابعة' : 'Confirm & Proceed'}</span>
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
