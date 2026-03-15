"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/clientApp";
import { useUser } from "@/firebase/auth/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Activity, Scan, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const CONDITIONS = [
    "Diabetes", "Blood Pressure", "Asthma", "Heart Condition", "Thyroid", "None of these"
];

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

export default function OnboardingPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const { user, loading: authLoading } = useUser();
    
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [state, setState] = useState("");
    const [conditions, setConditions] = useState<string[]>([]);
    const [smokes, setSmokes] = useState(false);
    const [exercises, setExercises] = useState(false);

    // Initial load checks
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace(`/${locale}/login`);
        } else if (user) {
            // Already filled out?
            getDoc(doc(db, "users", user.uid, "profile", "data")).then((docSnap) => {
                if (docSnap.exists() && docSnap.data().onboardingDone) {
                    router.replace(`/${locale}/dashboard`);
                }
            });
        }
    }, [user, authLoading, router, locale]);

    const handleNext = () => setStep((s) => Math.min(s + 1, 4));
    const handleBack = () => setStep((s) => Math.max(s - 1, 1));

    const toggleCondition = (cond: string) => {
        if (cond === "None of these") {
            setConditions(["None of these"]);
            return;
        }
        setConditions(prev => {
            const next = prev.filter(c => c !== "None of these");
            if (next.includes(cond)) return next.filter(c => c !== cond);
            return [...next, cond];
        });
    };

    const handleFinish = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid, "profile", "data"), {
                name: name || user.displayName || "User",
                age: age ? parseInt(age) : null,
                gender: gender || null,
                state: state || null,
                healthConditions: conditions,
                smokes,
                exercises,
                onboardingDone: true,
                onboardingCompletedAt: serverTimestamp()
            }, { merge: true });
            
            setStep(4);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong saving your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || (!user && step !== 4)) {
        return (
            <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    // Variants for sliding
    const variants: Variants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
        })
    };

    return (
        <div className="min-h-[100dvh] bg-[#0A0F1A] text-white flex flex-col relative overflow-hidden font-sans">
            {/* Ambient Background Gradient */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Top Bar / Progress */}
            {step < 4 && (
                <div className="h-16 flex items-center px-4 md:px-8 z-10">
                    {step > 1 && (
                        <button onClick={handleBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="flex-1 flex justify-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div 
                                key={s} 
                                className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(0,191,165,0.4)]' : 'bg-white/10'} w-12 sm:w-16`}
                            />
                        ))}
                    </div>
                    {step > 1 && <div className="w-10"></div>} {/* spacer for centering */}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-4 z-10">
                <AnimatePresence mode="wait" custom={1}>
                    {step === 1 && (
                        <motion.div key="step1" custom={1} variants={variants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md space-y-8 text-center">
                            <div className="text-6xl mb-6">👋</div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome to PulseCheck AI!</h1>
                            <p className="text-lg text-white/60">Your personal AI health companion, designed for Bharat.</p>
                            
                            <div className="space-y-4 text-left bg-white/5 border border-white/10 p-6 rounded-2xl mx-auto shadow-xl">
                                {[
                                    "Free forever — no hidden charges",
                                    "Your data is private & secure",
                                    "Works in Hindi & English"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                                        <span className="text-[15px] font-medium text-white/90">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 space-y-4">
                                <Button onClick={handleNext} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40">
                                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <p className="text-xs text-white/40 font-medium tracking-wide uppercase">Takes only 1 minute</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" custom={1} variants={variants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md space-y-8">
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tell us a little about you</h2>
                                <p className="text-white/60">This helps Pulse give better, personalized advice.</p>
                            </div>

                            <div className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                                <div className="space-y-2">
                                    <Label className="text-white/80">What should Pulse call you?</Label>
                                    <Input 
                                        placeholder="Your Name (Optional)" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="h-12 bg-black/40 border-white/10 focus-visible:ring-emerald-500/50" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80">Age</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 25" 
                                        value={age} 
                                        onChange={(e) => setAge(e.target.value)} 
                                        className="h-12 bg-black/40 border-white/10 focus-visible:ring-emerald-500/50" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80 mb-2 block">Gender</Label>
                                    <div className="flex gap-2">
                                        {["Male", "Female", "Other"].map(g => (
                                            <button 
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${gender === g ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80 block">State</Label>
                                    <Select value={state} onValueChange={setState}>
                                        <SelectTrigger className="h-12 bg-black/40 border-white/10">
                                            <SelectValue placeholder="Select your state" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button onClick={handleNext} className="w-full h-12 text-[15px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <button onClick={handleNext} className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
                                    Skip for now
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" custom={1} variants={variants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md space-y-8">
                             <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Any health conditions?</h2>
                                <p className="text-white/60">Optional — helps us personalize warnings.</p>
                            </div>

                            <div className="space-y-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl">
                                {/* Chips */}
                                <div className="flex flex-wrap gap-2">
                                    {CONDITIONS.map(cond => {
                                        const isSelected = conditions.includes(cond);
                                        return (
                                            <button
                                                key={cond}
                                                onClick={() => toggleCondition(cond)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10'}`}
                                            >
                                                {cond}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Toggles */}
                                <div className="space-y-5 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[15px] text-white/90">Do you smoke?</Label>
                                        <Switch checked={smokes} onCheckedChange={setSmokes} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[15px] text-white/90">Do you exercise regularly?</Label>
                                        <Switch checked={exercises} onCheckedChange={setExercises} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button onClick={handleFinish} disabled={isSaving} className="w-full h-12 text-[15px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="ml-2 w-4 h-4" /></>}
                                </Button>
                                <button onClick={handleFinish} disabled={isSaving} className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
                                    Skip for now
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" custom={1} variants={variants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md space-y-8 text-center pt-10">
                            <div className="text-7xl mb-4 animate-bounce">🎉</div>
                            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                                You're all set{name ? `, ${name}` : ''}!
                            </h2>
                            <p className="text-white/60 mb-8">Pulse is ready to help you. Try out these features first:</p>
                            
                            <div className="space-y-3 pb-4">
                                <FeatureButton 
                                    icon={Activity} 
                                    title="Check Symptoms" 
                                    desc="Got a fever or pain? Ask our AI." 
                                    onClick={() => router.push(`/${locale}/symptom-checker`)} 
                                />
                                <FeatureButton 
                                    icon={Scan} 
                                    title="Try Skin Scan" 
                                    desc="Take a photo for a quick review." 
                                    onClick={() => router.push(`/${locale}/skin-scan`)} 
                                />
                                <FeatureButton 
                                    icon={MessageSquare} 
                                    title="Chat with Pulse" 
                                    desc="Talk directly to your Health Agent." 
                                    onClick={() => router.push(`/${locale}/dashboard`)} 
                                />
                            </div>

                            <Button onClick={() => router.push(`/${locale}/dashboard`)} variant="outline" className="w-full h-12 font-bold border-white/20 hover:bg-white/10 bg-transparent text-white">
                                Skip to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function FeatureButton({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group text-left shadow-lg"
        >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center mr-4 group-hover:from-emerald-500/30 group-hover:to-teal-500/20 transition-colors border border-emerald-500/20">
                <Icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-[15px] text-white">{title}</h3>
                <p className="text-xs text-white/50 mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-colors" />
        </button>
    );
}
