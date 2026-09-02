"use client";

import { 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  CloudOff,
  ClipboardPlus,
  Send,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";

export default function WorkerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Good Morning, Priya</h1>
        <p className="text-slate-400">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Assigned Families</CardTitle>
            <Users className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">47</div>
            <p className="text-xs text-slate-500 mt-1">+2 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Today's Visits</CardTitle>
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-xs text-slate-500 mt-1">4 remaining today</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Referrals</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-slate-500 mt-1">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-red-900/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Unsynced Records</CardTitle>
            <CloudOff className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">2</div>
            <p className="text-xs text-slate-500 mt-1">Tap sync to upload</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-100">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 transition-colors cursor-pointer shadow-sm group min-h-[100px]" 
            onClick={() => router.push(`/${locale}/dashboard/worker/intake`)}
          >
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
                  <ClipboardPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Start New Intake</h3>
                  <p className="text-sm text-blue-200">Record a new patient screening</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm group min-h-[100px]" 
            onClick={() => router.push(`/${locale}/dashboard/worker/referrals`)}
          >
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
                  <Send className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">View Referrals</h3>
                  <p className="text-sm text-slate-400">Track referred patients</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100">Recent Activity</h2>
          <Button variant="link" className="text-blue-400 p-0 h-auto min-h-[44px]">View all</Button>
        </div>
        <Card className="bg-slate-900 border-slate-800">
          <div className="divide-y divide-slate-800">
            {[
              { title: "Intake completed for Sunita Devi", time: "10 mins ago" },
              { title: "Referral generated for Rahul Kumar", time: "2 hours ago" },
              { title: "Follow-up visit with Verma Family", time: "Yesterday" },
              { title: "Data sync completed", time: "Yesterday" }
            ].map((activity, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors">
                <div className="bg-slate-800 p-2 rounded-full">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{activity.title}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
