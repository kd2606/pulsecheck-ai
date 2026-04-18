"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { 
    User, Settings, Plus, Activity, Brain, HeartPulse, Hospital, 
    FileText, ChevronRight, LogOut, Smartphone, X, LayoutDashboard, 
    ShieldCheck, Database, Zap, Bell, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/firebase/auth/useUser";
import { useRouter, useParams } from "next/navigation";
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot,
    doc,
    getDoc
} from "firebase/firestore";
import { db, auth } from "@/firebase/clientApp";
import { AddVitalsModal } from "@/components/dashboard/add-vitals-modal";
import { RuralHospitalList, MedicinePriceCard, FamilyCardsList, GovSchemesCard, VoiceAssistantButton } from "@/components/dashboard/rural-features";
import { UserProfileModal } from "@/components/dashboard/user-profile";
import Link from "next/link";
import { signOut } from "firebase/auth";

export default function DashboardPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const [scrolled, setScrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [vitals, setVitals] = useState<any>(null);
    const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [user, loading, router, locale]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Real-time Vitals Subscription
    useEffect(() => {
        if (!user) return;

        const vitalsQuery = query(
            collection(db, "users", user.uid, "vitals"),
            orderBy("updatedAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(vitalsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (data.length > 0) {
                setVitals(data[0]);
                setVitalsHistory(data);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push(`/${locale}/login`);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-2 border-emerald-500 animate-spin" />
                    <HeartPulse className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
            </div>
        );
    }

    const navItems = [
        { icon: LayoutDashboard, label: "Home", active: true },
        { icon: Activity, label: "Health Checks", path: `/${locale}/vision-scan` },
        { icon: ShieldCheck, label: "Govt Schemes" },
        { icon: Database, label: "Hospitals" },
        { icon: Zap, label: "Health News" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-inter flex overflow-hidden">
            {/* Global Grid Pattern */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-24 bg-[#0a0a0a]/80 backdrop-blur-3xl border-r border-white/5 
                flex flex-col items-center py-10 transition-transform duration-500 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="mb-12">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center emerald-glow group cursor-pointer transition-transform duration-500 hover:rotate-12">
                        <HeartPulse className="w-6 h-6 text-white" />
                    </div>
                </div>
                
                <nav className="flex flex-col gap-8 flex-1">
                    {navItems.map((item, index) => (
                        <Link key={index} href={item.path || "#"} className="group relative" onClick={() => setIsSidebarOpen(false)}>
                            <item.icon className={`w-6 h-6 transition-all duration-300 ${item.active ? 'text-emerald-400' : 'text-white/20 group-hover:text-white/60'}`} />
                            {item.active && <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(0,252,64,0.5)]" />}
                            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter z-50 shadow-xl border border-black/10">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col gap-6 pt-8 border-t border-white/5 w-full items-center">
                    <Settings className="w-6 h-6 text-white/20 hover:text-white/60 cursor-pointer transition-colors" />
                    <UserProfileModal>
                        <button className="h-10 w-10 rounded-full border border-white/10 overflow-hidden hover:border-emerald-500/50 transition-all">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="P" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] font-bold">U</div>
                            )}
                        </button>
                    </UserProfileModal>
                    <button onClick={handleLogout} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative scrollbar-hide">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
                    
                    {/* Top Command Bar */}
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl md:hidden hover:bg-white/10 transition-all"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="space-y-1">
                                <p className="text-[10px] text-emerald-400/60 font-space font-bold tracking-[0.3em] uppercase">
                                    Welcome to PulseCheck
                                </p>
                                <h1 className="text-4xl font-space font-bold tracking-tighter text-white">
                                    Health <span className="text-white/40">Dashboard</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-space font-bold uppercase tracking-widest text-white/60">System Online</span>
                            </div>
                            <AddVitalsModal />
                            <VoiceAssistantButton />
                        </div>
                    </header>

                    {/* Layout Grid */}
                    <div className="grid grid-cols-12 gap-8">
                        
                        {/* Hero Section: AI Diagnostic Vector */}
                        <section className="col-span-12 group relative rounded-[3rem] border border-white/5 bg-gradient-to-br from-[#0e0e0e]/80 to-transparent p-12 overflow-hidden backdrop-blur-3xl">
                            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[150px] -mr-96 -mt-96 transition-all duration-1000 group-hover:bg-emerald-500/[0.05]" />
                            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/[0.02] blur-[150px] -ml-48 -mb-48" />
                            
                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-10">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">AI Helper Ready</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h2 className="text-6xl md:text-7xl font-space font-bold tracking-tighter leading-[0.9]">
                                            Quick <br/> 
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-white/40">Health Check</span>
                                        </h2>
                                        <p className="text-xl text-white/40 font-medium leading-relaxed max-w-lg">
                                            Use our easy AI tools to check your symptoms, get advice, and stay healthy.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-4">
                                        <Link href={`/${locale}/skin-scan`}>
                                            <button className="h-16 px-10 rounded-2xl bg-white text-black font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/10 group">
                                                Start Scan
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                        <div className="flex items-center gap-4 px-6 h-16 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-[8px] font-bold">U{i}</div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Connect with doctors</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="relative hidden lg:block">
                                    <div className="aspect-square rounded-full border border-white/5 flex items-center justify-center relative bg-white/[0.01]">
                                        <div className="absolute inset-0 border-t-2 border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                                        <div className="absolute inset-8 border-b-2 border-indigo-500/20 rounded-full animate-[spin_15s_linear_reverse_infinite]" />
                                        <div className="absolute inset-16 border-l-2 border-emerald-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
                                        
                                        <motion.div 
                                            animate={{ 
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 90, 0]
                                            }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                            className="h-48 w-48 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-[0_0_80px_rgba(0,252,64,0.2)] relative z-20 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                            <Zap className="w-20 h-20 text-white relative z-10" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </section>



                        {/* Feature Components */}
                        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            <div className="xl:col-span-1"><MedicinePriceCard /></div>
                            <div className="xl:col-span-1"><FamilyCardsList /></div>
                            <div className="xl:col-span-1"><GovSchemesCard /></div>
                            <div className="xl:col-span-1"><RuralHospitalList /></div>
                        </div>

                    </div>
                    
                    {/* Footer System Status */}
                    <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Version 1.0</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Location Services Active</span>
                        </div>
                        <p className="text-[10px] font-bold">© 2026 PULSECHECK AI. ALL RIGHTS RESERVED.</p>
                    </footer>

                </div>
            </main>
        </div>
    );
}
