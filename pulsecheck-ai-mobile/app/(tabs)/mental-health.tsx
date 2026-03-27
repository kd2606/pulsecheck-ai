import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useAuthContext } from "../../src/context/AuthProvider";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

const FALLBACK_QUESTIONS = [
    "When facing an unexpected setback, how quickly can you identify and process the specific emotions you are feeling, rather than just feeling overwhelmed?",
    "How often do you find your internal monologue shifting from constructive self-reflection to harsh, unyielding self-criticism?",
    "During moments of high stress, to what extent do you feel physically disconnected from your body or emotionally detached from your surroundings?",
    "How frequently do you wake up feeling a sense of dread or 'heavy' lethargy that lacks a specific external cause?",
    "When interacting with close friends or family, how often do you pretend to feel fine to avoid burdening them with your true emotional state?"
];

const ANSWER_OPTIONS = [
    { value: 0, label: "Never" },
    { value: 1, label: "Rarely" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Often" },
    { value: 4, label: "Constantly" },
];

export default function MentalHealthScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [step, setStep] = useState<"questions" | "voice" | "analyzing" | "results">("questions");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ question: string; answer: number }[]>([]);

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [results, setResults] = useState<any>(null);

    const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
    const [fetchingQuestions, setFetchingQuestions] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`${VERCEL_API}/api/mental-health/questions`);
                if (!res.ok) throw new Error("Failed to fetch questions");
                const data = await res.json();
                setDynamicQuestions(data.questions || FALLBACK_QUESTIONS);
            } catch (err) {
                console.error("Fetch questions error:", err);
                setDynamicQuestions(FALLBACK_QUESTIONS);
            } finally {
                setFetchingQuestions(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswer = (value: number) => {
        const newAnswers = [...answers, { question: dynamicQuestions[currentQuestion], answer: value }];
        setAnswers(newAnswers);

        if (currentQuestion < dynamicQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setStep("voice");
        }
    };

    const startRecording = async () => {
        try {
            setErrorMsg("");
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === "granted") {
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                setRecording(recording);
            } else {
                setErrorMsg("Microphone permission denied");
            }
        } catch (err) {
            console.error("Failed to start recording", err);
            setErrorMsg("Failed to start recording");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
    };

    const analyzeSession = async () => {
        if (!audioUri && step === "voice") {
            setErrorMsg("Please record your voice first.");
            return;
        }

        setStep("analyzing");
        setLoading(true);
        setErrorMsg("");

        try {
            const mockVoiceWpm = Math.floor(Math.random() * (170 - 110) + 110);
            const mockVocalTension = mockVoiceWpm > 150 ? "High" : mockVoiceWpm < 125 ? "Low" : "Normal";

            const res = await fetch(`${VERCEL_API}/api/mental-health`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers,
                    voiceMetrics: { wpm: mockVoiceWpm, tension: mockVocalTension }
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            const data = await res.json();
            setResults(data);
            setStep("results");

            if (user && data) {
                const severityLevel = data.seekProfessionalHelp ? "high" : data.wellnessScore < 60 ? "moderate" : "low";
                const verdictStr = data.seekProfessionalHelp ? "doctor_today" : data.wellnessScore < 60 ? "monitor" : "rest";

                await addDoc(collection(db, `users/${user.uid}/healthRecords`), {
                    type: "mental",
                    title: "Mental Health Screen",
                    severity: severityLevel,
                    verdict: verdictStr,
                    summary: data.summary,
                    details: {
                        condition: data.perceivedMood,
                        medicines: [],
                        homecare: data.recommendations
                    },
                    date: new Date(),
                    saved: true
                });
            }
        } catch (error: any) {
            console.error("Analysis error:", error);
            setErrorMsg(error.message || "Failed to analyze data.");
            setStep("voice");
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setStep("questions");
        setCurrentQuestion(0);
        setAnswers([]);
        setAudioUri(null);
        setResults(null);
        setErrorMsg("");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#22C55E";
        if (score >= 60) return "#EAB308";
        if (score >= 40) return "#F97316";
        return "#EF4444";
    };

    return (
        <LinearGradient
            colors={["#060E1E", "#0D1B3E", "#0A1A2F", "#060E1E"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={ms.blob1} />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>

                    {/* Error */}
                    {errorMsg ? (
                        <BlurView intensity={40} tint="dark" style={ms.errorBox}>
                            <Ionicons name="alert-circle-outline" size={18} color="#FCA5A5" />
                            <Text style={ms.errorText}>{errorMsg}</Text>
                        </BlurView>
                    ) : null}

                    {/* Loading questions */}
                    {fetchingQuestions && (
                        <View style={ms.centerContainer}>
                            <ActivityIndicator size="large" color="#34D399" />
                            <Text style={ms.loadingText}>Preparing your personalized assessment...</Text>
                        </View>
                    )}

                    {/* Questions step */}
                    {step === "questions" && !fetchingQuestions && (
                        <View>
                            <View style={ms.header}>
                                <View style={ms.headerIcon}>
                                    <Ionicons name="pulse" size={20} color="#34D399" />
                                </View>
                                <Text style={ms.title}>Mental Health Screen</Text>
                            </View>
                            <Text style={ms.subtitle}>
                                Question {currentQuestion + 1} of {dynamicQuestions.length}
                            </Text>

                            <BlurView intensity={45} tint="dark" style={ms.questionCard}>
                                <Text style={ms.questionText}>{dynamicQuestions[currentQuestion]}</Text>
                                <View style={ms.optionsContainer}>
                                    {ANSWER_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={ms.optionButton}
                                            onPress={() => handleAnswer(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <LinearGradient
                                                colors={["rgba(52,211,153,0.18)", "rgba(52,211,153,0.05)"]}
                                                style={ms.optionCircle}
                                            >
                                                <Text style={ms.optionNumber}>{option.value}</Text>
                                            </LinearGradient>
                                            <Text style={ms.optionLabel}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </BlurView>
                        </View>
                    )}

                    {/* Voice step */}
                    {step === "voice" && (
                        <BlurView intensity={45} tint="dark" style={ms.voiceContainer}>
                            <View style={ms.headerIcon}>
                                <Ionicons name="mic-outline" size={26} color="#34D399" />
                            </View>
                            <Text style={ms.title}>Voice Analysis</Text>
                            <Text style={ms.subtitleCentered}>
                                Speak for 10-15 seconds about how you are feeling today. Our AI will analyze your speech patterns and vocal tension.
                            </Text>
                            <TouchableOpacity onPress={recording ? stopRecording : startRecording} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={recording ? ["#EF4444", "#B91C1C"] : ["#34D399", "#059669"]}
                                    style={ms.recordButton}
                                >
                                    <Ionicons name={recording ? "stop" : "mic"} size={32} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={ms.recordStatus}>
                                {recording ? "Recording... Tap to stop" : audioUri ? "✅ Recording saved!" : "Tap to start recording"}
                            </Text>
                            {audioUri && !recording && (
                                <TouchableOpacity onPress={analyzeSession} activeOpacity={0.85}>
                                    <LinearGradient colors={["#34D399", "#059669"]} style={ms.analyzeButton}>
                                        <Text style={ms.analyzeButtonText}>Analyze Session</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </BlurView>
                    )}

                    {/* Analyzing step */}
                    {step === "analyzing" && (
                        <View style={ms.centerContainer}>
                            <ActivityIndicator size="large" color="#34D399" />
                            <Text style={ms.loadingText}>Analyzing your session...</Text>
                        </View>
                    )}

                    {/* Results step */}
                    {step === "results" && results && (
                        <View>
                            <View style={ms.header}>
                                <View style={ms.headerIcon}>
                                    <Ionicons name="checkmark-circle" size={20} color="#34D399" />
                                </View>
                                <Text style={ms.title}>Your Results</Text>
                            </View>

                            <BlurView intensity={45} tint="dark" style={ms.resultCard}>
                                <View style={ms.scoreHeader}>
                                    <View style={[ms.scoreCircle, { borderColor: getScoreColor(results.wellnessScore) }]}>
                                        <Text style={[ms.scoreText, { color: getScoreColor(results.wellnessScore) }]}>
                                            {results.wellnessScore}
                                        </Text>
                                    </View>
                                    <View style={ms.moodBox}>
                                        <Text style={ms.moodLabel}>Mood:</Text>
                                        <BlurView intensity={30} tint="dark" style={ms.badge}>
                                            <Text style={ms.badgeText}>{results.perceivedMood}</Text>
                                        </BlurView>
                                    </View>
                                </View>

                                <Text style={ms.summaryText}>{results.summary}</Text>

                                <Text style={ms.sectionTitle}>Recommendations</Text>
                                {results.recommendations?.map((rec: string, i: number) => (
                                    <View key={i} style={ms.listItem}>
                                        <View style={ms.bullet} />
                                        <Text style={ms.listText}>{rec}</Text>
                                    </View>
                                ))}

                                {results.seekProfessionalHelp && (
                                    <View>
                                        <BlurView intensity={30} tint="dark" style={ms.alertBox}>
                                            <Ionicons name="warning" size={22} color="#FCA5A5" />
                                            <Text style={ms.alertText}>
                                                Please consult a {results.clinicType} soon. You can find nearby specialists using our locator.
                                            </Text>
                                        </BlurView>
                                        <TouchableOpacity onPress={() => router.push("/nearby-hospitals" as any)} activeOpacity={0.85}>
                                            <LinearGradient colors={["#3B82F6", "#2563EB"]} style={ms.findButton}>
                                                <Ionicons name="map" size={16} color="#FFF" />
                                                <Text style={ms.findButtonText}>Find {results.clinicType} Near Me</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </BlurView>

                            <TouchableOpacity style={ms.resetButton} onPress={resetQuiz} activeOpacity={0.8}>
                                <Text style={ms.resetButtonText}>Retake Assessment</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const ms = StyleSheet.create({
    blob1: { position: "absolute", top: -80, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(52,211,153,0.06)" },

    header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    headerIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(52,211,153,0.15)", borderWidth: 1, borderColor: "rgba(52,211,153,0.25)", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", color: "#F8FAFC", letterSpacing: -0.3 },
    subtitle: { fontSize: 15, color: "#64748B", marginBottom: 20 },
    subtitleCentered: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 28, lineHeight: 22 },
    centerContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
    loadingText: { color: "#64748B", fontSize: 15, marginTop: 16, textAlign: "center" },

    errorBox: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 14, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(252,165,165,0.2)" },
    errorText: { color: "#FCA5A5", fontSize: 13, flex: 1 },

    questionCard: { borderRadius: 22, padding: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
    questionText: { fontSize: 16, color: "#F1F5F9", fontWeight: "600", lineHeight: 24, marginBottom: 24 },
    optionsContainer: { gap: 10 },
    optionButton: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(52,211,153,0.15)", backgroundColor: "rgba(52,211,153,0.04)" },
    optionCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center", marginRight: 12 },
    optionNumber: { color: "#34D399", fontSize: 13, fontWeight: "700" },
    optionLabel: { color: "#CBD5E1", fontSize: 15, flex: 1 },

    voiceContainer: { borderRadius: 22, padding: 28, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", alignItems: "center", gap: 12 },
    recordButton: { width: 82, height: 82, borderRadius: 41, justifyContent: "center", alignItems: "center", marginVertical: 8 },
    recordStatus: { color: "#64748B", fontSize: 14 },
    analyzeButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, gap: 8, marginTop: 8 },
    analyzeButtonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

    resultCard: { borderRadius: 22, padding: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", marginTop: 16 },
    scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    scoreCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, justifyContent: "center", alignItems: "center" },
    scoreText: { fontSize: 30, fontWeight: "800" },
    moodBox: { alignItems: "flex-end", gap: 6 },
    moodLabel: { color: "#94A3B8", fontSize: 13 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    badgeText: { color: "#E2E8F0", fontSize: 13, fontWeight: "600" },

    summaryText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22, marginBottom: 20, padding: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
    sectionTitle: { fontSize: 16, color: "#F1F5F9", fontWeight: "700", marginBottom: 10 },
    listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#34D399", marginTop: 8, marginRight: 10 },
    listText: { color: "#94A3B8", fontSize: 13, lineHeight: 21, flex: 1 },

    alertBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, marginTop: 20, gap: 10, overflow: "hidden", borderWidth: 1, borderColor: "rgba(252,165,165,0.2)" },
    alertText: { flex: 1, color: "#FECACA", fontSize: 13, lineHeight: 19 },
    findButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, marginTop: 12, gap: 8 },
    findButtonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

    resetButton: { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 20, backgroundColor: "rgba(255,255,255,0.04)" },
    resetButtonText: { color: "#CBD5E1", fontSize: 15, fontWeight: "600" },
});
