import { Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Headphones,
    MessageCircle,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import React from 'react';

interface Props {
    isRtl: boolean;
}

export default function WelcomeFooter({ isRtl }: Props) {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <footer className="border-t border-border bg-card/80 dark:bg-card/40 pt-16 pb-12 px-4 sm:px-8 lg:px-12 text-start text-xs text-muted-foreground transition-colors relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto space-y-12">
                {/* 4 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Col 1: Brand & Status (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
                                <BookOpen className="size-5 text-primary-foreground stroke-[2.2]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg text-foreground tracking-tight leading-tight">
                                    {isRtl ? 'فرغلي' : 'Farghly'}
                                </span>
                                <span className="text-[10px] text-primary tracking-widest font-mono font-bold uppercase">
                                    FARGHLY AI STUDIO
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
                            {isRtl
                                ? 'المنصة الذكية الأولى في العالم العربي لتحويل وتدقيق شروحات ومحاضرات يوتيوب إلى مذكرات وملخصات أكاديمية جاهزة للمذاكرة والطباعة بهويتك وشعارك.'
                                : 'The leading AI lecture intelligence studio in the MENA region. Transform educational YouTube videos into verified, branded print-ready study memos in seconds.'}
                        </p>

                        {/* Live Server Operational Status */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-mono text-foreground font-semibold">
                                {isRtl ? 'جميع الأنظمة السحابية تعمل بكفاءة 99.9%' : 'All Systems Operational 99.9%'}
                            </span>
                        </div>
                    </div>

                    {/* Col 2: Platform Capabilities (3 cols) */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="text-sm font-bold text-foreground tracking-tight">
                            {isRtl ? 'مزايا المنصة' : 'Capabilities'}
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'تفريغ دقيق متزامن بالثواني' : 'Word-level Synchronized Transcription'}
                                </a>
                            </li>
                            <li>
                                <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'تدقيق لغوي ونحوي شامل' : 'Arabic Linguistic & Grammar Proofread'}
                                </a>
                            </li>
                            <li>
                                <a href="#studio-workflow" onClick={(e) => handleNavClick(e, '#studio-workflow')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'استخراج القوانين والمعادلات' : 'AI Formula & Key Concept Extraction'}
                                </a>
                            </li>
                            <li>
                                <a href="#custom-themes" onClick={(e) => handleNavClick(e, '#custom-themes')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'قوالب الطباعة والهوية A4' : 'A4 Commercial Print Templates (300 DPI)'}
                                </a>
                            </li>
                            <li>
                                <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'تصدير Word (.docx) وترجمة SRT' : 'Word & SRT Subtitle Multi-Export'}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Audience & Solutions (2 cols) */}
                    <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-sm font-bold text-foreground tracking-tight">
                            {isRtl ? 'حلول مخصصة' : 'Solutions'}
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <a href="#for-who" onClick={(e) => handleNavClick(e, '#for-who')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'للطلاب والجامعيين' : 'For Students'}
                                </a>
                            </li>
                            <li>
                                <a href="#for-who" onClick={(e) => handleNavClick(e, '#for-who')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'للمعلمين والمحاضرين' : 'For Teachers'}
                                </a>
                            </li>
                            <li>
                                <a href="#plans" onClick={(e) => handleNavClick(e, '#plans')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'للمراكز والسناتر التعليمية' : 'For Academies & Centers'}
                                </a>
                            </li>
                            <li>
                                <a href="#custom-themes" onClick={(e) => handleNavClick(e, '#custom-themes')} className="hover:text-primary transition-colors">
                                    {isRtl ? 'للمطابع والمكتبات الشريكة' : 'For Commercial Print Shops'}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Sales & WhatsApp Desk (3 cols) */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="text-sm font-bold text-foreground tracking-tight">
                            {isRtl ? 'إدارة المبيعات والتفعيل' : 'Sales & Support Desk'}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {isRtl
                                ? 'تواصل مباشرة مع فريق المبيعات لتفعيل فوري، أو ترقية باقتك عبر وسائل الدفع المحلية والدولية.'
                                : 'Direct sales support via WhatsApp for instant activation and institutional licensing.'}
                        </p>

                        <a
                            href={`https://wa.me/201129274930?text=${encodeURIComponent(
                                isRtl ? 'مرحباً، أرغب في الاستفسار والاشتراك في منصة فرغلي' : 'Hello, I want to subscribe to Farghly',
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold text-xs transition-all w-full justify-center group"
                        >
                            <MessageCircle className="size-4 text-primary" />
                            <span>{isRtl ? 'تواصل عبر واتساب المبيعات' : 'WhatsApp Direct Desk'}</span>
                        </a>

                        <div className="pt-2 text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                            <ShieldCheck className="size-3.5 text-primary" />
                            <span>{isRtl ? 'فودافون كاش · إنستاباي · فيزا · تحويل بنكي' : 'Local & Global Payment Methods'}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Separator & Copyright */}
                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{isRtl ? 'فرغلي' : 'Farghly'}</span>
                        <span>© {new Date().getFullYear()} {isRtl ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 font-medium">
                        <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-foreground transition-colors">
                            {isRtl ? 'المميزات' : 'Features'}
                        </a>
                        <a href="#plans" onClick={(e) => handleNavClick(e, '#plans')} className="hover:text-foreground transition-colors">
                            {isRtl ? 'باقات الاشتراك' : 'Pricing'}
                        </a>
                        <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className="hover:text-foreground transition-colors">
                            {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
                        </a>
                        <Link href={route('login')} className="hover:text-primary transition-colors font-bold">
                            {isRtl ? 'بوابة المشتركين' : 'Subscriber Login'}
                        </Link>
                    </div>

                    <span className="font-mono text-[11px]">
                        Farghly AI Platform v2.5
                    </span>
                </div>
            </div>
        </footer>
    );
}
