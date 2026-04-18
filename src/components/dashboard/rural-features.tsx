"use client";

import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Phone, CheckCircle2, Pill, Users, MessageCircle, Star, 
    MapPin, Mic, AlertOctagon, ShieldCheck, Plus, Check, 
    Clock, Shield, Search, ChevronRight, Activity, Zap, Server
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirebaseContext } from "@/firebase/provider";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { getMedicinePrices, type MedicinePriceInfo } from "@/ai/flows/medicine";
import Link from "next/link";

/**
 * Regional Medical Centers - Redesigned as high-fidelity node monitoring
 */
export function RuralHospitalList() {
    return (
        <GlassCard className="h-full flex flex-col p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h2 className="font-space font-bold text-2xl flex items-center gap-3 text-white">
                        <Activity className="w-6 h-6 text-indigo-400" />
                        Clinical Nodes
                    </h2>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">Regional Infrastructure</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20 uppercase tracking-widest px-3 py-1 font-bold">
                    Sync Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { name: "Mehta Psychiatric Node", dist: "1.2km", sector: "Alpha Pulgaon", rating: 4, cover: "PM-JAY ACTIVE" },
                    { name: "Sharma Primary Intake", dist: "4.5km", sector: "Kapsi Primary", rating: 3, cover: "STANDARD" }
                ].map((hospital, idx) => (
                    <motion.div 
                        key={idx}
                        className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group flex flex-col justify-between"
                        whileHover={{ y: -5 }}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight font-space">
                                        {hospital.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-3 h-3 text-white/20" />
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                                            {hospital.dist} • {hospital.sector}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-white/5 text-[8px] border border-white/10 text-white/40 px-2 py-0.5 rounded-lg">
                                    {hospital.cover}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-1.5 py-2 border-y border-white/5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < hospital.rating ? 'fill-indigo-500 text-indigo-500' : 'fill-white/5 text-white/10'}`} />
                                ))}
                                <span className="text-[9px] ml-2 text-white/20 font-bold uppercase tracking-tighter">Clinical Reliability</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button className="flex-1 bg-white text-black hover:bg-emerald-400 hover:text-black rounded-xl h-12 font-bold text-xs font-space transition-all active:scale-95" asChild>
                                <a href="https://wa.me/919876543210?text=Clinic%20Initialization%20Request." target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="w-4 h-4 mr-2" /> Initialize Chat
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 border-white/10 rounded-xl bg-white/5 hover:bg-white/10" asChild>
                                <a href="tel:09876543210"><Phone className="w-4 h-4 text-indigo-400" /></a>
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}

/**
 * Medicine Price Comparison - Redesigned as Dermal-Cost Review Interface
 */
export function MedicinePriceCard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [medicineData, setMedicineData] = useState<MedicinePriceInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const data = await getMedicinePrices(searchQuery.trim());
            setMedicineData(data);
            toast.success(`Analysis synchronized for ${data.searchedName}`);
        } catch (error) {
            toast.error("Telemetry failure in price engine.");
        } finally {
            setSearchQuery("");
            setLoading(false);
        }
    };

    return (
        <GlassCard className="h-full flex flex-col p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-10 text-left">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <Pill className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="font-space font-bold text-2xl text-white">Cost Review</h2>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">Pharmaceutical Telemetry</p>
                </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <Input
                        placeholder="Search pharmaceutical vector..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 px-6 font-inter focus:ring-indigo-500/20"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading} className="h-14 w-14 shrink-0 bg-white text-black hover:bg-emerald-400 rounded-2xl transition-all shadow-2xl active:scale-90">
                        {loading ? <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                    </Button>
                </form>

                <AnimatePresence mode="wait">
                    {medicineData ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                <div className="border-b border-white/5 pb-6 mb-8 flex justify-between items-start text-left">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-2xl text-white font-space tracking-tight">{medicineData.searchedName}</h3>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold tracking-widest px-2">VERIFIED VECTOR</Badge>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex justify-between items-end p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                        <div className="space-y-1 text-left">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Clinical Generic</span>
                                            <div className="text-lg font-medium text-white/80 font-space">{medicineData.genericName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-emerald-400 tracking-tighter">₹{medicineData.genericPrice}</div>
                                            <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Standard Node Cost</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end p-6 rounded-2xl bg-white/[0.02] border border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                                        <div className="space-y-1 text-left">
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Market Branded</span>
                                            <div className="text-base font-medium text-white/40">{medicineData.brandedName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white/20 tracking-tighter">₹{medicineData.brandedPrice}</div>
                                            <span className="text-[9px] text-white/10 uppercase tracking-widest font-bold">Market Price</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href={medicineData.purchaseLink} target="_blank" className="mt-10 block">
                                    <Button className="w-full h-16 bg-white text-black hover:bg-emerald-400 hover:text-black font-bold rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-all font-space uppercase tracking-widest text-sm">
                                        Initialize Procurement Phase
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                            <Server className="w-12 h-12 text-white/5 mb-6 animate-pulse" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed max-w-[200px]">
                                Awaiting clinical vector for cost synchronization
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}

/**
 * Kinsman Network - Family Hub with Biometric styling
 */
export function FamilyCardsList() {
    const { user } = useFirebaseContext();
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [newRelation, setNewRelation] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchFamily = async () => {
            try {
                const familyRef = doc(db, "users", user.uid, "family", "details");
                const snap = await getDoc(familyRef);
                if (snap.exists() && snap.data().members) {
                    setFamilyMembers(snap.data().members);
                }
            } catch (error) {
                console.warn("Telemetry error in family subsystem.");
            }
        };
        fetchFamily();
    }, [user]);

    const handleAddFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !memberEmail.trim() || !newRelation.trim()) return;

        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", memberEmail.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("Subject not located in registry.");
                setLoading(false);
                return;
            }

            const familyUserData = querySnapshot.docs[0].data();
            const familyUserId = querySnapshot.docs[0].id;
            const newMemberName = familyUserData.displayName || memberEmail.split('@')[0];

            const familyRef = doc(db, "users", user.uid, "family", "details");
            const newMember = {
                name: newMemberName,
                relation: newRelation,
                email: memberEmail.toLowerCase().trim(),
                uid: familyUserId
            };

            await setDoc(familyRef, { members: arrayUnion(newMember) }, { merge: true });
            setFamilyMembers(prev => [...prev, newMember]);
            toast.success(`Identity Linked: ${newMemberName}`);
            setOpenDialog(false);
            setMemberEmail("");
            setNewRelation("");
        } catch (error: any) {
            toast.error("Linkage protocol failure.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="h-full p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-10 text-left">
                <div className="space-y-1">
                    <h2 className="font-space font-bold text-2xl flex items-center gap-4 text-white">
                        <Users className="w-7 h-7 text-indigo-400" />
                        Kinsman Network
                    </h2>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">Associated Biometric Nodes</p>
                </div>
                <Badge variant="outline" className="border-white/10 text-white/40 font-bold text-[10px] tracking-widest px-3 py-1">
                    {familyMembers.length + 1} ACTIVE NODES
                </Badge>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scroll">
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <motion.div 
                            className="shrink-0 w-36 h-48 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all group"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white/20 group-hover:text-emerald-400 transition-colors">
                                <Plus className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white">Expand Node</p>
                        </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[450px] bg-[#0a0a0a] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[3rem] p-10 font-space overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                        <DialogHeader className="text-left mb-8 relative z-10">
                            <DialogTitle className="text-3xl font-bold tracking-tighter">Expand Registry</DialogTitle>
                            <DialogDescription className="text-white/40 font-inter font-light text-base mt-2">
                                Integrate a new clinical identity into your kinsman network for shared telemetry.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddFamily} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Network Identifier (Email)</Label>
                                <Input
                                    placeholder="patient_id@clinical.host"
                                    className="h-16 bg-white/[0.03] border-white/10 rounded-2xl text-white font-inter"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Mapping Protocols</Label>
                                <Input
                                    placeholder="Spouse, Sibling, Ward"
                                    className="h-16 bg-white/[0.03] border-white/10 rounded-2xl text-white font-inter"
                                    value={newRelation}
                                    onChange={(e) => setNewRelation(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full h-16 bg-white text-black hover:bg-emerald-400 font-bold text-lg rounded-2xl transition-all shadow-2xl">
                                {loading ? "Authorizing..." : "Initiate Linkage"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {familyMembers.map((member, i) => (
                    <motion.div 
                        key={i} 
                        className="shrink-0 w-36 h-48 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-5 hover:bg-white/[0.04] transition-all group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-space font-bold text-xl shadow-2xl transition-transform group-hover:rotate-6 ${i % 2 === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                            {member.name?.[0] || 'N'}
                        </div>
                        <div className="text-center px-4 space-y-1">
                            <p className="text-sm font-bold text-white tracking-tight leading-tight truncate">{member.name}</p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.15em]">{member.relation}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}

/**
 * Government Schemes - Redesigned as Sovereign Protocols
 */
export function GovSchemesCard() {
    return (
        <GlassCard className="h-full p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem]">
            <div className="flex items-center gap-4 mb-10 text-left">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="font-space font-bold text-2xl text-white">Protocols</h2>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">Sovereign State Infrastructure</p>
                </div>
            </div>

            <div className="space-y-5">
                {[
                    { title: "Ayushman PM-JAY", desc: "₹5 Lakh family coverage ceiling.", icon: ShieldCheck, color: "emerald", link: "https://pmjay.gov.in/" },
                    { title: "ABHA Health Node", desc: "Universal clinical identification.", icon: Activity, color: "blue", link: "https://abha.abdm.gov.in/" },
                    { title: "Janani Suraksha", desc: "Maternal assistance protocols.", icon: Activity, color: "fuchsia", link: "https://nhm.gov.in/" }
                ].map((scheme, i) => (
                    <motion.a 
                        key={i} 
                        href={scheme.link}
                        target="_blank"
                        className="block p-6 border border-white/5 bg-white/[0.01] rounded-[2rem] transition-all hover:bg-white/[0.03] group overflow-hidden relative"
                        whileHover={{ x: 5 }}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rotate-45 translate-x-12 -translate-y-12" />
                        <div className="flex justify-between items-center relative z-10 text-left">
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white font-space tracking-tight group-hover:text-emerald-400 transition-colors uppercase">
                                    {scheme.title}
                                </h3>
                                <p className="text-[11px] text-white/30 font-medium leading-relaxed font-inter">{scheme.desc}</p>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center text-white/10 group-hover:text-emerald-500 transition-all transform group-hover:translate-x-1">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </GlassCard>
    );
}

/**
 * Daily Reminders - Redesigned as Temporal Tasks Component
 */
export function DailyRemindersCard() {
    const { user } = useFirebaseContext();
    const [reminders, setReminders] = useState([
        { id: 1, title: "Dermal Integrity Review", subtitle: "Scheduled Telemetry", checked: true },
        { id: 2, title: "Clinical Archive Sync", subtitle: "Automated Maintenance", checked: false }
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const toggleReminder = (id: number) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, checked: !r.checked } : r));
    };

    return (
        <GlassCard className="h-full flex flex-col p-8 border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem]">
            <div className="flex justify-between items-start mb-10 shrink-0 text-left">
                <div className="space-y-1">
                    <h2 className="font-space font-bold text-2xl flex items-center gap-4 text-white">
                        <Clock className="w-7 h-7 text-rose-400" />
                        Temporal Tasks
                    </h2>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">Operational Schedule</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpenDialog(true)} className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 group transition-all shrink-0">
                    <Plus className="w-6 h-6 text-white/20 group-hover:text-white transition-colors" />
                </Button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scroll select-none">
                {reminders.map((r) => (
                    <motion.div
                        key={r.id}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden backdrop-blur-sm ${r.checked ? 'bg-emerald-500/[0.05] border-emerald-500/20 opacity-60' : 'bg-white/[0.01] border-white/5 hover:border-white/20'}`}
                        onClick={() => toggleReminder(r.id)}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex flex-col relative z-10 space-y-1 text-left">
                            <span className={`text-base font-bold font-space transition-all uppercase tracking-tight ${r.checked ? 'text-emerald-400 line-through' : 'text-white/80'}`}>{r.title}</span>
                            <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">{r.subtitle}</span>
                        </div>
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border transition-all relative z-10 ${r.checked ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(0,252,64,0.3)]' : 'bg-white/5 border-white/10'}`}>
                            {r.checked && <Check className="w-6 h-6 text-white" />}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-[400px] bg-[#0a0a0a] border border-white/5 shadow-3xl rounded-[3rem] p-10 text-white font-space">
                    <DialogHeader className="text-center mb-8">
                        <DialogTitle className="text-3xl font-bold tracking-tighter">Schedule Vector</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 text-left">
                        <div className="space-y-3">
                            <Label className="text-[10px] text-white/40 uppercase tracking-widest ml-1">Task Definition</Label>
                            <Input
                                placeholder="Execution Parameter..."
                                className="h-16 bg-white/5 border-white/10 rounded-2xl font-inter text-white"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => {
                            if (newTitle.trim()) {
                                setReminders([...reminders, { id: Date.now(), title: newTitle, subtitle: "Manual Protocol", checked: false }]);
                                setNewTitle("");
                                setOpenDialog(false);
                                toast.success("Task Synchronized");
                            }
                        }} className="w-full h-16 bg-white text-black font-bold text-lg rounded-2xl hover:bg-emerald-400 transition-all font-space">
                            Authorize Task
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </GlassCard>
    );
}

/**
 * SOS Primary Emergency Button
 */
export function EmergencyButton() {
    return (
        <motion.a
            href="tel:108"
            className="flex items-center justify-center gap-4 w-full h-16 bg-rose-600 hover:bg-rose-500 text-white rounded-[1.5rem] font-bold shadow-[0_20px_40px_rgba(225,29,72,0.2)] transition-all border border-rose-400/20 font-space tracking-widest text-sm uppercase"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative flex h-3 w-3">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-white"></div>
            </div>
            Emergency Protocol (108)
        </motion.a>
    );
}

/**
 * Telemetry Voice Interface Button
 */
export function VoiceAssistantButton() {
    const [listening, setListening] = useState(false);

    const toggleListening = () => {
        if (!listening) {
            toast.success("Voice Engine Active", { description: "Clinical telemetry is monitoring." });
        }
        setListening(!listening);
    };

    return (
        <div className="relative">
            <AnimatePresence>
                {listening && (
                    <>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0.3 }}
                            exit={{ scale: 1, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 bg-emerald-500 rounded-xl blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 2, opacity: 0.1 }}
                            exit={{ scale: 1, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-0 bg-emerald-500 rounded-xl blur-2xl"
                        />
                    </>
                )}
            </AnimatePresence>
            <motion.button
                onClick={toggleListening}
                className={`flex items-center justify-center h-12 w-12 rounded-xl shadow-2xl transition-all backdrop-blur-3xl border relative z-10 ${listening ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Initialize Voice Command"
            >
                <Mic className={`h-6 w-6 transition-transform duration-500 ${listening ? 'scale-110' : 'scale-100'}`} />
                {listening && (
                    <motion.div 
                        initial={{ height: "4px" }}
                        animate={{ height: ["4px", "12px", "4px"] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-[2px] bg-white rounded-full opacity-40 shadow-sm"
                    />
                )}
            </motion.button>
        </div>
    );
}
