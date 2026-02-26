"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "next-themes";



export function StressLevelChart({ stressLevel = 30 }: { stressLevel?: number }) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[200px] w-full animate-pulse bg-muted/50 rounded-xl" />;

    const isDark = theme === "dark";

    const color = stressLevel > 70 ? "#ef4444" : stressLevel > 40 ? "#f59e0b" : "#10b981";
    const textLabel = stressLevel > 70 ? "High" : stressLevel > 40 ? "Mod" : "Low";

    const dynamicData = [
        { name: "Stress", value: stressLevel, color: color },
        { name: "Rest", value: 100 - stressLevel, color: isDark ? "#ffffff10" : "#00000010" }
    ];

    return (
        <div className="h-[200px] w-full mt-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={dynamicData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        startAngle={180}
                        endAngle={0}
                    >
                        {dynamicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: isDark ? '#fff' : '#000' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-4">
                <span className="text-2xl font-bold" style={{ color }}>{stressLevel}%</span>
                <span className="text-xs text-muted-foreground">{textLabel} Stress</span>
            </div>
        </div>
    );
}
