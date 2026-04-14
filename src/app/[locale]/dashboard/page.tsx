"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/dashboard/glass-card";
import { AnimatedCircularProgress } from "@/components/dashboard/animated-circular-progress";
import { HeartRateChart } from "@/components/dashboard/heart-rate-chart";
import { StressLevelChart } from "@/components/dashboard/stress-level-chart";
import { HospitalMap } from "@/components/dashboard/hospital-map";
import {
    RuralHospitalList, MedicinePriceCard, FamilyCardsList,
    GovSchemesCard, DailyRemindersCard, EmergencyButton, VoiceAssistantButton
} from "@/components/dashboard/rural-features";
import { UserProfileModal } from "@/components/dashboard/user-profile";
import { AddVitalsModal } from "@/components/dashboard/add-vitals-modal";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { User, Settings, Plus, Activity, Brain, HeartPulse, Hospital, FileText, ChevronRight, LogOut, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebaseContext } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { collection, query, where, doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/firebase/clientApp";
import { signOut } from "firebase/auth";

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
    const t = useTranslations("dashboard");
    const params = useParams();
    const locale = params.locale as string;
    const router = useRouter();
    const { user, loading } = useFirebaseContext();
    const [vitals, setVitals] = useState({ heartRate: 72, stressLevel: 30, holisticScore: 78 });
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [showAndroidBanner, setShowAndroidBanner] = useState(false);

    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [user, loading, router, locale]);

    useEffect(() => {
        // Enforce a strict 3-second max loading state
        const timer = setTimeout(() => {
            setIsDataLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Check if banner was dismissed previously
        const isDismissed = localStorage.getItem("pulse-android-banner-dismissed");
        if (!isDismissed) {
            setShowAndroidBanner(true);
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        // Listen to active manual vitals updates
        const vitalsRef = doc(db, "users", user.uid, "vitals", "latest");
        const unsubscribeVitals = onSnapshot(vitalsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setVitals({
                    heartRate: data.heartRate || 72,
                    stressLevel: data.stressLevel || 30,
                    holisticScore: data.holisticScore || 78
                });
            }
            // First snapshot resolves loading state early if within 3s
            setIsDataLoading(false);
        });

        // Listen to active vision reports
        const reportsQuery = query(collection(db, "reports"), where("userId", "==", user.uid));
        const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
            const scans: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            scans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRecentScans(scans.slice(0, 3));
        });

        return () => {
            unsubscribeVitals();
            unsubscribeReports();
        };
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push(`/${locale}/login`);
    };

    if (loading || isDataLoading) {
        return (
            <div className="min-h-screen bg-transparent pb-24 p-4 md:p-6 w-full">
                <header className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-48 bg-white/10 dark:bg-white/10" />
                        <Skeleton className="h-4 w-32 bg-white/10 dark:bg-white/10" />
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <GlassCard className="p-8 h-full min-h-[250px] flex flex-col justify-between">
                        <Skeleton className="h-6 w-32 mb-8 bg-white/10 dark:bg-white/10" />
                        <div className="flex justify-center flex-1 items-center">
                            <Skeleton className="h-32 w-32 rounded-full bg-white/10 dark:bg-white/10" />
                        </div>
                    </GlassCard>
                    <GlassCard className="p-8 h-full min-h-[250px] flex flex-col justify-between">
                        <Skeleton className="h-6 w-32 mb-8 bg-white/10 dark:bg-white/10" />
                        <div className="flex-1 mt-auto">
                            <Skeleton className="w-full h-24 bg-white/10 dark:bg-white/10" />
                        </div>
                    </GlassCard>
                    <GlassCard className="p-8 h-full min-h-[250px] flex flex-col justify-between">
                        <Skeleton className="h-6 w-32 mb-8 bg-white/10 dark:bg-white/10" />
                        <div className="flex-1 mt-auto">
                            <Skeleton className="w-full h-24 bg-white/10 dark:bg-white/10" />
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash before redirect
    return (
        <div className="min-h-screen bg-transparent pb-24">
            {/* Header with New Voice & Emergency Features */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold tracking-tight bg-gradient-to-br from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent"
                    >
                        PulseCheck AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm flex items-center gap-1 mt-1"
                    >
                        Health Action Center
                    </motion.p>
                </div>
                <div className="flex items-center gap-3">
                    <AddVitalsModal />
                    <VoiceAssistantButton />
                    <EmergencyButton />

                    <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-black/40 backdrop-blur-md hidden sm:flex text-red-400 hover:text-red-500 hover:bg-red-500/10">
                        <LogOut className="h-4 w-4" />
                    </Button>
                    <UserProfileModal>
                        <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-black/40 backdrop-blur-md overflow-hidden p-0 relative group">
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all z-10">
                                <span className="text-[10px] text-white font-bold">EDIT</span>
                            </div>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="User" loading="lazy" className="w-full h-full object-cover relative z-0" />
                            ) : (
                                <div className="w-full h-full relative z-0 bg-gradient-to-tr from-emerald-400 to-indigo-400 flex items-center justify-center text-white font-bold capitalize">
                                    {user.displayName ? user.displayName[0] : user.email ? user.email[0] : "U"}
                                </div>
                            )}
                        </Button>
                    </UserProfileModal>
                </div>
            </header>

            {/* Android App Banner */}
            <AnimatePresence>
                {showAndroidBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-xl bg-black/40 border-l-4 border-l-teal-500 border-y border-r border-white/5 backdrop-blur-md shadow-lg gap-4 relative">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-teal-500/20 flex flex-col items-center justify-center text-teal-400">
                                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-tight leading-tight sm:text-lg">
                                        Get <span className="text-teal-400">PulseCheck AI</span> on Mobile
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-sm">
                                        For a faster and better experience, install our Android app. Free, no Play Store needed.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end mt-2 sm:mt-0">
                                <a 
                                    href="https://expo.dev/artifacts/eas/a4cyVYKBAo1t1yKs552SYf4.apk"
                                    onClick={() => console.log('APK Download clicked')}
                                    className="bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(0,191,165,0.3)]"
                                >
                                    Download APK →
                                </a>
                                <button 
                                    onClick={() => {
                                        setShowAndroidBanner(false);
                                        localStorage.setItem("pulse-android-banner-dismissed", "true");
                                    }}
                                    className="text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 sm:p-2.5 rounded-lg"
                                    aria-label="Dismiss banner"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Grid */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {/* -- Core Metrics: Row 1 -- */}
                <motion.div variants={staggerItem}>
                    <GlassCard className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
                        <div className="w-full flex justify-between items-center mb-4">
                            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> Holistic Score</h2>
                        </div>
                        <AnimatedCircularProgress value={vitals.holisticScore} />
                    </GlassCard>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <GlassCard className="h-full flex flex-col justify-between">
                        <div className="w-full flex justify-between items-center">
                            <h2 className="font-semibold flex items-center gap-2"><HeartPulse className="w-5 h-5 text-rose-500" /> Heart Rate</h2>
                            <span className="text-2xl font-bold">{vitals.heartRate} <span className="text-sm font-normal text-muted-foreground">bpm</span></span>
                        </div>
                        <HeartRateChart currentBpm={vitals.heartRate} />
                    </GlassCard>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <GlassCard className="h-full flex flex-col justify-between">
                        <div className="w-full flex justify-between items-center">
                            <h2 className="font-semibold flex items-center gap-2"><Brain className="w-5 h-5 text-amber-500" /> Stress Level</h2>
                        </div>
                        <StressLevelChart stressLevel={vitals.stressLevel} />
                    </GlassCard>
                </motion.div>

                {/* -- Expanded Rural Features: Row 2 -- */}
                <motion.div variants={staggerItem} className="md:col-span-2">
                    <RuralHospitalList />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <MedicinePriceCard />
                </motion.div>

                {/* -- Rural Tracking: Row 3 -- */}
                <motion.div variants={staggerItem} className="md:col-span-2 lg:col-span-1">
                    <DailyRemindersCard />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <GovSchemesCard />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <FamilyCardsList />
                </motion.div>

                {/* -- Original Dashboard Items: Row 4 -- */}
                <motion.div variants={staggerItem} className="md:col-span-2 lg:col-span-1">
                    <GlassCard className="h-full">
                        <h2 className="font-semibold flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-indigo-500" /> Latest Scans</h2>
                        <div className="space-y-4">
                            {recentScans.length > 0 ? (
                                recentScans.map((scan, i) => (
                                    <div key={scan.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 dark:bg-black/20 hover:bg-white/10 transition-colors group gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{scan.type || "Vision Scan"}</span>
                                            <span className="text-xs text-muted-foreground">{scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Today'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                            <Badge variant="outline" className={scan.result?.overallRisk === "High" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"}>
                                                {scan.disease_detected || "Healthy"}
                                            </Badge>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs px-2 shadow-sm rounded-md"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const { jsPDF } = await import("jspdf");
                                                        const doc = new jsPDF();

                                                        doc.setFontSize(22);
                                                        doc.setTextColor(34, 197, 94); // Emerald color
                                                        doc.text("PulseCheck AI - Health Report", 20, 20);

                                                        doc.setFontSize(14);
                                                        doc.setTextColor(0, 0, 0);
                                                        doc.text(`Scan Date: ${scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Unknown'}`, 20, 35);
                                                        doc.text(`Result: ${scan.disease_detected || "Healthy"}`, 20, 45);

                                                        // Fallback for different data structures (mental vs vision etc)
                                                        doc.setFontSize(12);
                                                        const details = scan.result?.overallAssessment || scan.aiAnalysis || scan.notes || "No detailed notes provided.";

                                                        const splitDetails = doc.splitTextToSize(`Details: ${details}`, 170);
                                                        doc.text(splitDetails, 20, 60);

                                                        doc.text("Generated by PulseCheck AI", 20, 280);

                                                        doc.save(`PulseCheck_Report_${scan.createdAt ? new Date(scan.createdAt).getTime() : 'Latest'}.pdf`);
                                                    } catch (err) {
                                                        console.error("Failed to generate PDF", err);
                                                        alert("Failed to download PDF. Please try again.");
                                                    }
                                                }}
                                            >
                                                Download PDF
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 text-muted-foreground bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 border-dashed">
                                    <p className="text-sm mb-2">No scans recorded yet.</p>
                                    <Link href={`/${locale}/vision-scan`}>
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-500">
                                            Take First Scan
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <GlassCard className="h-full flex flex-col">
                        <div className="w-full flex justify-between items-center mb-2">
                            <h2 className="font-semibold flex items-center gap-2"><Hospital className="w-5 h-5 text-blue-500" /> Map View</h2>
                        </div>
                        <HospitalMap />
                    </GlassCard>
                </motion.div>

                <motion.div variants={staggerItem} className="flex flex-col gap-4">
                    <Link href={`/${locale}/cardio-check`} className="w-full h-full min-h-[96px] flex items-center justify-center">
                        <motion.div
                            className="relative flex flex-col items-center justify-center gap-2 w-full h-full rounded-[24px] bg-gradient-to-br from-rose-500 to-orange-600 p-1 shadow-xl cursor-pointer group overflow-hidden"
                            whileHover={{ scale: 1.05, rotateZ: 1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity duration-500 blur-xl group-hover:blur-2xl" />
                            <div className="relative z-10 flex flex-row items-center justify-center gap-3 h-full w-full bg-black/20 backdrop-blur-md rounded-[22px] border border-white/20 p-4 text-white text-center">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <HeartPulse className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold">Cardio Check</h3>
                            </div>
                        </motion.div>
                    </Link>

                    <Link href={`/${locale}/vision-scan`} className="w-full h-full min-h-[96px] flex items-center justify-center">
                        <motion.div
                            className="relative flex flex-col items-center justify-center gap-2 w-full h-full rounded-[24px] bg-gradient-to-br from-emerald-500 to-indigo-600 p-1 shadow-xl cursor-pointer group overflow-hidden"
                            whileHover={{ scale: 1.05, rotateZ: -1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity duration-500 blur-xl group-hover:blur-2xl" />
                            <div className="relative z-10 flex flex-row items-center justify-center gap-3 h-full w-full bg-black/20 backdrop-blur-md rounded-[22px] border border-white/20 p-4 text-white text-center">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold">New Vision Scan</h3>
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
