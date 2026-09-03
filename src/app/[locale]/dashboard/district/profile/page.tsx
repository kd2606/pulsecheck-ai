"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/firebase/auth/useUser";
import { User, Mail, Shield, Building, Key } from "lucide-react";

export default function DistrictProfilePage() {
    const { user } = useUser();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Profile & Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
                            {user?.displayName ? user.displayName.charAt(0) : "CM"}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.displayName || "Dr. C. Mishra"}</h2>
                        <p className="text-sm text-slate-500 font-medium">Chief Medical Officer</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                            <Shield className="w-3 h-3" />
                            Admin Access
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                        <CardDescription>Administrative details and contact info</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Mail className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
                                <p className="text-sm font-semibold text-slate-900">{user?.email || "dmo@diagnoverse.ai"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Jurisdiction</p>
                                <p className="text-sm font-semibold text-slate-900">Raipur District Command Center</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><User className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">UID</p>
                                <p className="text-sm font-semibold text-slate-900 font-mono">{user?.uid || "SYS-ADMIN-001"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Key className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Access Level</p>
                                <p className="text-sm font-semibold text-slate-900">Level 4 (District Wide)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
