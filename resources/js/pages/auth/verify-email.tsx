import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="تأكيد البريد الإلكتروني"
            description="شكراً لانضمامك! يرجى التحقق من صندوق الوارد الخاص بك والنقر على الرابط المرسل لتفعيل حسابك بالكامل."
        >
            <Head title="تأكيد البريد الإلكتروني | نَص تيوب" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-xs font-mono text-[#4EDEA3] bg-[#10B981]/10 p-3 rounded-xl border border-[#10B981]/30">
                    تم إرسال رابط تأكيد جديد بنجاح إلى عنوان بريدك الإلكتروني.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4 text-center">
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
                            <span className="material-symbols-outlined text-lg">send</span>
                            <span>إعادة إرسال رابط التأكيد</span>
                        </>
                    )}
                </button>

                <div className="pt-4 border-t border-white/10">
                    <TextLink href={route('logout')} method="post" as="button" className="text-xs text-[#BBCAFF] hover:text-white transition-colors">
                        تسجيل الخروج
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
