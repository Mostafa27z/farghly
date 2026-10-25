import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
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
            title="إنشاء حساب عضو جديد"
            description="أدخل بياناتك للانضمام إلى مساحة عمل مؤسستك وبدء تفريغ المحتوى."
        >
            <Head title="تسجيل حساب جديد | نَص تيوب" />

            <form className="flex flex-col gap-4 text-right" onSubmit={submit}>
                <div className="space-y-3.5">
                    {/* Name */}
                    <div className="space-y-1">
                        <label htmlFor="name" className="block text-xs font-bold text-[#DFE2EE]">
                            الاسم الكامل <span className="text-[#4EDEA3] font-mono text-[11px]">/ Full Name</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="محمد علي"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-sans text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-bold text-[#DFE2EE]">
                            البريد الإلكتروني <span className="text-[#4EDEA3] font-mono text-[11px]">/ Email</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-bold text-[#DFE2EE]">
                            كلمة المرور <span className="text-[#4EDEA3] font-mono text-[11px]">/ Password</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label htmlFor="password_confirmation" className="block text-xs font-bold text-[#DFE2EE]">
                            تأكيد كلمة المرور <span className="text-[#4EDEA3] font-mono text-[11px]">/ Confirm</span>
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-3 w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                <span>جاري إنشاء الحساب...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">person_add</span>
                                <span>تأكيد وإنشاء الحساب</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-[#BBCAFF]">
                    <span>لديك حساب مفعل بالفعل؟ </span>
                    <TextLink href={route('login')} className="text-[#4EDEA3] font-bold hover:underline" tabIndex={6}>
                        تسجيل الدخول
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
