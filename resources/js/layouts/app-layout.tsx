import DashboardLayout from '@/layouts/dashboard-layout';
import { type BreadcrumbItem } from '@/types';
import React from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].title : undefined;

    return (
        <DashboardLayout title={pageTitle}>
            {children}
        </DashboardLayout>
    );
}
