import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Layers,
    Mic,
    Pencil,
    Plus,
    Power,
    Shield,
    Sparkles,
    Trash2,
    Users,
    Video,
    X,
} from 'lucide-react';

interface PlanItem {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    monthly_videos_limit: number;
    monthly_recording_minutes_limit: number;
    monthly_minutes_limit: number;
    price: number;
    max_team_members: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

interface Props {
    plans: PlanItem[];
    tenantCounts: Record<string, number>;
}

export default function PlansManagement({ plans, tenantCounts }: Props) {
    const { isRtl } = useLanguage();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

    // Form for creating a plan
    const createForm = useForm({
        name: '',
        display_name: '',
        description: '',
        monthly_videos_limit: 150,
        monthly_recording_minutes_limit: 300,
        price: 59,
        max_team_members: 5,
        sort_order: plans.length + 1,
        is_active: true,
    });

    // Form for updating an existing plan
    const editForm = useForm({
        display_name: '',
        description: '',
        monthly_videos_limit: 150,
        monthly_recording_minutes_limit: 300,
        price: 59,
        max_team_members: 5,
        sort_order: 1,
        is_active: true,
    });

    const openEditModal = (plan: PlanItem) => {
        setEditingPlan(plan);
        editForm.setData({
            display_name: plan.display_name,
            description: plan.description || '',
            monthly_videos_limit: plan.monthly_videos_limit,
            monthly_recording_minutes_limit: plan.monthly_recording_minutes_limit,
            price: plan.price,
            max_team_members: plan.max_team_members,
            sort_order: plan.sort_order,
            is_active: plan.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.plans.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;

        editForm.put(route('admin.plans.update', editingPlan.id), {
            onSuccess: () => {
                setEditingPlan(null);
            },
        });
    };

    const handleToggle = (planId: number) => {
        router.post(route('admin.plans.toggle', planId), {}, { preserveScroll: true });
    };

    const handleDelete = (plan: PlanItem) => {
        const count = tenantCounts[plan.name] || 0;
        if (count > 0) {
            alert(isRtl
                ? `لا يمكن حذف هذه الباقة لأن هناك (${count}) عملاء مشتركون بها حالياً. يمكنك تعطيلها بدلاً من ذلك.`
                : `Cannot delete plan because (${count}) active clients are subscribed to it. You can deactivate it instead.`
            );
            return;
        }

        if (confirm(isRtl ? `هل أنت متأكد من حذف باقة «${plan.display_name}» نهائياً؟` : `Delete plan "${plan.display_name}"?`)) {
            router.delete(route('admin.plans.destroy', plan.id), { preserveScroll: true });
        }
    };

    const activePlansCount = plans.filter((p) => p.is_active).length;
    const totalSubscribedClients = Object.values(tenantCounts).reduce((a, b) => a + b, 0);

    return (
        <DashboardLayout
            title={isRtl ? 'إدارة الباقات والأسعار' : 'Plans & Quotas Management'}
            subtitle={isRtl ? 'تحديد حدود الفيديوهات ودقائق التسجيل وأسعار الباقات التجارية' : 'Manage subscription plans, limits, and pricing'}
            actionSlot={
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer"
                >
                    <Plus className="size-4" />
                    <span>{isRtl ? 'إنشاء باقة جديدة' : 'Create New Plan'}</span>
                </button>
            }
        >
            <Head title={isRtl ? 'إدارة الباقات والأسعار | فرغلي' : 'Plans Management | Farghly'} />

            <div className="space-y-6">
                {/* 1. Quick Stats Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'إجمالي الباقات المتاحة' : 'Total Plans'}</span>
                            <div className="text-2xl font-black text-foreground font-mono">{plans.length}</div>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                {activePlansCount} {isRtl ? 'باقة نشطة ومعروضة للمبيعات' : 'active plans'}
                            </span>
                        </div>
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                            <CreditCard className="size-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'المشتركون بالباقات' : 'Subscribed Clients'}</span>
                            <div className="text-2xl font-black text-foreground font-mono">{totalSubscribedClients}</div>
                            <span className="text-[11px] text-muted-foreground">
                                {isRtl ? 'موزعون على الباقات الحالية' : 'across all active plans'}
                            </span>
                        </div>
                        <div className="size-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                            <Users className="size-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground">{isRtl ? 'نظام الحدود المستقلة' : 'Independent Quotas'}</span>
                            <div className="text-sm font-black text-foreground">{isRtl ? 'فيديوهات يوتيوب + دقائق صوت' : 'YouTube + Audio Mins'}</div>
                            <span className="text-[11px] text-muted-foreground">
                                {isRtl ? 'تحكم مرن لكل باقة على حدة' : 'Independent quota limits'}
                            </span>
                        </div>
                        <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <Sparkles className="size-5" />
                        </div>
                    </div>
                </div>

                {/* 2. Plans Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => {
                        const subscriberCount = tenantCounts[plan.name] || 0;
                        return (
                            <div
                                key={plan.id}
                                className={`rounded-3xl bg-card border transition-all p-5 flex flex-col justify-between relative overflow-hidden group shadow-xs hover:shadow-md ${
                                    plan.is_active ? 'border-border/80 hover:border-primary/50' : 'border-border/40 opacity-70 bg-muted/20'
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Header & Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                                                {plan.name}
                                            </span>
                                            <h3 className="text-base font-extrabold text-foreground mt-1.5">
                                                {plan.display_name}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(plan.id)}
                                            className={`size-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                                plan.is_active
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                            title={plan.is_active ? 'الباقة نشطة (انقر للتعطيل)' : 'الباقة معطلة (انقر للتفعيل)'}
                                        >
                                            <Power className="size-4" />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-foreground font-mono tracking-tight">
                                            ${plan.price}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-semibold">
                                            {isRtl ? '/ شهرياً' : '/ month'}
                                        </span>
                                    </div>

                                    {plan.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {plan.description}
                                        </p>
                                    )}

                                    {/* Quota Limits Breakdown */}
                                    <div className="space-y-2 pt-3 border-t border-border/50 text-xs">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/50">
                                            <span className="text-muted-foreground flex items-center gap-1.5 font-bold">
                                                <Video className="size-3.5 text-red-500" />
                                                <span>{isRtl ? 'فيديوهات يوتيوب:' : 'YouTube Videos:'}</span>
                                            </span>
                                            <span className="font-mono font-extrabold text-foreground">
                                                {plan.monthly_videos_limit.toLocaleString()} {isRtl ? 'فيديو' : 'videos'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/50">
                                            <span className="text-muted-foreground flex items-center gap-1.5 font-bold">
                                                <Mic className="size-3.5 text-primary" />
                                                <span>{isRtl ? 'دقائق تسجيل صوتي:' : 'Recording Mins:'}</span>
                                            </span>
                                            <span className="font-mono font-extrabold text-foreground text-primary">
                                                {plan.monthly_recording_minutes_limit.toLocaleString()} {isRtl ? 'دقيقة' : 'mins'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-muted-foreground">
                                            <span>{isRtl ? 'أعضاء الفريق:' : 'Team members:'}</span>
                                            <span className="font-mono font-semibold">{plan.max_team_members} {isRtl ? 'مستخدمين' : 'users'}</span>
                                        </div>

                                        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                                            <span>{isRtl ? 'المشتركون حالياً:' : 'Active clients:'}</span>
                                            <span className="font-mono font-bold text-foreground">{subscriberCount} {isRtl ? 'عميل' : 'clients'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(plan)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <Pencil className="size-3.5" />
                                        <span>{isRtl ? 'تعديل الباقة' : 'Edit Plan'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(plan)}
                                        disabled={subscriberCount > 0}
                                        className={`size-8 rounded-xl flex items-center justify-center border transition-all ${
                                            subscriberCount > 0
                                                ? 'bg-muted/40 border-border/40 text-muted-foreground/40 cursor-not-allowed'
                                                : 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20 cursor-pointer'
                                        }`}
                                        title={subscriberCount > 0 ? (isRtl ? 'لا يمكن الحذف (هناك مشتركون)' : 'Cannot delete (in use)') : (isRtl ? 'حذف الباقة' : 'Delete')}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. CREATE PLAN MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-border/70 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                                    <Plus className="size-5" />
                                </div>
                                <h3 className="text-base font-extrabold text-foreground">
                                    {isRtl ? 'إنشاء باقة اشتراك جديدة' : 'Create New Subscription Plan'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="size-8 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'المعرف الفريد (Slug / Key):' : 'Plan Key (Unique):'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="مثال: Premium, University"
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-[11px] text-destructive font-bold">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'اسم الباقة الظاهر:' : 'Display Name:'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.display_name}
                                        onChange={(e) => createForm.setData('display_name', e.target.value)}
                                        placeholder="مثال: باقة الجامعات المتقدمة"
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground">
                                    {isRtl ? 'وصف مختصر للباقة:' : 'Description:'}
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="وصف مزايا الباقة..."
                                    className="w-full text-xs px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                />
                            </div>

                            {/* Limits & Price */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/70">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Video className="size-3 text-red-500" />
                                        <span>{isRtl ? 'فيديوهات يوتيوب:' : 'YouTube Videos:'}</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={createForm.data.monthly_videos_limit}
                                        onChange={(e) => createForm.setData('monthly_videos_limit', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Mic className="size-3 text-primary" />
                                        <span>{isRtl ? 'دقائق تسجيل صوتي:' : 'Recording Mins:'}</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={createForm.data.monthly_recording_minutes_limit}
                                        onChange={(e) => createForm.setData('monthly_recording_minutes_limit', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground">
                                        {isRtl ? 'السعر الشهري ($):' : 'Monthly Price ($):'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'أقصى عدد لأعضاء الفريق:' : 'Max Team Members:'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={createForm.data.max_team_members}
                                        onChange={(e) => createForm.setData('max_team_members', parseInt(e.target.value) || 1)}
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'ترتيب الظهور:' : 'Sort Order:'}
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={(e) => createForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    {isRtl ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold shadow-md shadow-primary/25 cursor-pointer"
                                >
                                    {createForm.processing ? (isRtl ? 'جارٍ الحفظ...' : 'Saving...') : (isRtl ? 'حفظ وإتاحة الباقة' : 'Create Plan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. EDIT PLAN MODAL */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-border/70 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                                    <Pencil className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-foreground">
                                        {isRtl ? `تعديل باقة «${editingPlan.display_name}»` : `Edit Plan: ${editingPlan.display_name}`}
                                    </h3>
                                    <span className="text-[11px] font-mono text-muted-foreground">Slug: {editingPlan.name}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingPlan(null)}
                                className="size-8 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground">
                                    {isRtl ? 'اسم الباقة الظاهر:' : 'Display Name:'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.display_name}
                                    onChange={(e) => editForm.setData('display_name', e.target.value)}
                                    className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground">
                                    {isRtl ? 'الوصف الترويجي:' : 'Description:'}
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full text-xs px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                />
                            </div>

                            {/* Limits & Price */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/70">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Video className="size-3 text-red-500" />
                                        <span>{isRtl ? 'فيديوهات يوتيوب:' : 'YouTube Videos:'}</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={editForm.data.monthly_videos_limit}
                                        onChange={(e) => editForm.setData('monthly_videos_limit', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Mic className="size-3 text-primary" />
                                        <span>{isRtl ? 'دقائق تسجيل صوتي:' : 'Recording Mins:'}</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editForm.data.monthly_recording_minutes_limit}
                                        onChange={(e) => editForm.setData('monthly_recording_minutes_limit', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-muted-foreground">
                                        {isRtl ? 'السعر الشهري ($):' : 'Price ($):'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'أعضاء الفريق المسموحين:' : 'Max Team Members:'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editForm.data.max_team_members}
                                        onChange={(e) => editForm.setData('max_team_members', parseInt(e.target.value) || 1)}
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-foreground">
                                        {isRtl ? 'ترتيب العرض:' : 'Sort Order:'}
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.data.sort_order}
                                        onChange={(e) => editForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-hidden focus:border-primary"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="size-4 rounded text-primary border-border focus:ring-primary"
                                />
                                <span className="text-xs font-bold text-foreground">
                                    {isRtl ? 'إتاحة وتفعيل الباقة لفريق المبيعات والعملاء' : 'Enable plan for sales and clients'}
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setEditingPlan(null)}
                                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    {isRtl ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold shadow-md shadow-primary/25 cursor-pointer"
                                >
                                    {editForm.processing ? (isRtl ? 'جارٍ التحديث...' : 'Updating...') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
