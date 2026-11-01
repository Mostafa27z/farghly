import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Code2,
    Download,
    Eye,
    ImageIcon,
    Paintbrush,
    Palette,
    Plus,
    SlidersHorizontal,
    Sparkles,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
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

export default function ThemesIndex({
    themes,
    systemPresets,
    availableFonts,
    sampleTemplate,
}: Props) {
    const { isRtl } = useLanguage();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'builder' | 'custom_html'>('builder');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Visual Builder Form
    const builderForm = useForm({
        type: 'builder',
        name: '',
        primary_color: '#0F172A',
        accent_color: '#10B981',
        bg_color: '#FFFFFF',
        text_color: '#1E293B',
        card_bg: '#F8FAFC',
        border_color: '#E2E8F0',
        font_family: 'Cairo',
        header_text: isRtl ? '✦ مستند تفريغ وتلخيص ذكي بالذكاء الاصطناعي' : '✦ AI Automated Study Handout & Summary',
        footer_text: isRtl ? 'وثيقة رسمية مؤتمتة - جميع الحقوق محفوظة' : 'Official Automated Document - All Rights Reserved',
        logo: null as File | null,
        is_default: false as boolean,
    });

    // Custom HTML Form
    const htmlForm = useForm({
        type: 'custom_html',
        name: '',
        html_file: null as File | null,
        logo: null as File | null,
        header_text: '',
        footer_text: '',
        is_default: false as boolean,
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
        router.post(route('themes.default', themeId));
    };

    const handleDelete = (themeId: string, name: string) => {
        const msg = isRtl
            ? `هل أنت متأكد من حذف القالب "${name}"؟`
            : `Are you sure you want to delete template "${name}"?`;
        if (confirm(msg)) {
            router.delete(route('themes.destroy', themeId));
        }
    };

    return (
        <DashboardLayout
            title={isRtl ? 'الهوية وقوالب الطباعة' : 'Branding & Templates'}
            subtitle={
                isRtl
                    ? 'تخصيص ألوان وشعار وهوية مذكرات A4 الجاهزة للمطبعة'
                    : 'Customize branding, colors, logos, and A4 print templates'
            }
            actionSlot={
                <div className="flex items-center gap-2">
                    <a
                        href={route('themes.sample.download')}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted text-xs font-semibold transition-colors"
                        title={isRtl ? 'تحميل كود HTML النموذجي' : 'Download Sample HTML'}
                    >
                        <Download className="size-3.5 text-primary" />
                        <span>{isRtl ? 'تحميل نموذج HTML' : 'Sample HTML'}</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-sm shadow-primary/25 cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>{isRtl ? 'إنشاء قالب جديد' : 'New Template'}</span>
                    </button>
                </div>
            }
        >
            <Head title={isRtl ? 'الهوية وقوالب الطباعة | فرغلي' : 'Print Themes | Farghly'} />

            <div className="space-y-8">
                {/* 1. Custom User Themes Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Palette className="size-4.5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-foreground">
                                    {isRtl ? 'قوالبك المخصصة' : 'Custom Brand Templates'}
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    {isRtl
                                        ? 'القوالب المصممة خصيصاً لهوية مذكراتك التعليمية'
                                        : 'Templates personalized with your colors, font, and school logo'}
                                </p>
                            </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                            {themes.length}
                        </span>
                    </div>

                    {themes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {themes.map((theme) => {
                                const colors = theme.colors || {};
                                return (
                                    <div
                                        key={theme.id}
                                        className={`group rounded-2xl bg-card border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md ${
                                            theme.is_default
                                                ? 'border-primary ring-2 ring-primary/15'
                                                : 'border-border/80 hover:border-border'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-extrabold text-sm text-foreground truncate">
                                                            {theme.name}
                                                        </h3>
                                                        {theme.is_default && (
                                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                                                {isRtl ? 'الافتراضي' : 'Default'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {theme.type === 'builder'
                                                            ? (isRtl ? 'مُنشئ الهوية البصرية' : 'Visual Builder')
                                                            : (isRtl ? 'قالب HTML مخصص' : 'Custom HTML')}
                                                    </span>
                                                </div>

                                                {/* Logo Thumbnail */}
                                                {theme.logo_url ? (
                                                    <div className="size-10 rounded-xl bg-muted/60 border border-border/80 p-1 flex items-center justify-center shrink-0">
                                                        <img
                                                            src={theme.logo_url}
                                                            alt={theme.name}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="size-10 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-center text-muted-foreground/50 shrink-0">
                                                        <ImageIcon className="size-4.5" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Color Swatches */}
                                            {colors.primary && (
                                                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                                                    <span className="text-[10.5px] text-muted-foreground font-medium">
                                                        {isRtl ? 'لوحة الألوان:' : 'Palette:'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="size-4.5 rounded-full border border-border shadow-2xs"
                                                            style={{ backgroundColor: colors.primary }}
                                                            title={`Primary: ${colors.primary}`}
                                                        />
                                                        <div
                                                            className="size-4.5 rounded-full border border-border shadow-2xs"
                                                            style={{ backgroundColor: colors.accent }}
                                                            title={`Accent: ${colors.accent}`}
                                                        />
                                                        <div
                                                            className="size-4.5 rounded-full border border-border shadow-2xs"
                                                            style={{ backgroundColor: colors.bg }}
                                                            title={`Background: ${colors.bg}`}
                                                        />
                                                        <div
                                                            className="size-4.5 rounded-full border border-border shadow-2xs"
                                                            style={{ backgroundColor: colors.text }}
                                                            title={`Text: ${colors.text}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Texts */}
                                            {theme.header_text && (
                                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                    <span className="font-semibold text-foreground/80">{isRtl ? 'الترويسة: ' : 'Header: '}</span>
                                                    <span>{theme.header_text}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 mt-4 border-t border-border/50 flex items-center justify-between gap-2">
                                            <a
                                                href={route('themes.preview', theme.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-bold"
                                            >
                                                <Eye className="size-3.5" />
                                                <span>{isRtl ? 'معاينة حية A4' : 'Live Preview A4'}</span>
                                            </a>

                                            <div className="flex items-center gap-1.5">
                                                {!theme.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefault(theme.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[11px] font-bold transition-colors cursor-pointer border border-border/50"
                                                    >
                                                        {isRtl ? 'تعيين كافتراضي' : 'Set Default'}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(theme.id, theme.name)}
                                                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                                    title={isRtl ? 'حذف القالب' : 'Delete Template'}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center rounded-3xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center gap-2.5">
                            <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
                                <Palette className="size-6 stroke-[1.8]" />
                            </div>
                            <h4 className="font-extrabold text-sm text-foreground">
                                {isRtl ? 'لم تقم بإنشاء قوالب مخصصة بعد' : 'No custom templates created yet'}
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                {isRtl
                                    ? 'أنشئ قالبك الأول الآن لإضافة شعارك وألوانك المعتمدة على جميع مذكرات المحاضرات المطبوعة.'
                                    : 'Create your first template to add your school logo, fonts, and colors to all study handouts.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
                            >
                                <Plus className="size-3.5" />
                                <span>{isRtl ? 'إنشاء قالب مخصص' : 'Create Custom Template'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. System Presets */}
                <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                            <BookOpen className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground">
                                {isRtl ? 'قوالب النظام الجاهزة' : 'Built-in System Presets'}
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                {isRtl
                                    ? 'متوفرة تلقائياً في شاشة تجهيز المذكرات والطباعة'
                                    : 'Available out-of-the-box in the print studio'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {Object.entries(systemPresets).map(([key, preset]) => (
                            <div
                                key={key}
                                className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div
                                            className="size-3.5 rounded-full border border-border"
                                            style={{ backgroundColor: preset.accent }}
                                        />
                                        <span className="text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
                                            PRESET
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground mb-2">
                                        {preset.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                                        <div className="size-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                                        <div className="size-3 rounded-full border border-border" style={{ backgroundColor: preset.card_bg }} />
                                    </div>
                                </div>

                                <a
                                    href={`${route('themes.preview')}?theme=${key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 pt-2 border-t border-border/50 font-medium"
                                >
                                    <Eye className="size-3.5" />
                                    <span>{isRtl ? 'معاينة النموذج' : 'Preview Handout'}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Theme Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl my-8 rounded-3xl bg-card border border-border/80 p-5 sm:p-7 shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-border/60 mb-5">
                            <div>
                                <h3 className="text-base font-extrabold text-foreground mb-0.5">
                                    {isRtl ? 'تخصيص هوية المستند وقوالب الطباعة A4' : 'Create Print Template & Branding'}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {isRtl
                                        ? 'اختر بين تصميم الهوية المرئية سريعاً أو رفع ملف HTML مخصص'
                                        : 'Choose between the visual palette builder or upload custom HTML'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        {/* Mode Selector Tabs */}
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60 border border-border/60 mb-5">
                            <button
                                type="button"
                                onClick={() => setActiveTab('builder')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    activeTab === 'builder'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <SlidersHorizontal className="size-3.5" />
                                <span>{isRtl ? 'مُنشئ الهوية البصرية (ألوان وشعار)' : 'Visual Builder'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('custom_html')}
                                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    activeTab === 'custom_html'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Code2 className="size-3.5" />
                                <span>{isRtl ? 'رفع قالب HTML مخصص' : 'Custom HTML File'}</span>
                            </button>
                        </div>

                        {/* TAB 1: VISUAL THEME BUILDER */}
                        {activeTab === 'builder' && (
                            <form onSubmit={handleBuilderSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">
                                        {isRtl ? 'اسم القالب:' : 'Template Name:'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={builderForm.data.name}
                                        onChange={(e) => builderForm.setData('name', e.target.value)}
                                        placeholder={isRtl ? 'مثال: الهوية الرسمية للأكاديمية / النمط المعتمد' : 'e.g. Official Academy Handout'}
                                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-hidden transition-all"
                                    />
                                    {builderForm.errors.name && (
                                        <p className="text-destructive text-xs mt-1">{builderForm.errors.name}</p>
                                    )}
                                </div>

                                {/* Color Inputs */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-foreground mb-1">
                                            {isRtl ? 'اللون الرئيسي:' : 'Primary Color:'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={builderForm.data.primary_color}
                                                onChange={(e) => builderForm.setData('primary_color', e.target.value)}
                                                className="size-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                                            />
                                            <span className="text-[11px] font-mono text-muted-foreground">{builderForm.data.primary_color}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-foreground mb-1">
                                            {isRtl ? 'اللون التكميلي:' : 'Accent Color:'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={builderForm.data.accent_color}
                                                onChange={(e) => builderForm.setData('accent_color', e.target.value)}
                                                className="size-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                                            />
                                            <span className="text-[11px] font-mono text-muted-foreground">{builderForm.data.accent_color}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-foreground mb-1">
                                            {isRtl ? 'نوع الخط:' : 'Font Family:'}
                                        </label>
                                        <select
                                            value={builderForm.data.font_family}
                                            onChange={(e) => builderForm.setData('font_family', e.target.value)}
                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:border-primary outline-hidden"
                                        >
                                            {Object.entries(availableFonts).map(([fontKey, fontLabel]) => (
                                                <option key={fontKey} value={fontKey}>{fontLabel}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">
                                        {isRtl ? 'شعار المؤسسة / المعلم (Logo):' : 'School/Teacher Logo:'}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 bg-background cursor-pointer text-xs text-muted-foreground transition-colors">
                                            <Upload className="size-4 text-primary" />
                                            <span>{isRtl ? 'اختر صورة الشعار (PNG أو JPG)' : 'Choose Logo Image (PNG / JPG)'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleLogoChange(e, 'builder')}
                                            />
                                        </label>
                                        {logoPreview && (
                                            <div className="size-11 rounded-xl bg-card border border-border p-1 flex items-center justify-center shrink-0">
                                                <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Default Checkbox */}
                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={builderForm.data.is_default}
                                        onChange={(e) => builderForm.setData('is_default', e.target.checked)}
                                        className="size-4 rounded text-primary focus:ring-primary/20 accent-primary"
                                    />
                                    <span className="text-xs font-medium text-foreground">
                                        {isRtl ? 'تعيين هذا القالب كقالب افتراضي لجميع المذكرات القادمة' : 'Set as default template for upcoming handouts'}
                                    </span>
                                </label>

                                <div className="pt-3 border-t border-border flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                                    >
                                        {isRtl ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={builderForm.processing}
                                        className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/25 cursor-pointer"
                                    >
                                        {isRtl ? 'حفظ وتطبيق القالب' : 'Save Template'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB 2: CUSTOM HTML UPLOAD */}
                        {activeTab === 'custom_html' && (
                            <form onSubmit={handleHtmlSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">
                                        {isRtl ? 'اسم القالب:' : 'Template Name:'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={htmlForm.data.name}
                                        onChange={(e) => htmlForm.setData('name', e.target.value)}
                                        placeholder={isRtl ? 'مثال: قالب A4 المطور للمطبعة' : 'e.g. Custom Press Handout HTML'}
                                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-hidden transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">
                                        {isRtl ? 'ملف قالب الـ HTML (.html):' : 'HTML Template File (.html):'}
                                    </label>
                                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background cursor-pointer text-center transition-colors">
                                        <Code2 className="size-8 text-primary mb-2" />
                                        <span className="text-xs font-bold text-foreground">
                                            {htmlForm.data.html_file ? (htmlForm.data.html_file as File).name : (isRtl ? 'اضغط لاختيار ملف HTML' : 'Click to select HTML file')}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground mt-1">
                                            {isRtl ? 'يجب أن يحتوي الملف على وسوم الاستبدال مثل {{TITLE}} و {{SUMMARY}}' : 'Must include template tags like {{TITLE}} and {{SUMMARY}}'}
                                        </span>
                                        <input
                                            type="file"
                                            required
                                            accept=".html,.htm"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    htmlForm.setData('html_file', e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={htmlForm.data.is_default}
                                        onChange={(e) => htmlForm.setData('is_default', e.target.checked)}
                                        className="size-4 rounded text-primary focus:ring-primary/20 accent-primary"
                                    />
                                    <span className="text-xs font-medium text-foreground">
                                        {isRtl ? 'تعيين كافتراضي' : 'Set as default'}
                                    </span>
                                </label>

                                <div className="pt-3 border-t border-border flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                                    >
                                        {isRtl ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={htmlForm.processing}
                                        className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/25 cursor-pointer"
                                    >
                                        {isRtl ? 'رفع وحفظ القالب' : 'Upload & Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
