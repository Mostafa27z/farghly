import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted-foreground/50',
                'focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-all duration-150',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
