import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
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
            title="تعيين كلمة المرور الجديدة"
            description="أدخل كلمة المرور الجديدة لتأمين حسابك ومتابعة الدخول لمساحة العمل."
        >
            <Head title="إعادة تعيين كلمة المرور | نَص تيوب" />

            <form onSubmit={submit} className="flex flex-col gap-4 text-right">
                <div className="space-y-3.5">
                    {/* Email */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-bold text-[#DFE2EE]">
                            البريد الإلكتروني <span className="text-[#4EDEA3] font-mono text-[11px]">/ Email</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            readOnly
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C]/60 border border-white/5 text-white/50 font-mono text-sm cursor-not-allowed outline-none"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-bold text-[#DFE2EE]">
                            كلمة المرور الجديدة <span className="text-[#4EDEA3] font-mono text-[11px]">/ New Password</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            autoFocus
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm */}
                    <div className="space-y-1">
                        <label htmlFor="password_confirmation" className="block text-xs font-bold text-[#DFE2EE]">
                            تأكيد كلمة المرور <span className="text-[#4EDEA3] font-mono text-[11px]">/ Confirm</span>
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="mt-3 w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                <span>جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">lock_reset</span>
                                <span>حفظ وتعيين كلمة المرور</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
