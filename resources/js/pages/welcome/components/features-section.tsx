import {
    AudioWaveform,
    Captions,
    CheckCircle2,
    Download,
    FileCheck,
    FileText,
    FolderKanban,
    Layers,
    Palette,
    Printer,
    Sparkles,
    Wand2,
} from 'lucide-react';
import React from 'react';

interface Props {
    isRtl: boolean;
}

export default function FeaturesSection({ isRtl }: Props) {
    return (
        <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-28 scroll-mt-24">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Layers className="size-3.5" />
                    <span>{isRtl ? 'منظومة إنتاج تعليمية متكاملة' : 'Complete AI Learning Suite'}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    {isRtl ? 'كل ما تحتاجه من الرابط حتى المذكرة المطبوعة' : 'Everything You Need in One Unified Platform'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-3">
                    {isRtl
                        ? 'أدوات ذكية مصممة بدقة لتخدم رحلة الطالب والمعلم وتختصر مئات ساعات العمل اليدوي.'
                        : 'Precision-engineered tools saving students and educators hundreds of manual typing hours.'}
                </p>
            </div>

            {/* Dynamic Modern Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-start">
                {/* Bento Card 1: Video Transcription (Span 2 on lg) */}
                <div className="lg:col-span-2 p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between relative overflow-hidden glow-card">
                    <div className="absolute top-0 end-0 w-64 h-64 bg-primary/8 rounded-full blur-[90px] pointer-events-none" />

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                                <Captions className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-bold border border-primary/20">
                                WORD-LEVEL SYNC
                            </span>
                        </div>

                        <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-3">
                            {isRtl ? 'تفريغ فائق الدقة متزامن بالثواني مع الفيديو' : 'High-Fidelity Synchronized Video Transcription'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mb-6">
                            {isRtl
                                ? 'استخراج كامل الحوار المنطوق في محاضرات يوتيوب بنسبة دقة تتجاوز 99%، مع ربط كل كلمة وجملة بالتوقيت الزمني الدقيق للرجوع السريع لأي نقطة في الفيديو.'
                                : 'Extract all spoken dialogue with word-level accuracy linked directly to exact timestamps for instant navigation.'}
                        </p>
                    </div>

                    {/* Interactive UI Micro-Preview inside Card */}
                    <div className="p-3.5 rounded-2xl bg-muted/50 border border-border flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-md font-bold text-[11px] border border-primary/20">
                                02:14
                            </span>
                            <span className="text-foreground truncate max-w-xs text-[11px] sm:text-xs">
                                {isRtl ? '«...ينص قانون نيوتن على أن القوة المحصلة تساوي الكتلة في التسارع...»' : '«...Newton’s Law states that force equals mass times acceleration...»'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">99.8% Match</span>
                    </div>
                </div>

                {/* Bento Card 2: Linguistic Grammar Proofread (Span 1 on lg) */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between glow-card">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Wand2 className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground font-bold">02</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                            {isRtl ? 'تدقيق لغوي ونحوي كامل' : 'Arabic Linguistic Proofreading'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'مراجعة أوتوماتيكية للقواعد الإملائية وعلامات الترقيم، وتقسيم الشرح إلى فقرات وعناوين منسقة دون حذف أي فكرة.'
                                : 'Automatic syntax and grammar refinement without deleting any core lecture explanations.'}
                        </p>
                    </div>

                    {/* Proofread Badge */}
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2 font-medium">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{isRtl ? 'تصحيح تلقائي للإملاء وعلامات الترقيم' : 'Zero grammar error tolerance'}</span>
                    </div>
                </div>

                {/* Bento Card 3: 300 DPI A4 PDF Print Ready (Span 1 on lg) */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between glow-card">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Printer className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground font-bold">03</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                            {isRtl ? 'تصدير PDF جاهز للمطبعة A4' : '300 DPI Print-Ready PDF'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'مستندات مهيأة للمطابع التجارية والطابعات المنزلية بدقة 300 DPI مع ضبط هوامش التجليد وترقيم الصفحات.'
                                : 'A4 standard layouts calibrated at 300 DPI with custom margins ready for commercial binding.'}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs flex items-center justify-between font-mono">
                        <span className="text-foreground font-bold">A4 Standard Margins</span>
                        <span className="text-primary font-bold">300 DPI</span>
                    </div>
                </div>

                {/* Bento Card 4: Custom Branding & Logo (Span 2 on lg) */}
                <div className="lg:col-span-2 p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between relative overflow-hidden glow-card">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Palette className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-bold border border-primary/20">
                                CUSTOM BRANDING
                            </span>
                        </div>

                        <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-3">
                            {isRtl ? 'قوالب الهوية البصرية وإضافة شعارك على كل صفحة' : 'Custom Brand Themes, Logos & Watermarks'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mb-6">
                            {isRtl
                                ? 'ارفع شعار الأستاذ أو السنتر التعليمي، واختر ألوانك المعتمدة ونصوص الترويسة والتذييل، ليخرج كل ملف PDF مطبوع كتحفة فنية تحمل علامتك التجارية.'
                                : 'Upload school logos, select signature color palettes, and stamp custom headers on all exported materials.'}
                        </p>
                    </div>

                    {/* Visual Brand Swatches */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                            {isRtl ? '✦ الزمردي الحديث (Obsidian)' : '✦ Modern Emerald (Obsidian)'}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 font-bold">
                            {isRtl ? '✦ الأزرق الملكي (Royal Navy)' : '✦ Royal Navy'}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold">
                            {isRtl ? '✦ الأكاديمي الكلاسيكي' : '✦ Classic Academic'}
                        </span>
                    </div>
                </div>

                {/* Bento Card 5: Multi-Export (Word, SRT, VTT, TXT) */}
                <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between glow-card">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Download className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground font-bold">05</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                            {isRtl ? 'تعدد صيغ التصدير والترجمة' : 'Multi-format Export'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            {isRtl
                                ? 'حمّل ملفات Word (.docx) للتحرير المرن، أو ملفات الترجمة (.srt / .vtt) للدمج على برامج المونتاج وصناع المحتوى.'
                                : 'Download full Word documents and SRT subtitles for seamless video editing.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-primary font-bold border border-border">.DOCX</span>
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-bold border border-border">.SRT</span>
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-bold border border-border">.VTT</span>
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-bold border border-border">.TXT</span>
                    </div>
                </div>

                {/* Bento Card 6: Cloud Study Library (Span 2 on lg) */}
                <div className="lg:col-span-2 p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between glow-card">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <FolderKanban className="size-6" />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground font-bold">06</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                            {isRtl ? 'مكتبة سحابية منظمة للمحاضرات والمواد' : 'Dedicated Cloud Lecture Archive'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">
                            {isRtl
                                ? 'جميع فيديوهاتك ومذكراتك السابقة محفوظة بأمان في مساحة عملك السحابية للوصول إليها في أي وقت ومن أي جهاز بدون إعادة تفريغ أو استهلاك للرصيد.'
                                : 'Permanent cloud repository cataloging your transcripts and generated documents ready for instant retrieval.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span>{isRtl ? 'حفظ دائم وأرشفة سحابية مشفرة بضمان الوصول السريع' : 'End-to-end encrypted cloud storage with instant retrieval'}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
