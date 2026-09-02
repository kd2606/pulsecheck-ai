'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  AlertOctagon, 
  FileText, 
  Map, 
  Settings, 
  Menu, 
  Bell, 
  LogOut,
  Building,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DistrictLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';

  const navItems = [
    { icon: LayoutDashboard, label: 'SLA Dashboard', href: `/${locale}/dashboard/district`, active: true },
    { icon: Map, label: 'Facility Mapping', href: '#' },
    { icon: AlertOctagon, label: 'Critical Incidents', href: '#' },
    { icon: FileText, label: 'Audit Reports', href: '#' },
    { icon: Settings, label: 'System Config', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Building className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">DIAGNOVERSE</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">District Command</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href !== '#') router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  item.active 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("size-5", item.active ? "text-slate-900" : "text-slate-400")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
              CM
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-900">Dr. C. Mishra</p>
              <p className="text-xs text-slate-500">Chief Medical Officer</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 mt-2">
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">Referral SLAs & Operations</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sync Warning Widget */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
              <Activity className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">
                12 ASHA devices haven't synced in 72+ hrs
              </span>
            </div>

            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile Sync Warning */}
          <div className="lg:hidden flex items-center gap-3 p-3 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
            <Activity className="size-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              Warning: 12 ASHA devices haven't synced in 72+ hours. Local offline queues may be full.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
