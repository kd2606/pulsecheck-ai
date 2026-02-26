"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Eye,
    Mic,
    Scan,
    Brain,
    TrendingUp,
    Users,
    Heart,
    Stethoscope,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ locale }: { locale: string }) {
    const t = useTranslations("nav");
    const pathname = usePathname();

    const navItems = [
        { title: t("dashboard"), url: `/${locale}/dashboard`, icon: LayoutDashboard },
        { title: t("symptomChecker"), url: `/${locale}/symptom-checker`, icon: Stethoscope },
        { title: t("visionScan"), url: `/${locale}/vision-scan`, icon: Eye },
        { title: t("coughAnalysis"), url: `/${locale}/cough-analysis`, icon: Mic },
        { title: t("skinScan"), url: `/${locale}/skin-scan`, icon: Scan },
        { title: t("mentalHealth"), url: `/${locale}/mental-health-screen`, icon: Brain },
        { title: t("trends"), url: `/${locale}/health-trends`, icon: TrendingUp },
        { title: t("people"), url: `/${locale}/people`, icon: Users },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Heart className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">PulseCheck AI</span>
                        <span className="text-[10px] text-muted-foreground">Rural Health Platform</span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
