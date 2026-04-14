"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { Camera, Upload, Loader2, CheckCircle, XCircle, ExternalLink, Activity, ShieldCheck, Moon, Laptop, HeartPulse } from "lucide-react";
import { analyzeVisionScan } from "@/ai/flows/vision-scan";
import { useUser } from "@/firebase/auth/useUser";
import { useScanStore } from "@/firebase/firestore/useScanStore";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";
import { saveHealthRecord } from "@/firebase/healthRecords";

type Results = Awaited<ReturnType<typeof analyzeVisionScan>>;

export default function VisionScanPage() {
    const t = useTranslations("scan.vision");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useUser();
    const { saveScan } = useScanStore();

    const [step, setStep] = useState<"capture" | "metadata" | "analyzing" | "results">("capture");

    // Capture State
    const [imageData, setImageData] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);

    // Metadata State
    const [screenTime, setScreenTime] = useState("4-6 hours");
    const [sleepHours, setSleepHours] = useState("6-8 hours");
    const [stressLevel, setStressLevel] = useState("Moderate");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Results | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (error) {
            console.error("Camera error:", error);
            toast.error("Could not access camera. Please allow permissions.");
        }
    }, []);

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

    const handleNextStep = () => {
        if (!imageData) {
            toast.error("Please capture or upload a photo before proceeding.");
            return;
        }
        setStep("metadata");
    };

    const handleAnalyze = async () => {
        if (!imageData) return;
        setStep("analyzing");
        setLoading(true);
        try {
            const result = await analyzeVisionScan({
                imageBase64: imageData,
                screenTime,
                sleepHours,
                stressLevel
            });
            setResults(result);
            if (!result) return;

            // Auto-save the health record
            const isHighPriority = result.triagePriority === "High Fatigue Priority";
            const severityLevel = isHighPriority ? "high" : result.triagePriority === "Elevated Strain Profile" ? "moderate" : "low";
            const verdictStr = isHighPriority ? "doctor_today" : severityLevel === "moderate" ? "monitor" : "rest";

            await saveHealthRecord(user?.uid, {
                type: "vision",
                title: "Ocular & Facial Strain Analysis",
                severity: severityLevel,
                verdict: verdictStr,
                summary: result.simpleExplanation,
                details: {
                    condition: `Fatigue Index: ${result.fatigueIndex}%`,
                    medicines: result.otcMedicines.map(m => m.name),
                    homecare: result.precautions
                }
            });

            if (user) {
                await saveScan(user.uid, "self", "visionScans", result);
            }

            setStep("results");
        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Analysis failed. Please try again.");
            setStep("metadata");
        } finally {
            setLoading(false);
        }
    };

    const resetWizard = () => {
        setImageData(null);
        setScreenTime("4-6 hours");
        setSleepHours("6-8 hours");
        setStressLevel("Moderate");
        setResults(null);
        setStep("capture");
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Facial Strain Scan</h1>
                        <p className="text-muted-foreground">Analyze visual indicators of fatigue and ocular strain.</p>
                    </div>
                </div>
            </FadeIn>

            {step === "capture" && (
                <FadeIn delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Capture Photo</CardTitle>
                            <CardDescription>Take a clear photo of your face in good lighting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`relative overflow-hidden rounded-lg ${showCamera ? "block" : "hidden"}`}>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
                                <Button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <Camera className="mr-2 h-4 w-4" /> Capture Photo
                                </Button>
                            </div>

                            {imageData && (
                                <div className="overflow-hidden rounded-lg border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/jpeg;base64,${imageData}`}
                                        alt="Captured face"
                                        className="w-full max-h-[300px] object-cover"
                                    />
                                </div>
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                            />

                            <div className="flex gap-2">
                                {imageData ? (
                                    <>
                                        <Button variant="outline" onClick={() => setImageData(null)} className="flex-1">
                                            Retake Photo
                                        </Button>
                                        <Button onClick={handleNextStep} className="flex-1 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white">
                                            Continue to Details
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={startCamera} disabled={showCamera} className="flex-1">
                                            <Camera className="mr-2 h-4 w-4" /> Use Camera
                                        </Button>
                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {step === "metadata" && (
                <FadeIn delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Lifestyle Details</CardTitle>
                            <CardDescription>We use this metadata to contextualize your visual strain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Laptop className="h-4 w-4 text-primary" /> Daily Screen Time</Label>
                                <Select value={screenTime} onValueChange={setScreenTime}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select screen time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="< 2 hours">&lt; 2 hours</SelectItem>
                                        <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                                        <SelectItem value="4-6 hours">4-6 hours</SelectItem>
                                        <SelectItem value="6-8 hours">6-8 hours</SelectItem>
                                        <SelectItem value="> 8 hours">&gt; 8 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Moon className="h-4 w-4 text-purple-500" /> Sleep (Last Night)</Label>
                                <Select value={sleepHours} onValueChange={setSleepHours}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sleep hours" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="< 4 hours">&lt; 4 hours</SelectItem>
                                        <SelectItem value="4-6 hours">4-6 hours</SelectItem>
                                        <SelectItem value="6-8 hours">6-8 hours</SelectItem>
                                        <SelectItem value="> 8 hours">&gt; 8 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-red-500" /> Current Stress Level</Label>
                                <Select value={stressLevel} onValueChange={setStressLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stress level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStep("capture")}>Back</Button>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="flex-1 bg-[#00BFA5] hover:bg-[#00BFA5]/90 hover:shadow-[0_0_15px_rgba(0,191,165,0.4)] transition-all duration-300 text-white font-medium"
                                >
                                    Analyze Strain Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {step === "analyzing" && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 p-12">
                        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                        <p className="text-muted-foreground">Synthesizing visual biometrics and lifestyle data...</p>
                    </CardContent>
                </Card>
            )}

            {step === "results" && results && (
                <FadeIn delay={0.2} className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Strain & Recovery Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {/* Triage Priority */}
                            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/20 border rounded-xl">
                                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Triage Priority</div>
                                <Badge variant={results.triagePriority === "High Fatigue Priority" ? "destructive" : results.triagePriority === "Elevated Strain Profile" ? "default" : "secondary"} className="text-base py-1">
                                    {results.triagePriority === "High Fatigue Priority" ? "🔴" : results.triagePriority === "Elevated Strain Profile" ? "🟡" : "🟢"} {results.triagePriority}
                                </Badge>
                                <div className="mt-2 text-sm">
                                    Fatigue Index: <span className="font-bold text-lg">{results.fatigueIndex}/100</span>
                                </div>
                            </div>

                            <Card className="border-teal-500/20 shadow-sm bg-teal-500/5 dark:bg-teal-900/10">
                                <CardContent className="p-4">
                                    <p className="text-sm dark:text-teal-100">{results.overallAssessment}</p>
                                    <p className="text-sm mt-3 dark:text-teal-100 font-medium">{results.simpleExplanation}</p>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <h4 className="font-medium">Visual Indicators Checked</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {results.indicators.map((indicator, i) => (
                                        <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 ${indicator.detected ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                                            {indicator.detected ? (
                                                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                            ) : (
                                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">{indicator.sign}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{indicator.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    Recovery Protocols
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

                            {/* OTC Medicines / Wellness Items */}
                            {results.otcMedicines.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold p-1">Wellness Items</h4>
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
                                                        Find
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-700 dark:text-yellow-400 text-center">
                                <span>⚠️</span>
                                <span>AI estimation only — Not a medical diagnosis.</span>
                            </div>

                            <Button onClick={resetWizard} variant="outline" className="w-full">
                                Retake Assessment
                            </Button>
                        </CardContent>
                    </Card>
                    <MedicalDisclaimer />
                </FadeIn>
            )}
        </div>
    );
}
