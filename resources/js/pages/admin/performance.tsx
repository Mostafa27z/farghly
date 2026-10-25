import StaffHeader from '@/components/staff-header';
import { Head, router } from '@inertiajs/react';
import React from 'react';

interface LeaderboardItem {
    id: number;
    name: string;
    email: string;
    system_role: string;
    new_accounts: number;
    renewals: number;
    total_transactions: number;
    total_collected: number;
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

    return (
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans antialiased">
            <Head title="مؤشرات أداء فريق المبيعات | نَص تيوب" />

            <StaffHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white mb-1">
                            لوحة متابعة ومقارنة أداء مناديب المبيعات
                        </h1>
                        <p className="text-xs text-[#BBCAFF]">
                            تحليل حجم الاشتراكات الجديدة والتجديدات، الدقائق الممنوحة، والمبالغ المحصلة لكل مسؤول مبيعات.
                        </p>
                    </div>

                    {/* Period Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141822] border border-white/10 overflow-x-auto w-full md:w-auto">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handlePeriodChange(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    period === p.id
                                        ? 'bg-[#10B981] text-[#003824] shadow-md'
                                        : 'text-[#BBCAFF] hover:text-white'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="rounded-2xl bg-[#141822] border border-white/10 overflow-hidden shadow-xl mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-[#0F131C] text-[#BBCAFF] border-b border-white/10">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold text-center w-16">الترتيب</th>
                                    <th className="py-3.5 px-4 font-bold">اسم الموظف</th>
                                    <th className="py-3.5 px-4 font-bold text-center">عملاء جدد</th>
                                    <th className="py-3.5 px-4 font-bold text-center">تجديدات</th>
                                    <th className="py-3.5 px-4 font-bold text-center">إجمالي العمليات</th>
                                    <th className="py-3.5 px-4 font-bold">الدقائق الممنوحة</th>
                                    <th className="py-3.5 px-4 font-bold">المبالغ المحصلة</th>
                                    <th className="py-3.5 px-4 font-bold">آخر نشاط</th>
                                    <th className="py-3.5 px-4 font-bold text-center">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-[#BBCAFF]">
                                            لا توجد بيانات مسجلة لفريق المبيعات خلال هذه الفترة.
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((item, idx) => {
                                        const medals = ['🥇', '🥈', '🥉'];
                                        return (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-4 text-center font-bold text-base">
                                                    {medals[idx] || (
                                                        <span className="text-white/40 font-mono text-xs">#{idx + 1}</span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-white text-sm">{item.name}</div>
                                                    <div className="text-[11px] text-[#BBCAFF]">
                                                        {item.email} •{' '}
                                                        <span className="text-emerald-400 font-mono">
                                                            {item.system_role === 'super_admin' ? 'مدير عام' : 'مندوب مبيعات'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 text-center font-mono font-bold text-white text-sm">
                                                    {item.new_accounts}
                                                </td>

                                                <td className="py-4 px-4 text-center font-mono font-bold text-white text-sm">
                                                    {item.renewals}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#10B981]/15 text-[#4EDEA3] border border-[#10B981]/30">
                                                        {item.total_transactions}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 font-mono text-[#BBCAFF]">
                                                    {item.total_minutes_granted.toLocaleString()} د
                                                </td>

                                                <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                                                    ${item.total_collected.toLocaleString()}
                                                </td>

                                                <td className="py-4 px-4 text-[11px] text-white/50">
                                                    {item.last_transaction || 'لا يوجد نشاط'}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectAgent(item.id)}
                                                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                        <div className="w-full max-w-2xl my-8 rounded-3xl bg-[#141822] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        سجل أداء الموظف: {selectedAgent.agent.name}
                                    </h3>
                                    <p className="text-xs text-[#BBCAFF]">
                                        {selectedAgent.agent.email} • الفترة: {periods.find(p => p.id === period)?.label}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseDrilldown}
                                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            {/* Summary Metric Cards */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5 text-center">
                                    <div className="text-[10px] text-[#BBCAFF] mb-1">عملاء جدد</div>
                                    <div className="text-xl font-bold font-mono text-white">{selectedAgent.new_accounts}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5 text-center">
                                    <div className="text-[10px] text-[#BBCAFF] mb-1">تجديدات</div>
                                    <div className="text-xl font-bold font-mono text-white">{selectedAgent.renewals}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5 text-center">
                                    <div className="text-[10px] text-[#BBCAFF] mb-1">الدقائق الممنوحة</div>
                                    <div className="text-xl font-bold font-mono text-amber-400">{selectedAgent.total_minutes_granted.toLocaleString()}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0F131C] border border-white/5 text-center">
                                    <div className="text-[10px] text-[#BBCAFF] mb-1">المحصل</div>
                                    <div className="text-xl font-bold font-mono text-emerald-400">${selectedAgent.total_collected.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Transactions stream */}
                            <div className="space-y-2.5 max-h-80 overflow-y-auto pl-1">
                                {selectedAgent.transactions.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-[#BBCAFF]">
                                        لا توجد عمليات منفذة بواسطة هذا المندوب خلال الفترة المختارة.
                                    </div>
                                ) : (
                                    selectedAgent.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="p-3 rounded-xl bg-[#0F131C] border border-white/5 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        tx.action_type === 'new_account'
                                                            ? 'bg-[#10B981]/15 text-[#4EDEA3]'
                                                            : 'bg-indigo-500/15 text-indigo-300'
                                                    }`}>
                                                        {tx.action_type === 'new_account' ? 'عميل جديد' : 'تجديد اشتراك'}
                                                    </span>
                                                    <span className="font-bold text-white">{tx.tenant_name || 'مساحة عمل'}</span>
                                                    <span className="text-[10px] text-[#BBCAFF] font-mono">({tx.plan_name})</span>
                                                </div>
                                                {tx.notes && (
                                                    <div className="text-[11px] text-[#BBCAFF]">{tx.notes}</div>
                                                )}
                                            </div>

                                            <div className="text-left font-mono">
                                                <div className="font-bold text-emerald-400">
                                                    {tx.amount_collected ? `$${tx.amount_collected.toFixed(2)}` : '—'}
                                                </div>
                                                <div className="text-[10px] text-white/40">{tx.created_at_human}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
