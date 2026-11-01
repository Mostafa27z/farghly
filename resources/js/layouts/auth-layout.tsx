import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    titleEn,
    description,
    descriptionEn,
    badgeText,
    badgeTextEn,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    badgeText?: string;
    badgeTextEn?: string;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            titleEn={titleEn}
            description={description}
            descriptionEn={descriptionEn}
            badgeText={badgeText}
            badgeTextEn={badgeTextEn}
            {...props}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
