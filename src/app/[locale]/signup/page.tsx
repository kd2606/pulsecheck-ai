"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/clientApp";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Set initial state for a new user
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                displayName: name,
                email: email,
                createdAt: new Date().toISOString(),
                isNewUser: true // This will be used to show the "clean dashboard"
            });

            toast.success("Account created successfully!");
            router.push(`/${locale}/dashboard`);
        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[90vh] items-center justify-center p-4 relative overflow-hidden bg-transparent">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <Card className="rounded-[24px] border border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 shadow-lg shadow-indigo-500/20">
                            <Activity className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Join PulseCheck AI</CardTitle>
                        <CardDescription>Create your intelligent rural health profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Ramesh Kumar"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/50 dark:bg-black/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/50 dark:bg-black/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-black/50"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white" disabled={loading}>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                {loading ? "Creating Account..." : "Create Account"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center border-t border-white/10 pt-6 pb-6">
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground pr-1">Already have an account?</span>
                            <Link href={`/${locale}/login`} className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                                Sign in here
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
