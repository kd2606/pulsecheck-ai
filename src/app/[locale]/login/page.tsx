"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useUser } from "@/firebase/auth/useUser";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { HeartPulse, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[90vh] items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const t = useTranslations("auth");
    const { signInWithGoogle } = useUser();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = params.locale as string;
    const isAutoDemo = searchParams.get("demo") === "1";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const hasTriggeredDemo = useRef(false);

    useEffect(() => {
        if (isAutoDemo && !hasTriggeredDemo.current) {
            hasTriggeredDemo.current = true;
            handleDemoLogin();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoDemo]);


    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "users", userCred.user.uid, "profile", "data"));
            toast.success("Login successful!");
            if (userDoc.exists() && userDoc.data().onboardingDone) {
                router.push(`/${locale}/dashboard`);
            } else {
                router.push(`/${locale}/onboarding`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        const DEMO_EMAIL = "demo@pulsecheckai.in";
        const DEMO_PASSWORD = "demo123456";
        try {
            await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
            toast.success("Demo login successful! 👋");
            router.push(`/${locale}/dashboard`);
        } catch (error: any) {
            // Auto-create demo account if it doesn't exist yet
            if (
                error.code === "auth/user-not-found" ||
                error.code === "auth/invalid-credential" ||
                error.code === "auth/invalid-login-credentials"
            ) {
                try {
                    await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
                    toast.success("Demo account ready! 👋");
                    router.push(`/${locale}/dashboard`);
                } catch (createError: any) {
                    toast.error("Demo setup failed: " + createError.message);
                }
            } else {
                toast.error("Demo login failed: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const userCred = await signInWithGoogle();
            if (userCred && userCred.user) {
                const userDoc = await getDoc(doc(db, "users", userCred.user.uid, "profile", "data"));
                if (userDoc.exists() && userDoc.data().onboardingDone) {
                    router.push(`/${locale}/dashboard`);
                } else {
                    router.push(`/${locale}/onboarding`);
                }
            }
        } catch (error: any) {
            if (error.code === 'auth/configuration-not-found' || error.message?.includes('configuration-not-found')) {
                toast.error("Configuration Error", {
                    description: "Google Sign-In is not enabled. Please enable it in your Firebase Console (Authentication > Sign-in method).",
                    duration: 10000,
                });
            } else {
                toast.error("Google sign in failed: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[90vh] items-center justify-center p-4 relative overflow-hidden bg-transparent">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-indigo-500/5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <Card className="rounded-[24px] border border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/20">
                            <HeartPulse className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                        <CardDescription>Sign in to your PulseCheck AI account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleEmailLogin} className="space-y-4">
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-black/50"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white" disabled={loading}>
                                <Mail className="w-4 h-4 mr-2" />
                                {loading ? "Signing in..." : "Continue with Email"}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground">or sign in with</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleGoogleSignIn}
                            variant="outline"
                            className="w-full bg-white/50 dark:bg-black/50 border-white/20"
                            size="lg"
                            disabled={loading}
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google Connect
                        </Button>

                        <div className="pt-2">
                            <Button
                                onClick={handleDemoLogin}
                                variant="secondary"
                                className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                disabled={loading}
                            >
                                Try Demo Account Fast
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center border-t border-white/10 pt-6 pb-6">
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground pr-1">Don't have an account?</span>
                            <Link href={`/${locale}/signup`} className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
                                Create new account
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
