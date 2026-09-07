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
          <p className="text-muted-foreground mt-1">Manage households under your jurisdiction.</p>
        </div>
        <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Family
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by family head name or ID..." 
            className="pl-9 bg-background border-border text-white placeholder:text-muted-foreground focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <Card className="bg-background border-border shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-6 shadow-inner border border-border">
            <Users className="w-8 h-8 text-emerald-500/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Families Found</h3>
          <p className="text-muted-foreground text-sm mb-8">
            Your roster is currently empty or still syncing from the ABHA directory. Check back later or add a family manually.
          </p>
        </div>
      </Card>
    </div>
  );
}
