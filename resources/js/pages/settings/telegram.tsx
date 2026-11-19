import SettingsLayout from '@/layouts/settings/layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Globe,
    Layers,
    Mic,
    QrCode,
    RefreshCw,
    Send,
    ShieldCheck,
    Sparkles,
    Trash2,
} from 'lucide-react';

interface ConnectionData {
    id: number;
    telegram_username: string | null;
    telegram_first_name: string | null;
    preferred_language: string;
    connected_at: string | null;
    last_interaction_at: string | null;
}

interface TenantData {
    name: string;
    plan_name: string;
    remaining_recording_minutes: number;
    monthly_recording_minutes_limit: number;
}

interface FlashCodeData {
    plain_code: string;
    deep_link: string;
    expires_at: string;
}

interface Props {
    connection: ConnectionData | null;
    tenant: TenantData;
    botUsername: string;
    flashCodeData: FlashCodeData | null;
}

export default function TelegramSettings({ connection, tenant, botUsername, flashCodeData }: Props) {
    const { isRtl } = useLanguage();
    const { flash } = usePage().props as any;

    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(connection?.preferred_language || 'ar');
    const [savingLang, setSavingLang] = useState(false);

    const handleGenerateCode = () => {
        setGenerating(true);
        router.post(route('telegram.generate'), {}, {
            preserveScroll: true,
            onFinish: () => setGenerating(false),
        });
    };

    const handleDisconnect = () => {
        if (!confirm(isRtl ? 'هل أنت متأكد من فك ارتباط حساب تيليجرام؟' : 'Are you sure you want to disconnect?')) {
            return;
        }
        setDisconnecting(true);
        router.post(route('telegram.disconnect'), {}, {
            preserveScroll: true,
            onFinish: () => setDisconnecting(false),
        });
    };

    const handleSaveLanguage = () => {
        setSavingLang(true);
        router.patch(route('telegram.preferences'), { preferred_language: selectedLanguage }, {
            preserveScroll: true,
            onFinish: () => setSavingLang(false),
        });
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <SettingsLayout
            title={isRtl ? 'ربط بوت تيليجرام' : 'Telegram Bot Integration'}
            subtitle={isRtl ? 'اربط حسابك لتفريغ الفويس نوت والملفات الصوتية مباشرة من تيليجرام' : 'Connect Telegram to transcribe voice notes and audio on the go'}
        >
            <Head title={isRtl ? 'ربط تيليجرام | إعدادات فرغلي' : 'Telegram Bot | Farghly Settings'} />

            <div className="space-y-6 text-right">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-primary text-xs shadow-xs">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <div>{flash.success}</div>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-xs shadow-xs">
                        <AlertCircle className="size-4 shrink-0" />
                        <div>{flash.error}</div>
                    </div>
                )}

                {/* 1. Connection Status Card */}
                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border/70">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                                <Send className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">
                                    {isRtl ? 'حالة ربط حساب تيليجرام' : 'Telegram Connection Status'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    @{botUsername}
                                </p>
                            </div>
                        </div>

                        {connection ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{isRtl ? 'متصل بنجاح' : 'Connected'}</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                                <span className="size-2 rounded-full bg-muted-foreground/50" />
                                <span>{isRtl ? 'غير متصل' : 'Not Connected'}</span>
                            </span>
                        )}
                    </div>

                    {connection ? (
                        /* CONNECTED VIEW */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/70 text-xs">
                                    <span className="text-muted-foreground block mb-1">{isRtl ? 'حساب تيليجرام:' : 'Telegram Account:'}</span>
                                    <strong className="text-foreground text-sm font-mono">
                                        {connection.telegram_username ? `@${connection.telegram_username}` : connection.telegram_first_name}
                                    </strong>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/70 text-xs">
                                    <span className="text-muted-foreground block mb-1">{isRtl ? 'تاريخ الربط:' : 'Connected On:'}</span>
                                    <strong className="text-foreground font-mono">
                                        {connection.connected_at || 'مؤخراً'}
                                    </strong>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/70 text-xs">
                                    <span className="text-muted-foreground block mb-1">{isRtl ? 'آخر تفاعل في الشات:' : 'Last Interaction:'}</span>
                                    <strong className="text-foreground font-mono">
                                        {connection.last_interaction_at || 'لم يتم تسجيل نشاط بعد'}
                                    </strong>
                                </div>
                            </div>

                            {/* Preferred Language for Bot */}
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-foreground block">
                                        {isRtl ? 'لغة التفريغ الافتراضية للبوت:' : 'Default Transcription Language:'}
                                    </label>
                                    <span className="text-[11px] text-muted-foreground">
                                        {isRtl ? 'اللغة التي يختارها البوت تلقائياً عند استلام فويس نوت' : 'Preferred language when processing voice notes'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground outline-none focus:border-primary"
                                    >
                                        <option value="ar">العربية 🇸🇦</option>
                                        <option value="en">English 🇬🇧</option>
                                        <option value="auto">تلقائي 🌐</option>
                                    </select>
                                    <button
                                        type="button"
                                        disabled={savingLang || selectedLanguage === connection.preferred_language}
                                        onClick={handleSaveLanguage}
                                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                                    >
                                        {savingLang ? 'جاري الحفظ...' : (isRtl ? 'حفظ' : 'Save')}
                                    </button>
                                </div>
                            </div>

                            {/* Disconnect button */}
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    disabled={disconnecting}
                                    onClick={handleDisconnect}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20 text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Trash2 className="size-4" />
                                    <span>{disconnecting ? 'جاري فك الارتباط...' : (isRtl ? 'فك ارتباط حساب تيليجرام' : 'Disconnect Account')}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* NOT CONNECTED VIEW */
                        <div className="space-y-5">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {isRtl
                                    ? 'اربط حسابك لتتمكن من إرسال أو تحويل أي فويس نوت أو ملف صوتي/فيديو مباشرة للبوت ليتم تفريغه تلقائياً باستخدام نموذج Groq Whisper فائق السرعة وإضافته إلى مساحة عملك.'
                                    : 'Connect your Telegram account to transcribe voice notes and audio on the go.'}
                            </p>

                            {/* Code Generation Section */}
                            {!flashCodeData ? (
                                <button
                                    type="button"
                                    disabled={generating}
                                    onClick={handleGenerateCode}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                                >
                                    <Sparkles className="size-4" />
                                    <span>{generating ? 'جاري إنشاء الكود...' : (isRtl ? 'إنشاء كود ربط آمن (صالح 10 دقائق)' : 'Generate 10-Min Link Code')}</span>
                                </button>
                            ) : (
                                /* ACTIVE CODE GENERATED BOX */
                                <div className="p-5 rounded-3xl bg-primary/5 border-2 border-primary/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-bold text-xs">
                                            <Clock className="size-4" />
                                            <span>{isRtl ? 'كود الربط جاهز (صالح لمرة واحدة لمدة 10 دقائق):' : 'One-time link code ready:'}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateCode}
                                            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                            <RefreshCw className="size-3" />
                                            <span>{isRtl ? 'توليد كود آخر' : 'Generate new'}</span>
                                        </button>
                                    </div>

                                    {/* Method 1: One-Click Deep Link */}
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-bold text-foreground block">
                                            {isRtl ? 'الطريقة 1: التفعيل الفوري بنقرة واحدة (موصى بها للموبايل والكمبيوتر):' : 'Method 1: One-Click Instant Connect:'}
                                        </span>
                                        <a
                                            href={flashCodeData.deep_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                                        >
                                            <Send className="size-4" />
                                            <span>{isRtl ? 'فتح بوت تيليجرام والتفعيل فوراً بنقرة واحدة' : 'Open Telegram & Link Instantly'}</span>
                                            <ExternalLink className="size-3.5" />
                                        </a>
                                    </div>

                                    {/* Method 2: Manual Copy & Paste */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                                        <span className="text-xs font-bold text-foreground block">
                                            {isRtl ? 'الطريقة 2: نسخ الكود وإرساله يدوياً في شات البوت:' : 'Method 2: Copy & send manually in chat:'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border font-mono text-sm font-bold text-primary tracking-wider text-center select-all">
                                                {flashCodeData.plain_code}
                                            </code>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyCode(flashCodeData.plain_code)}
                                                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                                <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {isRtl ? 'يتم حذف رسالة الكود تلقائياً من الشات فور استلامها لحماية خصوصيتك.' : 'The message containing the code will be auto-deleted immediately upon receipt.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Quota Snapshot Card */}
                <div className="p-5 rounded-3xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Mic className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-foreground block">
                                {isRtl ? 'رصيد دقائق التسجيل والتفريغ الصوتي:' : 'Recording & Audio Quota:'}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                {isRtl
                                    ? `مساحة العمل: ${tenant.name} (${tenant.plan_name})`
                                    : `Workspace: ${tenant.name} (${tenant.plan_name})`}
                            </p>
                        </div>
                    </div>

                    <div className="text-start sm:text-end font-mono">
                        <strong className="text-lg font-bold text-foreground">
                            {tenant.remaining_recording_minutes}
                        </strong>
                        <span className="text-xs text-muted-foreground"> / {tenant.monthly_recording_minutes_limit} {isRtl ? 'دقيقة' : 'min'}</span>
                    </div>
                </div>

                {/* 3. Usage Guide & Limits Card */}
                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span>{isRtl ? 'دليل وحدود الاستخدام عبر تيليجرام' : 'Telegram Usage Guide & Limits'}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                            <strong className="text-foreground block font-bold">1. فويس نوت مباشرة</strong>
                            <p className="text-[11px] text-muted-foreground">
                                سجّل أي فويس نوت مباشرة أو حوّل تسجيلاً من أي قناة (حتى 20 MB، وهو ما يعادل 85-110 دقيقة صوتية بصيغة Opus).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                            <strong className="text-foreground block font-bold">2. ملفات صوتية وفيديو</strong>
                            <p className="text-[11px] text-muted-foreground">
                                يدعم MP3 (حتى ~20 دقيقة بالجودة العالية مباشرة)، وملفات الفيديو القصيرة. يظهر لك خيار تأكيد واختيار اللغة فوراً.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                            <strong className="text-foreground block font-bold">3. ملفات أكبر من 20 MB</strong>
                            <p className="text-[11px] text-muted-foreground">
                                للملفات الكبيرة حتى 1 جيجابايت، يرسل لك البوت زر رفع مخصص مع ضغط صوتي فوري فائق السرعة داخل متصفحك.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
