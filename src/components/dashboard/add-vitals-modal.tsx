"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { useFirebaseContext } from "@/firebase/provider";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function AddVitalsModal() {
    const { user } = useFirebaseContext();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [heartRate, setHeartRate] = useState("72");
    const [stressLevel, setStressLevel] = useState("30"); // 1-100
    const [holisticScore, setHolisticScore] = useState("78"); // 1-100

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const vitalsRef = doc(db, "users", user.uid, "vitals", "latest");
            await setDoc(vitalsRef, {
                heartRate: parseInt(heartRate),
                stressLevel: parseInt(stressLevel),
                holisticScore: parseInt(holisticScore),
                updatedAt: new Date().toISOString()
            });

            toast.success("Vitals Updated Successfully!", {
                description: "Your dashboard will now reflect your live data."
            });
            setOpen(false);
        } catch (error: any) {
            toast.error("Failed to update vitals: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 dark:bg-black/40 backdrop-blur-md rounded-full shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4 mr-2" /> Live Manual Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden rounded-[24px]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 pointer-events-none" />
                <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-indigo-500 bg-clip-text text-transparent">Update Health Vitals</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4 relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="holistic" className="text-muted-foreground font-semibold">Holistic Score (0-100)</Label>
                        <Input
                            id="holistic"
                            type="number"
                            min="0"
                            max="100"
                            className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-emerald-500 text-lg"
                            value={holisticScore}
                            onChange={(e) => setHolisticScore(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heartRate" className="text-muted-foreground font-semibold">Heart Rate (bpm)</Label>
                        <Input
                            id="heartRate"
                            type="number"
                            min="30"
                            max="200"
                            className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-emerald-500 text-lg"
                            value={heartRate}
                            onChange={(e) => setHeartRate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stressLevel" className="text-muted-foreground font-semibold">Stress Level (%)</Label>
                        <Input
                            id="stressLevel"
                            type="number"
                            min="0"
                            max="100"
                            className="bg-white/50 dark:bg-black/50 border-white/20 focus-visible:ring-emerald-500 text-lg"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">0 = Very Calm, 100 = High Stress</p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/20"
                    >
                        {loading ? "Updating Vitals..." : "Save Live Data"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
