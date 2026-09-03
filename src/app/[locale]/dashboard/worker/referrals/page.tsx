"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, FileSearch, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkerReferralsPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Active Referrals</h1>
          <p className="text-slate-400 mt-1">Manage and track patient referrals to District Facilities.</p>
        </div>
        <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
          <Send className="w-4 h-4 mr-2" /> Sync Status
        </Button>
      </div>

      <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
            <FileSearch className="w-8 h-8 text-emerald-500/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Active Referrals</h3>
          <p className="text-slate-400 text-sm mb-8">
            You currently have no pending or active referrals. When a high-risk triage case is submitted, it will appear here.
          </p>
        </div>
      </Card>
    </div>
  );
}
