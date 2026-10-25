import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface ThemeItem {
    id: string;
    name: string;
    type: 'builder' | 'custom_html';
    colors?: {
        primary?: string;
        accent?: string;
        bg?: string;
        text?: string;
        card_bg?: string;
        border?: string;
    } | null;
    font_family?: string;
    header_text?: string;
    footer_text?: string;
    logo_url?: string | null;
    is_default: boolean;
    created_at: string;
}

interface SystemPreset {
    name: string;
    primary: string;
    accent: string;
    bg: string;
    text: string;
    border: string;
    card_bg: string;
}

interface Props {
    themes: ThemeItem[];
    systemPresets: Record<string, SystemPreset>;
    availableFonts: Record<string, string>;
    sampleTemplate: string;
}

export default function ThemesIndex({ themes, systemPresets, availableFonts, sampleTemplate }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'builder' | 'custom_html'>('builder');
    const [copiedTag, setCopiedTag] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Visual Builder Form
    const builderForm = useForm({
        type: 'builder',
        name: '',
        primary_color: '#0F172A',
        accent_color: '#6366F1',
        bg_color: '#FFFFFF',
        text_color: '#1E293B',
        card_bg: '#F8FAFC',
        border_color: '#E2E8F0',
        font_family: 'Cairo',
        header_text: '✦ مستند تفريغ وتلخيص ذكي بالذكاء الاصطناعي',
        footer_text: 'وثيقة رسمية مؤتمتة - جميع الحقوق محفوظة',
        logo: null as File | null,
        is_default: false,
    });

    // Custom HTML Form
    const htmlForm = useForm({
        type: 'custom_html',
        name: '',
        html_file: null as File | null,
        logo: null as File | null,
        header_text: '',
        footer_text: '',
        is_default: false,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'builder' | 'html') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            if (formType === 'builder') {
                builderForm.setData('logo', file);
            } else {
                htmlForm.setData('logo', file);
            }
        }
    };

    const handleBuilderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        builderForm.post(route('themes.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                builderForm.reset();
                setLogoPreview(null);
            },
        });
    };

    const handleHtmlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        htmlForm.post(route('themes.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                htmlForm.reset();
                setLogoPreview(null);
            },
        });
    };

    const handleSetDefault = (themeId: string) => {
        router.post(route('themes.default', themeId), {}, { preserveScroll: true });
    };

    const handleDelete = (themeId: string, name: string) => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف قالب «${name}»؟`)) {
            router.delete(route('themes.destroy', themeId), { preserveScroll: true });
        }
    };

    const copyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const templateTags = [
        { tag: '{{TITLE}}', label: 'عنوان الفيديو' },
        { tag: '{{CONTENT}}', label: 'نص الملخص المنشأ بالـ AI (إلزامي)' },
        { tag: '{{LOGO}}', label: 'شعار المؤسسة كصورة مدمجة' },
        { tag: '{{CHANNEL_NAME}}', label: 'اسم قناة اليوتيوب' },
        { tag: '{{DURATION}}', label: 'مدة المقطع' },
        { tag: '{{DATE}}', label: 'تاريخ التوثيق والإنشاء' },
        { tag: '{{PRIMARY_COLOR}}', label: 'كود اللون الرئيسي' },
        { tag: '{{ACCENT_COLOR}}', label: 'كود اللون الثانوي' },
        { tag: '{{FOOTER_TEXT}}', label: 'نص تذييل الصفحة' },
    ];

    return (
        <div dir="rtl" className="min-h-screen bg-[#0A0E16] text-[#DFE2EE] font-sans antialiased">
            <Head title="إدارة الهوية البصرية وقوالب المستندات | نَص تيوب" />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-[#0F131C]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <span className="material-symbols-outlined text-[#003824] text-xl font-bold">graphic_eq</span>
                            </div>
                            <span className="font-extrabold text-lg text-white">نَص تيوب</span>
                        </Link>

                        <div className="h-5 w-[1px] bg-white/20 hidden md:block" />

                        {/* Navigation Links */}
                        <nav className="flex items-center gap-2">
                            <Link
                                href={route('dashboard')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#BBCAFF] hover:text-white hover:bg-white/5 transition-all"
                            >
                                المكتبة والتفريغ
                            </Link>
                            <Link
                                href={route('themes.index')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#10B981]/15 text-[#4EDEA3] border border-[#10B981]/30"
                            >
                                الهوية وقوالب المستندات
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            <span>إنشاء أو رفع قالب جديد</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Hero Header */}
                <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                            الهوية البصرية وقوالب المستندات المطبوعة
                        </h1>
                        <p className="text-sm text-[#BBCAFF] max-w-2xl leading-relaxed">
                            خصص مظهر وثائق الـ PDF المصدرة من ملخصات الذكاء الاصطناعي لتطابق شعار شركتك وألوانها، أو ارفع قالب HTML مخصص متكامل بصيغة A4.
                        </p>
                    </div>

                    <a
                        href={route('themes.sample.download')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141822] hover:bg-[#1C2028] border border-white/10 text-xs font-bold text-[#DFE2EE] transition-all"
                    >
                        <span className="material-symbols-outlined text-sm text-[#4EDEA3]">download</span>
                        <span>تحميل قالب HTML تجريبي</span>
                    </a>
                </div>

                {/* Section 1: Tenant Custom Themes */}
                <div className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#4EDEA3] text-2xl">palette</span>
                            <h2 className="text-lg font-bold text-white">قوالب علامتك التجارية المخصصة</h2>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                                {themes.length}
                            </span>
                        </div>
                    </div>

                    {themes.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-[#141822] border border-white/10 text-center flex flex-col items-center shadow-lg">
                            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#4EDEA3] flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">brush</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">لم تقم بإنشاء أو رفع أي قالب مخصص بعد</h3>
                            <p className="text-xs text-[#BBCAFF] max-w-md mb-6 leading-relaxed">
                                يمكنك إنشاء هوية مؤسسية مخصصة بألوانك وشعارك أو رفع كود HTML مخصص لتطبيقها على جميع تقارير ملخصات اليوتيوب بنقرة واحدة.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] text-[#003824] font-bold text-xs shadow-md"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                <span>إنشاء أول قالب خاص بك</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {themes.map((theme) => {
                                const colors = theme.colors || {};
                                return (
                                    <div
                                        key={theme.id}
                                        className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
                                            theme.is_default
                                                ? 'bg-gradient-to-tr from-[#141822] to-[#1A2232] border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                                : 'bg-[#141822] border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {/* Default Badge */}
                                        {theme.is_default && (
                                            <div className="absolute top-0 left-0 bg-[#10B981] text-[#003824] font-bold text-[10px] px-3 py-1 rounded-br-xl font-mono">
                                                القالب الافتراضي للمستندات
                                            </div>
                                        )}

                                        <div>
                                            {/* Header Info */}
                                            <div className="flex items-start justify-between gap-3 mb-4 pt-2">
                                                <div>
                                                    <h3 className="text-base font-extrabold text-white mb-1">
                                                        {theme.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-white/10 text-[#BBCAFF]">
                                                            {theme.type === 'custom_html' ? 'HTML مخصص' : 'مُنشئ ألوان'}
                                                        </span>
                                                        {theme.font_family && (
                                                            <span className="text-[11px] text-[#BBCAFF]">
                                                                الخط: {theme.font_family}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Logo preview */}
                                                {theme.logo_url ? (
                                                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                        <img
                                                            src={theme.logo_url}
                                                            alt={theme.name}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0">
                                                        <span className="material-symbols-outlined text-xl">image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Color Palette preview (if builder) */}
                                            {colors.primary && (
                                                <div className="mb-4 p-3 rounded-xl bg-[#0F131C] border border-white/5 flex items-center justify-between">
                                                    <span className="text-[11px] text-[#BBCAFF]">لوحة الألوان:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                                            style={{ backgroundColor: colors.primary }}
                                                            title={`الرئيسي: ${colors.primary}`}
                                                        />
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                                            style={{ backgroundColor: colors.accent }}
                                                            title={`الثانوي: ${colors.accent}`}
                                                        />
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                                            style={{ backgroundColor: colors.bg }}
                                                            title={`الخلفية: ${colors.bg}`}
                                                        />
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                                            style={{ backgroundColor: colors.text }}
                                                            title={`النصوص: ${colors.text}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Header text / Footer text preview */}
                                            {theme.header_text && (
                                                <p className="text-[11px] text-[#BBCAFF] mb-2 line-clamp-1">
                                                    الترويسة: <span className="text-white">{theme.header_text}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                                            <a
                                                href={route('themes.preview', theme.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-[#4EDEA3] hover:underline font-bold"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                <span>معاينة حية A4</span>
                                            </a>

                                            <div className="flex items-center gap-2">
                                                {!theme.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefault(theme.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                                    >
                                                        تعيين كافتراضي
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(theme.id, theme.name)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                    title="حذف القالب"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section 2: Built-in System Presets */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-[#BBCAFF] text-2xl">auto_stories</span>
                        <h2 className="text-lg font-bold text-white">قوالب النظام الجاهزة</h2>
                        <span className="text-xs text-[#BBCAFF]">(متوفرة تلقائياً في شاشة الطباعة)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(systemPresets).map(([key, preset]) => (
                            <div
                                key={key}
                                className="p-4 rounded-xl bg-[#141822] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div
                                            className="w-4 h-4 rounded-full border border-white/20"
                                            style={{ backgroundColor: preset.accent }}
                                        />
                                        <span className="text-[10px] text-[#BBCAFF] font-mono">PRESET</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2">{preset.name}</h4>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                                        <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.card_bg }} />
                                    </div>
                                </div>

                                <a
                                    href={`${route('themes.preview')}?theme=${key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#BBCAFF] hover:text-[#4EDEA3] transition-colors flex items-center gap-1 pt-2 border-t border-white/5"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    <span>معاينة المستند</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Create Theme Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-2xl my-8 rounded-3xl bg-[#141822] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-right">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    تخصيص هوية المستند وقوالب الطباعة A4
                                </h3>
                                <p className="text-xs text-[#BBCAFF]">
                                    اختر بين تصميم الهوية المرئية سريعاً أو رفع ملف HTML مخصص
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Mode Selector Tabs */}
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0F131C] border border-white/10 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('builder')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    activeTab === 'builder'
                                        ? 'bg-[#10B981] text-[#003824] shadow-md'
                                        : 'text-[#BBCAFF] hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">tune</span>
                                <span>مُنشئ الهوية البصرية (ألوان وشعار)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('custom_html')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    activeTab === 'custom_html'
                                        ? 'bg-[#10B981] text-[#003824] shadow-md'
                                        : 'text-[#BBCAFF] hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">code</span>
                                <span>رفع قالب HTML مخصص</span>
                            </button>
                        </div>

                        {/* TAB 1: VISUAL THEME BUILDER */}
                        {activeTab === 'builder' && (
                            <form onSubmit={handleBuilderSubmit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        اسم القالب:
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={builderForm.data.name}
                                        onChange={(e) => builderForm.setData('name', e.target.value)}
                                        placeholder="مثال: الهوية الرسمية للشركة / النمط الأكاديمي المعتمد"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-[#10B981] outline-none"
                                    />
                                    {builderForm.errors.name && (
                                        <p className="text-red-400 text-xs mt-1">{builderForm.errors.name}</p>
                                    )}
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        شعار المؤسسة (Logo):
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 border-2 border-dashed border-white/15 hover:border-[#10B981]/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-[#0F131C]">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                onChange={(e) => handleLogoChange(e, 'builder')}
                                                className="hidden"
                                            />
                                            <span className="material-symbols-outlined text-[#4EDEA3] text-2xl block mb-1">
                                                upload_file
                                            </span>
                                            <span className="text-xs text-[#BBCAFF] block">
                                                اضغط لرفع الشعار (PNG, SVG, JPG - حد أقصى 2MB)
                                            </span>
                                        </label>

                                        {logoPreview && (
                                            <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/15 p-2 flex items-center justify-center shrink-0">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo Preview"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Colors Grid */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-2">
                                        لوحة الألوان الأساسية:
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 rounded-xl bg-[#0F131C] border border-white/10">
                                            <label className="text-[11px] text-[#BBCAFF] block mb-1">اللون الرئيسي</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={builderForm.data.primary_color}
                                                    onChange={(e) => builderForm.setData('primary_color', e.target.value)}
                                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                                />
                                                <span className="font-mono text-xs text-white uppercase">{builderForm.data.primary_color}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#0F131C] border border-white/10">
                                            <label className="text-[11px] text-[#BBCAFF] block mb-1">لون التمييز (Accent)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={builderForm.data.accent_color}
                                                    onChange={(e) => builderForm.setData('accent_color', e.target.value)}
                                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                                />
                                                <span className="font-mono text-xs text-white uppercase">{builderForm.data.accent_color}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#0F131C] border border-white/10">
                                            <label className="text-[11px] text-[#BBCAFF] block mb-1">لون النصوص</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={builderForm.data.text_color}
                                                    onChange={(e) => builderForm.setData('text_color', e.target.value)}
                                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                                />
                                                <span className="font-mono text-xs text-white uppercase">{builderForm.data.text_color}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#0F131C] border border-white/10">
                                            <label className="text-[11px] text-[#BBCAFF] block mb-1">لون خلفية الورقة</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={builderForm.data.bg_color}
                                                    onChange={(e) => builderForm.setData('bg_color', e.target.value)}
                                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                                />
                                                <span className="font-mono text-xs text-white uppercase">{builderForm.data.bg_color}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Typography Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        الخط العربي للمستند:
                                    </label>
                                    <select
                                        value={builderForm.data.font_family}
                                        onChange={(e) => builderForm.setData('font_family', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white text-xs outline-none focus:border-[#10B981]"
                                    >
                                        {Object.entries(availableFonts).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Header & Footer Custom Texts */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                            نص شارة الترويسة (Header Tag):
                                        </label>
                                        <input
                                            type="text"
                                            value={builderForm.data.header_text}
                                            onChange={(e) => builderForm.setData('header_text', e.target.value)}
                                            placeholder="مثال: ✦ تقرير استراتيجي موثق"
                                            className="w-full px-3.5 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-white text-xs outline-none focus:border-[#10B981]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                            نص التذييل (Footer Text):
                                        </label>
                                        <input
                                            type="text"
                                            value={builderForm.data.footer_text}
                                            onChange={(e) => builderForm.setData('footer_text', e.target.value)}
                                            placeholder="مثال: وثيقة سرية خاصة بإدارة الشركة"
                                            className="w-full px-3.5 py-2 rounded-xl bg-[#0F131C] border border-white/10 text-white text-xs outline-none focus:border-[#10B981]"
                                        />
                                    </div>
                                </div>

                                {/* Set as Default */}
                                <label className="flex items-center gap-2 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        checked={builderForm.data.is_default}
                                        onChange={(e) => builderForm.setData('is_default', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#10B981] bg-[#0F131C] border-white/20 focus:ring-[#10B981]"
                                    />
                                    <span className="text-xs text-white font-medium">
                                        تعيين هذا القالب كقالب افتراضي لجميع المستندات المصدرة
                                    </span>
                                </label>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2.5 rounded-xl text-xs text-[#BBCAFF] hover:text-white"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={builderForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {builderForm.processing ? 'جاري الحفظ...' : 'حفظ القالب الآن'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB 2: CUSTOM HTML UPLOAD */}
                        {activeTab === 'custom_html' && (
                            <form onSubmit={handleHtmlSubmit} className="space-y-5">
                                {/* Instructions & Cheat Sheet */}
                                <div className="p-4 rounded-2xl bg-[#0F131C] border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[#4EDEA3] text-base">info</span>
                                            وسوم القالب المتاحة (انقر للنسخ):
                                        </span>
                                        <a
                                            href={route('themes.sample.download')}
                                            className="text-[11px] text-[#4EDEA3] hover:underline font-bold"
                                        >
                                            تحميل قالب جاهز كنموذج
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {templateTags.map((item) => (
                                            <button
                                                key={item.tag}
                                                type="button"
                                                onClick={() => copyTag(item.tag)}
                                                className={`p-2 rounded-lg text-right border transition-all text-[11px] cursor-pointer ${
                                                    copiedTag === item.tag
                                                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#4EDEA3]'
                                                        : 'bg-[#141822] border-white/5 hover:border-white/20 text-[#DFE2EE]'
                                                }`}
                                            >
                                                <div className="font-mono font-bold text-xs">{item.tag}</div>
                                                <div className="text-[10px] text-[#BBCAFF] truncate">{item.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        اسم القالب:
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={htmlForm.data.name}
                                        onChange={(e) => htmlForm.setData('name', e.target.value)}
                                        placeholder="مثال: قالب تقارير الإدارة العليا المخصص"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131C] border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-[#10B981] outline-none"
                                    />
                                    {htmlForm.errors.name && (
                                        <p className="text-red-400 text-xs mt-1">{htmlForm.errors.name}</p>
                                    )}
                                </div>

                                {/* HTML File Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        ملف القالب بصيغة (.html):
                                    </label>
                                    <label className="block border-2 border-dashed border-white/15 hover:border-[#10B981]/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#0F131C]">
                                        <input
                                            type="file"
                                            required
                                            accept=".html,.htm"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    htmlForm.setData('html_file', e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <span className="material-symbols-outlined text-[#4EDEA3] text-3xl block mb-1">
                                            code
                                        </span>
                                        <span className="text-xs text-white font-bold block mb-1">
                                            {htmlForm.data.html_file ? (htmlForm.data.html_file as File).name : 'اضغط لاختيار ملف HTML من جهازك'}
                                        </span>
                                        <span className="text-[10px] text-[#BBCAFF]">
                                            يجب أن يحتوي الملف على وسم <code className="text-[#4EDEA3] font-mono">{"{{CONTENT}}"}</code>
                                        </span>
                                    </label>
                                    {htmlForm.errors.html_file && (
                                        <p className="text-red-400 text-xs mt-1">{htmlForm.errors.html_file}</p>
                                    )}
                                </div>

                                {/* Optional Logo Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-[#DFE2EE] mb-1.5">
                                        شعار إضافي مدمج (اختياري للاستخدام مع وسم {"{{LOGO}}"}):
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml"
                                        onChange={(e) => handleLogoChange(e, 'html')}
                                        className="text-xs text-[#BBCAFF] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                                    />
                                </div>

                                {/* Set as Default */}
                                <label className="flex items-center gap-2 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        checked={htmlForm.data.is_default}
                                        onChange={(e) => htmlForm.setData('is_default', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#10B981] bg-[#0F131C] border-white/20 focus:ring-[#10B981]"
                                    />
                                    <span className="text-xs text-white font-medium">
                                        تعيين هذا القالب كافتراضي لجميع مستندات الـ PDF
                                    </span>
                                </label>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2.5 rounded-xl text-xs text-[#BBCAFF] hover:text-white"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={htmlForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {htmlForm.processing ? 'جاري الرفع والتحقق...' : 'رفع وحفظ القالب'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
