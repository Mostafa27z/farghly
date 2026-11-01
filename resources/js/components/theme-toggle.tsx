import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface Props {
    className?: string;
    showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: Props) {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const checkDark = () => {
            const htmlHasDark = document.documentElement.classList.contains('dark');
            setIsDark(htmlHasDark);
        };
        checkDark();

        const handleSync = () => checkDark();
        window.addEventListener('farghly_theme_change', handleSync);
        return () => window.removeEventListener('farghly_theme_change', handleSync);
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('farghly_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('farghly_theme', 'light');
        }
        window.dispatchEvent(new CustomEvent('farghly_theme_change', { detail: { isDark: nextDark } }));
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'تفعيل الوضع النهاري (Light Mode)' : 'تفعيل الوضع الليلي (Dark Mode)'}
            className={`size-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs select-none hover:border-primary/40 active:scale-95 ${className}`}
        >
            {isDark ? (
                <Sun size={17} className="text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
            ) : (
                <Moon size={17} className="text-slate-600 dark:text-slate-300 -rotate-12 transition-transform duration-300 hover:rotate-0" />
            )}
            {showLabel && (
                <span className="ms-1.5 font-bold text-xs">
                    {isDark ? 'ليلي' : 'نهاري'}
                </span>
            )}
        </button>
    );
}
