import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, LogIn, Mail } from 'lucide-react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { isRtl } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title={isRtl ? 'تسجيل دخول المشتركين' : 'Subscriber Sign In'}
            description={
                isRtl
                    ? 'أدخل بيانات اعتماد حسابك للوصول إلى مساحة عملك ومتابعة تفريغ وتلخيص الفيديوهات.'
                    : 'Enter your credentials to access your workspace and manage video transcription and study memos.'
            }
            badgeText={isRtl ? 'بوابة المشتركين والمؤسسات' : 'Subscriber & Institutional Portal'}
        >
            <Head title={isRtl ? 'دخول المشتركين | فرغلي' : 'Sign In | Farghly'} />

            {status && (
                <div className="mb-5 text-center text-xs font-mono font-medium text-primary bg-primary/10 p-3 rounded-xl border border-primary/25">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-5 text-start" onSubmit={submit}>
                {/* 1. Email Field */}
                <FormInput
                    id="email"
                    type="email"
                    label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                    icon={Mail}
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="name@company.com"
                    error={errors.email}
                />

                {/* 2. Password Field with Lock icon & Eye toggle */}
                <FormInput
                    id="password"
                    label={isRtl ? 'كلمة المرور' : 'Password'}
                    isPassword
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
                />

                {/* 3. Remember Me Checkbox & Forgot Password Link */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="size-4 rounded-md border-border text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                        />
                        <label htmlFor="remember" className="text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                            {isRtl ? 'تذكر تسجيل الدخول' : 'Remember me'}
                        </label>
                    </div>

                    {canResetPassword && (
                        <TextLink
                            href={route('password.request')}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium hover:underline"
                            tabIndex={5}
                        >
                            {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                        </TextLink>
                    )}
                </div>

                {/* 4. Submit CTA Button */}
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    tabIndex={4}
                    className="w-full mt-2 shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري تسجيل الدخول...' : 'Signing in...'}</span>
                        </>
                    ) : (
                        <>
                            <LogIn className="size-4" />
                            <span>{isRtl ? 'تسجيل الدخول للمساحة' : 'Sign in to Workspace'}</span>
                        </>
                    )}
                </Button>

                {/* 5. Sales Inquiry Footer */}
                <div className="mt-3 pt-5 border-t border-border text-center text-xs text-muted-foreground">
                    <span>{isRtl ? 'ليس لدى مؤسستك اشتراك مفعل؟ ' : 'No active workspace subscription? '}</span>
                    <a
                        href="https://wa.me/201129274930?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%81%D8%B1%D8%BA%D9%84%D9%8A%20AI"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-bold hover:underline ms-1"
                    >
                        {isRtl ? 'طلب اشتراك جديد' : 'Inquire via WhatsApp'}
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
}
