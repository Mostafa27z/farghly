import DashboardLayout from '@/layouts/dashboard-layout';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Palette, Video } from 'lucide-react';
import React from 'react';

export default function Dashboard() {
    const { isRtl } = useLanguage();

    return (
        <DashboardLayout
            title={isRtl ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}
            subtitle={isRtl ? 'إدارة مساحة العمل والمحتوى' : 'Manage your workspace and content'}
        >
            <Head title={isRtl ? 'لوحة التحكم | فرغلي' : 'Dashboard | Farghly'} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <Link
                    href={route('dashboard')}
                    className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                    <div className="space-y-3">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Video className="size-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                            {isRtl ? 'المكتبة والتفريغ الذكي' : 'Library & Transcripts'}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {isRtl
                                ? 'استخراج نصوص المحاضرات من يوتيوب وتوليد الملخصات الدقيقة وتدقيقها لغوياً.'
                                : 'Extract YouTube lecture transcripts, generate AI summaries and proofread text.'}
                        </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center text-xs font-bold text-primary gap-1">
                        <span>{isRtl ? 'الانتقال للمكتبة' : 'Go to Library'}</span>
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                    </div>
                </Link>

                <Link
                    href={route('themes.index')}
                    className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                    <div className="space-y-3">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Palette className="size-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                            {isRtl ? 'الهوية وقوالب الطباعة' : 'Branding & Templates'}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {isRtl
                                ? 'تخصيص ألوان وشعار المستندات المطبوعة وتصميم مذكرات A4 الاحترافية.'
                                : 'Customize branding, logos, and color palettes for high-quality A4 handouts.'}
                        </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center text-xs font-bold text-primary gap-1">
                        <span>{isRtl ? 'إدارة القوالب' : 'Manage Templates'}</span>
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                    </div>
                </Link>
            </div>
        </DashboardLayout>
    );
}
