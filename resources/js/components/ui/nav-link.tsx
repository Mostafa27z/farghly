import React from 'react';
import { Link, InertiaLinkProps } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export interface NavLinkProps extends InertiaLinkProps {
    active?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function NavLink({ active = false, className = '', children, ...props }: NavLinkProps) {
    return (
        <Link
            className={cn(
                'nav-link-animated text-xs sm:text-sm font-semibold py-1.5 px-1 cursor-pointer transition-colors',
                active ? 'text-primary active' : 'text-muted-foreground hover:text-foreground',
                className
            )}
            {...props}
        >
            {children}
        </Link>
    );
}

export default NavLink;

