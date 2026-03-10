"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { Camera, Upload, Loader2, ExternalLink, MapPin, Save } from "lucide-react";
import { analyzeSkinScan } from "@/ai/flows/skin-scan";
import { useUser } from "@/firebase/auth/useUser";
import { useScanStore } from "@/firebase/firestore/useScanStore";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";
import { saveHealthRecord } from "@/firebase/healthRecords";

export default function SkinScanPage() {
    const t = useTranslations("scan.skin");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [imageData, setImageData] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [results, setResults] = useState<Awaited<ReturnType<typeof analyzeSkinScan>> | null>(null);

    const { user } = useUser();
    const { saveScan } = useScanStore();

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (error) {
            console.error("Camera error:", error);
            toast.error("Could not access camera. Please allow permissions.");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
            setImageData(base64);
            const stream = video.srcObject as MediaStream;
            stream?.getTracks().forEach((track) => track.stop());
            setShowCamera(false);
        }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            setImageData(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!imageData) return;
        setLoading(true);
        try {
            const result = await analyzeSkinScan(imageData);
            setResults(result);
            if (!result) return;

            // Auto-save the health record
            const topConfidence = result.conditions[0]?.confidence || "Low";
            const severityLevel = topConfidence === "High" ? "high" : topConfidence === "Medium" ? "moderate" : "low";
            const verdictStr = topConfidence === "High" ? "doctor_today" : topConfidence === "Medium" ? "monitor" : "rest";

            await saveHealthRecord(user?.uid, {
                type: "skin",
                title: result.conditions[0]?.name || "Skin Analysis",
                severity: severityLevel,
                verdict: verdictStr,
                summary: result.simpleExplanation,
                details: {
                    condition: result.conditions[0]?.name,
                    medicines: result.otcMedicines.map(m => m.name),
                    homecare: result.homeCare
                }
            });
        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setLoading(false);
        }
    };

    const confidenceColors: Record<string, string> = {
        High: "destructive",
        Medium: "default",
        Low: "secondary",
    };

    const handleShareWithDoctor = () => {
        if (!results) return;

        const conditionName = results.conditions[0]?.name || "Unknown Condition";
        const severityLevel = results.conditions[0]?.confidence || "Unknown Severity";
        const simpleExplanation = results.simpleExplanation || "No explanation available.";
        const homeCarePoints = results.homeCare.length > 0 ? results.homeCare.map(t => "• " + t).join("\n   ") : "None";
        const medicineNames = results.otcMedicines.length > 0 ? results.otcMedicines.map(m => "• " + m.name).join("\n   ") : "None";

        const message = `🏥 *PulseCheck AI — Skin Analysis Report*
   
📋 *Condition:* ${conditionName}
⚠️ *Severity:* ${severityLevel}
   
💬 *In Simple Words:*
${simpleExplanation}
   
🏠 *Home Care:*
   ${homeCarePoints}
   
💊 *Suggested OTC Medicines:*
   ${medicineNames}
   
─────────────────
Generated by PulseCheck AI
⚠️ This is AI-generated. Please consult a doctor.`;

        const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </FadeIn>

            <FadeIn delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t("capture")}</CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={`relative overflow-hidden rounded-lg ${showCamera ? "block" : "hidden"}`}>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
                            <Button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                <Camera className="mr-2 h-4 w-4" /> Capture
                            </Button>
                        </div>

                        {imageData && (
                            <div className="overflow-hidden rounded-lg border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`data:image/jpeg;base64,${imageData}`} alt="Skin area" className="w-full max-h-80 object-cover" />
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={startCamera} disabled={showCamera}>
                                <Camera className="mr-2 h-4 w-4" /> {t("capture")}
                            </Button>
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> {t("upload")}
                            </Button>
                        </div>

                        {imageData && (
                            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("analyzing")}</> : "Analyze"}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </FadeIn>

            {results && (
                <FadeIn delay={0.2} className="space-y-4">
                    {/* Verdict Card */}
                    {results.conditions[0]?.confidence === "High" && (
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
                    {results.conditions[0]?.confidence === "Medium" && (
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
                    {results.conditions[0]?.confidence === "Low" && (
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t("results")}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleShareWithDoctor}
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                                >
                                    💬 Share with Doctor
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={saving || !user}
                                    onClick={async () => {
                                        if (!user) return toast.error("Please login to save");
                                        setSaving(true);
                                        try {
                                            await saveScan(user.uid, "self", "skinScans", results);
                                            toast.success("Scan saved successfully");
                                        } catch (e) {
                                            toast.error("Failed to save scan");
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                >
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Report
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {results.conditions.map((condition, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                        <Badge variant={confidenceColors[condition.confidence] as "destructive" | "default" | "secondary"}>
                                            {condition.confidence}
                                        </Badge>
                                        <div>
                                            <p className="font-medium">{condition.name}</p>
                                            <p className="text-sm text-muted-foreground">{condition.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm">{results.overallAssessment}</p>

                            <div className="space-y-2">
                                <h4 className="font-medium">Home Care</h4>
                                <ul className="space-y-1">
                                    {results.homeCare.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {results.otcMedicines.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">OTC Medicines</h4>
                                    {results.otcMedicines.map((med, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-sm text-muted-foreground">{med.purpose}</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`https://www.google.com/search?q=${encodeURIComponent(med.searchQuery)}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-1 h-3 w-3" /> Find Online
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.seekDermatologist && (
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(results.clinicType)}+near+me`} target="_blank" rel="noopener noreferrer">
                                        <MapPin className="mr-2 h-4 w-4" /> Find {results.clinicType} Near Me
                                    </a>
                                </Button>
                            )}

                            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-700 dark:text-yellow-400 text-center">
                                <span>⚠️</span>
                                <span>AI suggestion only — Not a medical diagnosis. Always consult a real doctor for serious concerns.</span>
                            </div>
                        </CardContent>
                    </Card>
                    <MedicalDisclaimer />
                </FadeIn>
            )}
        </div>
    );
}
