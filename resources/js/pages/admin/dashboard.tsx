import StaffHeader from '@/components/staff-header';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

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
    return (
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans antialiased">
            <Head title="لوحة الإدارة العليا | نَص تيوب" />

            <StaffHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Title & Quick Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white mb-1">
                            لوحة الإدارة العامة ومؤشرات النظام
                        </h1>
                        <p className="text-xs text-[#BBCAFF]">
                            نظرة عامة على أداء الاشتراكات، مؤشرات المبيعات، ومراقبة حركة المشتركين في المنصة.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.performance')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1C2028] border border-white/10 text-xs font-bold text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-sm text-[#4EDEA3]">leaderboard</span>
                            <span>أداء المبيعات المقارن</span>
                        </Link>

                        <Link
                            href={route('admin.sales-team.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] text-xs font-bold shadow-md transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">badge</span>
                            <span>إدارة فريق المبيعات</span>
                        </Link>
                    </div>
                </div>

                {/* 1. Main KPI Stat Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Active Clients */}
                    <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#BBCAFF]">المشتركون النشطون</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                        </div>
                        <div className="text-3xl font-extrabold text-white font-mono">
                            {metrics.active_tenants}
                        </div>
                        <div className="text-[11px] text-[#BBCAFF] mt-2">
                            من إجمالي {metrics.total_tenants} مساحة عمل مسجلة
                        </div>
                    </div>

                    {/* Expiring Soon */}
                    <div className="p-5 rounded-2xl bg-[#141822] border border-amber-500/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-amber-400">ينتهي خلال 7 أيام</span>
                            <span className="material-symbols-outlined text-amber-400 text-xl">notification_important</span>
                        </div>
                        <div className="text-3xl font-extrabold text-amber-400 font-mono">
                            {metrics.expiring_soon}
                        </div>
                        <div className="text-[11px] text-[#BBCAFF] mt-2">
                            فرص تجديد ساخنة لمتابعة فريق المبيعات
                        </div>
                    </div>

                    {/* Expired Clients */}
                    <div className="p-5 rounded-2xl bg-[#141822] border border-red-500/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-red-400">اشتراكات منتهية</span>
                            <span className="material-symbols-outlined text-red-400 text-xl">event_busy</span>
                        </div>
                        <div className="text-3xl font-extrabold text-red-400 font-mono">
                            {metrics.expired_tenants}
                        </div>
                        <div className="text-[11px] text-[#BBCAFF] mt-2">
                            بحاجة لإعادة التواصل والتنشيط
                        </div>
                    </div>

                    {/* Sales Revenue */}
                    <div className="p-5 rounded-2xl bg-[#141822] border border-emerald-500/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-emerald-400">المبيعات المحصلة (الشهر)</span>
                            <span className="material-symbols-outlined text-emerald-400 text-xl">attach_money</span>
                        </div>
                        <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                            ${metrics.month_revenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#BBCAFF] mt-2">
                            {metrics.month_renewals} تجديد + {metrics.month_new_clients} عميل جديد
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Sales Performers this month */}
                    <div className="lg:col-span-1 rounded-2xl bg-[#141822] border border-white/10 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-400 text-xl">emoji_events</span>
                                    <h3 className="text-sm font-bold text-white">متصدرو مبيعات هذا الشهر</h3>
                                </div>
                                <Link href={route('admin.performance')} className="text-[11px] text-[#4EDEA3] hover:underline font-bold">
                                    كامل الترتيب
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {topPerformers.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-[#BBCAFF]">
                                        لم يتم تسجيل عمليات بعد في هذا الشهر.
                                    </div>
                                ) : (
                                    topPerformers.map((performer, idx) => {
                                        const medals = ['🥇', '🥈', '🥉'];
                                        return (
                                            <div
                                                key={performer.id}
                                                className="p-3 rounded-xl bg-[#0F131C] border border-white/5 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{medals[idx] || `#${idx + 1}`}</span>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{performer.name}</div>
                                                        <div className="text-[10px] text-[#BBCAFF]">
                                                            {performer.new_accounts} جديد • {performer.renewals} تجديد
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-left font-mono">
                                                    <div className="text-xs font-bold text-emerald-400">
                                                        ${performer.total_collected.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-[#BBCAFF]">
                                                        {performer.total_transactions} عملية
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-white/10 text-center">
                            <span className="text-xs text-[#BBCAFF]">
                                عدد مناديب المبيعات النشطين: <strong className="text-white">{metrics.sales_agents_count}</strong> موظف
                            </span>
                        </div>
                    </div>

                    {/* Recent Transactions Across Platform */}
                    <div className="lg:col-span-2 rounded-2xl bg-[#141822] border border-white/10 p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4EDEA3] text-xl">history</span>
                                <h3 className="text-sm font-bold text-white">أحدث عمليات التجديد والاشتراكات</h3>
                            </div>
                            <Link href={route('admin.audit-logs')} className="text-[11px] text-[#4EDEA3] hover:underline font-bold">
                                عرض السجل العام
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="text-[#BBCAFF] border-b border-white/5 font-bold">
                                    <tr>
                                        <th className="pb-3">النوع</th>
                                        <th className="pb-3">العميل / الشركة</th>
                                        <th className="pb-3">الباقة</th>
                                        <th className="pb-3">المندوب</th>
                                        <th className="pb-3">المبلغ</th>
                                        <th className="pb-3">الوقت</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-[#BBCAFF]">
                                                لا توجد عمليات مسجلة حديثاً.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/[0.02]">
                                                <td className="py-3">
                                                    {tx.action_type === 'new_account' ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#4EDEA3]">
                                                            عميل جديد
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300">
                                                            تجديد ({tx.duration_days} يوم)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 font-bold text-white">
                                                    {tx.tenant?.name || 'مساحة عمل'}
                                                </td>
                                                <td className="py-3 text-[#BBCAFF] font-mono">
                                                    {tx.plan_name}
                                                </td>
                                                <td className="py-3 text-white">
                                                    {tx.sales_agent?.name || 'النظام'}
                                                    {tx.is_admin_action && (
                                                        <span className="text-[9px] font-mono text-purple-400 block font-normal">مدير عام</span>
                                                    )}
                                                </td>
                                                <td className="py-3 font-mono font-bold">
                                                    {tx.is_admin_action ? (
                                                        <span className="text-[10px] text-purple-300 font-mono font-normal">إجراء إداري (غير محتسب)</span>
                                                    ) : tx.amount_collected ? (
                                                        <span className="text-emerald-400 font-mono">${tx.amount_collected.toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-white/30">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-[11px] text-white/40">
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
            </main>
        </div>
    );
}
