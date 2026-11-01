import ScrollToTop from '@/components/scroll-to-top';
import AudienceSection from '@/pages/welcome/components/audience-section';
import CustomThemesSection from '@/pages/welcome/components/custom-themes-section';
import FeaturesSection from '@/pages/welcome/components/features-section';
import HeroSection from '@/pages/welcome/components/hero-section';
import PricingSection from '@/pages/welcome/components/pricing-section';
import StudioPreviewSection from '@/pages/welcome/components/studio-preview-section';
import FaqSection from '@/pages/welcome/components/faq-section';
import WelcomeFooter from '@/pages/welcome/components/welcome-footer';
import WelcomeHeader from '@/pages/welcome/components/welcome-header';
import { useLanguage } from '@/hooks/use-language';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function Welcome() {
    const { lang, setLang, isRtl } = useLanguage();

    // Subtle gradient divider between sections
    const Sep = () => (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
    );

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-primary-foreground transition-colors scroll-smooth"
        >
            <Head
                title={
                    isRtl
                        ? 'فرغلي | استوديو تحويل وتلخيص الفيديوهات التعليمية إلى مذكرات ذكية'
                        : 'Farghly | Turn Educational Videos into Smart Study Memos'
                }
            />

            {/* 1. Header with smooth navigation */}
            <WelcomeHeader lang={lang} setLang={setLang} isRtl={isRtl} />

            {/* 2. Main Sections */}
            <main className="pt-16 sm:pt-20">
                <HeroSection isRtl={isRtl} />

                <Sep />
                <div className="bg-muted/20">
                    <AudienceSection isRtl={isRtl} />
                </div>

                <Sep />
                <FeaturesSection isRtl={isRtl} />

                <Sep />
                <div className="bg-muted/20">
                    <StudioPreviewSection isRtl={isRtl} />
                </div>

                <Sep />
                <CustomThemesSection isRtl={isRtl} />

                <Sep />
                <div className="bg-muted/20">
                    <PricingSection isRtl={isRtl} />
                </div>

                <Sep />
                <FaqSection isRtl={isRtl} />
            </main>

            {/* 3. Footer */}
            <WelcomeFooter isRtl={isRtl} />

            {/* 4. Floating Scroll-to-Top Button */}
            <ScrollToTop isRtl={isRtl} />
        </div>
    );
}
