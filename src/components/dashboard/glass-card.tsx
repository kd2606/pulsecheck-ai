"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export function GlassCard({ className, children, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-[24px] border border-white/20 bg-background/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40",
                hoverEffect && "transition-all hover:shadow-2xl hover:border-primary/30",
                className
            )}
            whileHover={hoverEffect ? { scale: 1.02, rotateX: 2, rotateY: -2 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 pointer-events-none" />

            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}
