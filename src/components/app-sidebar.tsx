"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PulseCheckLogo } from "@/components/pulse-check-logo";
import {
    LayoutDashboard,
    Eye,
    Mic,
    Scan,
    Brain,
    TrendingUp,
    Users,
    Stethoscope,
    Landmark,
    BellRing,
    ClipboardList,
    Lock,
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
import { useIsDemo } from "@/hooks/useIsDemo";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* Features demo users cannot fully use — clicking will still navigate but the page should handle it */
const DEMO_LOCKED = new Set(["/health-records", "/people"]);

export function AppSidebar({ locale }: { locale: string }) {
    const t = useTranslations("nav");
    const pathname = usePathname();
    const isDemo = useIsDemo();
    const router = useRouter();

    const navItems = [
        { title: t("dashboard"), url: `/${locale}/dashboard`, icon: LayoutDashboard },
        { title: t("symptomChecker"), url: `/${locale}/symptom-checker`, icon: Stethoscope },
        { title: t("visionScan"), url: `/${locale}/vision-scan`, icon: Eye },
        { title: t("coughAnalysis"), url: `/${locale}/cough-analysis`, icon: Mic },
        { title: t("skinScan"), url: `/${locale}/skin-scan`, icon: Scan },
        { title: t("mentalHealth"), url: `/${locale}/mental-health-screen`, icon: Brain },
        { title: t("trends"), url: `/${locale}/health-trends`, icon: TrendingUp },
        { title: "Health Records", url: `/${locale}/health-records`, icon: ClipboardList },
        { title: "Govt Schemes", url: `/${locale}/govt-schemes`, icon: Landmark },
        { title: "Reminders", url: `/${locale}/reminders`, icon: BellRing },
        { title: t("nearbyHospitals"), url: `/${locale}/nearby-hospitals`, icon: Stethoscope },
        { title: t("people"), url: `/${locale}/people`, icon: Users },
    ];

    return (
        <TooltipProvider delayDuration={200}>
            <Sidebar>
                <SidebarHeader className="border-b p-4">
                    <Link href={`/${locale}/dashboard`}>
                        <PulseCheckLogo size={40} />
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => {
                                    const routeSuffix = item.url.replace(`/${locale}`, "");
                                    const locked = isDemo && DEMO_LOCKED.has(routeSuffix);

                                    const inner = (
                                        <SidebarMenuButton
                                            asChild={!locked}
                                            isActive={pathname === item.url}
                                            className={locked ? "opacity-60 cursor-pointer" : ""}
                                            onClick={
                                                locked
                                                    ? (e) => {
                                                        e.preventDefault();
                                                        router.push(`/${locale}/signup`);
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {locked ? (
                                                <div className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md">
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                    <span className="flex-1 truncate">{item.title}</span>
                                                    <Lock className="h-3 w-3 text-yellow-500 shrink-0" />
                                                </div>
                                            ) : (
                                                <Link href={item.url}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    );

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            {locked ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="w-full">{inner}</div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Sign up to unlock</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : inner}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Demo CTA at bottom of sidebar */}
                    {isDemo && (
                        <div className="mt-auto p-4">
                            <Link
                                href={`/${locale}/signup`}
                                className="block w-full text-center bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-lg py-2 px-3 hover:bg-yellow-500/20 transition-colors"
                            >
                                🔓 Sign up to save data
                            </Link>
                        </div>
                    )}
                </SidebarContent>
            </Sidebar>
        </TooltipProvider>
    );
}
