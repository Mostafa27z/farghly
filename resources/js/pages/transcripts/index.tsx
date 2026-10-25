import ThemeToggle from '@/components/theme-toggle';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface TranscriptItem {
    id: string;
    youtube_id: string;
    title: string;
    channel_name: string;
    thumbnail_url: string;
    duration_seconds: number;
    language: string;
    created_at: string;
}

interface TenantInfo {
    name: string;
    plan_name: string;
    monthly_minutes_limit: number;
    monthly_minutes_used: number;
    remaining_minutes: number;
    expires_at: string;
}

interface PaginatedTranscripts {
    data: TranscriptItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    transcripts: PaginatedTranscripts;
    tenant: TenantInfo;
    filters: { search?: string };
}

export default function TranscriptsIndex({ transcripts, tenant, filters }: Props) {
    const { auth } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
    });

    const handleExtract = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('transcripts.store'), {
            onSuccess: () => reset('url'),
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('dashboard'), { search }, { preserveState: true });
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-[#0A0E16] text-slate-800 dark:text-[#DFE2EE] font-sans antialiased transition-colors">
            <Head title={`مساحة العمل | ${tenant.name}`} />

            {/* Top Workspace Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F131C]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-4 shadow-xs">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#4EDEA3] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <span className="material-symbols-outlined text-[#003824] text-xl font-bold">graphic_eq</span>
                            </div>
                            <span className="font-extrabold text-lg text-slate-900 dark:text-white">فرغلي</span>
                        </Link>

                        <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/20 hidden md:block" />

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{tenant.name}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] text-xs font-mono font-bold border border-emerald-200 dark:border-[#10B981]/30">
                                {tenant.plan_name}
                            </span>
                        </div>

                        {/* Navigation links */}
                        <nav className="hidden lg:flex items-center gap-1.5 mr-4">
                            <Link
                                href={route('dashboard')}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#4EDEA3] border border-emerald-200 dark:border-[#10B981]/30"
                            >
                                المكتبة والتفريغ
                            </Link>
                            <Link
                                href={route('themes.index')}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-[#4EDEA3]">palette</span>
                                <span>الهوية وقوالب المستندات</span>
                            </Link>
                            {auth?.is_staff && (
                                <Link
                                    href={auth?.is_super_admin ? route('admin.dashboard') : route('sales.index')}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                                    <span>{auth?.is_super_admin ? 'لوحة الإدارة العامة' : 'بوابة المبيعات'}</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Quota & User Bar */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1C2028] border border-slate-200 dark:border-white/10 shadow-xs">
                            <span className="text-slate-600 dark:text-[#BBCAFF]">الرصيد المتبقي:</span>
                            <span className="font-mono text-emerald-600 dark:text-[#4EDEA3] font-bold text-sm">
                                {tenant.remaining_minutes.toLocaleString()} دقيقة
                            </span>
                            <span className="text-slate-300 dark:text-white/20">/</span>
                            <span className="font-mono text-slate-600 dark:text-[#BBCAFF]">
                                {tenant.monthly_minutes_limit.toLocaleString()} دقيقة
                            </span>
                        </div>

                        <ThemeToggle />

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-slate-600 dark:text-[#BBCAFF] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            تسجيل الخروج
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Stage */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* 1. YouTube Transcribe Action Box */}
                <div className="mb-10 p-6 rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-[#141822] dark:to-[#181C24] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-[90px] pointer-events-none" />

                    <div className="relative z-10 max-w-3xl">
                        <span className="text-xs font-mono text-emerald-600 dark:text-[#4EDEA3] font-bold uppercase tracking-wider">
                            استخراج فوري
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
                            تفريغ محتوى فيديو يوتيوب جديد
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-[#BBCAFF] mb-6">
                            أدخل رابط أي فيديو من يوتيوب (فيديو عادي، شورتس، أو بث مباشر مسجل) لاستخراج النصوص وتوقيتاتها بدقة.
                        </p>

                        <form onSubmit={handleExtract} className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full">
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 material-symbols-outlined text-2xl">
                                    smart_display
                                </span>
                                <input
                                    type="text"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#0A0E16]/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#003824] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all shrink-0 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        <span>جاري الاستخراج...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">subtitles</span>
                                        <span>تفريغ النص</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {errors.url && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-3 font-medium bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800/40">
                                {errors.url}
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. Transcripts Library Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">سجل الفيديوهات المفرغة</h3>
                        <p className="text-xs text-slate-500 dark:text-[#BBCAFF]">إجمالي الملفات في مساحة العمل: {transcripts.total}</p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 material-symbols-outlined text-xl">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث في العناوين والنصوص..."
                            className="w-full pl-3 pr-10 py-2 rounded-xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-[#10B981] outline-none shadow-xs"
                        />
                    </form>
                </div>

                {/* 3. Grid of Transcripts */}
                {transcripts.data.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 shadow-xs">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-white/20 mb-3">folder_open</span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">لا توجد ملفات مفرغة حتى الآن</h4>
                        <p className="text-xs text-slate-500 dark:text-[#BBCAFF]">الصق أول رابط يوتيوب بالأعلى لتبدأ بتفريغ نصوصك وحفظها في مساحة العمل.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {transcripts.data.map((item) => (
                            <Link
                                key={item.id}
                                href={route('transcripts.show', item.id)}
                                className="group rounded-2xl bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-[#10B981]/40 transition-all overflow-hidden flex flex-col justify-between shadow-xs dark:shadow-lg"
                            >
                                <div>
                                    {/* Thumbnail with duration badge */}
                                    <div className="relative aspect-video bg-black/60 overflow-hidden">
                                        <img
                                            src={item.thumbnail_url || `https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white">
                                            {formatDuration(item.duration_seconds)}
                                        </div>
                                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#10B981] font-mono text-[10px] text-[#003824] font-bold uppercase">
                                            {item.language}
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-4">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-[#4EDEA3] transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-[#BBCAFF] mb-3">{item.channel_name || 'قناة يوتيوب'}</p>
                                    </div>
                                </div>

                                <div className="px-4 py-3 bg-slate-50 dark:bg-[#0F131C] border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-[#BBCAFF]">
                                    <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                                    <span className="text-emerald-600 dark:text-[#4EDEA3] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        <span>عرض النص والتصدير</span>
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
