"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkerReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Monthly Reports</h1>
          <p className="text-slate-400 mt-1">Analytics and performance tracking.</p>
        </div>
        <Button variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0B1120] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Total Screenings</CardTitle>
            <Activity className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">124</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +14% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1120] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">High Risk Referrals</CardTitle>
            <FileText className="w-4 h-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12</div>
            <p className="text-xs text-rose-400 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +2 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1120] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Follow-ups Completed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">45</div>
            <p className="text-xs text-slate-400 mt-1">
              89% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center mt-6">
        <p className="text-slate-500 text-sm">Detailed charts and graphs will populate here after more data is synced.</p>
      </Card>
    </div>
  );
}
