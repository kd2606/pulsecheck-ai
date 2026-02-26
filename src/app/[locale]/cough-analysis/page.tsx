"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { Mic, MicOff, Loader2, ExternalLink, MapPin, AlertTriangle, Save } from "lucide-react";
import { analyzeCough } from "@/ai/flows/cough-analysis";
import { useUser } from "@/firebase/auth/useUser";
import { useScanStore } from "@/firebase/firestore/useScanStore";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";

export default function CoughAnalysisPage() {
    const t = useTranslations("scan.cough");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [results, setResults] = useState<Awaited<ReturnType<typeof analyzeCough>> | null>(null);

    const { user } = useUser();
    const { saveScan } = useScanStore();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (recording) {
            timer = setInterval(() => {
                setSeconds((s) => {
                    if (s >= 5) {
                        stopRecording();
                        return 5;
                    }
                    return s + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [recording]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(",")[1];
                    setAudioData(base64);
                };
                reader.readAsDataURL(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setRecording(true);
            setSeconds(0);
            setResults(null);
        } catch (error) {
            console.error("Microphone error:", error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
    }, []);

    const handleAnalyze = async () => {
        if (!audioData) return;
        setLoading(true);
        try {
            const result = await analyzeCough(audioData);
            setResults(result);
        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setLoading(false);
        }
    };

    const coughTypeColors: Record<string, string> = {
        dry: "bg-yellow-500",
        wet: "bg-blue-500",
        wheezing: "bg-orange-500",
        barking: "bg-red-500",
        unknown: "bg-gray-500",
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
                        <CardTitle>{t("record")}</CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className={`flex h-32 w-32 items-center justify-center rounded-full border-4 transition-colors ${recording ? "border-destructive animate-pulse bg-destructive/10" : "border-muted"
                                    }`}
                            >
                                {recording ? (
                                    <MicOff className="h-12 w-12 text-destructive" />
                                ) : (
                                    <Mic className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>

                            {recording && (
                                <div className="w-full max-w-xs space-y-2">
                                    <Progress value={(seconds / 5) * 100} />
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t("timer", { seconds })}
                                    </p>
                                </div>
                            )}

                            {audioData && !recording && (
                                <Badge variant="secondary">✓ Audio recorded successfully</Badge>
                            )}
                        </div>

                        <div className="flex justify-center gap-2">
                            {!recording ? (
                                <Button onClick={startRecording} size="lg">
                                    <Mic className="mr-2 h-4 w-4" /> {t("record")}
                                </Button>
                            ) : (
                                <Button onClick={stopRecording} variant="destructive" size="lg">
                                    <MicOff className="mr-2 h-4 w-4" /> {t("stop")}
                                </Button>
                            )}
                        </div>

                        {audioData && !recording && (
                            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("analyzing")}</>
                                ) : (
                                    "Analyze Cough"
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </FadeIn>

            {results && (
                <FadeIn delay={0.2} className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t("results")}</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={saving || !user}
                                onClick={async () => {
                                    if (!user) return toast.error("Please login to save");
                                    setSaving(true);
                                    try {
                                        await saveScan(user.uid, "self", "coughAnalyses", results);
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
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-4 w-4 rounded-full ${coughTypeColors[results.coughType]}`} />
                                <span className="text-lg font-semibold capitalize">{results.coughType} Cough</span>
                                <Badge variant="outline">{results.confidence} Confidence</Badge>
                            </div>

                            <p className="text-sm">{results.description}</p>

                            {results.seekMedicalAttention && (
                                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                                    <p className="text-sm">{results.medicalNote}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="font-medium">Possible Causes</h4>
                                <ul className="space-y-1">
                                    {results.possibleCauses.map((cause, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                                            {cause}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Home Remedies</h4>
                                <ul className="space-y-1">
                                    {results.homeRemedies.map((remedy, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                            {remedy}
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
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`https://www.google.com/search?q=${encodeURIComponent(med.searchQuery)}`} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-1 h-3 w-3" /> Find Online
                                                    </a>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noopener noreferrer">
                                                        <MapPin className="mr-1 h-3 w-3" /> Find Clinic
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <MedicalDisclaimer />
                </FadeIn>
            )}
        </div>
    );
}
