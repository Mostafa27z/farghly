import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    Captions,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    HelpCircle,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Menu,
    Palette,
    PanelLeft,
    PanelRight,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    TrendingUp,
    User,
    UserCheck,
    Users,
    Video,
    X,
    Sparkles,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actionSlot?: React.ReactNode;
}

export default function DashboardLayout({
    children,
    title,
    subtitle,
    actionSlot,
}: DashboardLayoutProps) {
    const { auth } = usePage().props as any;
    const { lang, setLang, isRtl } = useLanguage();
    const user = auth?.user;
    const tenant = auth?.tenant;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem('farghly_dashboard_sidebar');
            if (savedState !== null) {
                setIsSidebarOpen(savedState === 'true');
            }
        } catch {
            // ignore
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('farghly_dashboard_sidebar', String(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

    // Quota calculations
    const totalVideos = tenant?.monthly_videos_limit ?? tenant?.monthly_minutes_limit ?? 0;
    const usedVideos = tenant?.monthly_videos_used ?? tenant?.monthly_minutes_used ?? 0;
    const remainingVideos = tenant?.remaining_videos ?? tenant?.remaining_minutes ?? 0;
    const usagePercent = totalVideos > 0 ? Math.min(100, Math.round((usedVideos / totalVideos) * 100)) : 0;

    const isCurrent = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    const navItems = [
        {
            groupAr: 'مساحة العمل',
            groupEn: 'WORKSPACE',
            items: [
                {
                    titleAr: 'المكتبة والتفريغ الذكي',
                    titleEn: 'Library & Transcripts',
                    href: route('dashboard'),
                    icon: Video,
                    active: isCurrent('dashboard') || isCurrent('transcripts.*'),
                },
                {
                    titleAr: 'الهوية وقوالب الطباعة',
                    titleEn: 'Branding & Templates',
                    href: route('themes.index'),
                    icon: Palette,
                    active: isCurrent('themes.*'),
                },
            ],
        },
        ...(auth?.is_staff
            ? [
                  {
                      groupAr: 'بوابة الإدارة والمبيعات',
                      groupEn: 'ADMIN & SALES',
                      items: [
                          {
                              titleAr: 'لوحة تحكم الإدارة',
                              titleEn: 'Admin Overview',
                              href: route('admin.dashboard'),
                              icon: ShieldCheck,
                              active: isCurrent('admin.dashboard'),
                          },
                          ...(auth?.is_super_admin
                              ? [
                                    {
                                        titleAr: 'فريق المبيعات',
                                        titleEn: 'Sales Team',
                                        href: route('admin.sales-team.index'),
                                        icon: Users,
                                        active: isCurrent('admin.sales-team.*'),
                                    },
                                    {
                                        titleAr: 'أداء المبيعات',
                                        titleEn: 'Sales Performance',
                                        href: route('admin.performance'),
                                        icon: TrendingUp,
                                        active: isCurrent('admin.performance'),
                                    },
                                    {
                                        titleAr: 'سجل التدقيق والعمليات',
                                        titleEn: 'Audit Logs',
                                        href: route('admin.audit-logs'),
                                        icon: Activity,
                                        active: isCurrent('admin.audit-logs'),
                                    },
                                ]
                              : [
                                    {
                                        titleAr: 'إدارة العملاء والاشتراكات',
                                        titleEn: 'Clients & Renewals',
                                        href: route('sales.index'),
                                        icon: UserCheck,
                                        active: isCurrent('sales.*'),
                                    },
                                ]),
                      ],
                  },
              ]
            : []),
        {
            groupAr: 'الحساب والإعدادات',
            groupEn: 'ACCOUNT',
            items: [
                {
                    titleAr: 'إعدادات الحساب',
                    titleEn: 'Account Settings',
                    href: route('profile.edit'),
                    icon: Settings,
                    active: isCurrent('profile.*') || isCurrent('password.*') || isCurrent('appearance'),
                },
            ],
        },
    ];

    // Reusable Sidebar Inner Content
    const renderSidebarContent = (isMobileDrawer = false) => (
        <div className="flex flex-col h-full overflow-hidden select-none">
            {/* Header / Brand */}
            <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-all shrink-0">
                        <BookOpen className="size-5 text-primary-foreground stroke-[2.2]" />
                    </div>
                    {(!isMobileDrawer && !isSidebarOpen) ? null : (
                        <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-base text-foreground leading-tight tracking-tight">
                                {isRtl ? 'فرغلي' : 'Farghly'}
                            </span>
                            <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider">
                                {isRtl ? 'منصة المعلم الذكية' : 'AI EDU PLATFORM'}
                            </span>
                        </div>
                    )}
                </Link>

                {isMobileDrawer && (
                    <button
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="size-4.5" />
                    </button>
                )}
            </div>

            {/* Tenant Workspace Info Card */}
            {tenant && (isMobileDrawer || isSidebarOpen) && (
                <div className="px-4 py-3 border-b border-border/50 shrink-0 bg-muted/20">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-card/80 border border-border/70 shadow-2xs">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-muted-foreground font-semibold">
                                {isRtl ? 'مساحة العمل النشطة' : 'Active Workspace'}
                            </span>
                            <span className="text-xs font-bold text-foreground truncate mt-0.5">
                                {tenant.name}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/25 shrink-0">
                            {tenant.plan_name}
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation Menus List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
                {navItems.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1.5">
                        {(isMobileDrawer || isSidebarOpen) && (
                            <h4 className="px-3 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase font-mono">
                                {isRtl ? group.groupAr : group.groupEn}
                            </h4>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item, iIdx) => {
                                const ItemIcon = item.icon;
                                const isActive = item.active;
                                return (
                                    <Link
                                        key={iIdx}
                                        href={item.href}
                                        onClick={() => {
                                            if (isMobileDrawer) setIsMobileDrawerOpen(false);
                                        }}
                                        title={!isMobileDrawer && !isSidebarOpen ? (isRtl ? item.titleAr : item.titleEn) : undefined}
                                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                            isActive
                                                ? 'bg-primary/10 text-primary font-bold border border-primary/25 shadow-2xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/30 border border-transparent'
                                        }`}
                                    >
                                        <ItemIcon
                                            className={`size-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                            }`}
                                        />
                                        {(isMobileDrawer || isSidebarOpen) && (
                                            <span className="truncate flex-1">
                                                {isRtl ? item.titleAr : item.titleEn}
                                            </span>
                                        )}
                                        {isActive && (isMobileDrawer || isSidebarOpen) && (
                                            <div className="size-1.5 rounded-full bg-primary shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quota Mini Card (if expanded or mobile) */}
            {tenant && (isMobileDrawer || isSidebarOpen) && (
                <div className="p-3 mx-3 mb-2 rounded-2xl bg-muted/40 border border-border/70 shrink-0">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-semibold">
                        <span className="text-muted-foreground">{isRtl ? 'رصيد الفيديوهات' : 'Video Quota'}</span>
                        <span className="font-mono text-foreground font-bold">{remainingVideos} / {totalVideos}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                usagePercent > 85 ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[9.5px] text-muted-foreground mt-1.5 font-mono">
                        <span>{isRtl ? `تم استهلاك ${usagePercent}%` : `${usagePercent}% used`}</span>
                        <span>{tenant.expires_at ? (isRtl ? `تجديد: ${tenant.expires_at}` : `Renews: ${tenant.expires_at}`) : ''}</span>
                    </div>
                </div>
            )}

            {/* Footer / User Profile & Controls */}
            <div className="p-3 border-t border-border/70 bg-card/60 shrink-0 space-y-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {(isMobileDrawer || isSidebarOpen) && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-foreground truncate">{user?.name || 'User'}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                        </div>
                    )}
                </div>

                {(isMobileDrawer || isSidebarOpen) && (
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border border-border/50"
                    >
                        <LogOut className="size-3.5" />
                        <span>{isRtl ? 'تسجيل الخروج' : 'Log out'}</span>
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col transition-colors selection:bg-primary selection:text-primary-foreground"
        >
            <div className="flex flex-1 w-full min-h-screen">
                {/* ── Desktop Sidebar: RIGHT in Arabic (RTL), LEFT in English (LTR) ── */}
                <aside
                    className={`hidden md:flex flex-col bg-card/90 backdrop-blur-xl border-border/80 transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen overflow-hidden ${
                        isRtl ? 'border-l' : 'border-r'
                    } ${isSidebarOpen ? 'w-64 sm:w-72' : 'w-20'}`}
                >
                    {renderSidebarContent(false)}
                </aside>

                {/* ── Mobile Drawer (Slide-in) ── */}
                {isMobileDrawerOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                            onClick={() => setIsMobileDrawerOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <div
                            className={`relative w-[85%] max-w-xs bg-card border-border shadow-2xl h-full z-10 flex flex-col ${
                                isRtl ? 'ms-auto border-s' : 'me-auto border-e'
                            } animate-in ${isRtl ? 'slide-in-from-right' : 'slide-in-from-left'} duration-200`}
                        >
                            {renderSidebarContent(true)}
                        </div>
                    </div>
                )}

                {/* ── Main Workspace Content Area ── */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    {/* Top Control Bar */}
                    <header className="sticky top-0 z-20 h-16 bg-card/85 backdrop-blur-md border-b border-border/70 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-4 transition-colors">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            {/* Toggle Sidebar Button (Desktop) */}
                            <button
                                onClick={toggleSidebar}
                                className="hidden md:flex size-9 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60 transition-colors cursor-pointer"
                                title={isSidebarOpen ? (isRtl ? 'طي القائمة الجانبية' : 'Collapse Sidebar') : (isRtl ? 'توسيع القائمة الجانبية' : 'Expand Sidebar')}
                            >
                                {isRtl ? (
                                    isSidebarOpen ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />
                                ) : (
                                    isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />
                                )}
                            </button>

                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsMobileDrawerOpen(true)}
                                className="flex md:hidden size-9 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60 transition-colors cursor-pointer shrink-0"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="size-5" />
                            </button>

                            {/* Page Title & Subtitle */}
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-xs sm:text-base font-extrabold text-foreground truncate">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate hidden sm:block">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Top Right / Left Action Slot & Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                            {actionSlot}
                            <div className="h-4 w-px bg-border hidden sm:block" />
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <ThemeToggle />
                                <LanguageToggle />
                            </div>
                        </div>
                    </header>

                    {/* Content Body */}
                    <main className="flex-1 p-3.5 sm:p-6 lg:p-8 w-full min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

