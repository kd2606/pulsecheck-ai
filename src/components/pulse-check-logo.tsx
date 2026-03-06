import Image from "next/image";

interface PulseCheckLogoProps {
    /** Pixel size of the square logo. Default: 32 */
    size?: number;
    /** Show the wordmark ("PulseCheck AI") beside the icon. Default: true */
    showWordmark?: boolean;
    className?: string;
}

export function PulseCheckLogo({ size = 32, showWordmark = true, className = "" }: PulseCheckLogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <Image
                src="/pulsecheck-logo.svg"
                alt="PulseCheck AI Logo"
                width={size}
                height={size}
                priority
                className="shrink-0"
            />
            {showWordmark && (
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold tracking-tight">PulseCheck AI</span>
                    <span className="text-[10px] text-muted-foreground tracking-wide">Health · Intelligence · Care</span>
                </div>
            )}
        </div>
    );
}
