import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, ShieldPlus, HeartPulse, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] mix-blend-screen" />
                <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[128px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Navbar */}
            <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        <span className="font-bold text-xl tracking-tight text-white">DIAGNOVERSE</span>
                    </div>
                    <Link href="/auth">
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white bg-transparent">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center py-20 lg:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        SIH26133 Initiative
                    </div>
                    
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8">
                        Diagnoverse AI: <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Rural Care Coordination & <br className="hidden sm:block" />Digital Triage Platform
                        </span>
                    </h1>
                    
                    <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Equipping ASHA workers and community volunteers with intelligent, offline-first screening tools. Streamline hospital referrals and sync real-time data to district command centers instantly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link href="/auth">
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-105">
                                Access Portal
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Dashboard Illustration */}
                    <div className="w-full max-w-4xl mx-auto relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-md mb-24 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col h-[400px]">
                            {/* App Header Mockup */}
                            <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-4 bg-slate-900">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                </div>
                                <div className="flex-1"></div>
                                <div className="w-6 h-6 rounded bg-slate-800"></div>
                            </div>
                            {/* App Content Mockup */}
                            <div className="flex flex-1 p-6 gap-6 overflow-hidden">
                                <div className="w-1/3 flex flex-col gap-4">
                                    <div className="h-24 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col p-4 justify-center">
                                        <div className="h-4 w-20 bg-blue-500/20 rounded mb-2"></div>
                                        <div className="h-8 w-12 bg-blue-400 rounded"></div>
                                    </div>
                                    <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-4">
                                        <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex gap-3 items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-3 w-full bg-slate-800 rounded"></div>
                                                        <div className="h-3 w-2/3 bg-slate-800/50 rounded"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="h-48 rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col">
                                        <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
                                        <div className="flex-1 flex items-end gap-2 px-2">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col">
                                         <div className="h-4 w-40 bg-slate-800 rounded mb-4"></div>
                                         <div className="flex-1 bg-slate-800/30 rounded border border-slate-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl text-left">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                <ShieldPlus className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Smart Triage</h3>
                            <p className="text-sm text-slate-400">AI-assisted screening directly in the field for accurate patient assessment.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Vital Tracking</h3>
                            <p className="text-sm text-slate-400">Real-time health record sync and vital monitoring for proactive care.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">District Command</h3>
                            <p className="text-sm text-slate-400">Comprehensive dashboard for SLA tracking and facility mapping.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
