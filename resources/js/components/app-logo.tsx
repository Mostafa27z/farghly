import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
                <AppLogoIcon className="size-5 fill-current text-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">فرغلي</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate">FARGHLY AI</span>
            </div>
        </>
    );
}
