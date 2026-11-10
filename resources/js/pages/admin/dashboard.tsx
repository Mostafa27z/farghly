import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { BadgeCheck, BarChart3, BellRing, CalendarX, DollarSign, History, Search, Trophy, UsersRound, Video } from 'lucide-react';

interface ClientItem {
    id: number;
    name: string;
    plan_name: string;
    subscription_status: string;
    expires_at: string | null;
    expires_at_human: string | null;
    days_left: number | null;
    monthly_videos_limit: number;
    monthly_videos_used: number;
    remaining_videos: number;
    monthly_minutes_limit: number;
    monthly_minutes_used: number;
    remaining_minutes: number;
    transcripts_count: number;
    owner: {
        id: number;
        name: string;
        email: string;
    } | null;
    sales_agent: {
        id: number;
        name: string;
    } | null;
}

interface PaginatedClients {
    data: ClientItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    metrics: {
        total_tenants: number;
        active_tenants: number;
        expired_tenants: number;
        expiring_soon: number;
        sales_agents_count: number;
        month_renewals: number;
        month_new_clients: number;
        month_revenue: number;
    };
    clients: PaginatedClients;
    filters?: {
        filter?: string;
        search?: string;
    };
    recentTransactions: Array<{
        id: number;
        action_type: string;
        plan_name: string;
        duration_days: number;
        minutes_added: number;
        amount_collected: number;
        is_admin_action?: boolean;
        notes: string | null;
        created_at_human: string;
        sales_agent: { id: number; name: string } | null;
        tenant: { id: number; name: string } | null;
    }>;
    topPerformers: Array<{
        id: number;
        name: string;
        system_role: string;
        new_accounts: number;
        renewals: number;
        total_transactions: number;
        total_collected: number;
        total_minutes_granted: number;
    }>;
}

export default function AdminDashboard({ metrics, clients, filters = {}, recentTransactions, topPerformers }: Props) {
    const { isRtl } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.dashboard'), { ...filters, search }, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (newFilter: string) => {
        router.get(route('admin.dashboard'), { ...filters, filter: newFilter, search }, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardLayout
            title={isRtl ? 'لوحة الإدارة العامة' : 'Super Admin Overview'}
            subtitle={isRtl ? 'مؤشرات النظام، الاشتراكات ومتابعة فريق المبيعات' : 'System metrics, subscriptions and sales team monitoring'}
            actionSlot={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.performance')}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all"
                    >
                        <BarChart3 className="size-3.5 text-primary" />
                        <span>{isRtl ? 'أداء المبيعات' : 'Performance'}</span>
                    </Link>
                    <Link
                        href={route('admin.sales-team.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs"
                    >
                        <BadgeCheck className="size-3.5" />
                        <span>{isRtl ? 'فريق المبيعات' : 'Sales Team'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isRtl ? 'لوحة الإدارة العليا | فرغلي' : 'Super Admin Dashboard | Farghly'} />

            <div className="space-y-8">
                {/* ── 1. KPI Stat Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Active Clients */}
                    <div className="p-5 rounded-xl bg-card border border-border relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">المشتركون النشطون</span>
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="text-3xl font-extrabold text-foreground font-mono">
                            {metrics.active_tenants}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                            من إجمالي {metrics.total_tenants} مساحة عمل
                        </div>
                    </div>

                    {/* Expiring Soon */}
                    <div className="p-5 rounded-xl bg-card border border-amber-200 dark:border-amber-500/20 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-amber-600 dark:text-amber-400">ينتهي خلال 7 أيام</span>
                            <BellRing size={18} />
                        </div>
                        <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                            {metrics.expiring_soon}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                            فرص تجديد ساخنة
                        </div>
                    </div>

                    {/* Expired */}
                    <div className="p-5 rounded-xl bg-card border border-red-200 dark:border-red-500/20 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-destructive">اشتراكات منتهية</span>
                            <CalendarX size={18} />
                        </div>
                        <div className="text-3xl font-extrabold text-destructive font-mono">
                            {metrics.expired_tenants}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                            بحاجة لإعادة التواصل
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="p-5 rounded-xl bg-card border border-primary/20 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-primary">المبيعات المحصلة (الشهر)</span>
                            <DollarSign size={18} />
                        </div>
                        <div className="text-3xl font-extrabold text-primary font-mono">
                            ${metrics.month_revenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                            {metrics.month_renewals} تجديد · {metrics.month_new_clients} عميل جديد
                        </div>
                    </div>
                </div>

                {/* ── 2. Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Top Sales Performers */}
                    <div className="lg:col-span-1 rounded-xl bg-card border border-border p-6 flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                            <div className="flex items-center gap-2">
                                <Trophy size={20} />
                                <h3 className="text-sm font-bold text-foreground">متصدرو مبيعات هذا الشهر</h3>
                            </div>
                            <Link href={route('admin.performance')} className="text-[11px] text-primary hover:underline font-bold">
                                كامل الترتيب
                            </Link>
                        </div>

                        <div className="space-y-2.5 flex-1">
                            {topPerformers.length === 0 ? (
                                <div className="text-center py-10 text-xs text-muted-foreground">
                                    لم يتم تسجيل عمليات بعد في هذا الشهر.
                                </div>
                            ) : (
                                topPerformers.map((performer, idx) => {
                                    const rankStyles = [
                                        'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                                        'bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30',
                                        'bg-orange-600/15 text-orange-600 dark:text-orange-400 border-orange-600/30',
                                    ];
                                    return (
                                        <div
                                            key={performer.id}
                                            className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`size-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        rankStyles[idx] || 'bg-background text-muted-foreground border-border'
                                                    }`}
                                                >
                                                    {idx < 3 ? <Trophy size={14} /> : `#${idx + 1}`}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">{performer.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {performer.new_accounts} جديد · {performer.renewals} تجديد
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-left font-mono">
                                                <div className="text-xs font-bold text-primary">
                                                    ${performer.total_collected.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {performer.total_transactions} عملية
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-4 mt-auto border-t border-border text-center">
                            <span className="text-xs text-muted-foreground">
                                عدد مناديب المبيعات النشطين:
                                <strong className="text-foreground mr-1">{metrics.sales_agents_count}</strong> موظف
                            </span>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                            <div className="flex items-center gap-2">
                                <History size={20} />
                                <h3 className="text-sm font-bold text-foreground">أحدث عمليات التجديد والاشتراكات</h3>
                            </div>
                            <Link href={route('admin.audit-logs')} className="text-[11px] text-primary hover:underline font-bold">
                                عرض السجل العام
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="text-muted-foreground border-b border-border font-semibold">
                                    <tr>
                                        <th className="pb-3 font-semibold">النوع</th>
                                        <th className="pb-3 font-semibold">العميل / الشركة</th>
                                        <th className="pb-3 font-semibold">الباقة</th>
                                        <th className="pb-3 font-semibold">المندوب</th>
                                        <th className="pb-3 font-semibold">المبلغ</th>
                                        <th className="pb-3 font-semibold">الوقت</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-muted-foreground">
                                                لا توجد عمليات مسجلة حديثاً.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3.5">
                                                    {tx.action_type === 'new_account' ? (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                            عميل جديد
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-secondary-foreground border border-border">
                                                            تجديد ({tx.duration_days} يوم)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 font-bold text-foreground">
                                                    {tx.tenant?.name || 'مساحة عمل'}
                                                </td>
                                                <td className="py-3.5 text-muted-foreground font-mono">
                                                    {tx.plan_name}
                                                </td>
                                                <td className="py-3.5 text-foreground">
                                                    {tx.sales_agent?.name || 'النظام'}
                                                    {tx.is_admin_action && (
                                                        <span className="text-[9px] font-mono text-purple-500 dark:text-purple-400 block font-normal">مدير عام</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 font-mono font-bold">
                                                    {tx.is_admin_action ? (
                                                        <span className="text-[10px] text-purple-500 dark:text-purple-400 font-mono font-normal">إجراء إداري</span>
                                                    ) : tx.amount_collected ? (
                                                        <span className="text-primary font-mono">${tx.amount_collected.toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-[11px] text-muted-foreground">
                                                    {tx.created_at_human}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── 3. Clients & Usage Directory (Paginated) ── */}
                {clients && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <UsersRound size={20} className="text-primary" />
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {isRtl ? 'دليل العملاء واستهلاك الفيديوهات' : 'Clients & Video Usage'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {isRtl
                                            ? 'متابعة جميع المشتركين وعدد الفيديوهات المفرغة والرصيد المتبقي لكل عميل'
                                            : 'Monitor all client workspaces, transcribed videos count, and remaining quotas'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('sales.index')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 text-xs font-bold transition-all"
                            >
                                <span>{isRtl ? 'إدارة وتجديد الاشتراكات' : 'Manage Subscriptions'}</span>
                            </Link>
                        </div>

                        {/* Filters & Search Bar */}
                        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        (filters.filter || 'all') === 'all'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    جميع العملاء ({clients.total})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('active')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        filters.filter === 'active'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    نشطون حالياً
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('expiring_soon')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                        filters.filter === 'expiring_soon'
                                            ? 'bg-amber-400 text-primary-foreground'
                                            : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10'
                                    }`}
                                >
                                    <span>ينتهي قريباً</span>
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('expired')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        filters.filter === 'expired'
                                            ? 'bg-red-500 text-white'
                                            : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                    }`}
                                >
                                    منتهية اشتراكاتهم
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="w-full md:w-72 relative flex items-center">
                                <Search size={16} className="absolute right-3 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="بحث بالاسم، الإيميل، أو الشركة..."
                                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none"
                                />
                            </form>
                        </div>

                        {/* Clients Table */}
                        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-muted text-muted-foreground border-b border-border">
                                        <tr>
                                            <th className="py-3.5 px-4 font-bold">العميل / الشركة</th>
                                            <th className="py-3.5 px-4 font-bold">الباقة</th>
                                            <th className="py-3.5 px-4 font-bold">حالة الاشتراك</th>
                                            <th className="py-3.5 px-4 font-bold">تاريخ الانتهاء</th>
                                            <th className="py-3.5 px-4 font-bold">استهلاك الباقة</th>
                                            <th className="py-3.5 px-4 font-bold">الفيديوهات المفرغة</th>
                                            <th className="py-3.5 px-4 font-bold">المسؤول بالمبيعات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {clients.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                                    لم يتم العثور على أي عملاء يطابقون شروط البحث.
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.data.map((client) => {
                                                const isExpired =
                                                    client.subscription_status === 'expired' ||
                                                    (client.days_left !== null && client.days_left < 0);
                                                const isExpiringSoon = !isExpired && client.days_left !== null && client.days_left <= 7;
                                                const videoLimit =
                                                    client.monthly_videos_limit ||
                                                    Math.round((client.monthly_minutes_limit || 3000) / 20) ||
                                                    1;
                                                const videoUsed = client.monthly_videos_used ?? 0;
                                                const usagePercent = Math.min(100, Math.round((videoUsed / videoLimit) * 100));

                                                return (
                                                    <tr key={client.id} className="hover:bg-muted/40 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="font-bold text-foreground text-sm">{client.name}</div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {client.owner?.name} ({client.owner?.email})
                                                            </div>
                                                        </td>

                                                        <td className="py-4 px-4">
                                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-muted text-foreground border border-border">
                                                                {client.plan_name}
                                                            </span>
                                                        </td>

                                                        <td className="py-4 px-4">
                                                            {isExpired ? (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                                                                    منتهي
                                                                </span>
                                                            ) : isExpiringSoon ? (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30">
                                                                    ينتهي خلال {client.days_left} يوم
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-emerald-200 dark:border-primary/30">
                                                                    نشط ({client.days_left} يوم متبقي)
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="py-4 px-4 font-mono text-muted-foreground">
                                                            {client.expires_at || 'غير محدد'}
                                                            <span className="text-[10px] block text-muted-foreground/60">
                                                                {client.expires_at_human}
                                                            </span>
                                                        </td>

                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center justify-between text-[11px] mb-1 font-mono gap-2">
                                                                <span className="text-foreground font-bold">{videoUsed} مستهلك</span>
                                                                <span className="text-muted-foreground">/ {videoLimit} فيديو</span>
                                                            </div>
                                                            <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${
                                                                        usagePercent > 80 ? 'bg-red-500' : 'bg-primary'
                                                                    }`}
                                                                    style={{ width: `${usagePercent}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                                                                المتبقي: {client.remaining_videos} فيديو
                                                            </div>
                                                        </td>

                                                        <td className="py-4 px-4">
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs">
                                                                <Video size={13} />
                                                                <span>{client.transcripts_count} فيديو مفرغ</span>
                                                            </div>
                                                            {client.monthly_minutes_used > 0 && (
                                                                <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                                                                    ({client.monthly_minutes_used} دقيقة مستخدمة)
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-4 px-4 text-muted-foreground">
                                                            {client.sales_agent?.name || 'غير مسند'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-4 py-3 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-muted-foreground">
                                    الصفحة <strong className="text-foreground font-mono">{clients.current_page}</strong> من{' '}
                                    <strong className="text-foreground font-mono">{clients.last_page}</strong> — إجمالي العملاء:{' '}
                                    <strong className="text-foreground font-mono">{clients.total}</strong>
                                </span>

                                <div className="flex items-center flex-wrap justify-center gap-1.5">
                                    {clients.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                                            }
                                            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                                    : 'bg-card text-muted-foreground border border-border hover:bg-muted disabled:opacity-35 disabled:cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
