"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Mail, Building, ShieldCheck, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WorkerProfilePage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your professional information and credentials.</p>
      </div>

      <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-900/30 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D9488] to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/20 border-4 border-[#0B1120]">
              HW
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Health Worker</CardTitle>
              <CardDescription className="text-emerald-400 font-medium mt-1 uppercase tracking-wider text-xs flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Verified ASHA / ANM
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-slate-400 flex items-center text-xs uppercase tracking-wider font-semibold">
                <User className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Full Name
              </Label>
              <Input 
                defaultValue="Health Worker" 
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-emerald-500 font-medium" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 flex items-center text-xs uppercase tracking-wider font-semibold">
                <Mail className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Email Address
              </Label>
              <Input 
                defaultValue="worker@diagnoverse.in" 
                type="email"
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-emerald-500 font-medium" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 flex items-center text-xs uppercase tracking-wider font-semibold">
                <Building className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Assigned PHC
              </Label>
              <Input 
                defaultValue="Block 4 Primary Health Centre" 
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-emerald-500 font-medium" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 flex items-center text-xs uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Employee / NHA ID
              </Label>
              <Input 
                defaultValue="ASHA-2023-8942" 
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-emerald-500 font-medium" 
                disabled
              />
              <p className="text-[10px] text-slate-500">Contact admin to change official ID.</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 flex items-center text-xs uppercase tracking-wider font-semibold">
                <Phone className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Contact Number
              </Label>
              <Input 
                defaultValue="+91 98765 43210" 
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-emerald-500 font-medium" 
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-slate-800 bg-slate-900/20 p-6 flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white">Cancel</Button>
          <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
