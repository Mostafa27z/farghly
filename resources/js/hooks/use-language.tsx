import { useEffect, useState } from 'react';

export type Language = 'ar' | 'en';

const LANGUAGE_KEY = 'farghly_lang';

export function getStoredLanguage(): Language {
    if (typeof window === 'undefined') return 'ar';
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
    return 'ar';
}

export function applyLanguage(lang: Language) {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
}

export function useLanguage() {
    const [lang, setLangState] = useState<Language>(() => getStoredLanguage());

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LANGUAGE_KEY, newLang);
            applyLanguage(newLang);
            window.dispatchEvent(new CustomEvent('farghly-language-change', { detail: newLang }));
        }
    };

    useEffect(() => {
        const initial = getStoredLanguage();
        setLangState(initial);
        applyLanguage(initial);

        const handleLanguageChange = (e: Event) => {
            const customEvent = e as CustomEvent<Language>;
            if (customEvent.detail) {
                setLangState(customEvent.detail);
                applyLanguage(customEvent.detail);
            }
        };

        window.addEventListener('farghly-language-change', handleLanguageChange);
        return () => window.removeEventListener('farghly-language-change', handleLanguageChange);
    }, []);

    const isRtl = lang === 'ar';

    const t = (ar: string, en: string) => (isRtl ? ar : en);

    return { lang, setLang, isRtl, t };
}

