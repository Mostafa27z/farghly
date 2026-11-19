import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Head } from '@inertiajs/react';
import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
    message: string;
}

export default function ScopedUploadInvalid({ message }: Props) {
    const { isRtl } = useLanguage();

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-6 antialiased transition-colors relative">
            <Head title={isRtl ? 'رابط الرفع غير صالح | فرغلي' : 'Invalid Upload Link | Farghly'} />

            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
            </div>

            <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border shadow-xl text-center relative overflow-hidden">
                <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-5">
                    <AlertCircle size={36} />
                </div>

                <h1 className="text-xl font-extrabold text-foreground mb-2">
                    {isRtl ? 'تعذر فتح صفحة الرفع' : 'Unable to Open Upload Link'}
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {message}
                </p>

                <p className="text-xs text-muted-foreground/80 mb-6">
                    {isRtl
                        ? 'يمكنك العودة إلى محادثة تيليجرام وإرسال الملف مجدداً للحصول على رابط جديد صالح لمدة 20 دقيقة.'
                        : 'Please return to Telegram and send your file again to receive a fresh 20-minute link.'}
                </p>

                <a
                    href="https://t.me"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                    <span>{isRtl ? 'العودة إلى تطبيق تيليجرام' : 'Return to Telegram'}</span>
                    <ArrowRight className="size-4 rtl:rotate-180" />
                </a>
            </div>
        </div>
    );
}
