import { LucideIcon } from 'lucide-react';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan_name: string;
    remaining_videos?: number;
    monthly_videos_limit?: number;
    monthly_videos_used?: number;
    remaining_minutes?: number;
    has_active_subscription?: boolean;
    expires_at?: string | null;
}

export interface Auth {
    user: User;
    is_super_admin?: boolean;
    is_sales?: boolean;
    is_staff?: boolean;
    tenant?: Tenant | null;
    [key: string]: unknown;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
