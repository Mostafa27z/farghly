import StaffHeader from '@/components/staff-header';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface AuditItem {
    id: number;
    action_type: string;
    plan_name: string;
    duration_days: number;
    minutes_added: number;
    previous_expires_at: string | null;
    new_expires_at: string | null;
    amount_collected: number;
    is_super_admin_action?: boolean;
    notes: string | null;
    created_at: string;
    created_at_human: string;
    sales_agent: { id: number; name: string; email: string; system_role?: string } | null;
    tenant: { id: number; name: string } | null;
}

interface PaginatedLogs {
    data: AuditItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs: PaginatedLogs;
    salesAgents: Array<{ id: number; name: string }>;
    filters: {
        sales_id?: string;
        action_type?: string;
    };
}

export default function AdminAuditLogs({ logs, salesAgents, filters }: Props) {
    const [salesId, setSalesId] = useState(filters.sales_id || '');
    const [actionType, setActionType] = useState(filters.action_type || '');

    const handleFilter = (newSalesId = salesId, newActionType = actionType) => {
        router.get(
            route('admin.audit-logs'),
            { sales_id: newSalesId || undefined, action_type: newActionType || undefined },
            { preserveState: true }
        );
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans antialiased">
            <Head title="سجل تدقيق الاشتراكات العام | نَص تيوب" />

            <StaffHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white mb-1">
                            سجل العمليات والتدقيق الشامل (Audit Trail)
                        </h1>
                        <p className="text-xs text-[#BBCAFF]">
                            تتبع تاريخي زمني مفصل لكل عملية تسجيل عميل أو تجديد اشتراك أو تعديل رصيد دقائق تمت في المنظومة.
                        </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={salesId}
                            onChange={(e) => {
                                setSalesId(e.target.value);
                                handleFilter(e.target.value, actionType);
                            }}
                            className="px-3 py-2 rounded-xl bg-[#141822] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                        >
                            <option value="">جميع مناديب المبيعات</option>
                            {salesAgents.map((agent) => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>

                        <select
                            value={actionType}
                            onChange={(e) => {
                                setActionType(e.target.value);
                                handleFilter(salesId, e.target.value);
                            }}
                            className="px-3 py-2 rounded-xl bg-[#141822] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                        >
                            <option value="">جميع أنواع العمليات</option>
                            <option value="new_account">اشتراك جديد (New Client)</option>
                            <option value="renew">تجديد اشتراك (Renewal)</option>
                        </select>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-2xl bg-[#141822] border border-white/10 overflow-hidden shadow-xl mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-[#0F131C] text-[#BBCAFF] border-b border-white/10">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">التاريخ والوقت</th>
                                    <th className="py-3.5 px-4 font-bold">الموظف المنفذ</th>
                                    <th className="py-3.5 px-4 font-bold">العميل / الشركة</th>
                                    <th className="py-3.5 px-4 font-bold">نوع الإجراء</th>
                                    <th className="py-3.5 px-4 font-bold">الباقة والمدة</th>
                                    <th className="py-3.5 px-4 font-bold">الدقائق الممنوحة</th>
                                    <th className="py-3.5 px-4 font-bold">صلاحية الاشتراك</th>
                                    <th className="py-3.5 px-4 font-bold">المبلغ المسجل</th>
                                    <th className="py-3.5 px-4 font-bold">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-[#BBCAFF]">
                                            لا توجد أي سجلات تطابق الفلترة المحددة.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-[#BBCAFF] whitespace-nowrap">
                                                {item.created_at}
                                                <span className="text-[10px] block text-white/40">{item.created_at_human}</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                                                {item.sales_agent?.name || 'النظام'}
                                                {item.is_super_admin_action && (
                                                    <span className="text-[9px] font-mono text-purple-400 block font-normal">مدير عام</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-[#4EDEA3] whitespace-nowrap">
                                                {item.tenant?.name || '—'}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {item.action_type === 'new_account' ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#4EDEA3] border border-[#10B981]/30">
                                                        تسجيل عميل جديد
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                                        تجديد وتمديد
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-white">
                                                {item.plan_name} <span className="text-white/40">({item.duration_days} يوم)</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-amber-400 whitespace-nowrap">
                                                {item.minutes_added > 0 ? `+${item.minutes_added.toLocaleString()} د` : '—'}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#BBCAFF] whitespace-nowrap">
                                                {item.previous_expires_at ? `${item.previous_expires_at} → ` : 'جديد → '}
                                                <strong className="text-white">{item.new_expires_at || '—'}</strong>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                                                {item.is_super_admin_action ? (
                                                    <span className="text-[10px] text-purple-300 font-mono font-normal">إجراء إداري (غير محتسب كإيراد)</span>
                                                ) : item.amount_collected ? (
                                                    <span className="text-emerald-400 font-mono">${item.amount_collected.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-white/30">—</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-[#BBCAFF] max-w-xs truncate" title={item.notes || ''}>
                                                {item.notes || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5">
                        {logs.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    link.active
                                        ? 'bg-[#10B981] text-[#003824] font-bold'
                                        : 'bg-[#141822] text-[#BBCAFF] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
