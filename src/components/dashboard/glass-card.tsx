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
                "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0e0e0e]/40 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500",
                hoverEffect && "hover:border-emerald-500/10 hover:bg-[#121212]/60",
                className
            )}
            whileHover={hoverEffect ? { y: -5, scale: 1.005 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            {...props}
        >
            {/* Specular Ghost Highlight (15% opacity fallback border) */}
            <div className="absolute inset-0 border border-white/[0.03] rounded-[2.5rem] pointer-events-none" />
            
            {/* Atmospheric Depth Layer */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/[0.03] blur-[100px] pointer-events-none" />

            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}
