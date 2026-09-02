"use client";

import { 
  Home, 
  Heart, 
  Bell, 
  Settings,
  Activity,
  ScanEye,
  Mic,
  Stethoscope,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = params.locale as string || "en";
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: `/${locale}/dashboard/patient` },
    { icon: Activity, label: "Symptom Checker", href: `/${locale}/symptom-checker` },
    { icon: ScanEye, label: "Vision Scan", href: `/${locale}/vision-scan` },
    { icon: Mic, label: "Cough Analysis", href: `/${locale}/cough-analysis` },
    { icon: Stethoscope, label: "Skin Scan", href: `/${locale}/skin-scan` },
    { icon: Brain, label: "Mental Health", href: `/${locale}/mental-health-screen` },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-teal-600/20 p-2 rounded-lg">
            <Heart className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">My Health</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link key={i} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium min-h-[44px]",
                  isActive 
                    ? "bg-teal-600/10 text-teal-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:hidden">
            <Heart className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-semibold text-slate-100">My Health</h2>
          </div>
          <div className="hidden md:block"></div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-300 min-h-[44px] min-w-[44px]">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-300 min-h-[44px] min-w-[44px]">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-950">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-40 px-2 pb-safe">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link key={i} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[44px]">
              <item.icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "text-slate-400")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-teal-400" : "text-slate-400")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
