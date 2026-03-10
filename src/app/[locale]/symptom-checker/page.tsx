"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { FadeIn } from "@/components/ui/fade-in";
import { Loader2, ExternalLink, MapPin, Stethoscope, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { checkSymptoms } from "@/ai/flows/symptom-checker";
import { toast } from "sonner";
import { useUser } from "@/firebase/auth/useUser";
import { saveHealthRecord } from "@/firebase/healthRecords";

type Results = Awaited<ReturnType<typeof checkSymptoms>>;

const severityConfig: Record<string, { variant: "destructive" | "default" | "secondary"; icon: React.ReactNode; color: string }> = {
    Severe: { variant: "destructive", icon: <AlertTriangle className="h-4 w-4" />, color: "text-destructive" },
    Moderate: { variant: "default", icon: <Info className="h-4 w-4" />, color: "text-primary" },
    Mild: { variant: "secondary", icon: <ShieldCheck className="h-4 w-4" />, color: "text-green-600 dark:text-green-400" },
};

export default function SymptomCheckerPage() {
    const t = useTranslations("symptomChecker");
    const { user } = useUser();

    const [symptoms, setSymptoms] = useState("");
    const quickSymptoms = ["🤒 Fever", "🤕 Headache", "🤢 Stomach Pain", "🤧 Cold & Cough", "😴 Body Ache", "👁️ Eye Problem", "🫀 Chest Pain", "💊 Skin Issue"];
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Results | null>(null);

    const handleCheck = async () => {
        if (!symptoms.trim()) {
            toast.error(t("enterSymptoms"));
            return;
        }
        setLoading(true);
        setResults(null);
        try {
            const result = await checkSymptoms({
                symptoms: symptoms.trim(),
                age: age ? parseInt(age, 10) : undefined,
                gender: gender || undefined,
            });
            setResults(result);
            if (!result) return;

            // Auto-save the health record
            const severityLevel = result.severity === "Severe" ? "high" : result.severity === "Moderate" ? "moderate" : "low";
            const verdictStr = result.severity === "Severe" ? "doctor_today" : result.severity === "Moderate" ? "monitor" : "rest";

            await saveHealthRecord(user?.uid, {
                type: "symptom",
                title: "Symptom Analysis",
                severity: severityLevel,
                verdict: verdictStr,
                summary: result.simpleExplanation,
                details: {
                    condition: result.likelyCondition,
                    medicines: result.otcMedicines.map(m => m.name),
                    homecare: result.precautions
                }
            });
        } catch (error) {
            console.error("Symptom check error:", error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const severityInfo = results ? severityConfig[results.severity] ?? severityConfig.Mild : null;

    return (
        <div className="space-y-6">
            <FadeIn direction="down">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-muted-foreground">{t("description")}</p>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t("enterSymptomsTitle")}</CardTitle>
                        <CardDescription>{t("enterSymptomsDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Symptoms Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">{t("symptomsLabel")}</Label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
                                {quickSymptoms.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSymptoms(prev => prev ? prev + ", " + s : s)}
                                        className="whitespace-nowrap rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-700 dark:text-teal-400 transition-colors hover:bg-teal-500/20"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                id="symptoms"
                                placeholder={t("symptomsPlaceholder")}
                                className="min-h-[120px] resize-none"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                            />
                        </div>

                        {/* Optional Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">{t("age")} <span className="text-muted-foreground text-xs">({t("optional")})</span></Label>
                                <Input
                                    id="age"
                                    type="number"
                                    min={1}
                                    max={120}
                                    placeholder="e.g. 35"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("gender")} <span className="text-muted-foreground text-xs">({t("optional")})</span></Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("selectGender")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">{t("male")}</SelectItem>
                                        <SelectItem value="Female">{t("female")}</SelectItem>
                                        <SelectItem value="Other">{t("other")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={handleCheck}
                            disabled={loading}
                            className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 hover:shadow-[0_0_15px_rgba(0,191,165,0.4)] transition-all duration-300 text-white font-medium"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("analyzing")}
                                </>
                            ) : (
                                <>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    {t("checkButton")}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </FadeIn>

            {results && severityInfo && (
                <FadeIn delay={0.2} className="space-y-4">
                    {/* Verdict Card */}
                    {results.severity === "Severe" && (
                        <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                            <CardContent className="p-4 flex items-center gap-3">
                                <div>
                                    <p className="font-bold text-base flex items-center gap-2">
                                        <span className="text-lg">🔴</span> Visit a doctor TODAY
                                    </p>
                                    <p className="text-sm text-muted-foreground">Your results need immediate attention</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {results.severity === "Moderate" && (
                        <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                            <CardContent className="p-4 flex items-center gap-3">
                                <div>
                                    <p className="font-bold text-base flex items-center gap-2">
                                        <span className="text-lg">🟡</span> Monitor for 24-48 hours
                                    </p>
                                    <p className="text-sm text-muted-foreground">Watch symptoms, visit doctor if worsens</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {results.severity === "Mild" && (
                        <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                            <CardContent className="p-4 flex items-center gap-3">
                                <div>
                                    <p className="font-bold text-base flex items-center gap-2">
                                        <span className="text-lg">🟢</span> Rest at home
                                    </p>
                                    <p className="text-sm text-muted-foreground">Home care should be enough</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-teal-500/20 shadow-sm bg-teal-500/5 dark:bg-teal-900/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                💬 In Simple Words
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm dark:text-teal-100">{results.simpleExplanation}</p>
                        </CardContent>
                    </Card>

                    {/* Main Condition Card */}
                    <Card className="border-2">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{t("likelyCondition")}</p>
                                    <CardTitle className="text-2xl">{results.likelyCondition}</CardTitle>
                                </div>
                                <Badge variant={severityInfo.variant} className="flex items-center gap-1.5 text-sm px-3 py-1">
                                    {severityInfo.icon}
                                    {results.severity}
                                </Badge>
                            </div>
                            <CardDescription className="mt-2 text-sm leading-relaxed">{results.conditionDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Precautions */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    {t("precautions")}
                                </h4>
                                <ul className="space-y-2">
                                    {results.precautions.map((p, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm rounded-lg bg-muted/50 p-2.5">
                                            <span className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* OTC Medicines */}
                            {results.otcMedicines.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold">{t("otcMedicines")}</h4>
                                    <div className="space-y-2">
                                        {results.otcMedicines.map((med, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg border p-3 gap-3">
                                                <div>
                                                    <p className="font-medium text-sm">{med.name}</p>
                                                    <p className="text-xs text-muted-foreground">{med.purpose}</p>
                                                </div>
                                                <Button variant="outline" size="sm" asChild className="shrink-0">
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(med.searchQuery)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="mr-1.5 h-3 w-3" />
                                                        {t("findOnline")}
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Disclaimer text */}
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">{results.disclaimer}</p>

                            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-700 dark:text-yellow-400 text-center">
                                <span>⚠️</span>
                                <span>AI suggestion only — Not a medical diagnosis. Always consult a real doctor for serious concerns.</span>
                            </div>

                            {/* Find Doctor button */}
                            {results.seekDoctor && results.clinicType !== "Not required" && (
                                <Button variant="destructive" className="w-full" asChild>
                                    <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(results.clinicType + " near me")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {t("findDoctor")} ({results.clinicType})
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <MedicalDisclaimer />
                </FadeIn>
            )}
        </div>
    );
}
