import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Globe } from 'lucide-react';

interface Props {
    className?: string;
    compact?: boolean;
}

export default function LanguageToggle({ className = '', compact = false }: Props) {
    const { lang, setLang, isRtl } = useLanguage();

    const toggle = () => {
        setLang(isRtl ? 'en' : 'ar');
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
            title={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer shadow-xs select-none active:scale-95 ${className}`}
        >
            <Globe className="size-3.5 text-primary shrink-0" />
            <span className="font-sans">
                {compact ? (isRtl ? 'EN' : 'عربي') : (isRtl ? 'English' : 'العربية')}
            </span>
        </button>
    );
}
