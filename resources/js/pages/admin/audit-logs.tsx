import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface AuditItem {
    id: number;
    action_type: string;
    plan_name: string;
    duration_days: number;
    videos_added?: number;
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

    const { isRtl } = useLanguage();

    return (
        <DashboardLayout
            title={isRtl ? 'سجل التدقيق والعمليات' : 'Audit Logs & Transactions'}
            subtitle={isRtl ? 'تتبع تاريخي زمني مفصل لكل عملية تسجيل أو تجديد أو تعديل رصيد' : 'Comprehensive audit trail of client onboarding and renewals'}
            actionSlot={
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={salesId}
                        onChange={(e) => {
                            setSalesId(e.target.value);
                            handleFilter(e.target.value, actionType);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground outline-hidden focus:border-primary shadow-xs"
                    >
                        <option value="" className="text-foreground dark:bg-card">{isRtl ? 'جميع مناديب المبيعات' : 'All Agents'}</option>
                        {salesAgents.map((agent) => (
                            <option key={agent.id} value={agent.id} className="text-foreground dark:bg-card">{agent.name}</option>
                        ))}
                    </select>

                    <select
                        value={actionType}
                        onChange={(e) => {
                            setActionType(e.target.value);
                            handleFilter(salesId, e.target.value);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground outline-hidden focus:border-primary shadow-xs"
                    >
                        <option value="" className="text-foreground dark:bg-card">{isRtl ? 'جميع أنواع العمليات' : 'All Actions'}</option>
                        <option value="new_account" className="text-foreground dark:bg-card">{isRtl ? 'اشتراك جديد' : 'New Client'}</option>
                        <option value="renew" className="text-foreground dark:bg-card">{isRtl ? 'تجديد اشتراك' : 'Renewal'}</option>
                    </select>
                </div>
            }
        >
            <Head title={isRtl ? 'سجل تدقيق الاشتراكات العام | فرغلي' : 'Audit Logs & Transactions | Farghly'} />

            <div className="space-y-6">

                {/* Audit Logs Table */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs dark:shadow-xl mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">التاريخ والوقت</th>
                                    <th className="py-3.5 px-4 font-bold">الموظف المنفذ</th>
                                    <th className="py-3.5 px-4 font-bold">العميل / الشركة</th>
                                    <th className="py-3.5 px-4 font-bold">نوع الإجراء</th>
                                    <th className="py-3.5 px-4 font-bold">الباقة والمدة</th>
                                    <th className="py-3.5 px-4 font-bold">الفيديوهات الممنوحة</th>
                                    <th className="py-3.5 px-4 font-bold">صلاحية الاشتراك</th>
                                    <th className="py-3.5 px-4 font-bold">المبلغ المسجل</th>
                                    <th className="py-3.5 px-4 font-bold">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-muted-foreground">
                                            لا توجد أي سجلات تطابق الفلترة المحددة.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-muted-foreground whitespace-nowrap">
                                                {item.created_at}
                                                <span className="text-[10px] block text-muted-foreground/60">{item.created_at_human}</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-foreground whitespace-nowrap">
                                                {item.sales_agent?.name || 'النظام'}
                                                {item.is_super_admin_action && (
                                                    <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 block font-normal">مدير عام</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-primary whitespace-nowrap">
                                                {item.tenant?.name || '—'}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {item.action_type === 'new_account' ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                                                        تسجيل عميل جديد
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                                                        تجديد وتمديد
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-foreground">
                                                {item.plan_name} <span className="text-muted-foreground/60">({item.duration_days} يوم)</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                {(item.videos_added && item.videos_added > 0)
                                                    ? `+${item.videos_added} فيديو`
                                                    : (item.minutes_added > 0 ? `+${Math.round(item.minutes_added / 20)} فيديو` : '—')}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                                {item.previous_expires_at ? `${item.previous_expires_at} → ` : 'جديد → '}
                                                <strong className="text-foreground">{item.new_expires_at || '—'}</strong>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                                                {item.is_super_admin_action ? (
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-300 font-mono font-normal">إجراء إداري (غير محتسب كإيراد)</span>
                                                ) : item.amount_collected ? (
                                                    <span className="text-primary font-mono">${item.amount_collected.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/50">—</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate" title={item.notes || ''}>
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
                                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                        : 'bg-card text-muted-foreground border border-border hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
