import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/layouts/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, Mail, User, UserPlus } from 'lucide-react';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

export default function Register() {
    const { isRtl } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={isRtl ? 'إنشاء حساب عضو جديد' : 'Create New Account'}
            description={
                isRtl
                    ? 'أدخل بياناتك للانضمام إلى مساحة عمل مؤسستك وبدء تفريغ المحتوى.'
                    : 'Enter your details to join your workspace and start transcribing lectures.'
            }
            badgeText={isRtl ? 'تسجيل عضو جديد' : 'New Member Registration'}
        >
            <Head title={isRtl ? 'تسجيل حساب جديد | فرغلي' : 'Register | Farghly'} />

            <form className="flex flex-col gap-4 text-start" onSubmit={submit}>
                {/* 1. Full Name */}
                <FormInput
                    id="name"
                    type="text"
                    label={isRtl ? 'الاسم الكامل' : 'Full Name'}
                    icon={User}
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    disabled={processing}
                    placeholder={isRtl ? 'مثال: د. محمد أحمد' : 'e.g. Dr. John Doe'}
                    error={errors.name}
                />

                {/* 2. Email */}
                <FormInput
                    id="email"
                    type="email"
                    label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                    icon={Mail}
                    required
                    tabIndex={2}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    disabled={processing}
                    placeholder="name@company.com"
                    error={errors.email}
                />

                {/* 3. Password */}
                <FormInput
                    id="password"
                    label={isRtl ? 'كلمة المرور' : 'Password'}
                    isPassword
                    required
                    tabIndex={3}
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    disabled={processing}
                    placeholder="••••••••"
                    error={errors.password}
                />

                {/* 4. Password Confirmation */}
                <FormInput
                    id="password_confirmation"
                    label={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    isPassword
                    required
                    tabIndex={4}
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    disabled={processing}
                    placeholder="••••••••"
                    error={errors.password_confirmation}
                />

                {/* 5. Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    tabIndex={5}
                    className="w-full mt-3 shadow-lg shadow-primary/25"
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
                        </>
                    ) : (
                        <>
                            <UserPlus className="size-4" />
                            <span>{isRtl ? 'تأكيد وإنشاء الحساب' : 'Create Account'}</span>
                        </>
                    )}
                </Button>

                {/* 6. Footer Link */}
                <div className="mt-2 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                    <span>{isRtl ? 'لديك حساب مفعل بالفعل؟ ' : 'Already have an active account? '}</span>
                    <TextLink href={route('login')} className="text-primary font-bold hover:underline ms-1" tabIndex={6}>
                        {isRtl ? 'تسجيل الدخول' : 'Sign in'}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
