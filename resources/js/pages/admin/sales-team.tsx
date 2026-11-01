import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { KeyRound, UserPlus, X } from 'lucide-react';

interface SalesRep {
    id: number;
    name: string;
    email: string;
    system_role: string;
    is_active: boolean;
    transactions_count: number;
    created_tenants_count: number;
    created_at: string;
    created_at_human: string;
}

interface Props {
    salesReps: SalesRep[];
}

export default function SalesTeamIndex({ salesReps }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [passwordModalUser, setPasswordModalUser] = useState<SalesRep | null>(null);

    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        system_role: 'sales',
    });

    const passwordForm = useForm({
        password: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.sales-team.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                addForm.reset();
            },
        });
    };

    const handleToggleStatus = (rep: SalesRep) => {
        const action = rep.is_active ? 'إيقاف وتعطيل' : 'تفعيل';
        if (confirm(`هل أنت متأكد من رغبتك في ${action} حساب الموظف «${rep.name}»؟`)) {
            router.post(route('admin.sales-team.toggle', rep.id), {}, { preserveScroll: true });
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordModalUser) return;

        passwordForm.post(route('admin.sales-team.password', passwordModalUser.id), {
            onSuccess: () => {
                setPasswordModalUser(null);
                passwordForm.reset();
            },
        });
    };

    const { isRtl } = useLanguage();

    return (
        <DashboardLayout
            title={isRtl ? 'إدارة فريق المبيعات' : 'Sales Team Management'}
            subtitle={isRtl ? 'إضافة مناديب المبيعات، ضبط الصلاحيات، وإدارة كلمات المرور' : 'Manage sales agents, access permissions and credentials'}
            actionSlot={
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                    <UserPlus className="size-4" />
                    <span>{isRtl ? 'إضافة مندوب مبيعات جديد' : 'New Sales Agent'}</span>
                </button>
            }
        >
            <Head title={isRtl ? 'إدارة فريق المبيعات | فرغلي' : 'Sales Team Management | Farghly'} />

            <div className="space-y-6">

                {/* Sales Team Table */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs dark:shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">اسم الموظف</th>
                                    <th className="py-3.5 px-4 font-bold">البريد الإلكتروني</th>
                                    <th className="py-3.5 px-4 font-bold">الدور</th>
                                    <th className="py-3.5 px-4 font-bold">حالة الحساب</th>
                                    <th className="py-3.5 px-4 font-bold text-center">العملاء المسجلون</th>
                                    <th className="py-3.5 px-4 font-bold text-center">عمليات التجديد</th>
                                    <th className="py-3.5 px-4 font-bold">تاريخ الانضمام</th>
                                    <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {salesReps.map((rep) => (
                                    <tr key={rep.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-foreground text-sm">
                                            {rep.name}
                                        </td>

                                        <td className="py-4 px-4 font-mono text-muted-foreground">
                                            {rep.email}
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                                rep.system_role === 'super_admin'
                                                    ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                                                    : 'bg-primary/10 text-primary border border-primary/25'
                                            }`}>
                                                {rep.system_role === 'super_admin' ? 'مدير عام' : 'مندوب مبيعات'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4">
                                            {rep.is_active ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-emerald-200 dark:border-primary/30">
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                                                    معطل وموقوف
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-4 px-4 text-center font-mono font-bold text-foreground">
                                            {rep.created_tenants_count}
                                        </td>

                                        <td className="py-4 px-4 text-center font-mono font-bold text-foreground">
                                            {rep.transactions_count}
                                        </td>

                                        <td className="py-4 px-4 text-muted-foreground font-mono">
                                            {rep.created_at}
                                        </td>

                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPasswordModalUser(rep)}
                                                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                                    title="تغيير كلمة المرور"
                                                >
                                                    <KeyRound size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(rep)}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                        rep.is_active
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-primary dark:hover:bg-emerald-500/20'
                                                    }`}
                                                >
                                                    {rep.is_active ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: ADD NEW SALES REP */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-md my-8 rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative text-right">
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">إضافة موظف مبيعات جديد</h3>
                                <p className="text-xs text-muted-foreground">إنشاء حساب وتعيين الصلاحيات</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-foreground/40 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">اسم الموظف:</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="مثال: يوسف الكردي"
                                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                />
                                {addForm.errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{addForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">البريد الإلكتروني للعمل:</label>
                                <input
                                    type="email"
                                    required
                                    value={addForm.data.email}
                                    onChange={(e) => addForm.setData('email', e.target.value)}
                                    placeholder="yousef@farghly.com"
                                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                />
                                {addForm.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{addForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">كلمة المرور:</label>
                                <input
                                    type="password"
                                    required
                                    value={addForm.data.password}
                                    onChange={(e) => addForm.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                />
                                {addForm.errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{addForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">نوع الدور والصلاحية:</label>
                                <select
                                    value={addForm.data.system_role}
                                    onChange={(e) => addForm.setData('system_role', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                >
                                    <option value="sales" className="text-foreground dark:bg-card">مندوب مبيعات (Sales Rep)</option>
                                    <option value="super_admin" className="text-foreground dark:bg-card">مدير عام للنظام (Super Admin)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {addForm.processing ? 'جاري الإنشاء...' : 'حفظ وإنشاء الحساب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: RESET PASSWORD */}
            {passwordModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl relative text-right">
                        <h3 className="text-base font-bold text-foreground mb-1">
                            تغيير كلمة المرور: {passwordModalUser.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">أدخل كلمة المرور الجديدة لهذا الموظف</p>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)..."
                                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalUser(null)}
                                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {passwordForm.processing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
