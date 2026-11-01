import { Link } from '@inertiajs/react';
import { Check, Copy, FileText, Printer, SpellCheck } from 'lucide-react';
import React from 'react';

interface ThemeOption {
    id: string;
    name: string;
    type: 'builder' | 'custom_html';
    is_default: boolean;
}

interface TranscriptData {
    id: string;
    proofread_html?: string | null;
    proofread_text?: string | null;
}

interface ProofreadTabProps {
    transcript: TranscriptData;
    docTheme: string;
    setDocTheme: (v: string) => void;
    themes: ThemeOption[];
    systemPresetsList: { id: string; name: string; color: string }[];
    copiedProofread: boolean;
    onCopyProofread: () => void;
    onOpenProofreadModal: () => void;
}

export default function ProofreadTab({
    transcript,
    docTheme,
    setDocTheme,
    themes,
    systemPresetsList,
    copiedProofread,
    onCopyProofread,
    onOpenProofreadModal,
}: ProofreadTabProps) {
    if (transcript.proofread_html) {
        return (
            <div className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-xs dark:shadow-xl max-h-[calc(100vh-230px)] overflow-y-auto">
                    {/* Document Header Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-foreground">
                                النص الكامل بعد التدقيق اللغوي والنحوي والتنسيق
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">قالب المستند:</span>
                            <select
                                value={docTheme}
                                onChange={(e) => setDocTheme(e.target.value)}
                                className="bg-muted border border-border rounded-lg px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                            >
                                {themes.length > 0 && (
                                    <optgroup label="قوالب المؤسسة المخصصة">
                                        {themes.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} (مخصص)</option>
                                        ))}
                                    </optgroup>
                                )}
                                <optgroup label="قوالب النظام القياسية">
                                    {systemPresetsList.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </optgroup>
                            </select>

                            <button
                                type="button"
                                onClick={onOpenProofreadModal}
                                className="text-[11px] text-primary hover:underline font-bold mr-1"
                            >
                                إعادة التدقيق
                            </button>
                        </div>
                    </div>

                    {/* Rendered Semantic HTML Proofread Text */}
                    <div
                        className="prose dark:prose-invert max-w-none text-right leading-relaxed text-sm text-foreground
                                   [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-foreground [&_h1]:mb-4
                                   [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_h2]:border-r-4 [&_h2]:border-primary [&_h2]:pr-3 [&_h2]:mt-6 [&_h2]:mb-3
                                   [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2
                                   [&_p]:mb-3.5 [&_p]:text-justify [&_p]:text-foreground/90 [&_p]:leading-7
                                   [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-4 [&_li]:mb-1.5
                                   [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-muted [&_blockquote]:p-3 [&_blockquote]:rounded-l-lg [&_blockquote]:my-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: transcript.proofread_html }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 rounded-2xl bg-card border border-border text-center flex flex-col items-center shadow-xs dark:shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <SpellCheck size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">
                تدقيق النص كاملاً وتجهيزه كملف PDF رسمي
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                يقوم الذكاء الاصطناعي بتدقيق النص كاملاً بدون أي اختصار أو تلخيص، مع تصحيح الأخطاء اللغوية والنحوية والإملائية وضبط علامات الترقيم وتقسيم النص إلى فقرات وعناوين منسقة وجاهزة للتصدير كملف PDF رسمي.
            </p>
            <button
                type="button"
                onClick={onOpenProofreadModal}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
                <SpellCheck size={18} />
                <span>بدء التدقيق اللغوي للنص كاملاً الآن</span>
            </button>
        </div>
    );
}

