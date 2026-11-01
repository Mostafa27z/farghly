import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function PricingSection({ isRtl }: Props) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    return (
        <section id="plans" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-28 scroll-mt-24">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-14">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Sparkles className="size-3.5" />
                    <span>{isRtl ? 'باقات مرنة ومدروسة' : 'Flexible Subscriptions'}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    {isRtl ? 'اختر الباقة المناسبة لاحتياجاتك التعليمية' : 'Choose the Plan that Powers Your Teaching & Learning'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                    {isRtl ? '✦ تفعيل فوري ومرونة في الدفع بالتنسيق المباشر مع إدارة المبيعات' : '✦ Direct instant activation via dedicated sales desk'}
                </p>

                {/* Billing Cycle Switcher */}
                <div className="flex items-center justify-center gap-3 mt-8">
                    <div className="p-1 rounded-full bg-card border border-border inline-flex items-center shadow-xs">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                billingCycle === 'monthly'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {isRtl ? 'اشتراك شهري' : 'Monthly'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('annual')}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                billingCycle === 'annual'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>{isRtl ? 'اشتراك سنوي' : 'Annual'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-mono font-extrabold">
                                {isRtl ? 'خصم 20%' : 'Save 20%'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch text-start">
                {/* Plan 1: Student Pack */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border flex flex-col justify-between glow-card shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                {isRtl ? 'باقة الطالب' : 'Student Pack'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                {isRtl ? 'مذاكرة وامتحانات' : 'Study'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
                            {isRtl ? 'رصيد المذاكرة الفردي' : 'Study & Revision'}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'للطلاب الذين يريدون تفريغ محاضراتهم ومراجعة أهم القوانين ليلة الامتحان بتركيز تام.'
                                : 'For students wanting organized lecture transcripts and summaries.'}
                        </p>

                        <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 mb-6 flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">{isRtl ? 'نظام الباقة:' : 'Quota:'}</span>
                            <span className="text-sm font-bold text-foreground font-mono">
                                {billingCycle === 'annual' ? (isRtl ? 'رصيد سنوي مفتوح' : 'Annual Quota') : (isRtl ? 'رصيد شهري متجدد' : 'Monthly Quota')}
                            </span>
                        </div>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-foreground/90 mb-8">
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تفريغ كامل للمحاضرات بدقة زمنية متزامنة' : 'Word-level lecture transcription'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تلخيص ذكي واستخراج القوانين والمعادلات' : 'AI formulas and exam review'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تصدير مستندات PDF مهيأة للموبايل والتابلت' : 'Mobile-friendly study PDFs'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'مكتبة سحابية لتنظيم محاضرات كل مادة' : 'Cloud study repository'}</span>
                            </li>
                        </ul>
                    </div>

                    <a
                        href={`https://wa.me/201129274930?text=${encodeURIComponent(
                            isRtl ? 'مرحباً، أرغب في الاشتراك في باقة الطالب في منصة فرغلي' : 'Hello, I want to subscribe to Student Pack on Farghly',
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block"
                    >
                        <Button variant="outline" className="w-full py-3">
                            {isRtl ? 'اشترك في باقة الطالب' : 'Get Student Pack'}
                        </Button>
                    </a>
                </div>

                {/* Plan 2: Teacher Pro (Featured) */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border-2 border-primary relative shadow-2xl shadow-primary/15 ring-2 ring-primary/20 lg:scale-105 flex flex-col justify-between">
                    <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-primary-foreground font-mono text-[11px] font-extrabold uppercase flex items-center gap-1.5 shadow-md shadow-primary/30">
                        <Sparkles className="size-3.5" />
                        <span>{isRtl ? 'الأكثر طلباً للمدرسين والسناتر' : 'Most Popular'}</span>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <span className="text-xs text-primary uppercase font-bold tracking-wider">
                                {isRtl ? 'باقة المعلم المحترف' : 'Teacher Pro'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                {isRtl ? 'طباعة وهوية' : 'Branded A4'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
                            {isRtl ? 'إعداد وطباعة المذكرات' : 'Full Course Builder'}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'للمعلمين وأصحاب القنوات الذين يريدون تحويل شروحاتهم إلى مذكرات مطبوعة بهويتهم وشعارهم.'
                                : 'For educators producing branded, print-ready course notes.'}
                        </p>

                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 mb-6 flex items-baseline justify-between">
                            <span className="text-xs font-bold text-primary">{isRtl ? 'مزايا متقدمة:' : 'Included:'}</span>
                            <span className="text-xs font-bold text-primary font-mono">
                                300 DPI + Word + Watermark
                            </span>
                        </div>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-foreground mb-8">
                            <li className="flex items-start gap-2.5 font-bold">
                                <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'شعار واسم المعلم على كامل صفحات المذكرة' : 'Teacher branding & logo watermark'}</span>
                            </li>
                            <li className="flex items-start gap-2.5 font-medium">
                                <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'رصيد مضاعف لتفريغ عشرات الساعات شهرياً' : 'Expanded quota for dozens of hours'}</span>
                            </li>
                            <li className="flex items-start gap-2.5 font-medium">
                                <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تصدير PDF بدقة 300 DPI جاهزة للمطبعة فوراً' : 'Commercial print-ready 300 DPI PDF'}</span>
                            </li>
                            <li className="flex items-start gap-2.5 font-medium">
                                <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تصدير وورد Word (.docx) وتفريغ ترجمة SRT' : 'Word (.docx) & SRT subtitle exports'}</span>
                            </li>
                            <li className="flex items-start gap-2.5 font-medium">
                                <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تدقيق لغوي ونحوي شامل دون اختصار' : 'Full linguistic proofreading'}</span>
                            </li>
                        </ul>
                    </div>

                    <a
                        href={`https://wa.me/201129274930?text=${encodeURIComponent(
                            isRtl ? 'مرحباً، أرغب في تفعيل باقة المعلم المحترف في منصة فرغلي' : 'Hello, I want to activate Teacher Pro on Farghly',
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block"
                    >
                        <Button className="w-full py-3 shadow-lg shadow-primary/25">
                            {isRtl ? 'تفعيل باقة المعلم الآن' : 'Get Teacher Pro'}
                        </Button>
                    </a>
                </div>

                {/* Plan 3: Academy / Center Pack */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border flex flex-col justify-between glow-card shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                {isRtl ? 'باقة الأكاديميات' : 'Academy & Institution'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                {isRtl ? 'مؤسسات وسناتر' : 'Enterprise'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
                            {isRtl ? 'مساحة عمل جماعية' : 'Team Workspace'}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'للمراكز التعليمية والمدارس التي تمتلك طاقم تدريس وتحتاج سعة استخراج ضخمة.'
                                : 'For educational centers managing multi-teacher curriculums.'}
                        </p>

                        <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 mb-6 flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">{isRtl ? 'طبيعة الحساب:' : 'License:'}</span>
                            <span className="text-sm font-bold text-foreground font-mono">
                                {isRtl ? 'متعدد المعلمين' : 'Multi-teacher Team'}
                            </span>
                        </div>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-foreground/90 mb-8">
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تعدد حسابات المعلمين تحت مساحة عمل واحدة' : 'Multi-teacher team accounts'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'تخصيص قوالب HTML كاملة للمطابع الشريكة' : 'Custom HTML templates for print shops'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'أعلى سعة استخراج موازية بدون انتظار' : 'High-concurrency extraction pipeline'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="size-3 stroke-[2.5]" />
                                </div>
                                <span>{isRtl ? 'مدير حساب مخصص ودعم فني على مدار الساعة' : 'Dedicated account manager & 24/7 support'}</span>
                            </li>
                        </ul>
                    </div>

                    <a
                        href={`https://wa.me/201129274930?text=${encodeURIComponent(
                            isRtl ? 'مرحباً، أرغب في الاستفسار عن باقة المؤسسات والأكاديميات في منصة فرغلي' : 'Hello, I want to inquire about Academy & Institution plans on Farghly',
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block"
                    >
                        <Button variant="outline" className="w-full py-3">
                            {isRtl ? 'تواصل مع إدارة المبيعات' : 'Contact Sales Desk'}
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}
