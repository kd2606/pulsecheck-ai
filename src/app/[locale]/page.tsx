import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, ShieldPlus, HeartPulse } from "lucide-react";

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

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
                    <Link href={`/${locale}/auth`}>
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white bg-transparent">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 relative z-10 flex items-center justify-center py-20 lg:py-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                        Empowering health workers with AI-driven diagnostics, seamless hospital referrals, and real-time district command centers to deliver premium healthcare to every corner.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={`/${locale}/auth`}>
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-105">
                                Access Portal
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Features Row */}
                    <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
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
                                <Activity className="w-6 h-6" />
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
