import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import {
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Search,
    User,
    type LucideIcon,
} from 'lucide-react';
import React, { forwardRef, useState } from 'react';

// Icon shorthand mapping for easy declarative usage
const ICON_MAP = {
    email: Mail,
    mail: Mail,
    password: Lock,
    lock: Lock,
    user: User,
    name: User,
    search: Search,
    key: KeyRound,
} as const;

export type IconKey = keyof typeof ICON_MAP;

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelExtra?: React.ReactNode;
    error?: string;
    icon?: LucideIcon | IconKey;
    isPassword?: boolean;
    containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            id,
            label,
            labelExtra,
            error,
            icon,
            isPassword = false,
            type = 'text',
            className,
            containerClassName,
            disabled,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState(false);

        // Resolve icon component
        let ResolvedIcon: LucideIcon | null = null;
        if (typeof icon === 'string' && icon in ICON_MAP) {
            ResolvedIcon = ICON_MAP[icon as IconKey];
        } else if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
            ResolvedIcon = icon as LucideIcon;
        } else if (isPassword && icon === undefined) {
            ResolvedIcon = Lock;
        } else if (type === 'email' && icon === undefined) {
            ResolvedIcon = Mail;
        }

        const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className={cn('space-y-1.5 text-start w-full', containerClassName)}>
                {/* 1. Label Row */}
                {(label || labelExtra) && (
                    <div className="flex items-center justify-between gap-2">
                        {label && (
                            <label
                                htmlFor={id}
                                className="block text-xs font-bold text-foreground select-none cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {labelExtra && <div className="text-xs">{labelExtra}</div>}
                    </div>
                )}

                {/* 2. Modern Flex Input Container (Prevents any overlap or edge-clipping) */}
                <div
                    className={cn(
                        'group flex items-center w-full h-11 sm:h-12 px-3.5 gap-3 rounded-xl',
                        'bg-card dark:bg-slate-900/70 border border-border/80 shadow-2xs',
                        'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                        'hover:border-muted-foreground/30 transition-all duration-150',
                        disabled && 'opacity-50 cursor-not-allowed',
                        error && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
                    )}
                >
                    {/* Leading Icon (Right in RTL, Left in LTR) */}
                    {ResolvedIcon && (
                        <div className="flex items-center justify-center shrink-0 text-muted-foreground/60 group-focus-within:text-primary transition-colors">
                            <ResolvedIcon className="size-4 stroke-[1.8]" />
                        </div>
                    )}

                    {/* Native Input Element */}
                    <input
                        id={id}
                        type={effectiveType}
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            'flex-1 w-full h-full bg-transparent border-0 outline-none p-0 text-sm font-sans text-foreground',
                            'placeholder:text-muted-foreground/45 placeholder:font-sans focus:ring-0 focus:outline-none',
                            className,
                        )}
                        {...props}
                    />

                    {/* Trailing Eye Toggle Button for Password (Left in RTL, Right in LTR) */}
                    {isPassword && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer select-none shrink-0"
                        >
                            {showPassword ? (
                                <EyeOff className="size-4 text-primary stroke-[2.2]" />
                            ) : (
                                <Eye className="size-4 stroke-[1.8]" />
                            )}
                        </button>
                    )}
                </div>

                {/* 3. Validation Error Message */}
                {error && <InputError message={error} />}
            </div>
        );
    },
);

FormInput.displayName = 'FormInput';

// Convenient dedicated component wrappers
export const EmailInput = forwardRef<HTMLInputElement, FormInputProps>((props, ref) => (
    <FormInput ref={ref} type="email" icon={Mail} {...props} />
));
EmailInput.displayName = 'EmailInput';

export const PasswordInput = forwardRef<HTMLInputElement, FormInputProps>((props, ref) => (
    <FormInput ref={ref} isPassword icon={Lock} {...props} />
));
PasswordInput.displayName = 'PasswordInput';

export { FormInput };
