"use client";

import { useUser } from "@/firebase/auth/useUser";
import { useParams, useRouter } from "next/navigation";
import { 
  Activity, 
  ScanEye,
  Mic,
  Stethoscope,
  Brain,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Hello, {user?.displayName || "Guest"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="font-mono tracking-widest text-slate-300">
              {user?.email || "No email linked"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (AI Tools) */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4 px-1">AI Health Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col"
            onClick={() => router.push(`/${locale}/symptom-checker`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-lg text-slate-200 group-hover:text-white">Check Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">AI-driven triage and diagnosis based on your symptoms.</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col"
            onClick={() => router.push(`/${locale}/skin-scan`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-emerald-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-lg text-slate-200 group-hover:text-white">Start Skin Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Analyze skin lesions or rashes using your device camera.</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col"
            onClick={() => router.push(`/${locale}/mental-health-screen`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-purple-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-lg text-slate-200 group-hover:text-white">Mental Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Quick screening for stress, anxiety, and depression.</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900 border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col"
            onClick={() => router.push(`/${locale}/cough-analysis`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-orange-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-lg text-slate-200 group-hover:text-white">Cough Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Record your cough for AI respiratory screening.</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col"
            onClick={() => router.push(`/${locale}/vision-scan`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-teal-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ScanEye className="w-6 h-6 text-teal-400" />
              </div>
              <CardTitle className="text-lg text-slate-200 group-hover:text-white">Vision Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Check for cataracts and other common eye conditions.</p>
            </CardContent>
          </Card>
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
