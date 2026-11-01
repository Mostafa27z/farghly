import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ExternalLink, Sparkles } from 'lucide-react';
import React from 'react';

interface Props {
    isRtl: boolean;
}

export default function CtaSection({ isRtl }: Props) {
    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pb-16 sm:pb-28">
            <div className="relative rounded-3xl bg-card border border-border p-8 sm:p-16 text-center overflow-hidden shadow-sm max-w-5xl mx-auto">
                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    <div className="size-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-5 shadow-sm">
                        <Sparkles className="size-7" />
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                        {isRtl ? 'جاهز لإنتاج مذكراتك التعليمية بذكاء؟' : 'Ready to Transform Your Course Notes?'}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-8 max-w-xl">
                        {isRtl
                            ? 'انضم اليوم إلى مئات المدرسين والطلاب الذين وفروا مئات الساعات في تفريغ وتلخيص المحتوى التعليمي بأعلى جودة.'
                            : 'Join hundreds of teachers and students saving countless hours with automated transcription and print-ready notes.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                        <a
                            href={`https://wa.me/201129274930?text=${encodeURIComponent(
                                isRtl ? 'مرحباً، أرغب في تجربة منصة فرغلي والاستفسار عن الاشتراكات' : 'Hello, I want to try Farghly platform',
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button size="lg" className="w-full shadow-xl">
                                <span>{isRtl ? 'تواصل معنا وابدأ الآن' : 'Contact Us & Start Now'}</span>
                                <ExternalLink className="size-4" />
                            </Button>
                        </a>

                        <Link href={route('login')} className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full">
                                <span>{isRtl ? 'دخول المشتركين' : 'Member Login'}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

