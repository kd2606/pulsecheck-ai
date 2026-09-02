"use client";

import { 
  FileText, 
  Video, 
  Activity, 
  Download,
  CalendarPlus,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Hello, Ramesh</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="font-mono tracking-widest text-slate-300">ABHA: 91-XXXX-XXXX-XXXX</span>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Records Card */}
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors flex flex-col">
          <CardHeader className="pb-2">
            <div className="bg-teal-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <CardTitle className="text-lg text-slate-200">My Health Records</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-slate-400 text-sm">4 records available</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full bg-slate-800 hover:bg-slate-700 text-white min-h-[44px]">
              View All
            </Button>
          </CardFooter>
        </Card>

        {/* Consultation Card */}
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="bg-blue-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                <Video className="w-5 h-5 text-blue-400" />
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10">Upcoming</Badge>
            </div>
            <CardTitle className="text-lg text-slate-200">Upcoming Consultation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="font-medium text-white">Dr. Anjali Verma</p>
            <p className="text-slate-400 text-sm mt-1">15 Sep, 10:00 AM</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white min-h-[44px]">
              Join Call
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Triage Status */}
      <Card className="bg-slate-900 border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-900/30 p-3 rounded-full">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Latest Triage</h3>
              <p className="text-sm text-slate-400">Last checked 2 days ago</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 hover:bg-emerald-500/20">
            Status: GREEN
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto p-4 justify-start gap-4 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-left group min-h-[44px]">
            <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
              <CalendarPlus className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Book Teleconsultation</div>
              <div className="text-xs text-slate-400">Schedule a new visit</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Button>

          <Button variant="outline" className="h-auto p-4 justify-start gap-4 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-left group min-h-[44px]">
            <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
              <Download className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Download Health Report</div>
              <div className="text-xs text-slate-400">Get latest summary</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center">
        <p className="text-xs text-slate-500 leading-relaxed">
          Information provided here is for personal health management and does not replace professional medical advice. In case of emergency, please visit the nearest healthcare facility.
        </p>
      </footer>
    </div>
  );
}
