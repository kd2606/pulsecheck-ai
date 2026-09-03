"use client";

import { useState } from "react";
import { 
  Shield, 
  Home, 
  Users, 
  ClipboardPlus, 
  Send, 
  FileText, 
  Menu, 
  Bell, 
  RefreshCw,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";

  const navItems = [
    { icon: Home, label: "Dashboard", href: `/${locale}/dashboard/worker` },
    { icon: Users, label: "Assigned Families", href: `/${locale}/dashboard/worker/assigned-families` },
    { icon: ClipboardPlus, label: "New Intake", href: `/${locale}/dashboard/worker/intake`, primary: true },
    { icon: Send, label: "Referrals", href: `/${locale}/dashboard/worker/referrals` },
    { icon: FileText, label: "Reports", href: `/${locale}/dashboard/worker/reports` },
    { icon: User, label: "My Profile", href: `/${locale}/dashboard/worker/profile` },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ease-in-out",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-[#0B1120] flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/50 shadow-xl animate-in fade-in duration-500",
        sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
      )}>
        {/* Logo Area */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white/5 p-2 rounded-lg">
            <HeartPulse className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">DIAGNOVERSE</h1>
            <p className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider">Health Worker Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item, i) => (
            <Link key={i} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-sm font-medium min-h-[44px]",
                item.primary 
                  ? "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm" 
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}>
                <item.icon className={cn("w-5 h-5", item.primary ? "text-white" : "text-emerald-500")} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-4">
          <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-400">Online</span>
              </div>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/20 text-xs border-orange-500/30">
                3 unsynced
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                HW
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Health Worker</span>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider">ASHA Worker</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0B1120]/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h2 className="text-lg font-semibold text-white tracking-tight hidden sm:block">Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Data
            </Button>
            <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900" />
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
