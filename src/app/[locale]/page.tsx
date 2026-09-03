import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Stethoscope, HeartPulse, Sparkles, MessageSquareHeart } from "lucide-react";

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-600/15 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                <div className="absolute bottom-[-20%] left-[20%] w-[50rem] h-[50rem] bg-teal-600/10 rounded-full blur-[150px] mix-blend-screen opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navbar */}
            <header className="relative z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-400 to-indigo-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white font-space">DIAGNOVERSE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            SIH26133 Live
                        </span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center pt-24 pb-32 lg:pt-32 lg:pb-40">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-white/10 text-slate-300 text-sm font-medium mb-8 backdrop-blur-md shadow-2xl">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Next-Generation AI Healthcare Platform</span>
                    </div>
                    
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-8 leading-[1.1]">
                        Healthcare that reaches <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                            where doctors can't.
                        </span>
                    </h1>
                    
                    <p className="mt-6 text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                        Experience clinically-validated AI diagnostics, seamless health worker coordination, and instant triage in one beautiful platform.
                    </p>
                    
                    {/* Dual CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-20">
                        {/* Primary B2C Patient Button */}
                        <Link href={`/${locale}/auth/patient`} className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 px-8 h-14 text-lg font-semibold rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:-translate-y-1">
                                User Portal
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Secondary B2B Worker Button */}
                        <Link href={`/${locale}/auth/worker`} className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-[#0B1120]/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 px-8 h-14 text-lg font-semibold rounded-2xl backdrop-blur-md transition-all hover:scale-105 hover:-translate-y-1">
                                For Health Workers
                            </Button>
                        </Link>
                    </div>

                    {/* Chat UI Mockup */}
                    <div className="mt-24 relative mx-auto max-w-3xl perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-20 h-full w-full bottom-0" />
                        
                        <div className="relative z-10 bg-[#0B1120]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 text-left shadow-2xl transform rotate-x-12 scale-105 translate-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <MessageSquareHeart className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">PulseCheck AI Assistant</h3>
                                    <p className="text-xs text-emerald-400">Always online</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 opacity-80">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-slate-300 text-sm max-w-[80%]">
                                        Hi! I've been having a persistent dry cough and mild fever for the past 3 days. What should I do?
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                                        <HeartPulse className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tr-sm p-4 text-slate-200 text-sm max-w-[80%] shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
                                        I can help you assess that. To give you the most accurate triage, could you please use the microphone feature to record a 5-second sample of your cough?
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-slate-300 text-sm flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                                        </div>
                                        <span className="italic text-slate-400">Audio sample recorded (0:05)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </main>
        </div>
    );
}
