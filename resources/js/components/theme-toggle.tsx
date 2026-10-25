import { useAppearance } from '@/hooks/use-appearance';
import React from 'react';

interface Props {
    className?: string;
    showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: Props) {
    const { appearance, updateAppearance } = useAppearance();

    // Check effective dark state
    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            title={isDark ? 'تفعيل الوضع النهاري (Light Mode)' : 'تفعيل الوضع الليلي (Dark Mode)'}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none text-xs font-mono ${
                isDark
                    ? 'bg-[#1C2028] border-white/10 text-[#BBCAFF] hover:text-white hover:border-[#10B981]/40 hover:bg-white/5'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-emerald-500/50 hover:bg-slate-50 shadow-sm'
            } ${className}`}
        >
            <span className={`material-symbols-outlined text-base transition-transform ${isDark ? 'text-amber-400 rotate-0' : 'text-slate-700 -rotate-12'}`}>
                {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            {showLabel && (
                <span className="font-sans font-medium">
                    {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                </span>
            )}
        </button>
    );
}
