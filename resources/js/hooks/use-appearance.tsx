import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

export interface AccentColor {
    id: string;
    nameAr: string;
    nameEn: string;
    primaryLight: string; // hsl(h, s, l)
    primaryDark: string;  // hsl(h, s, l)
    hex: string;
}

export const ACCENT_COLORS: AccentColor[] = [
    {
        id: 'emerald',
        nameAr: 'زمردي فرغلي',
        nameEn: 'Farghly Emerald',
        primaryLight: 'hsl(160, 84%, 38%)',
        primaryDark: 'hsl(160, 84%, 43%)',
        hex: '#10B981',
    },
    {
        id: 'blue',
        nameAr: 'أزرق ملكي',
        nameEn: 'Royal Blue',
        primaryLight: 'hsl(217, 91%, 55%)',
        primaryDark: 'hsl(217, 91%, 60%)',
        hex: '#2563EB',
    },
    {
        id: 'violet',
        nameAr: 'بنفسجي أكاديمي',
        nameEn: 'Academic Violet',
        primaryLight: 'hsl(262, 83%, 55%)',
        primaryDark: 'hsl(262, 83%, 62%)',
        hex: '#8B5CF6',
    },
    {
        id: 'amber',
        nameAr: 'كهرماني ذهبي',
        nameEn: 'Golden Amber',
        primaryLight: 'hsl(38, 92%, 48%)',
        primaryDark: 'hsl(38, 92%, 52%)',
        hex: '#F59E0B',
    },
    {
        id: 'rose',
        nameAr: 'ياقوتي عصري',
        nameEn: 'Crimson Ruby',
        primaryLight: 'hsl(346, 84%, 55%)',
        primaryDark: 'hsl(346, 84%, 60%)',
        hex: '#E11D48',
    },
    {
        id: 'teal',
        nameAr: 'فيروزي ناصع',
        nameEn: 'Ocean Teal',
        primaryLight: 'hsl(175, 84%, 36%)',
        primaryDark: 'hsl(175, 84%, 40%)',
        hex: '#0D9488',
    },
];

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);

    // Apply accent color matching dark/light
    const savedAccentId = localStorage.getItem('farghly_accent_color') || 'emerald';
    const accent = ACCENT_COLORS.find((c) => c.id === savedAccentId) || ACCENT_COLORS[0];
    const primaryColor = isDark ? accent.primaryDark : accent.primaryLight;

    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--sidebar-primary', primaryColor);
    document.documentElement.style.setProperty('--ring', primaryColor);

    window.dispatchEvent(new CustomEvent('farghly_theme_change', { detail: { appearance, isDark, accent } }));
};

export function initializeTheme() {
    const savedTheme = (localStorage.getItem('farghly_theme') as Appearance) || 'system';
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        const currentTheme = (localStorage.getItem('farghly_theme') as Appearance) || 'system';
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [accentColor, setAccentColor] = useState<string>('emerald');

    useEffect(() => {
        const savedTheme = (localStorage.getItem('farghly_theme') as Appearance) || 'system';
        const savedAccent = localStorage.getItem('farghly_accent_color') || 'emerald';
        setAppearance(savedTheme);
        setAccentColor(savedAccent);
        applyTheme(savedTheme);
    }, []);

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('farghly_theme', mode);
        applyTheme(mode);
    };

    const updateAccentColor = (accentId: string) => {
        setAccentColor(accentId);
        localStorage.setItem('farghly_accent_color', accentId);
        const currentTheme = (localStorage.getItem('farghly_theme') as Appearance) || 'system';
        applyTheme(currentTheme);
    };

    return { appearance, updateAppearance, accentColor, updateAccentColor, ACCENT_COLORS };
}
