import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { Trophy, X } from 'lucide-react';

interface LeaderboardItem {
    id: number;
    name: string;
    email: string;
    system_role: string;
    new_accounts: number;
    renewals: number;
    total_transactions: number;
    total_collected: number;
    total_videos_granted?: number;
    total_minutes_granted: number;
    last_transaction: string | null;
}

interface Props {
    leaderboard: LeaderboardItem[];
    period: string;
    selectedAgent: {
        agent: {
            id: number;
            name: string;
            email: string;
            system_role: string;
        };
        new_accounts: number;
        renewals: number;
        total_collected: number;
        total_videos_granted?: number;
        total_minutes_granted: number;
        transactions: Array<{
            id: number;
            action_type: string;
            plan_name: string;
            duration_days: number;
            amount_collected: number;
            notes: string | null;
            created_at_human: string;
            tenant_name: string | null;
        }>;
    } | null;
}

export default function AdminPerformance({ leaderboard, period, selectedAgent }: Props) {
    const periods = [
        { id: 'today', label: 'اليوم' },
        { id: 'this_week', label: 'هذا الأسبوع' },
        { id: 'this_month', label: 'هذا الشهر' },
        { id: 'last_month', label: 'الشهر الماضي' },
        { id: 'last_90_days', label: 'آخر 90 يوماً' },
        { id: 'all_time', label: 'كل الأوقات' },
    ];

    const handlePeriodChange = (newPeriod: string) => {
        router.get(route('admin.performance'), { period: newPeriod }, { preserveState: true });
    };

    const handleSelectAgent = (agentId: number) => {
        router.get(route('admin.performance'), { period, sales_id: agentId }, { preserveState: true });
    };

    const handleCloseDrilldown = () => {
        router.get(route('admin.performance'), { period }, { preserveState: true });
    };

    const { isRtl } = useLanguage();

    return (
        <DashboardLayout
            title={isRtl ? 'مؤشرات أداء المبيعات' : 'Sales Performance Analytics'}
            subtitle={isRtl ? 'تحليل حجم الاشتراكات والتجديدات والمبالغ المحصلة' : 'Track new subscriptions, renewals and revenue'}
            actionSlot={
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border shadow-2xs">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePeriodChange(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                period === p.id
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title={isRtl ? 'مؤشرات أداء فريق المبيعات | فرغلي' : 'Sales Performance Analytics | Farghly'} />

            <div className="space-y-6">

                {/* Leaderboard Table */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs dark:shadow-xl mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold text-center w-16">الترتيب</th>
                                    <th className="py-3.5 px-4 font-bold">اسم الموظف</th>
                                    <th className="py-3.5 px-4 font-bold text-center">عملاء جدد</th>
                                    <th className="py-3.5 px-4 font-bold text-center">تجديدات</th>
                                    <th className="py-3.5 px-4 font-bold text-center">إجمالي العمليات</th>
                                    <th className="py-3.5 px-4 font-bold">الفيديوهات الممنوحة</th>
                                    <th className="py-3.5 px-4 font-bold">المبالغ المحصلة</th>
                                    <th className="py-3.5 px-4 font-bold">آخر نشاط</th>
                                    <th className="py-3.5 px-4 font-bold text-center">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-muted-foreground">
                                            لا توجد بيانات مسجلة لفريق المبيعات خلال هذه الفترة.
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((item, idx) => {
                                        const rankStyles = [
                                            'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                                            'bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30',
                                            'bg-orange-600/15 text-orange-600 dark:text-orange-400 border-orange-600/30',
                                        ];
                                        return (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-4 px-4 text-center">
                                                    <div
                                                        className={`inline-flex size-7 rounded-lg border items-center justify-center font-bold text-xs ${
                                                            rankStyles[idx] || 'bg-background text-muted-foreground border-border'
                                                        }`}
                                                    >
                                                        {idx < 3 ? <Trophy size={14} /> : `#${idx + 1}`}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-foreground text-sm">{item.name}</div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {item.email} •{' '}
                                                        <span className="text-primary font-mono">
                                                            {item.system_role === 'super_admin' ? 'مدير عام' : 'مندوب مبيعات'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 text-center font-mono font-bold text-foreground text-sm">
                                                    {item.new_accounts}
                                                </td>

                                                <td className="py-4 px-4 text-center font-mono font-bold text-foreground text-sm">
                                                    {item.renewals}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/25">
                                                        {item.total_transactions}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 font-mono text-muted-foreground">
                                                    {(item.total_videos_granted ?? Math.round(item.total_minutes_granted / 20)).toLocaleString()} فيديو
                                                </td>

                                                <td className="py-4 px-4 font-mono font-bold text-primary text-sm">
                                                    ${item.total_collected.toLocaleString()}
                                                </td>

                                                <td className="py-4 px-4 text-[11px] text-muted-foreground/60">
                                                    {item.last_transaction || 'لا يوجد نشاط'}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectAgent(item.id)}
                                                        className="px-3 py-1 rounded-xl bg-muted hover:bg-muted/80 dark:bg-white/5 dark:hover:bg-white/10 text-foreground text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        استعراض السجل
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DRILLDOWN MODAL / AUDIT OF SELECTED AGENT */}
                {selectedAgent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
                        <div className="w-full max-w-2xl my-8 rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative text-right">
                            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">
                                        سجل أداء الموظف: {selectedAgent.agent.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedAgent.agent.email} • الفترة: {periods.find(p => p.id === period)?.label}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseDrilldown}
                                    className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Summary Metric Cards */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-muted border border-border/50 text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">عملاء جدد</div>
                                    <div className="text-xl font-bold font-mono text-foreground">{selectedAgent.new_accounts}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-muted border border-border/50 text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">تجديدات</div>
                                    <div className="text-xl font-bold font-mono text-foreground">{selectedAgent.renewals}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-muted border border-border/50 text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">الفيديوهات الممنوحة</div>
                                    <div className="text-xl font-bold font-mono text-amber-500 dark:text-amber-400">{(selectedAgent.total_videos_granted ?? Math.round(selectedAgent.total_minutes_granted / 20)).toLocaleString()}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-muted border border-border/50 text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">المحصل</div>
                                    <div className="text-xl font-bold font-mono text-primary">${selectedAgent.total_collected.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Transactions stream */}
                            <div className="space-y-2.5 max-h-80 overflow-y-auto pl-1">
                                {selectedAgent.transactions.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-muted-foreground">
                                        لا توجد عمليات منفذة بواسطة هذا المندوب خلال الفترة المختارة.
                                    </div>
                                ) : (
                                    selectedAgent.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="p-3 rounded-xl bg-muted border border-border/50 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        tx.action_type === 'new_account'
                                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                                            : 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20'
                                                    }`}>
                                                        {tx.action_type === 'new_account' ? 'عميل جديد' : 'تجديد اشتراك'}
                                                    </span>
                                                    <span className="font-bold text-foreground">{tx.tenant_name || 'مساحة عمل'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">({tx.plan_name})</span>
                                                </div>
                                                {tx.notes && (
                                                    <div className="text-[11px] text-muted-foreground">{tx.notes}</div>
                                                )}
                                            </div>

                                            <div className="text-left font-mono">
                                                <div className="font-bold text-primary">
                                                    {tx.amount_collected ? `$${tx.amount_collected.toFixed(2)}` : '—'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground/60">{tx.created_at_human}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
