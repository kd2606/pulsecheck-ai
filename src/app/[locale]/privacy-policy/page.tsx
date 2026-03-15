import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Ban, Lock, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="container max-w-4xl py-10 px-4 space-y-12">
            <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-ull bg-emerald-500/10">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-xl text-muted-foreground">Last updated: March 2026</p>
                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-500">
                    <Lock className="mr-2 h-4 w-4" />
                    Your data is safe with us
                </div>
            </div>

            {/* Section 1 - Simple Summary */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white/5 dark:bg-black/20 border-white/10">
                    <CardHeader>
                        <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                        <CardTitle className="text-lg">Your Data Stays With You</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        We never sell, share, or misuse your personal health data. Ever.
                    </CardContent>
                </Card>

                <Card className="bg-white/5 dark:bg-black/20 border-white/10">
                    <CardHeader>
                        <Ban className="h-8 w-8 text-rose-400 mb-2" />
                        <CardTitle className="text-lg">No Ads. Ever.</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        PulseCheck AI is completely ad-free. Your health data is never used for advertising.
                    </CardContent>
                </Card>

                <Card className="bg-white/5 dark:bg-black/20 border-white/10">
                    <CardHeader>
                        <ShieldCheck className="h-8 w-8 text-emerald-400 mb-2" />
                        <CardTitle className="text-lg">Secure Storage</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        All data is encrypted and stored securely on Google Firebase — the same platform trusted by millions of apps worldwide.
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8 max-w-3xl border-t border-white/10 pt-10">
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-emerald-400">What We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong className="text-white">Profile Data:</strong> Name, age, gender (for personalization).</li>
                        <li><strong className="text-white">Health Inputs:</strong> Symptom checker inputs and scan results (stored securely per user).</li>
                        <li><strong className="text-white">Device Info:</strong> Basic device telemetry for app performance troubleshooting.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-rose-400">What We DON'T Do</h2>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start"><span className="text-emerald-500 mr-2">✅</span> We do NOT sell your data.</li>
                        <li className="flex items-start"><span className="text-emerald-500 mr-2">✅</span> We do NOT show ads.</li>
                        <li className="flex items-start"><span className="text-emerald-500 mr-2">✅</span> We do NOT share with third parties.</li>
                        <li className="flex items-start"><span className="text-emerald-500 mr-2">✅</span> We do NOT store payment info (app is completely free).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-indigo-400">Your Rights</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Delete your account and all associated data at anytime.</li>
                        <li>Export your health records.</li>
                        <li>Update or completely clear your profile information.</li>
                    </ul>
                </section>

                <section className="space-y-4 border-t border-white/10 pt-8">
                    <h2 className="text-2xl font-semibold">Contact Us</h2>
                    <p className="text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        Questions? Contact us at: <a href="mailto:dewangankrrish50@gmail.com" className="text-emerald-500 ml-1 hover:underline">dewangankrrish50@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
