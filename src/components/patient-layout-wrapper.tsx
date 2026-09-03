"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { DemoBanner } from "@/components/demo-banner";
import { FloatingChat } from "@/components/floating-chat";

export function PatientLayoutWrapper({ children, locale }: { children: React.ReactNode, locale: string }) {
    const pathname = usePathname();
    const isWorker = pathname?.includes('/worker');
    const isDistrict = pathname?.includes('/district');
    const isMarketing = pathname === `/${locale}` || pathname === `/`;
    const isAuth = pathname?.includes('/auth');

    if (isWorker || isDistrict || isMarketing || isAuth) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <AppSidebar locale={locale} />
            <SidebarInset className="overflow-hidden w-full max-w-full bg-[#FAFAF9] dark:bg-[#0B1120]">
                <DemoBanner />
                <AppHeader locale={locale} />
                <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</main>
            </SidebarInset>
            <FloatingChat />
        </SidebarProvider>
    );
}
