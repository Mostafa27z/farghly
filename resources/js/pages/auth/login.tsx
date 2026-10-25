import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
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
            title="تسجيل دخول المشتركين"
            description="أدخل بيانات اعتماد حسابك للوصول إلى مساحة عمل مؤسستك ومتابعة تفريغ الفيديوهات."
        >
            <Head title="دخول المشتركين | نَص تيوب" />

            <form className="flex flex-col gap-5 text-right" onSubmit={submit}>
                <div className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-bold text-[#DFE2EE]">
                            البريد الإلكتروني <span className="text-[#4EDEA3] font-mono text-[11px]">/ Email</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-xs font-bold text-[#DFE2EE]">
                                كلمة المرور <span className="text-[#4EDEA3] font-mono text-[11px]">/ Password</span>
                            </label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-xs text-[#BBCAFF] hover:text-[#4EDEA3] transition-colors"
                                    tabIndex={5}
                                >
                                    نسيت كلمة المرور؟
                                </TextLink>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded bg-[#0F131C] border-white/20 text-[#10B981] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10B981]"
                        />
                        <label htmlFor="remember" className="text-xs text-[#BBCAFF] cursor-pointer select-none">
                            تذكر تسجيل الدخول على هذا الجهاز
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-3 w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                <span>جاري تسجيل الدخول...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">login</span>
                                <span>تسجيل الدخول للمساحة</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Sales Inquiry Footer */}
                <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-[#BBCAFF]">
                    <span>ليس لدى مؤسستك اشتراك مفعل؟ </span>
                    <a
                        href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%85%D8%A4%D8%B3%D8%B3%D9%8A%20%D9%81%D9%8A%20%D9%86%D9%8E%D8%B5%20%D8%AA%D9%8A%D9%88%D8%A8"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4EDEA3] font-bold hover:underline"
                    >
                        طلب اشتراك جديد
                    </a>
                </div>
            </form>

            {status && <div className="mt-4 text-center text-xs font-mono text-[#4EDEA3] bg-[#10B981]/10 p-2.5 rounded-lg border border-[#10B981]/30">{status}</div>}
        </AuthLayout>
    );
}
