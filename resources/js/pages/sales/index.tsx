import StaffHeader from '@/components/staff-header';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface ClientItem {
    id: number;
    name: string;
    plan_name: string;
    subscription_status: string;
    expires_at: string | null;
    expires_at_human: string | null;
    days_left: number | null;
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
    clients: PaginatedClients;
    filters: {
        filter?: string;
        search?: string;
    };
    myMetrics: {
        title?: string;
        subtitle?: string;
        is_super_admin?: boolean;
        new_accounts: number;
        renewals: number;
        total_transactions: number;
        total_collected: number;
        total_minutes_granted: number;
    };
    availablePlans: Record<string, { name: string; minutes: number; default_price: number }>;
    availablePeriods: Record<string, string>;
}

export default function SalesIndex({ clients, filters, myMetrics, availablePlans, availablePeriods }: Props) {
    const { flash, auth } = usePage().props as any;
    const isSalesOnly = (auth?.is_sales || auth?.user?.system_role === 'sales') && !(auth?.is_super_admin || auth?.user?.system_role === 'super_admin');

    const [search, setSearch] = useState(filters.search || '');
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [selectedTenantForRenew, setSelectedTenantForRenew] = useState<ClientItem | null>(null);

    // New Client Onboard Form
    const onboardForm = useForm({
        client_name: '',
        client_email: '',
        client_password: 'password123',
        company_name: '',
        plan_name: 'Creator Pro',
        duration_days: 30,
        monthly_minutes_limit: 3000,
        amount_collected: 59,
        notes: '',
    });

    // Renew Subscription Form
    const renewForm = useForm({
        duration_days: 30,
        plan_name: '',
        minutes_to_add: 0,
        reset_used_minutes: true,
        amount_collected: 59,
        notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('sales.index'), { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (newFilter: string) => {
        router.get(route('sales.index'), { ...filters, filter: newFilter, search }, { preserveState: true });
    };

    const handlePlanChange = (planKey: string) => {
        const plan = availablePlans[planKey];
        if (plan) {
            onboardForm.setData((prev) => ({
                ...prev,
                plan_name: planKey,
                monthly_minutes_limit: plan.minutes,
                amount_collected: plan.default_price,
            }));
        }
    };

    const handleOnboardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onboardForm.post(route('sales.clients.store'), {
            onSuccess: () => {
                setShowOnboardModal(false);
                onboardForm.reset();
            },
        });
    };

    const openRenewModal = (client: ClientItem) => {
        setSelectedTenantForRenew(client);
        const plan = availablePlans[client.plan_name] || availablePlans['Creator Pro'];
        renewForm.setData({
            duration_days: 30,
            plan_name: client.plan_name,
            minutes_to_add: 0,
            reset_used_minutes: true,
            amount_collected: plan ? plan.default_price : 0,
            notes: '',
        });
    };

    const handleRenewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenantForRenew) return;

        renewForm.post(route('sales.clients.renew', selectedTenantForRenew.id), {
            onSuccess: () => {
                setSelectedTenantForRenew(null);
                renewForm.reset();
            },
        });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans antialiased">
            <Head title="بوابة المبيعات وإدارة الاشتراكات | نَص تيوب" />

            <StaffHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Flash Messages */}
                {flash?.error && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-200 text-sm">
                        <span className="material-symbols-outlined text-amber-400 text-2xl">info</span>
                        <div>{flash.error}</div>
                    </div>
                )}
                {flash?.success && (
                    <div className="mb-6 p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-3 text-[#4EDEA3] text-sm">
                        <span className="material-symbols-outlined text-[#4EDEA3] text-2xl">check_circle</span>
                        <div>{flash.success}</div>
                    </div>
                )}

                {/* Sales Role Scope Notice */}
                {isSalesOnly && (
                    <div className="mb-6 px-4 py-3 rounded-2xl bg-[#141822] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-[#BBCAFF]">
                            <span className="material-symbols-outlined text-[#10B981] text-lg">verified_user</span>
                            <span>
                                <strong className="text-white">نطاق حساب المبيعات:</strong> هذا الحساب مخصص حصرياً لإدارة اشتراكات العملاء وتجديد التراخيص ومتابعة التحصيل المالي.
                            </span>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#4EDEA3] font-mono font-bold text-[11px] whitespace-nowrap">
                            إدارة الاشتراكات والمالية
                        </span>
                    </div>
                )}

                {/* Header Title & CTA */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white mb-1">
                            إدارة العملاء والاشتراكات
                        </h1>
                        <p className="text-xs text-[#BBCAFF]">
                            إنشاء حسابات العملاء، تجديد وتمديد الباقات، ومتابعة العملاء المنتهية اشتراكاتهم.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowOnboardModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        <span>تسجيل عميل واشتراك جديد</span>
                    </button>
                </div>

                {/* Performance Header Note */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4EDEA3] text-lg">trending_up</span>
                        <span className="text-xs font-bold text-white">
                            {myMetrics.title || 'إحصاءات المبيعات (هذا الشهر)'}
                        </span>
                        {myMetrics.is_super_admin && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#BBCAFF]">
                                إجمالي مناديب المبيعات (حساب المدير العام مستبعد تماماً من الإيرادات)
                            </span>
                        )}
                    </div>
                </div>

                {/* Performance KPI Cards (This Month) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-[#141822] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#BBCAFF]">عملاء جدد (هذا الشهر)</span>
                            <span className="material-symbols-outlined text-[#10B981] text-xl">group_add</span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">
                            {myMetrics.new_accounts}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141822] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#BBCAFF]">عمليات التجديد</span>
                            <span className="material-symbols-outlined text-[#4EDEA3] text-xl">autorenew</span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">
                            {myMetrics.renewals}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141822] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#BBCAFF]">الدقائق الممنوحة</span>
                            <span className="material-symbols-outlined text-amber-400 text-xl">timer</span>
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">
                            {myMetrics.total_minutes_granted.toLocaleString()} د
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141822] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#BBCAFF]">المبالغ المحصلة</span>
                            <span className="material-symbols-outlined text-emerald-400 text-xl">payments</span>
                        </div>
                        <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                            ${myMetrics.total_collected.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="p-4 rounded-2xl bg-[#141822] border border-white/10 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                (filters.filter || 'all') === 'all'
                                    ? 'bg-[#10B981] text-[#003824]'
                                    : 'text-[#BBCAFF] hover:bg-white/5'
                            }`}
                        >
                            جميع العملاء ({clients.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('active')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                filters.filter === 'active'
                                    ? 'bg-[#10B981] text-[#003824]'
                                    : 'text-[#BBCAFF] hover:bg-white/5'
                            }`}
                        >
                            نشطون حالياً
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('expiring_soon')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                filters.filter === 'expiring_soon'
                                    ? 'bg-amber-400 text-[#003824]'
                                    : 'text-amber-400 hover:bg-amber-400/10'
                            }`}
                        >
                            <span>ينتهي قريباً (خلال أسبوع)</span>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('expired')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                filters.filter === 'expired'
                                    ? 'bg-red-500 text-white'
                                    : 'text-red-400 hover:bg-red-500/10'
                            }`}
                        >
                            منتهية اشتراكاتهم
                        </button>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="w-full md:w-72 relative">
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 material-symbols-outlined text-lg">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم، الإيميل، أو الشركة..."
                            className="w-full pl-3 pr-10 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white placeholder:text-white/30 focus:border-[#10B981] outline-none"
                        />
                    </form>
                </div>

                {/* Clients Table */}
                <div className="rounded-2xl bg-[#141822] border border-white/10 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-[#0F131C] text-[#BBCAFF] border-b border-white/10">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">العميل / الشركة</th>
                                    <th className="py-3.5 px-4 font-bold">الباقة</th>
                                    <th className="py-3.5 px-4 font-bold">حالة الاشتراك</th>
                                    <th className="py-3.5 px-4 font-bold">تاريخ الانتهاء</th>
                                    <th className="py-3.5 px-4 font-bold">استهلاك الدقائق</th>
                                    <th className="py-3.5 px-4 font-bold">المسؤول بالمبيعات</th>
                                    <th className="py-3.5 px-4 font-bold text-center">إجراء التجديد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[#BBCAFF]">
                                            لم يتم العثور على أي عملاء يطابقون شروط البحث.
                                        </td>
                                    </tr>
                                ) : (
                                    clients.data.map((client) => {
                                        const isExpired = client.subscription_status === 'expired' || (client.days_left !== null && client.days_left < 0);
                                        const isExpiringSoon = !isExpired && client.days_left !== null && client.days_left <= 7;
                                        const usagePercent = Math.min(100, Math.round((client.monthly_minutes_used / (client.monthly_minutes_limit || 1)) * 100));

                                        return (
                                            <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-white text-sm">{client.name}</div>
                                                    <div className="text-[11px] text-[#BBCAFF]">
                                                        {client.owner?.name} ({client.owner?.email})
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-white/10 text-white border border-white/10">
                                                        {client.plan_name}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {isExpired ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                                            منتهي
                                                        </span>
                                                    ) : isExpiringSoon ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                                                            ينتهي خلال {client.days_left} يوم
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-[#4EDEA3] border border-emerald-500/30">
                                                            نشط ({client.days_left} يوم متبقي)
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 font-mono text-[#BBCAFF]">
                                                    {client.expires_at || 'غير محدد'}
                                                    <span className="text-[10px] block text-white/40">{client.expires_at_human}</span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                                                        <span className="text-white font-bold">{client.monthly_minutes_used} د</span>
                                                        <span className="text-[#BBCAFF]">/ {client.monthly_minutes_limit} د</span>
                                                    </div>
                                                    <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-400' : 'bg-[#10B981]'}`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 text-[#BBCAFF]">
                                                    {client.sales_agent?.name || 'غير مسند'}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRenewModal(client)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981] text-[#4EDEA3] hover:text-[#003824] border border-[#10B981]/30 text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">autorenew</span>
                                                        <span>تجديد الاشتراك</span>
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
            </main>

            {/* MODAL 1: ONBOARD NEW CLIENT */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-xl my-8 rounded-3xl bg-[#141822] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">تسجيل عميل جديد وتفعيل باقته</h3>
                                <p className="text-xs text-[#BBCAFF]">إنشاء حساب مشترك جديد وربطه بمساحة عمل وباقة مفعلة فوراً</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOnboardModal(false)}
                                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">اسم العميل:</label>
                                    <input
                                        type="text"
                                        required
                                        value={onboardForm.data.client_name}
                                        onChange={(e) => onboardForm.setData('client_name', e.target.value)}
                                        placeholder="مثال: د. أحمد المنصور"
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    />
                                    {onboardForm.errors.client_name && (
                                        <p className="text-red-400 text-xs mt-1">{onboardForm.errors.client_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">اسم الشركة / الاستوديو:</label>
                                    <input
                                        type="text"
                                        value={onboardForm.data.company_name}
                                        onChange={(e) => onboardForm.setData('company_name', e.target.value)}
                                        placeholder="مثال: استوديو الرواد للإنتاج"
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">البريد الإلكتروني للعميل:</label>
                                    <input
                                        type="email"
                                        required
                                        value={onboardForm.data.client_email}
                                        onChange={(e) => onboardForm.setData('client_email', e.target.value)}
                                        placeholder="client@company.com"
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    />
                                    {onboardForm.errors.client_email && (
                                        <p className="text-red-400 text-xs mt-1">{onboardForm.errors.client_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">كلمة المرور المؤقتة:</label>
                                    <input
                                        type="text"
                                        required
                                        value={onboardForm.data.client_password}
                                        onChange={(e) => onboardForm.setData('client_password', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white font-mono outline-none focus:border-[#10B981]"
                                    />
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div>
                                <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">اختر الباقة المعتمدة:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.entries(availablePlans).map(([key, plan]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handlePlanChange(key)}
                                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                onboardForm.data.plan_name === key
                                                    ? 'bg-[#10B981]/15 border-[#10B981] text-[#4EDEA3] shadow-md font-bold'
                                                    : 'bg-[#0F131C] border-white/10 text-[#BBCAFF] hover:border-white/20'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">{key}</div>
                                            <div className="text-[10px] text-white/50">{plan.minutes.toLocaleString()} دقيقة</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration & Minutes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">مدة الاشتراك الأولى:</label>
                                    <select
                                        value={onboardForm.data.duration_days}
                                        onChange={(e) => onboardForm.setData('duration_days', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    >
                                        {Object.entries(availablePeriods).map(([days, label]) => (
                                            <option key={days} value={days}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">رصيد الدقائق الشهري:</label>
                                    <input
                                        type="number"
                                        required
                                        value={onboardForm.data.monthly_minutes_limit}
                                        onChange={(e) => onboardForm.setData('monthly_minutes_limit', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white font-mono outline-none focus:border-[#10B981]"
                                    />
                                </div>
                            </div>

                            {/* Offline Amount & Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">المبلغ المحصل خارجياً ($):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={onboardForm.data.amount_collected}
                                        onChange={(e) => onboardForm.setData('amount_collected', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white font-mono outline-none focus:border-[#10B981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">ملاحظات / رقم الحوالة:</label>
                                    <input
                                        type="text"
                                        value={onboardForm.data.notes}
                                        onChange={(e) => onboardForm.setData('notes', e.target.value)}
                                        placeholder="مثال: تحويل بنكي رقم #84729"
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardModal(false)}
                                    className="px-4 py-2 text-xs text-[#BBCAFF] hover:text-white"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={onboardForm.processing}
                                    className="px-6 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {onboardForm.processing ? 'جاري إنشاء الحساب...' : 'تفعيل العميل الآن'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: RENEW / EXTEND CLIENT SUBSCRIPTION */}
            {selectedTenantForRenew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-lg my-8 rounded-3xl bg-[#141822] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    تجديد اشتراك: {selectedTenantForRenew.name}
                                </h3>
                                <p className="text-xs text-[#BBCAFF]">
                                    تمديد تاريخ الصلاحية وإعادة تعبئة دقائق التلخيص والتفريغ
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTenantForRenew(null)}
                                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRenewSubmit} className="space-y-4">
                            {/* Quick Extension Period Buttons */}
                            <div>
                                <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">مدة التمديد:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { days: 30, label: '+ شهر واحد' },
                                        { days: 90, label: '+ 3 أشهر' },
                                        { days: 180, label: '+ 6 أشهر' },
                                        { days: 365, label: '+ سنة كاملة' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.days}
                                            type="button"
                                            onClick={() => renewForm.setData('duration_days', opt.days)}
                                            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                                                renewForm.data.duration_days === opt.days
                                                    ? 'bg-[#10B981] text-[#003824] shadow-md'
                                                    : 'bg-[#0F131C] border-white/10 text-white hover:border-white/20'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset usage toggle */}
                            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0F131C] border border-white/10 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={renewForm.data.reset_used_minutes}
                                    onChange={(e) => renewForm.setData('reset_used_minutes', e.target.checked)}
                                    className="w-4 h-4 rounded text-[#10B981] bg-[#0F131C] border-white/20"
                                />
                                <div className="text-xs">
                                    <span className="font-bold text-white block">تصفير الدقائق المستهلكة للشهر الجديد</span>
                                    <span className="text-[10px] text-[#BBCAFF]">إعادة عداد الاستهلاك إلى 0 مع استعادة كامل رصيد الباقة ({selectedTenantForRenew.monthly_minutes_limit} دقيقة)</span>
                                </div>
                            </label>

                            {/* Add extra minutes */}
                            <div>
                                <label className="block text-xs font-bold text-[#DFE2EE] mb-1">
                                    إضافة دقائق بونص إضافية للرصيد (اختياري):
                                </label>
                                <input
                                    type="number"
                                    value={renewForm.data.minutes_to_add}
                                    onChange={(e) => renewForm.setData('minutes_to_add', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white font-mono outline-none focus:border-[#10B981]"
                                />
                            </div>

                            {/* Amount & Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">المبلغ المحصل للتجديد ($):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={renewForm.data.amount_collected}
                                        onChange={(e) => renewForm.setData('amount_collected', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white font-mono outline-none focus:border-[#10B981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1">ملاحظة التجديد:</label>
                                    <input
                                        type="text"
                                        value={renewForm.data.notes}
                                        onChange={(e) => renewForm.setData('notes', e.target.value)}
                                        placeholder="تجديد يدوي..."
                                        className="w-full px-3 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTenantForRenew(null)}
                                    className="px-4 py-2 text-xs text-[#BBCAFF] hover:text-white"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={renewForm.processing}
                                    className="px-6 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {renewForm.processing ? 'جاري التجديد...' : 'تأكيد التجديد الآن'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
