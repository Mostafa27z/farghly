import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="استعادة كلمة المرور"
            description="أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور."
        >
            <Head title="استعادة كلمة المرور | نَص تيوب" />

            {status && (
                <div className="mb-4 text-center text-xs font-mono text-[#4EDEA3] bg-[#10B981]/10 p-3 rounded-xl border border-[#10B981]/30">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5 text-right">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-[#DFE2EE]">
                        البريد الإلكتروني <span className="text-[#4EDEA3] font-mono text-[11px]">/ Email</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        value={data.email}
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white font-mono text-sm placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all"
                    />
                    <InputError message={errors.email} />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            <span>جاري إرسال الرابط...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">mark_email_read</span>
                            <span>إرسال رابط استعادة المرور</span>
                        </>
                    )}
                </button>

                <div className="pt-4 border-t border-white/10 text-center text-xs text-[#BBCAFF]">
                    <span>تذكرت كلمة المرور؟ </span>
                    <TextLink href={route('login')} className="text-[#4EDEA3] font-bold hover:underline">
                        العودة لتسجيل الدخول
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
