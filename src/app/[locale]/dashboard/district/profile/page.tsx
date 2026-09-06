"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useUser } from "@/firebase/auth/useUser";
import { User, Mail, Shield, Building, Key, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db } from "@/firebase/clientApp";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function DistrictProfilePage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        jurisdiction: "Raipur District Command Center",
        uid: "",
        accessLevel: "Level 4 (District Wide)"
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, `users/${user.uid}`);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setFormData({
                        name: data.name || user.displayName || "Dr. C. Mishra",
                        email: data.email || user.email || "dmo@diagnoverse.ai",
                        jurisdiction: data.jurisdiction || "Raipur District Command Center",
                        uid: user.uid,
                        accessLevel: data.accessLevel || "Level 4 (District Wide)"
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        name: user.displayName || "Dr. C. Mishra",
                        email: user.email || "dmo@diagnoverse.ai",
                        uid: user.uid
                    }));
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const docRef = doc(db, `users/${user.uid}`);
            await updateDoc(docRef, {
                name: formData.name,
                email: formData.email,
                jurisdiction: formData.jurisdiction
            });
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Profile & Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "CM"}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{formData.name || "Dr. C. Mishra"}</h2>
                        <p className="text-sm text-slate-500 font-medium">Chief Medical Officer</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                            <Shield className="w-3 h-3" />
                            Admin Access
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                            <CardDescription>Administrative details and contact info</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 flex items-center text-xs uppercase tracking-wider font-semibold">
                                            <User className="w-4 h-4 mr-2" /> Full Name
                                        </Label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="font-medium" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 flex items-center text-xs uppercase tracking-wider font-semibold">
                                            <Mail className="w-4 h-4 mr-2" /> Email Address
                                        </Label>
                                        <Input 
                                            value={formData.email} 
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                            className="font-medium" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 flex items-center text-xs uppercase tracking-wider font-semibold">
                                            <Building className="w-4 h-4 mr-2" /> Jurisdiction
                                        </Label>
                                        <Input 
                                            value={formData.jurisdiction} 
                                            onChange={e => setFormData({ ...formData, jurisdiction: e.target.value })}
                                            className="font-medium" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 flex items-center text-xs uppercase tracking-wider font-semibold">
                                                <Key className="w-4 h-4 mr-2" /> UID
                                            </Label>
                                            <Input 
                                                value={formData.uid || "SYS-ADMIN-001"} 
                                                className="font-mono bg-slate-50" 
                                                disabled
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 flex items-center text-xs uppercase tracking-wider font-semibold">
                                                <Shield className="w-4 h-4 mr-2" /> Access Level
                                            </Label>
                                            <Input 
                                                value={formData.accessLevel} 
                                                className="font-medium bg-slate-50" 
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-slate-100 bg-slate-50 p-6 flex justify-end gap-3 rounded-b-lg">
                            <Button type="button" variant="outline" className="text-slate-600">Cancel</Button>
                            <Button type="submit" disabled={saving || loading} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} 
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
