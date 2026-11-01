import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { isRtl } = useLanguage();

    const tabs: { value: Appearance; icon: LucideIcon; labelAr: string; labelEn: string }[] = [
        { value: 'light', icon: Sun, labelAr: 'الوضع الفاتح', labelEn: 'Light' },
        { value: 'dark', icon: Moon, labelAr: 'الوضع الليلي', labelEn: 'Dark' },
        { value: 'system', icon: Monitor, labelAr: 'تلقائي حسب النظام', labelEn: 'System' },
    ];

    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 rounded-2xl bg-muted/40 border border-border/80', className)} {...props}>
            {tabs.map(({ value, icon: Icon, labelAr, labelEn }) => {
                const isSelected = appearance === value;
                return (
                    <button
                        type="button"
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                            isSelected
                                ? 'bg-card text-foreground shadow-sm border border-border/70 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50',
                        )}
                    >
                        <Icon className={cn('size-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span>{isRtl ? labelAr : labelEn}</span>
                    </button>
                );
            })}
        </div>
    );
}
