import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
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
            title="تأكيد كلمة المرور"
            description="هذه منطقة آمنة ومحمية من التطبيق. يرجى تأكيد كلمة المرور الخاصة بك للمتابعة."
        >
            <Head title="تأكيد كلمة المرور | فرغلي" />

            <form onSubmit={submit} className="flex flex-col gap-5 text-right">
                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-[#DFE2EE]">
                        كلمة المرور <span className="text-emerald-600 dark:text-[#4EDEA3] font-mono text-[11px]">/ Password</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        autoFocus
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F131C] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                    />
                    <InputError message={errors.password} />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            <span>جاري التحقق...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">security</span>
                            <span>تأكيد المتابعة</span>
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}
