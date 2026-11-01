import { Button } from '@/components/ui/button';
import { BookMarked, CheckCircle2, GraduationCap, Palette, Presentation } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    isRtl: boolean;
}

export default function AudienceSection({ isRtl }: Props) {
    const [audienceTab, setAudienceTab] = useState<'students' | 'teachers'>('students');

    const handleScrollToPlans = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.querySelector('#plans');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section id="for-who" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 scroll-mt-24">
            <div className="text-center mb-10 sm:mb-14">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                    {isRtl ? 'حلول مخصصة للجميع' : 'Tailored For You'}
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    {isRtl ? 'سواء كنت طالباً يذاكر أو معلماً يُعد مذكراته' : 'Built for Students and Professional Teachers'}
                </h2>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex justify-center mb-10 sm:mb-12">
                <div className="p-1.5 rounded-2xl bg-card border border-border inline-flex items-center gap-1.5 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setAudienceTab('students')}
                        className={`px-5 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            audienceTab === 'students'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <GraduationCap className="size-4" />
                        <span>{isRtl ? 'للطلاب: مذكرات للمذاكرة' : 'For Students'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAudienceTab('teachers')}
                        className={`px-5 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            audienceTab === 'teachers'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Presentation className="size-4" />
                        <span>{isRtl ? 'للمعلمين: إعداد المذكرات' : 'For Teachers'}</span>
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-stretch max-w-6xl mx-auto">
                {/* Students Card */}
                <div
                    className={`p-6 sm:p-10 rounded-3xl bg-card border transition-all flex flex-col justify-between text-start glow-card ${
                        audienceTab === 'students'
                            ? 'border-primary ring-2 ring-primary/20 shadow-xl'
                            : 'border-border opacity-75 hover:opacity-100'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <GraduationCap className="size-6" />
                            </div>
                            <span className="px-3.5 py-1 rounded-full bg-muted text-muted-foreground font-mono text-xs font-semibold">
                                {isRtl ? 'للطلاب والجامعيين' : 'Students & Academics'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                            {isRtl ? 'ذاكر بذكاء قبل الامتحانات' : 'Study Smart Before Finals'}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'بدل ما تضيع ساعات طويلة في إعادة مشاهدة المحاضرات، حوّل محتواها إلى نصوص مقروءة وملخصات تستخرج لك القوانين والتعريفات لتركز في الفهم والحل.'
                                : 'Stop re-watching endless videos before tests. Turn recorded lectures into organized text notes and quick summaries to review high-yield concepts.'}
                        </p>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-foreground mb-8">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'تفريغ كامل للفيديوهات والمحاضرات بالتوقيت الزمني الدقيق.' : 'Full timestamped transcription of all course lectures.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'استخراج أهم القوانين والمفاهيم وأسئلة الامتحانات بالذكاء الاصطناعي.' : 'AI extraction of key formulas, concepts, and expected exam questions.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'تصدير مستندات PDF منسقة ومهيأة للقراءة على الموبايل والتابلت.' : 'Clean PDF exports optimized for mobile and tablet studying.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'مكتبة سحابية خاصة بك لحفظ وتنظيم محاضرات كل مادة.' : 'Dedicated personal study library cataloged by subject.'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <a href="#plans" onClick={handleScrollToPlans} className="w-full block">
                            <Button className="w-full shadow-md">
                                <BookMarked className="size-4" />
                                <span>{isRtl ? 'ابدأ تجهيز مذكراتك الدراسية' : 'Start Preparing Your Notes'}</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Teachers Card */}
                <div
                    className={`p-6 sm:p-10 rounded-3xl bg-card border transition-all flex flex-col justify-between text-start glow-card ${
                        audienceTab === 'teachers'
                            ? 'border-primary ring-2 ring-primary/20 shadow-xl'
                            : 'border-border opacity-75 hover:opacity-100'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <Presentation className="size-6" />
                            </div>
                            <span className="px-3.5 py-1 rounded-full bg-muted text-muted-foreground font-mono text-xs font-semibold">
                                {isRtl ? 'للمعلمين والمحاضرين والسناتر' : 'Teachers & Institutions'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                            {isRtl ? 'جهّز مذكراتك التعليمية في وقت قياسي' : 'Create Course Handouts in Record Time'}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'وفر عشرات الساعات من التفريغ اليدوي وإعادة الكتابة. حوّل شروحاتك المسجلة إلى مذكرات احترافية تحمل شعارك واسمك وبياناتك جاهزة للمطبعة والتوزيع.'
                                : 'Eliminate hours of manual typing and reformatting. Transform your recorded lessons into branded, professional print-ready course materials.'}
                        </p>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-foreground mb-8">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'تفريغ وتدقيق لغوي ونحوي شامل للنصوص بضغطة زر واحدة.' : 'Accurate transcription and linguistic proofreading with one click.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'إضافة شعار الأستاذ أو السنتر والترويسة والفوتر على كل صفحة.' : 'Custom teacher or center branding, logo, and contact header/footer.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'ملفات PDF بدقة 300 DPI جاهزة للمطبعة فوراً بدون تعديلات.' : 'High-resolution 300 DPI PDF files ready for instant commercial printing.'}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>{isRtl ? 'تصدير ملفات Word (.docx) و SRT للترجمة والتحرير المرن.' : 'Flexible Word (.docx) and SRT subtitle file exports.'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <a href="#plans" onClick={handleScrollToPlans} className="w-full block">
                            <Button className="w-full shadow-md">
                                <Palette className="size-4" />
                                <span>{isRtl ? 'ابدأ إعداد مذكراتك بهويتك التعليمية' : 'Create Branded Notes'}</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

