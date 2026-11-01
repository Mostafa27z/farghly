import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/hooks/use-language';
import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';
import { Check, CheckCircle2, Monitor, Moon, Palette, Sparkles, Sun } from 'lucide-react';
import React from 'react';

export default function Appearance() {
    const { isRtl } = useLanguage();
    const { appearance, updateAppearance, accentColor, updateAccentColor, ACCENT_COLORS } = useAppearance();

    const themeModes = [
        {
            id: 'light' as const,
            nameAr: 'الوضع النهاري',
            nameEn: 'Light Mode',
            descAr: 'خلفيات بيضاء ناصعة، تباين عالي للنصوص ومريح للقراءة أثناء النهار',
            descEn: 'Clean white surfaces with crisp text and high daylight readability',
            icon: Sun,
        },
        {
            id: 'dark' as const,
            nameAr: 'الوضع الليلي',
            nameEn: 'Dark Mode',
            descAr: 'خلفيات داكنة عميقة مريحة للعينين في الإضاءة المنخفضة وجلسات العمل الطويلة',
            descEn: 'Deep dark surfaces designed to reduce eye strain in low-light environments',
            icon: Moon,
        },
        {
            id: 'system' as const,
            nameAr: 'تلقائي مع النظام',
            nameEn: 'System Synchronized',
            descAr: 'يتكيف تلقائياً مع إعدادات نظام التشغيل الخاص بجهازك (ويندوز، ماك، آيفون، أندرويد)',
            descEn: 'Automatically adapts to your operating system appearance preferences',
            icon: Monitor,
        },
    ];

    return (
        <SettingsLayout
            title={isRtl ? 'المظهر والألوان' : 'Appearance & Colors'}
            subtitle={isRtl ? 'تخصيص نمط الواجهة وألوان التمييز لمنصتك' : 'Customize interface theme mode and accent color'}
        >
            <Head title={isRtl ? 'المظهر والألوان | فرغلي' : 'Appearance & Colors | Farghly'} />

            <div className="space-y-6">
                {/* ── 1. Theme Mode Cards ── */}
                <div className="rounded-2xl sm:rounded-3xl bg-card border border-border/80 p-4 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Sun className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground">
                                {isRtl ? 'نمط الواجهة (نهاري / ليلي)' : 'Theme Mode (Light / Dark)'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl
                                    ? 'اختر النمط المناسب لراحتك البصرية أثناء تصفح المنصة وإعداد المذكرات'
                                    : 'Choose your visual preference for working and preparing handouts'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themeModes.map((mode) => {
                            const isSelected = appearance === mode.id;
                            const ModeIcon = mode.icon;
                            return (
                                <button
                                    type="button"
                                    key={mode.id}
                                    onClick={() => updateAppearance(mode.id)}
                                    className={`relative p-5 rounded-2xl border text-start flex flex-col justify-between transition-all duration-300 cursor-pointer group ${
                                        isSelected
                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                                            : 'border-border/80 bg-background/60 hover:border-border hover:bg-card'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                                                }`}
                                            >
                                                <ModeIcon className="size-5" />
                                            </div>
                                            {isSelected && (
                                                <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                                                    <Check className="size-3 stroke-[3]" />
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-extrabold text-foreground">
                                                {isRtl ? mode.nameAr : mode.nameEn}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                                {isRtl ? mode.descAr : mode.descEn}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visual UI Miniature Preview */}
                                    <div className="mt-4 pt-3 border-t border-border/50">
                                        <div
                                            className={`w-full h-16 rounded-xl border p-1.5 flex gap-1.5 overflow-hidden transition-colors ${
                                                mode.id === 'dark'
                                                    ? 'bg-slate-950 border-slate-800'
                                                    : mode.id === 'light'
                                                    ? 'bg-slate-50 border-slate-200'
                                                    : 'bg-gradient-to-r from-slate-100 to-slate-900 border-border'
                                            }`}
                                        >
                                            {/* Mini Sidebar */}
                                            <div
                                                className={`w-6 h-full rounded-md shrink-0 flex flex-col gap-1 p-1 ${
                                                    mode.id === 'dark' ? 'bg-slate-900' : 'bg-white border border-slate-200/60'
                                                }`}
                                            >
                                                <div className="size-2 rounded-full bg-primary" />
                                                <div className="w-full h-1 rounded-full bg-muted" />
                                                <div className="w-full h-1 rounded-full bg-muted" />
                                            </div>
                                            {/* Mini Content */}
                                            <div className="flex-1 flex flex-col gap-1 p-0.5">
                                                <div className="w-12 h-1.5 rounded-full bg-primary/40" />
                                                <div
                                                    className={`w-full h-7 rounded-md p-1 flex items-center justify-between ${
                                                        mode.id === 'dark' ? 'bg-slate-900/80' : 'bg-white border border-slate-200/60'
                                                    }`}
                                                >
                                                    <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
                                                    <div className="size-2 rounded-full bg-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── 2. Brand Accent Colors Section ── */}
                <div className="rounded-2xl sm:rounded-3xl bg-card border border-border/80 p-4 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Palette className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground">
                                {isRtl ? 'لون التمييز الأساسي (System Accent Color)' : 'System Accent Color'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl
                                    ? 'خصص لون الأزرار، الشارات، والمؤشرات التفاعلية بما يناسب ذوقك أو هوية أكاديميتك'
                                    : 'Personalize the buttons, active badges, and focus rings to your brand'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {ACCENT_COLORS.map((color) => {
                            const isSelected = accentColor === color.id;
                            return (
                                <button
                                    type="button"
                                    key={color.id}
                                    onClick={() => updateAccentColor(color.id)}
                                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                                            : 'border-border/80 bg-background/60 hover:border-border hover:bg-card'
                                    }`}
                                >
                                    <div
                                        className="size-9 rounded-full flex items-center justify-center text-white shadow-md relative group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.hex }}
                                    >
                                        {isSelected && <Check className="size-4 stroke-[3]" />}
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <span className="font-extrabold text-xs text-foreground">
                                            {isRtl ? color.nameAr : color.nameEn}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                            {color.hex}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── 3. Live Interactive UI Preview Sandbox ── */}
                <div className="rounded-2xl sm:rounded-3xl bg-card border border-border/80 p-4 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                                {isRtl ? 'معاينة حية وفورية لعناصر الواجهة' : 'Live Interactive UI Preview'}
                            </h3>
                        </div>
                        <span className="text-[10px] text-primary font-mono font-bold">
                            REALTIME PREVIEW
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {isRtl
                            ? 'هكذا ستظهر الأزرار، والروابط، والشارات في لوحة التحكم والاستوديو بالألوان المختارة:'
                            : 'This is how buttons, active links, and badges appear with your selected theme:'}
                    </p>

                    <div className="p-4 sm:p-5 rounded-2xl bg-background/80 border border-border/80 flex flex-wrap items-center gap-3 sm:gap-4">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            {isRtl ? 'زر رئيسي نشط' : 'Primary Button'}
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 rounded-xl border border-primary text-primary bg-primary/10 text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            {isRtl ? 'زر فرعي متناسق' : 'Accent Button'}
                        </button>

                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/25">
                            {isRtl ? 'شارة مفعلة' : 'Active Badge'}
                        </span>

                        <div className="flex-1 min-w-[140px] max-w-xs space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                <span>{isRtl ? 'شريط التقدم' : 'Progress'}</span>
                                <span className="font-bold text-primary">75%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary transition-all duration-300 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
