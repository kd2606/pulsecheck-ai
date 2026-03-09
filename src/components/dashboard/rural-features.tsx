"use client";

import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2, Pill, Users, MessageCircle, Star, MapPin, Mic, AlertOctagon, ShieldCheck, Plus, Check, Clock, Shield, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirebaseContext } from "@/firebase/provider";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { getMedicinePrices, type MedicinePriceInfo } from "@/ai/flows/medicine";

// 1. WhatsApp Doctor Booking + 3. Ayushman Bharat + 6. Offline Hospitals + 9. Doctor Reviews
export function RuralHospitalList() {
    return (
        <GlassCard className="h-full flex flex-col hoverEffect={false}">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" /> Nearby Hospitals
                </h2>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/20">Showing saved location</Badge>
            </div>

            <div className="space-y-4">
                {/* Hospital 1 */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 dark:bg-black/20 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-sm">Dr. Mehta Psychiatry</h3>
                            <p className="text-xs text-muted-foreground">1.2km • Pulgaon Village</p>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                <Star className="w-3 h-3 fill-muted text-muted" />
                                <span className="text-[10px] ml-1">"Excellent emergency wing"</span>
                            </div>
                        </div>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 text-[10px]">
                            <ShieldCheck className="w-3 h-3" /> ₹5L FREE
                        </Badge>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Button className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white h-9" asChild>
                            <a href="https://wa.me/919876543210?text=HealthSense%20detected%20stress.%20Need%20appointment%20today." target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-4 h-4 mr-2" /> Book WhatsApp
                            </a>
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
                            <a href="tel:09876543210"><Phone className="w-4 h-4 text-blue-500" /></a>
                        </Button>
                    </div>
                </div>

                {/* Hospital 2 */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 dark:bg-black/20 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-sm">Sharma Primary Health</h3>
                            <p className="text-xs text-muted-foreground">4.5km • Kapsi</p>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                {[1, 2, 3].map(i => <Star key={i} className="w-3 h-3 fill-muted text-muted" />)}
                                <span className="text-[10px] ml-1">"Long waiting times"</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Button className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white h-9" asChild>
                            <a href="https://wa.me/919876543210?text=HealthSense%20reports%20mild%20fever.%20When%20can%20I%20visit?" target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-4 h-4 mr-2" /> Book WhatsApp
                            </a>
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
                            <a href="tel:09876543210"><Phone className="w-4 h-4 text-blue-500" /></a>
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

// 5. Medicine Price Comparison
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
            toast.success(`Found price comparison for ${data.searchedName}`);
        } catch (error) {
            toast.error("Failed to fetch medicine prices.");
        } finally {
            setSearchQuery("");
            setLoading(false);
        }
    };

    return (
        <GlassCard className="h-full flex flex-col">
            <h2 className="font-semibold flex items-center gap-2 mb-4 shrink-0">
                <Pill className="w-5 h-5 text-fuchsia-500" /> AI Price Comparison
            </h2>
            <div className="space-y-4 flex-1 flex flex-col">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="e.g. Dolo 650, Amoxicillin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 bg-white/5 dark:bg-black/20 border-white/10 text-xs"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading} className="h-9 w-9 shrink-0 bg-fuchsia-500 hover:bg-fuchsia-600 text-white transition-all">
                        {loading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                </form>

                {medicineData ? (
                    <div className="p-3 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 flex-1 flex flex-col justify-center">
                        <h3 className="font-medium text-sm border-b border-white/10 pb-2 mb-2 uppercase tracking-tight">{medicineData.searchedName}</h3>

                        <div className="flex justify-between items-center mb-3">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-emerald-500">Generic Formula</span>
                                <span className="text-xs text-muted-foreground">{medicineData.genericName}</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="font-bold text-lg">₹{medicineData.genericPrice}</span>
                                <span className="text-[10px] text-muted-foreground">Est. Base Price</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center opacity-70 mb-4 pb-2 border-b border-white/5">
                            <div className="flex flex-col">
                                <span className="text-sm">Branded Specimen</span>
                                <span className="text-xs text-muted-foreground">{medicineData.brandedName}</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="font-bold">₹{medicineData.brandedPrice}</span>
                                <span className="text-[10px] text-muted-foreground">Est. Market Price</span>
                            </div>
                        </div>

                        <a href={medicineData.purchaseLink} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 outline-none border-none text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> View Real Prices on 1MG
                            </Button>
                        </a>
                    </div>
                ) : (
                    <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center p-4">
                        <div className="text-center opacity-50 flex flex-col items-center">
                            <Search className="w-6 h-6 mb-2" />
                            <p className="text-xs">Search for any medicine to instantly get its generic price, active formula, and a real 1MG order link generated by our AI.</p>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

// 7. Family Health Cards
export function FamilyCardsList() {
    const { user } = useFirebaseContext();
    const [familyMembers, setFamilyMembers] = useState<any[]>([
        { name: "Suresh", relation: "Father" },
        { name: "Radha", relation: "Mother" }
    ]);
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
                console.warn("Could not fetch family data (offline or blocked).", error);
            }
        };
        fetchFamily();
    }, [user]);

    const handleAddFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !memberEmail.trim() || !newRelation.trim()) return;

        setLoading(true);
        try {
            // Check if the user exists by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", memberEmail.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("User not found!", { description: "They must register an account on HealthSense AI first before you can add them." });
                setLoading(false);
                return;
            }

            const familyUserData = querySnapshot.docs[0].data();
            const familyUserId = querySnapshot.docs[0].id;
            const newMemberName = familyUserData.displayName || memberEmail.split('@')[0];

            if (familyUserId === user.uid) {
                toast.error("You cannot add yourself.");
                setLoading(false);
                return;
            }

            const familyRef = doc(db, "users", user.uid, "family", "details");
            const newMember = {
                name: newMemberName,
                relation: newRelation,
                email: memberEmail.toLowerCase().trim(),
                uid: familyUserId
            };

            // Set with merge ensures the document is created if it doesn't exist
            await setDoc(familyRef, {
                members: arrayUnion(newMember)
            }, { merge: true });

            setFamilyMembers(prev => [...prev, newMember]);
            toast.success(`${newMemberName} added to Family Protection!`);
            setOpenDialog(false);
            setMemberEmail("");
            setNewRelation("");
        } catch (error: any) {
            toast.error("Failed to add family member: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" /> Family
                </h2>
                <Badge variant="outline">{familyMembers.length + 1} Protected</Badge>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {familyMembers.map((member, i) => (
                    <div key={i} className="shrink-0 w-24 p-3 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i % 2 === 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {getInitials(member.name)}
                        </div>
                        <div className="text-center truncate w-full">
                            <p className="text-xs font-bold truncate">{member.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{member.relation}</p>
                        </div>
                    </div>
                ))}

                {/* Add New via Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <div className="shrink-0 w-24 p-3 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition group">
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:border-white/50 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-muted-foreground group-hover:text-white transition-colors">Add</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden rounded-[24px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 pointer-events-none" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" /> Connect Family Member
                            </DialogTitle>
                            <DialogDescription className="text-white/70">
                                Enter your family member's registered email to link their health data securely.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddFamily} className="space-y-4 mt-2 relative z-10">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Registered Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="patient@example.com"
                                    className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-amber-500"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relation" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Relationship</Label>
                                <Input
                                    id="relation"
                                    placeholder="e.g. Son, Wife, Brother"
                                    className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-amber-500"
                                    value={newRelation}
                                    onChange={(e) => setNewRelation(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20"
                            >
                                {loading ? "Adding..." : "Add to Care List"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </GlassCard>
    );
}

// 8. Government Scheme Finder
export function GovSchemesCard() {
    return (
        <GlassCard className="h-full">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-500" /> Govt Schemes
            </h2>
            <div className="space-y-3">
                <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" className="block p-3 border-l-2 border-emerald-500 bg-emerald-500/5 rounded-r-xl transition-colors hover:bg-emerald-500/10 hover:shadow-md">
                    <h3 className="text-sm font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Ayushman Bharat (PM-JAY)</h3>
                    <p className="text-xs text-muted-foreground mt-1">Free treatment cover up to ₹5 Lakhs per family per year.</p>
                </a>

                <a href="https://abha.abdm.gov.in/" target="_blank" rel="noopener noreferrer" className="block p-3 border-l-2 border-blue-500 bg-blue-500/5 rounded-r-xl transition-colors hover:bg-blue-500/10 hover:shadow-md">
                    <h3 className="text-sm font-bold flex items-center gap-1"><AlertOctagon className="w-4 h-4 text-blue-500" /> ABHA Digital Health ID</h3>
                    <p className="text-xs text-muted-foreground mt-1">Create your secure 14-digit national health identity.</p>
                </a>

                <a href="https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309" target="_blank" rel="noopener noreferrer" className="block p-3 border-l-2 border-fuchsia-500 bg-fuchsia-500/5 rounded-r-xl transition-colors hover:bg-fuchsia-500/10 hover:shadow-md">
                    <h3 className="text-sm font-bold flex items-center gap-1"><Users className="w-4 h-4 text-fuchsia-500" /> Janani Suraksha Yojana</h3>
                    <p className="text-xs text-muted-foreground mt-1">Cash assistance for safe pregnant mothers' institutional delivery.</p>
                </a>
            </div>
        </GlassCard>
    );
}

// 10. Daily Health Reminders
export function DailyRemindersCard() {
    const { user } = useFirebaseContext();
    const [reminders, setReminders] = useState([
        { id: 1, title: "Take TB medicine (DOTS)", subtitle: "Compliance check", checked: true },
        { id: 2, title: "Check Sugar", subtitle: "Before lunch", checked: false }
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");

    // Minimal persistence via state or Firestore. If using state:
    const toggleReminder = (id: number) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, checked: !r.checked } : r));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const newRem = {
            id: Date.now(),
            title: newTitle,
            subtitle: newDesc || "Custom reminder",
            checked: false
        };
        setReminders([...reminders, newRem]);
        toast.success("Reminder added!");
        setOpenDialog(false);
        setNewTitle("");
        setNewDesc("");
    };

    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-500" /> Reminders
                </h2>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10 shrink-0">
                            <Plus className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden rounded-[24px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-orange-500/10 pointer-events-none" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-rose-500" /> Add Reminder
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 mt-2 relative z-10">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Task</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Iron supplement"
                                    className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-rose-500"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Time / Detail (Optional)</Label>
                                <Input
                                    id="desc"
                                    placeholder="e.g. at 8:00 AM after breakfast"
                                    className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-rose-500"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 mt-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20"
                            >
                                Schedule Reminder
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide select-none">
                {reminders.map((r) => (
                    <div
                        key={r.id}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer flex justify-between items-center ${r.checked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 dark:bg-black/20 border-white/10'}`}
                        onClick={() => toggleReminder(r.id)}
                    >
                        <div className="flex flex-col pr-2">
                            <span className={`text-sm font-medium ${r.checked ? 'text-emerald-500 line-through opacity-70' : ''}`}>{r.title}</span>
                            <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                        </div>
                        <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border ${r.checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                            {r.checked && <Check className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

// 2. Emergency 108 Button (Top Bar)
export function EmergencyButton() {
    return (
        <motion.a
            href="tel:108"
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-sm hidden sm:inline">108 EMERGENCY</span>
            <span className="text-sm sm:hidden">108</span>
        </motion.a>
    );
}

// 4. Hindi Voice Assistant Button (Top Bar)
export function VoiceAssistantButton() {
    const [listening, setListening] = useState(false);

    const toggleListening = () => {
        if (!listening) {
            toast.success("Voice Assistant Active", { description: "I am listening! How can I help you today? 🌸" });
        } else {
            toast.info("Voice Assistant paused.");
        }
        setListening(!listening);
    };

    return (
        <motion.button
            onClick={toggleListening}
            className={`flex items-center justify-center h-9 w-9 rounded-full shadow-sm transition-all dark:border-white/10 backdrop-blur-md ${listening ? 'bg-indigo-500 text-white shadow-indigo-500/40 relative' : 'bg-white/10 hover:bg-white/20 dark:bg-black/40 text-muted-foreground hover:text-foreground border border-white/20'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="डॉक्टर ढूंढो (Voice Assistant)"
        >
            {listening && (
                <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                </>
            )}
            <Mic className="h-4 w-4 relative z-10" />
        </motion.button>
    );
}
