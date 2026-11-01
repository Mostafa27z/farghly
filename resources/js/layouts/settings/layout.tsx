import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import { KeyRound, SlidersHorizontal, User } from 'lucide-react';
import React from 'react';

interface SettingsLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function SettingsLayout({ children, title, subtitle }: SettingsLayoutProps) {
    const { isRtl } = useLanguage();

    const isCurrent = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    const tabs = [
        {
            titleAr: 'الملف الشخصي',
            titleEn: 'Profile Information',
            href: route('profile.edit'),
            icon: User,
            active: isCurrent('profile.edit'),
        },
        {
            titleAr: 'الأمان وكلمة المرور',
            titleEn: 'Security & Password',
            href: route('password.edit'),
            icon: KeyRound,
            active: isCurrent('password.edit'),
        },
        {
            titleAr: 'المظهر والألوان',
            titleEn: 'Appearance & Colors',
            href: route('appearance'),
            icon: SlidersHorizontal,
            active: isCurrent('appearance'),
        },
    ];

    return (
        <DashboardLayout
            title={title || (isRtl ? 'إعدادات الحساب' : 'Account Settings')}
            subtitle={subtitle || (isRtl ? 'إدارة معلوماتك الشخصية، الأمان والمظهر' : 'Manage your personal profile, security and appearance')}
        >
            <div className="w-full space-y-6">
                {/* Modern Settings Navigation Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/70 scrollbar-none">
                    {tabs.map((tab, idx) => {
                        const Icon = tab.icon;
                        const active = tab.active;
                        return (
                            <Link
                                key={idx}
                                href={tab.href}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    active
                                        ? 'bg-primary/10 text-primary border border-primary/25 shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
                                }`}
                            >
                                <Icon className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span>{isRtl ? tab.titleAr : tab.titleEn}</span>
                                {active && (
                                    <span className="size-1.5 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Settings View Body - Takes 100% full width */}
                <div className="w-full space-y-6">
                    {children}
                </div>
            </div>
        </DashboardLayout>
    );
}
