import { useLanguage } from '@/hooks/use-language';
import { ArrowUp, ChevronUp, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
    isRtl?: boolean;
}

export default function ScrollToTop({ isRtl: propIsRtl }: Props) {
    const { isRtl: hookIsRtl } = useLanguage();
    const isRtl = propIsRtl !== undefined ? propIsRtl : hookIsRtl;

    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrollingUp, setIsScrollingUp] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    // Track scroll position, progress percentage & visibility
    useEffect(() => {
        let lastKnownScrollPosition = 0;
        let ticking = false;

        const handleScroll = () => {
            lastKnownScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

                    if (docHeight > 0) {
                        const percent = Math.min(Math.max((lastKnownScrollPosition / docHeight) * 100, 0), 100);
                        setProgress(Math.round(percent));
                    }

                    if (lastKnownScrollPosition > 200) {
                        setVisible(true);
                    } else {
                        setVisible(false);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Ultra-smooth bespoke cinematic scroll to top with cubic-bezier easing
    const scrollToTop = () => {
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        if (startPosition === 0) return;

        setIsScrollingUp(true);

        // Optimal human-perception duration curve (600ms - 900ms max)
        const duration = Math.min(Math.max(startPosition * 0.28, 650), 950);
        let startTime: number | null = null;

        // Quartic Ease-Out: Instant response, silky smooth deceleration
        const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

        const animateScroll = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const normalizedTime = Math.min(timeElapsed / duration, 1);
            const eased = easeOutQuart(normalizedTime);

            window.scrollTo(0, Math.round(startPosition * (1 - eased)));

            if (timeElapsed < duration) {
                animationFrameRef.current = requestAnimationFrame(animateScroll);
            } else {
                window.scrollTo(0, 0);
                setIsScrollingUp(false);
                animationFrameRef.current = null;
            }
        };

        // Allow user wheel / touch to interrupt cleanly
        const cancelOnUserInteraction = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                setIsScrollingUp(false);
                window.removeEventListener('wheel', cancelOnUserInteraction);
                window.removeEventListener('touchmove', cancelOnUserInteraction);
            }
        };

        window.addEventListener('wheel', cancelOnUserInteraction, { passive: true });
        window.addEventListener('touchmove', cancelOnUserInteraction, { passive: true });

        animationFrameRef.current = requestAnimationFrame(animateScroll);
    };

    if (!visible) return null;

    // SVG Circular Progress Ring metrics
    const strokeWidth = 3;
    const size = 56;
    const center = size / 2;
    const radius = center - strokeWidth * 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <aside
            aria-label={isRtl ? 'زر العودة لأعلى الصفحة' : 'Scroll to top button'}
            className="fixed left-6 sm:left-8 bottom-6 sm:bottom-8 z-50 flex flex-col items-center select-none"
        >
            {/* Elegant Tooltip / Progress Chip */}
            <div
                className={`mb-2 px-3 py-1 rounded-full bg-slate-900/90 dark:bg-card/95 text-white dark:text-foreground text-[11px] font-mono font-bold tracking-tight shadow-lg border border-white/10 dark:border-border backdrop-blur-md transition-all duration-300 pointer-events-none flex items-center gap-1.5 ${
                    isHovered
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 scale-90'
                }`}
            >
                <span className="text-primary font-bold">{progress}%</span>
                <span className="text-white/40 dark:text-muted-foreground/60">·</span>
                <span>{isRtl ? 'للأعلى' : 'Top'}</span>
            </div>

            {/* Floating Glassmorphic Circular Action Capsule */}
            <button
                type="button"
                onClick={scrollToTop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={isRtl ? 'العودة لأعلى الصفحة بسلاسة' : 'Smooth scroll to top'}
                title={isRtl ? 'العودة للأعلى' : 'Scroll to top'}
                className="group relative size-14 sm:size-15 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-2xl border border-border/80 shadow-[0_10px_35px_rgba(0,0,0,0.14)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.65)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 active:scale-90 active:translate-y-0 hover:border-primary/60 outline-none"
            >
                {/* SVG Progress Ring */}
                <svg
                    className="absolute inset-0 size-full -rotate-90 pointer-events-none"
                    viewBox={`0 0 ${size} ${size}`}
                >
                    {/* Background Subtle Track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-border/40 dark:text-border/60"
                    />
                    {/* Dynamic Emerald Progress Stroke */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-primary transition-[stroke-dashoffset] duration-150 ease-out"
                    />
                </svg>

                {/* Pulsing Ripple Glow on active scroll */}
                {isScrollingUp && (
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-60 pointer-events-none" />
                )}

                {/* Inner Icon Orb */}
                <div className="size-9 sm:size-10 rounded-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-xs">
                    <ArrowUp
                        className={`size-4.5 stroke-[2.6] transition-transform duration-300 ${
                            isScrollingUp
                                ? '-translate-y-1'
                                : 'group-hover:-translate-y-0.5'
                        }`}
                    />
                </div>
            </button>
        </aside>
    );
}
