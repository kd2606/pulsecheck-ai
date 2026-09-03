"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WorkerAssignedFamiliesPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Assigned Families</h1>
          <p className="text-slate-400 mt-1">Manage households under your jurisdiction.</p>
        </div>
        <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Family
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search by family head name or ID..." 
            className="pl-9 bg-[#0B1120] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
            <Users className="w-8 h-8 text-emerald-500/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Families Found</h3>
          <p className="text-slate-400 text-sm mb-8">
            Your roster is currently empty or still syncing from the ABHA directory. Check back later or add a family manually.
          </p>
        </div>
      </Card>
    </div>
  );
}
