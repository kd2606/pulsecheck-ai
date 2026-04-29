import Image from "next/image";

interface DiagnoverseLogoProps {
    /** Pixel size of the square logo. Default: 32 */
    size?: number;
    /** Show the wordmark ("Diagnoverse AI") beside the icon. Default: true */
    showWordmark?: boolean;
    className?: string;
}

export function DiagnoverseLogo({ size = 32, showWordmark = true, className = "" }: DiagnoverseLogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <Image
                src="/diagnoverse-logo.svg"
                alt="Diagnoverse AI Logo"
                width={size}
                height={size}
                priority
                className="shrink-0"
            />
            {showWordmark && (
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold tracking-tight">Diagnoverse AI</span>
                    <span className="text-[10px] text-muted-foreground tracking-wide">Health · Intelligence · Care</span>
                </div>
            )}
        </div>
    );
}
