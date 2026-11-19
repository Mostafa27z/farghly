import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Clock,
    CreditCard,
    Equal,
    Film,
    Info,
    Mic,
    Monitor,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserPlus,
    UsersRound,
    X,
} from 'lucide-react';

interface ClientItem {
    id: number;
    name: string;
    plan_name: string;
    subscription_status: string;
    expires_at: string | null;
    expires_at_human: string | null;
    days_left: number | null;
    monthly_videos_limit?: number;
    monthly_videos_used?: number;
    remaining_videos?: number;
    monthly_minutes_limit: number;
    monthly_minutes_used: number;
    remaining_minutes: number;
    monthly_recording_minutes_limit?: number;
    monthly_recording_minutes_used?: number;
    remaining_recording_minutes?: number;
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
        total_videos_granted?: number;
        total_minutes_granted: number;
    };
    availablePlans: Record<string, { name: string; videos?: number; minutes?: number; recording_minutes?: number; default_price: number }>;
    availablePeriods: Record<string, string>;
}

export default function SalesIndex({ clients, filters, myMetrics, availablePlans, availablePeriods }: Props) {
    const { flash, auth } = usePage().props as any;
    const { lang, setLang, isRtl } = useLanguage();
    const isSalesOnly = (auth?.is_sales || auth?.user?.system_role === 'sales') && !(auth?.is_super_admin || auth?.user?.system_role === 'super_admin');

    const [search, setSearch] = useState(filters.search || '');
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [selectedTenantForRenew, setSelectedTenantForRenew] = useState<ClientItem | null>(null);

    // New Client Onboard Form (Videos Quota + Recording Minutes)
    const onboardForm = useForm({
        client_name: '',
        client_email: '',
        client_password: 'password123',
        company_name: '',
        plan_name: 'Creator Pro',
        duration_days: 30,
        monthly_videos_limit: 150,
        monthly_recording_minutes_limit: 300,
        amount_collected: 59,
        notes: '',
    });

    // Renew Subscription Form (Videos Quota + Recording Minutes)
    const renewForm = useForm({
        duration_days: 30,
        plan_name: '',
        new_videos_limit: 150,
        new_recording_minutes_limit: 300,
        videos_to_add: 0,
        recording_minutes_to_add: 0,
        reset_used_videos: true as boolean,
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
                monthly_videos_limit: plan.videos || 150,
                monthly_recording_minutes_limit: plan.recording_minutes || 300,
                amount_collected: plan.default_price,
            }));
        }
    };

    const handleRenewPlanChange = (planKey: string) => {
        const plan = availablePlans[planKey];
        if (plan) {
            renewForm.setData((prev) => ({
                ...prev,
                plan_name: planKey,
                new_videos_limit: plan.videos || 150,
                new_recording_minutes_limit: plan.recording_minutes || 300,
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
        const oldVideos = client.monthly_videos_limit ?? (client.monthly_minutes_limit ? Math.round(client.monthly_minutes_limit / 20) : 150);
        const oldRecording = client.monthly_recording_minutes_limit ?? 300;

        renewForm.setData({
            duration_days: 30,
            plan_name: client.plan_name,
            new_videos_limit: oldVideos,
            new_recording_minutes_limit: oldRecording,
            videos_to_add: 0,
            recording_minutes_to_add: 0,
            reset_used_videos: true,
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
        <DashboardLayout
            title={isRtl ? 'إدارة العملاء والاشتراكات' : 'Client Onboarding & Subscriptions'}
            subtitle={isRtl ? 'تسجيل المشتركين، تجديد وتمديد التراخيص، ومتابعة التحصيل' : 'Onboard clients, manage renewals and subscription quotas'}
            actionSlot={
                <button
                    type="button"
                    onClick={() => setShowOnboardModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                    <UserPlus className="size-4" />
                    <span>{isRtl ? 'تسجيل عميل جديد' : 'New Client'}</span>
                </button>
            }
        >
            <Head title={isRtl ? 'بوابة المبيعات وإدارة الاشتراكات | فرغلي' : 'Sales Portal & Subscriptions | Farghly'} />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm shadow-xs">
                        <Info className="size-4" />
                        <div>{flash.error}</div>
                    </div>
                )}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-primary text-sm shadow-xs">
                        <CheckCircle2 className="size-5" />
                        <div>{flash.success}</div>
                    </div>
                )}

                {/* Sales Role Scope Notice */}
                {isSalesOnly && (
                    <div className="px-4 py-3 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <ShieldCheck className="size-4.5" />
                            <span>
                                <strong className="text-foreground">{isRtl ? 'نطاق حساب المبيعات: ' : 'Sales Scope: '}</strong>
                                {isRtl ? 'يظهر لك هنا العملاء المسجلون باسمك فقط لإدارة اشتراكاتهم، تجديد التراخيص، ومتابعة التحصيل المالي.' : 'You can view and manage only the clients registered under your account.'}
                            </span>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-[11px] whitespace-nowrap">
                            {isRtl ? 'عملائي واشتراكاتهم' : 'My Clients Only'}
                        </span>
                    </div>
                )}

                {/* Performance Header Note */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} />
                        <span className="text-xs font-bold text-foreground">
                            {myMetrics.title || 'إحصاءات المبيعات (هذا الشهر)'}
                        </span>
                        {myMetrics.is_super_admin && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                                إجمالي مناديب المبيعات (حساب المدير العام مستبعد تماماً من الإيرادات)
                            </span>
                        )}
                    </div>
                </div>

                {/* Performance KPI Cards (This Month) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">عملاء جدد (هذا الشهر)</span>
                            <UsersRound size={20} />
                        </div>
                        <div className="text-2xl font-extrabold text-foreground font-mono">
                            {myMetrics.new_accounts}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">عمليات التجديد</span>
                            <RefreshCw size={20} />
                        </div>
                        <div className="text-2xl font-extrabold text-foreground font-mono">
                            {myMetrics.renewals}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">الفيديوهات الممنوحة</span>
                            <Monitor size={20} />
                        </div>
                        <div className="text-2xl font-extrabold text-foreground font-mono">
                            {(myMetrics.total_videos_granted ?? Math.round(myMetrics.total_minutes_granted / 20)).toLocaleString()} فيديو
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">المبالغ المحصلة</span>
                            <CreditCard size={20} />
                        </div>
                        <div className="text-2xl font-extrabold text-primary font-mono">
                            ${myMetrics.total_collected.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="p-4 rounded-2xl bg-card border border-border mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    {/* Status Tabs */}
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
                            <span>ينتهي قريباً (خلال أسبوع)</span>
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

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="w-full md:w-72 relative">
                        <Search size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم، الإيميل، أو الشركة..."
                            className="w-full pl-3 pr-10 py-2 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none"
                        />
                    </form>
                </div>

                {/* Clients Table */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">العميل / الشركة</th>
                                    <th className="py-3.5 px-4 font-bold">الباقة</th>
                                    <th className="py-3.5 px-4 font-bold">حالة الاشتراك</th>
                                    <th className="py-3.5 px-4 font-bold">تاريخ الانتهاء</th>
                                    <th className="py-3.5 px-4 font-bold">استهلاك الفيديوهات</th>
                                    <th className="py-3.5 px-4 font-bold">المسؤول بالمبيعات</th>
                                    <th className="py-3.5 px-4 font-bold text-center">إجراء التجديد</th>
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
                                        const isExpired = client.subscription_status === 'expired' || (client.days_left !== null && client.days_left < 0);
                                        const isExpiringSoon = !isExpired && client.days_left !== null && client.days_left <= 7;
                                        const videoLimit = client.monthly_videos_limit || Math.round((client.monthly_minutes_limit || 3000) / 20) || 1;
                                        const videoUsed = client.monthly_videos_used ?? 0;
                                        const usagePercent = Math.min(100, Math.round((videoUsed / videoLimit) * 100));

                                        return (
                                            <tr key={client.id} className="hover:bg-muted/50 transition-colors">
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
                                                    <span className="text-[10px] block text-muted-foreground/60">{client.expires_at_human}</span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono gap-2">
                                                        <span className="text-foreground font-bold">{videoUsed} فيديو</span>
                                                        <span className="text-muted-foreground">/ {videoLimit} فيديو</span>
                                                    </div>
                                                    <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                             className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 font-mono flex items-center justify-between">
                                                        <span>المتبقي بالتسجيل:</span>
                                                        <strong className="text-primary font-bold">{client.remaining_recording_minutes ?? 300} دقيقة</strong>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 text-muted-foreground">
                                                    {client.sales_agent?.name || 'غير مسند'}
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRenewModal(client)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        <RefreshCw size={14} />
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
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
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

            {/* MODAL 1: ONBOARD NEW CLIENT */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-xl my-8 rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">تسجيل عميل جديد وتفعيل باقته</h3>
                                <p className="text-xs text-muted-foreground">إنشاء حساب مشترك جديد وربطه بمساحة عمل وباقة مفعلة فوراً</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOnboardModal(false)}
                                className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">اسم العميل:</label>
                                    <input
                                        type="text"
                                        required
                                        value={onboardForm.data.client_name}
                                        onChange={(e) => onboardForm.setData('client_name', e.target.value)}
                                        placeholder="مثال: د. أحمد المنصور"
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                    />
                                    {onboardForm.errors.client_name && (
                                        <p className="text-red-500 text-xs mt-1">{onboardForm.errors.client_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">اسم الشركة / الاستوديو:</label>
                                    <input
                                        type="text"
                                        value={onboardForm.data.company_name}
                                        onChange={(e) => onboardForm.setData('company_name', e.target.value)}
                                        placeholder="مثال: استوديو الرواد للإنتاج"
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">البريد الإلكتروني للعميل:</label>
                                    <input
                                        type="email"
                                        required
                                        value={onboardForm.data.client_email}
                                        onChange={(e) => onboardForm.setData('client_email', e.target.value)}
                                        placeholder="client@company.com"
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                    />
                                    {onboardForm.errors.client_email && (
                                        <p className="text-red-500 text-xs mt-1">{onboardForm.errors.client_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">كلمة المرور المؤقتة:</label>
                                    <input
                                        type="text"
                                        required
                                        value={onboardForm.data.client_password}
                                        onChange={(e) => onboardForm.setData('client_password', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">اختر الباقة المعتمدة:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.entries(availablePlans).map(([key, plan]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handlePlanChange(key)}
                                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                onboardForm.data.plan_name === key
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm font-bold'
                                                    : 'bg-muted border-border text-muted-foreground hover:border-border'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">{key}</div>
                                            <div className="text-[10px] text-muted-foreground/50">{(plan.videos ?? Math.round((plan.minutes || 3000) / 20)).toLocaleString()} فيديو</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration & Limits */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">مدة الاشتراك الأولى:</label>
                                    <select
                                        value={onboardForm.data.duration_days}
                                        onChange={(e) => onboardForm.setData('duration_days', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                    >
                                        {Object.entries(availablePeriods).map(([days, label]) => (
                                            <option key={days} value={days} className="text-foreground dark:bg-card">{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">فيديوهات يوتيوب:</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={onboardForm.data.monthly_videos_limit}
                                        onChange={(e) => onboardForm.setData('monthly_videos_limit', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">دقائق تسجيل صوتي:</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={onboardForm.data.monthly_recording_minutes_limit}
                                        onChange={(e) => onboardForm.setData('monthly_recording_minutes_limit', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Offline Amount & Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">المبلغ المحصل خارجياً ($):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={onboardForm.data.amount_collected}
                                        onChange={(e) => onboardForm.setData('amount_collected', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">ملاحظات / رقم الحوالة:</label>
                                    <input
                                        type="text"
                                        value={onboardForm.data.notes}
                                        onChange={(e) => onboardForm.setData('notes', e.target.value)}
                                        placeholder="مثال: تحويل بنكي رقم #84729"
                                        className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardModal(false)}
                                    className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={onboardForm.processing}
                                    className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {onboardForm.processing ? 'جاري إنشاء الحساب...' : 'تفعيل العميل الآن'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: RENEW / EXTEND CLIENT SUBSCRIPTION */}
            {selectedTenantForRenew && (() => {
                const oldVideos = selectedTenantForRenew.monthly_videos_limit ?? (selectedTenantForRenew.monthly_minutes_limit ? Math.round(selectedTenantForRenew.monthly_minutes_limit / 20) : 150);
                const oldRecording = selectedTenantForRenew.monthly_recording_minutes_limit ?? 300;
                const currentVideos = renewForm.data.new_videos_limit ?? oldVideos;
                const currentRecording = renewForm.data.new_recording_minutes_limit ?? oldRecording;
                const deltaVideos = currentVideos - oldVideos;
                const deltaMinutes = currentRecording - oldRecording;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
                        <div className="w-full max-w-xl my-8 rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative text-right">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="size-5 text-primary" />
                                        <h3 className="text-lg font-bold text-foreground">
                                            تجديد اشتراك: {selectedTenantForRenew.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        تحديد رصيد الفيديوهات ودقائق التسجيل بدقة لفترة التجديد القادمة
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTenantForRenew(null)}
                                    className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleRenewSubmit} className="space-y-5">
                                {/* Current / Old Subscription Quota Display */}
                                <div className="p-4 rounded-2xl bg-muted/60 border border-border/70 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Info className="size-3.5 text-primary" />
                                            <span>الرصيد في الاشتراك السابق / الحالي:</span>
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-card text-foreground border border-border">
                                            {selectedTenantForRenew.plan_name}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                        <div className="p-3 rounded-xl bg-card border border-border/80 text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Film className="size-3.5 text-primary" />
                                                    <span>فيديوهات يوتيوب:</span>
                                                </span>
                                                <strong className="text-foreground font-mono text-sm">{oldVideos} فيديو</strong>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between pt-1 border-t border-border/50">
                                                <span>مستهلك: {selectedTenantForRenew.monthly_videos_used ?? 0}</span>
                                                <span>متبقي: {Math.max(0, oldVideos - (selectedTenantForRenew.monthly_videos_used ?? 0))}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-card border border-border/80 text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Mic className="size-3.5 text-primary" />
                                                    <span>دقائق التسجيل الصوتي:</span>
                                                </span>
                                                <strong className="text-foreground font-mono text-sm">{oldRecording} دقيقة</strong>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between pt-1 border-t border-border/50">
                                                <span>مستهلك: {selectedTenantForRenew.monthly_recording_minutes_used ?? 0}</span>
                                                <span>متبقي: {selectedTenantForRenew.remaining_recording_minutes ?? Math.max(0, oldRecording - (selectedTenantForRenew.monthly_recording_minutes_used ?? 0))}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-between pt-1">
                                        <span>ينتهي الاشتراك الحالي في: <strong className="text-foreground">{selectedTenantForRenew.expires_at || 'غير محدد'}</strong></span>
                                        {selectedTenantForRenew.days_left !== null && (
                                            <span>({selectedTenantForRenew.days_left > 0 ? `متبقي ${selectedTenantForRenew.days_left} يوم` : 'منتهي الصلاحية'})</span>
                                        )}
                                    </div>
                                </div>

                                {/* Plan Selection (Switch or Keep) */}
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">باقة التجديد:</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(availablePlans).map(([key, plan]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => handleRenewPlanChange(key)}
                                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                    renewForm.data.plan_name === key
                                                        ? 'bg-primary/10 border-primary text-primary shadow-xs font-bold ring-1 ring-primary'
                                                        : 'bg-muted border-border text-muted-foreground hover:border-border'
                                                }`}
                                            >
                                                <div className="text-xs font-bold">{key}</div>
                                                <div className="text-[10px] text-muted-foreground/60">
                                                    {plan.videos || 150} فيديو • {plan.recording_minutes || 300} د
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Extension Duration */}
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">مدة التمديد:</label>
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
                                                        ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                                                        : 'bg-muted border-border text-foreground hover:border-border'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quota Customization: Videos & Minutes Explicit Targets */}
                                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <span className="text-xs font-bold text-foreground">
                                            تحديد حصة الاستخدام لفترة التجديد (يمكن التثبيت أو الزيادة أو التخفيض):
                                        </span>
                                    </div>

                                    {/* 1. YouTube Videos Quota */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Film className="size-3.5 text-primary" />
                                                <span>رصيد فيديوهات يوتيوب الجديد:</span>
                                            </label>

                                            {/* Delta Badge */}
                                            {deltaVideos === 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                                                    <Equal size={12} />
                                                    <span>نفس السابق ({oldVideos} فيديو)</span>
                                                </span>
                                            ) : deltaVideos > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    <ArrowUp size={12} />
                                                    <span>زيادة +{deltaVideos} فيديو عن السابق</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    <ArrowDown size={12} />
                                                    <span>تخفيض {Math.abs(deltaVideos)} فيديو عن السابق</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={renewForm.data.new_videos_limit}
                                                onChange={(e) => renewForm.setData('new_videos_limit', Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm font-mono font-bold text-foreground outline-none focus:border-primary"
                                            />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">فيديو/شهر</span>
                                        </div>

                                        {/* Quick adjustment buttons */}
                                        <div className="flex items-center flex-wrap gap-1.5 pt-1">
                                            <span className="text-[10px] text-muted-foreground">تعديل سريع:</span>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_videos_limit', oldVideos)}
                                                className="px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground border border-border transition-all cursor-pointer"
                                            >
                                                نفس السابق ({oldVideos})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_videos_limit', currentVideos + 25)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +25
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_videos_limit', currentVideos + 50)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +50
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_videos_limit', currentVideos + 100)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +100
                                            </button>
                                            {currentVideos > 25 && (
                                                <button
                                                    type="button"
                                                    onClick={() => renewForm.setData('new_videos_limit', Math.max(1, currentVideos - 25))}
                                                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                                                >
                                                    -25
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Voice Recording Minutes Quota */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Mic className="size-3.5 text-primary" />
                                                <span>رصيد دقائق التسجيل الصوتي الجديد:</span>
                                            </label>

                                            {/* Delta Badge */}
                                            {deltaMinutes === 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                                                    <Equal size={12} />
                                                    <span>نفس السابق ({oldRecording} دقيقة)</span>
                                                </span>
                                            ) : deltaMinutes > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    <ArrowUp size={12} />
                                                    <span>زيادة +{deltaMinutes} دقيقة عن السابق</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    <ArrowDown size={12} />
                                                    <span>تخفيض {Math.abs(deltaMinutes)} دقيقة عن السابق</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={renewForm.data.new_recording_minutes_limit}
                                                onChange={(e) => renewForm.setData('new_recording_minutes_limit', Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm font-mono font-bold text-foreground outline-none focus:border-primary"
                                            />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">دقيقة/شهر</span>
                                        </div>

                                        {/* Quick adjustment buttons */}
                                        <div className="flex items-center flex-wrap gap-1.5 pt-1">
                                            <span className="text-[10px] text-muted-foreground">تعديل سريع:</span>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_recording_minutes_limit', oldRecording)}
                                                className="px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground border border-border transition-all cursor-pointer"
                                            >
                                                نفس السابق ({oldRecording})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_recording_minutes_limit', currentRecording + 60)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +60 د
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_recording_minutes_limit', currentRecording + 120)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +120 د
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => renewForm.setData('new_recording_minutes_limit', currentRecording + 300)}
                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                                            >
                                                +300 د
                                            </button>
                                            {currentRecording >= 60 && (
                                                <button
                                                    type="button"
                                                    onClick={() => renewForm.setData('new_recording_minutes_limit', Math.max(0, currentRecording - 60))}
                                                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                                                >
                                                    -60 د
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Reset usage toggle */}
                                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/60 border border-border cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={renewForm.data.reset_used_videos}
                                        onChange={(e) => renewForm.setData('reset_used_videos', e.target.checked)}
                                        className="w-4 h-4 rounded text-primary bg-card border-border cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-bold text-foreground block">تصفير عدادات الاستهلاك للشهر الجديد</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            إعادة الاستهلاك إلى 0 وبدء دورة استخدام كاملة بالرصيد الجديد ({currentVideos} فيديو و {currentRecording} دقيقة تسجيل)
                                        </span>
                                    </div>
                                </label>

                                {/* Amount & Notes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1">المبلغ المحصل للتجديد ($):</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={renewForm.data.amount_collected}
                                            onChange={(e) => renewForm.setData('amount_collected', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground font-mono outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1">ملاحظة التجديد:</label>
                                        <input
                                            type="text"
                                            value={renewForm.data.notes}
                                            onChange={(e) => renewForm.setData('notes', e.target.value)}
                                            placeholder="تجديد يدوي..."
                                            className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTenantForRenew(null)}
                                        className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={renewForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                    >
                                        <RefreshCw size={14} className={renewForm.processing ? 'animate-spin' : ''} />
                                        <span>{renewForm.processing ? 'جاري التجديد...' : 'تأكيد التجديد الآن'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}
        </DashboardLayout>
    );
}
