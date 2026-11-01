import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { BadgeCheck, BarChart3, BellRing, CalendarX, DollarSign, History, Trophy } from 'lucide-react';

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

export default function AdminDashboard({ metrics, recentTransactions, topPerformers }: Props) {
    const { isRtl } = useLanguage();

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
            </div>
        </DashboardLayout>
    );
}
