import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ExternalLink,
    HelpCircle,
    MessageCircle,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function FaqSection({ isRtl }: Props) {
    const [openFaq, setOpenFaq] = useState<number | null>(0); // First item open by default

    const toggleFaq = (idx: number) => {
        setOpenFaq((prev) => (prev === idx ? null : idx));
    };

    const faqs = [
        {
            q: isRtl ? 'ما الفرق بين التدقيق الكامل والملخص؟' : 'What is the difference between proofreading and summary?',
            a: isRtl
                ? 'التدقيق الكامل يفرغ كل كلمة نطق بها المدرس في الفيديو مع تصحيح الأخطاء اللغوية والنحوية وتقسيم النص إلى فقرات رسمية دون اختصار. أما الملخص، فيستخرج أهم القوانين والمفاهيم والنقاط الأساسية لسرعة المراجعة.'
                : 'Proofreading keeps all dialogue word-for-word, adjusting grammar and punctuation without shortening. Summary extracts core formulas, principles, and bullet points.',
        },
        {
            q: isRtl ? 'هل ملفات الـ PDF المصدرة جاهزة للطباعة فوراً؟' : 'Are the exported PDF files ready for printing immediately?',
            a: isRtl
                ? 'نعم، تم ضبط القوالب بأبعاد ورق A4 القياسية بدقة 300 DPI مع هوامش مخصصة ومحاذاة RTL تضمن عدم تداخل النصوص عند التجليد أو الطباعة على الوجهين.'
                : 'Yes, templates are calibrated at 300 DPI for standard A4 paper with proper margins and RTL alignment suitable for double-sided commercial printing.',
        },
        {
            q: isRtl ? 'كيف يمكنني إضافة شعاري واسمي على المذكرات؟' : 'How can I add my custom branding and logo to memos?',
            a: isRtl
                ? 'من خلال شاشة «الهوية وقوالب المستندات»، يمكنك رفع صورة الشعار واختيار الألوان والخطوط المناسبة لك، وسيتم تطبيقها تلقائياً على كل ملفات PDF التي تصدرها.'
                : 'Via the Branding & Templates panel, upload your logo and choose colors. All exported PDFs will automatically carry your watermark and header.',
        },
        {
            q: isRtl ? 'كيف يتم تفعيل وتجديد الاشتراك؟' : 'How are subscriptions activated and renewed?',
            a: isRtl
                ? 'الاشتراكات تدار مباشرة عبر فريق المبيعات لضمان مرونة الدفع (تحويل بنكي، فودافون كاش، إنستاباي، باي بال)، ويتم تفعيل مساحة العمل في غضون دقائق بعد التواصل.'
                : 'Subscriptions are handled directly by our sales desk to support local transfer methods, with account activation completed in minutes.',
        },
    ];

    return (
        <section id="faq" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* 1. Left / Right Pane (7 Cols): FAQs Accordion */}
                <div className="lg:col-span-7 space-y-6 text-start">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                            <HelpCircle className="size-3.5" />
                            <span>{isRtl ? 'إجابات على استفساراتك' : 'FAQ'}</span>
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                            {isRtl ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                            {isRtl
                                ? 'كل ما تحتاج معرفته حول تفريغ المحتوى، التدقيق اللغوي، والطباعة التجارية.'
                                : 'Everything you need to know about AI transcription, linguistic proofreading, and commercial printing.'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;

                            return (
                                <div
                                    key={idx}
                                    className={`rounded-2xl bg-card border transition-all duration-200 shadow-2xs overflow-hidden ${
                                        isOpen
                                            ? 'border-primary/40 ring-2 ring-primary/10 shadow-xs'
                                            : 'border-border hover:border-primary/30'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-4 sm:p-5 text-start flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                                    >
                                        <span className="leading-snug">{faq.q}</span>
                                        <ChevronDown
                                            className={`size-4 text-primary shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 sm:px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3.5 animate-in fade-in duration-150">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Side-by-Side CTA Card (5 Cols): Next to FAQ on desktop */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border/90 shadow-sm flex flex-col justify-between text-start relative overflow-hidden">
                        {/* Decorative Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                        <div>
                            {/* Icon & Badge */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                                    <Sparkles className="size-6" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono font-bold">
                                    FAST ACTIVATION
                                </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-3">
                                {isRtl ? 'جاهز لإنتاج مذكراتك التعليمية بذكاء؟' : 'Ready to Transform Your Course Notes?'}
                            </h3>

                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                                {isRtl
                                    ? 'انضم اليوم إلى مئات المدرسين والطلاب الذين وفروا مئات الساعات في تفريغ وتلخيص المحتوى التعليمي بأعلى جودة مطبعية.'
                                    : 'Join hundreds of teachers and students saving countless hours with automated transcription and print-ready notes.'}
                            </p>

                            {/* Trust Checklist */}
                            <ul className="space-y-2.5 text-xs text-foreground mb-8">
                                <li className="flex items-center gap-2">
                                    <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-2.5 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'تفعيل فوري خلال دقائق بالتنسيق المباشر' : 'Instant activation via direct desk'}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-2.5 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'مذكرات 300 DPI جاهزة للمطابع والسناتر' : '300 DPI print-ready handouts'}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                        <Check className="size-2.5 stroke-[3]" />
                                    </div>
                                    <span>{isRtl ? 'دعم فودافون كاش وإنستاباي والتحويلات' : 'Local payment methods supported'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-border">
                            <a
                                href={`https://wa.me/201129274930?text=${encodeURIComponent(
                                    isRtl ? 'مرحباً، أرغب في تجربة منصة فرغلي والاستفسار عن باقات الاشتراك' : 'Hello, I want to try Farghly platform',
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full"
                            >
                                <Button size="lg" className="w-full shadow-lg shadow-primary/20">
                                    <span>{isRtl ? 'تواصل معنا وابدأ الآن' : 'Contact Us & Start Now'}</span>
                                    <ExternalLink className="size-4" />
                                </Button>
                            </a>

                            <Link href={route('login')} className="w-full">
                                <Button variant="outline" size="lg" className="w-full">
                                    <span>{isRtl ? 'دخول المشتركين' : 'Member Login'}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
