import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface PricingFeature {
    text: string;
    included: boolean;
}

export interface PricingPlan {
    id: string;
    name: string;
    badge?: string;
    popular?: boolean;
    price: string;
    period: string;
    description: string;
    features: string[];
    ctaText: string;
    ctaHref: string;
}

interface Props {
    plan: PricingPlan;
    className?: string;
}

export function PricingCard({ plan, className = '' }: Props) {
    return (
        <div
            className={cn(
                'relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border bg-card text-foreground',
                plan.popular
                    ? 'border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/25 scale-[1.02] z-10'
                    : 'border-border hover:border-border/80 shadow-md glow-card',
                className
            )}
        >
            {/* Popular Badge */}
            {plan.popular && (
                <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-primary/30">
                    <Sparkles className="size-3.5 animate-spin-slow" />
                    <span>{plan.badge || 'الخيار الأكثر طلباً'}</span>
                </div>
            )}

            <div>
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-xl font-extrabold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-border">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-foreground">{plan.price}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">{plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <div className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="size-3 stroke-[2.5]" />
                            </div>
                            <span className="text-foreground/90 leading-tight">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA Button */}
            <a href={plan.ctaHref} className="w-full block">
                <Button
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    className={cn(
                        'w-full btn-slide',
                        plan.popular ? 'bg-primary text-primary-foreground shadow-md' : 'hover:border-primary'
                    )}
                >
                    {plan.ctaText}
                </Button>
            </a>
        </div>
    );
}

export default PricingCard;

