"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { Camera, Upload, Loader2, ExternalLink, MapPin, Save, ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { analyzeSkinScan } from "@/ai/flows/skin-scan";
import { useUser } from "@/firebase/auth/useUser";
import { useScanStore } from "@/firebase/firestore/useScanStore";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";
import { saveHealthRecord } from "@/firebase/healthRecords";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SkinScanPage() {
    const t = useTranslations("scan.skin");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [imageData, setImageData] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    
    // Metadata states
    const [itchingLevel, setItchingLevel] = useState<string>("");
    const [spreadRate, setSpreadRate] = useState<string>("");
    const [recentChanges, setRecentChanges] = useState<string>("");

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

    const isMetadataComplete = itchingLevel && spreadRate && recentChanges;

    const handleAnalyze = async () => {
        if (!imageData || !isMetadataComplete) return;
        setLoading(true);
        setStep(3); // move to results
        try {
            const response = await fetch('/api/skin-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: imageData, itchingLevel, spreadRate, recentChanges })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to analyze skin photo");
            
            setResults(result);
            if (!result) return;

            // Auto-save the health record
            const topPriority = result.triagePriority;
            const severityLevel = topPriority === "High Triage Priority" ? "high" : topPriority === "Elevated Triage Priority" ? "moderate" : "low";
            const verdictStr = topPriority === "High Triage Priority" ? "doctor_today" : topPriority === "Elevated Triage Priority" ? "monitor" : "rest";

            await saveHealthRecord(user?.uid, {
                type: "skin",
                title: "Skin Analysis",
                severity: severityLevel,
                verdict: verdictStr,
                summary: result.simpleExplanation,
                details: {
                    features: result.visualFeatures?.map((f: any) => f.feature) || [],
                    medicines: result.otcMedicines?.map((m: any) => m.name) || [],
                    precautions: result.precautions || []
                }

            });
        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Failed to analyze skin photo.");
            setStep(2); // bring back to step 2 on error
        } finally {
            setLoading(false);
        }
    };

    const handleShareWithDoctor = () => {
        if (!results) return;

        const triagePriority = results.triagePriority || "Unknown";
        const simpleExplanation = results.simpleExplanation || "No explanation available.";
        const precautionsPoints = results.precautions?.length > 0 ? results.precautions.map((t: string) => "• " + t).join("\n   ") : "None";
        const medicineNames = results.otcMedicines?.length > 0 ? results.otcMedicines.map((m: any) => "• " + m.name).join("\n   ") : "None";

        const message = `🏥 *PulseCheck AI — Skin Analysis Report*
   
⚠️ *Triage Priority:* ${triagePriority}
   
💬 *In Simple Words:*
${simpleExplanation}

📋 *User Metadata:*
Itching Level: ${itchingLevel}
Spread Rate: ${spreadRate}
Recent Changes: ${recentChanges}
   
🏠 *Precautions:*
   ${precautionsPoints}
   
💊 *Supportive Items:*
   ${medicineNames}
   
─────────────────
Generated by PulseCheck AI
⚠️ This is an AI wellness triage tool. Please consult a doctor.`;

        const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };

    const renderSeverityBadge = (priority: string) => {
        if (priority === "High Triage Priority") {
            return (
                <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    <CardContent className="p-4 flex items-center gap-3">
                        <div>
                            <p className="font-bold text-base flex items-center gap-2">
                                <span className="text-lg">🔴</span> High Triage Priority
                            </p>
                            <p className="text-sm text-muted-foreground">Emergency or immediate evaluation advised.</p>
                        </div>
                    </CardContent>
                </Card>
            )
        }
        if (priority === "Elevated Triage Priority") {
            return (
                <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                    <CardContent className="p-4 flex items-center gap-3">
                        <div>
                            <p className="font-bold text-base flex items-center gap-2">
                                <span className="text-lg">🟡</span> Elevated Triage Priority
                            </p>
                            <p className="text-sm text-muted-foreground">Monitor closely. Schedule a non-urgent checkup.</p>
                        </div>
                    </CardContent>
                </Card>
            )
        }
        return (
             <Card className="w-full bg-card border-none rounded-xl overflow-hidden shadow-sm relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                <CardContent className="p-4 flex items-center gap-3">
                    <div>
                        <p className="font-bold text-base flex items-center gap-2">
                            <span className="text-lg">🟢</span> Routine Triage Priority
                        </p>
                        <p className="text-sm text-muted-foreground">Maintain routine skin care practices.</p>
                    </div>
                </CardContent>
            </Card>
        )
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </FadeIn>

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-1/3 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 transition-colors ${step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {i}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground text-center">
                            {i === 1 ? "Capture" : i === 2 ? "Details" : "Results"}
                        </span>
                        {i < 3 && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${step > i ? "bg-primary" : "bg-muted"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Image Capture */}
            {step === 1 && (
                <FadeIn delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("capture")}</CardTitle>
                            <CardDescription>Take a clear, well-lit photo of the affected skin area.</CardDescription>
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
                                    <img src={`data:image/jpeg;base64,${imageData}`} alt="Skin area" className="w-full max-h-80 object-cover" />
                                </div>
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={startCamera} disabled={showCamera} className="w-full sm:flex-1">
                                    <Camera className="mr-2 h-4 w-4" /> Camera
                                </Button>
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:flex-1">
                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                            </div>

                            {imageData && (
                                <Button onClick={() => setStep(2)} className="w-full mt-4">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {/* Step 2: Metadata */}
            {step === 2 && (
                <FadeIn delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Dermatological Details</CardTitle>
                            <CardDescription>Tell us a bit more about what you&apos;re experiencing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="space-y-3">
                                <Label>Itching Level</Label>
                                <Select value={itchingLevel} onValueChange={setItchingLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select itching severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No itching</SelectItem>
                                        <SelectItem value="mild">Mild (occasional)</SelectItem>
                                        <SelectItem value="severe">Severe (distracting/constant)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>Spread Rate</Label>
                                <Select value={spreadRate} onValueChange={setSpreadRate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Is it spreading?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_spreading">Not spreading (localized)</SelectItem>
                                        <SelectItem value="slowly">Spreading slowly</SelectItem>
                                        <SelectItem value="rapidly">Spreading rapidly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>Recent Changes</Label>
                                <Select value={recentChanges} onValueChange={setRecentChanges}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Have there been recent changes?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_change">No significant changes</SelectItem>
                                        <SelectItem value="changed_color_size">Changed in color or size</SelectItem>
                                        <SelectItem value="bleeding_oozing">It is bleeding or oozing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleAnalyze} disabled={!isMetadataComplete} className="w-full">
                                    Analyze <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {/* Step 3: Loading & Results */}
            {step === 3 && loading && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Running analytical triage assessment...</p>
                </div>
            )}

            {step === 3 && !loading && results && (
                <FadeIn delay={0.2} className="space-y-6">
                    {/* Urgency Badge */}
                    {renderSeverityBadge(results.triagePriority)}

                    {/* Emergency Fallback */}
                    {results.triagePriority === "High Triage Priority" && (
                        <Card className="border-red-500/20 shadow-sm bg-red-500/5 dark:bg-red-900/10 mb-4 animate-in fade-in slide-in-from-bottom-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <Phone className="h-5 w-5" /> Local Support Services
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm dark:text-red-200 mb-4">Please contact a local healthcare provider immediately.</p>
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" asChild>
                                    <a href="https://www.google.com/maps/search/Dermatologist+or+ER+near+me" target="_blank" rel="noopener noreferrer">
                                        Find Professional Care Near Me
                                    </a>
                                </Button>
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
                            <CardTitle>Triage Report</CardTitle>
                            <div className="flex flex-col md:flex-row items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleShareWithDoctor}
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                                >
                                    💬 Share Report
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
                                    Save
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium">Identified Visual Features</h4>
                                {results.visualFeatures?.map((feature: any, i: number) => {
                                    const urgencyColors: Record<string, string> = {
                                        High: "destructive",
                                        Medium: "default",
                                        Low: "secondary",
                                    };
                                    return (
                                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                            <Badge variant={urgencyColors[feature.urgencyLevel] as "destructive" | "default" | "secondary"}>
                                                {feature.urgencyLevel}
                                            </Badge>
                                            <div>
                                                <p className="font-medium">{feature.feature}</p>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <p className="text-sm border-l-4 border-muted pl-4 py-1 italic">{results.overallAssessment}</p>

                            <div className="space-y-2">
                                <h4 className="font-medium">Precautions</h4>
                                <ul className="space-y-2">
                                    {results.precautions?.map((tip: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded-md">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {results.otcMedicines && results.otcMedicines.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Supportive Items</h4>
                                    {results.otcMedicines.map((med: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/10">
                                            <div>
                                                <p className="font-medium text-sm">{med.name}</p>
                                                <p className="text-xs text-muted-foreground">{med.purpose}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`https://www.google.com/search?q=${encodeURIComponent(med.searchQuery)}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.seekDoctor && (
                                <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                    <a href={`https://www.google.com/maps/search/Dermatologist+or+Clinic+near+me`} target="_blank" rel="noopener noreferrer">
                                        <MapPin className="mr-2 h-4 w-4" /> Find Professional Care
                                    </a>
                                </Button>
                            )}
                            
                            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-700 dark:text-yellow-400 text-center">
                                <span>⚠️</span>
                                <span>{results.disclaimer || "AI tool for wellness triage. Not a replacement for a medical diagnosis."}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <MedicalDisclaimer />
                    
                    <div className="flex justify-center mt-6">
                        <Button variant="ghost" onClick={() => {
                            setStep(1);
                            setImageData(null);
                            setResults(null);
                            setItchingLevel("");
                            setSpreadRate("");
                            setRecentChanges("");
                        }}>
                           Start New Scan
                        </Button>
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
