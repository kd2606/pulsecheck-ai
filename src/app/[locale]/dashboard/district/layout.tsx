'use client';

import { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
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
  Activity,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DistrictLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string || 'en';

  const navItems = [
    { icon: LayoutDashboard, label: 'SLA Dashboard', href: `/${locale}/dashboard/district` },
    { icon: Activity, label: 'Command Analytics', href: `/${locale}/dashboard/district/analytics` },
    { icon: Map, label: 'Facility Mapping', href: `/${locale}/dashboard/district/facilities` },
    { icon: Building, label: 'Service Catalog', href: `/${locale}/dashboard/district/catalog` },
    { icon: AlertOctagon, label: 'Critical Incidents', href: `/${locale}/dashboard/district/incidents` },
    { icon: FileText, label: 'Audit Reports', href: `/${locale}/dashboard/district/audit` },
    { icon: Settings, label: 'System Config', href: `/${locale}/dashboard/district/config` },
    { icon: User, label: 'My Profile', href: `/${locale}/dashboard/district/profile` },
  ];

  return (
    <div className="min-h-screen dashboard-true-black dark bg-background text-foreground flex flex-col md:flex-row font-sans">
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
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Building className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground leading-tight">CARESANCHAAR</h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">District Command</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === `/${locale}/dashboard/district` 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            const isRoadmap = ['Facility Mapping', 'Critical Incidents', 'Audit Reports', 'System Config'].includes(item.label);
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href !== '#' && !isRoadmap) router.push(item.href);
                  setSidebarOpen(false);
                }}
                disabled={isRoadmap}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-secondary text-secondary-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  isRoadmap && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className={cn("size-5", isActive ? "text-secondary-foreground" : "text-muted-foreground")} />
                {item.label}
                {isRoadmap && <Badge variant="outline" className="ml-auto text-[10px] leading-tight px-1.5 h-4">Roadmap</Badge>}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <Link href={`/${locale}/dashboard/district/profile`}>
            <div 
              className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100/10 border border-amber-200/20 flex items-center justify-center font-bold text-amber-500">
                CM
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Dr. C. Mishra</p>
                <p className="text-xs text-amber-500 font-medium">Chief Medical Officer</p>
              </div>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 mt-2"
            onClick={async () => {
              const { signOut } = await import('firebase/auth');
              const { auth } = await import('@/firebase/clientApp');
              await signOut(auth);
              router.push(`/${locale}/auth/district`);
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <h2 className="text-lg font-semibold text-muted-foreground hidden sm:block">
              {(() => {
                const activeItem = navItems.slice().reverse().find(item => 
                  item.href === `/${locale}/dashboard/district` 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href)
                );
                return activeItem ? activeItem.label : "SLA Dashboard";
              })()}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {/* Sync Warning Widget */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
              <Activity className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">
                12 ASHA devices haven't synced in 72+ hrs (Demo/Synthetic data)
              </span>
            </div>

            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
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
              Warning (Demo/Synthetic data): 12 ASHA devices haven't synced in 72+ hours. Local offline queues may be full.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
