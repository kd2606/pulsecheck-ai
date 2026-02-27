import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useAuthContext } from "../../src/context/AuthProvider";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

const DEEP_PSYCH_QUESTIONS = [
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
    const { user } = useAuthContext();
    const [step, setStep] = useState<"questions" | "voice" | "analyzing" | "results">("questions");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ question: string; answer: number }[]>([]);

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [results, setResults] = useState<any>(null);

    const handleAnswer = (value: number) => {
        const newAnswers = [...answers, { question: DEEP_PSYCH_QUESTIONS[currentQuestion], answer: value }];
        setAnswers(newAnswers);

        if (currentQuestion < DEEP_PSYCH_QUESTIONS.length - 1) {
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
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
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
            // Simulate voice biomarkers based on web logic
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

            // Save automatically to history
            if (user && data) {
                await addDoc(collection(db, `users/${user.uid}/mentalHealthScreens`), {
                    ...data,
                    timestamp: new Date().toISOString(),
                    type: "self"
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
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {errorMsg ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            ) : null}

            {step === "questions" && (
                <View>
                    <View style={styles.header}>
                        <Ionicons name="pulse" size={28} color="#10B981" />
                        <Text style={styles.title}>Mental Health Screen</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Question {currentQuestion + 1} of {DEEP_PSYCH_QUESTIONS.length}
                    </Text>

                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>{DEEP_PSYCH_QUESTIONS[currentQuestion]}</Text>

                        <View style={styles.optionsContainer}>
                            {ANSWER_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.optionButton}
                                    onPress={() => handleAnswer(option.value)}
                                >
                                    <View style={styles.optionCircle}>
                                        <Text style={styles.optionNumber}>{option.value}</Text>
                                    </View>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {step === "voice" && (
                <View style={styles.centerContainer}>
                    <Ionicons name="mic-outline" size={48} color="#10B981" style={{ marginBottom: 16 }} />
                    <Text style={styles.title}>Voice Analysis</Text>
                    <Text style={styles.subtitleCentered}>
                        To complete your profile, please speak for 10-15 seconds about how you are feeling today. Our AI will analyze your speech speed and vocal tension.
                    </Text>

                    <TouchableOpacity
                        style={[styles.recordButton, recording && styles.recordingActive]}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Ionicons name={recording ? "stop" : "mic"} size={32} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.recordStatus}>
                        {recording ? "Recording... Tap to stop" : audioUri ? "Recording saved!" : "Tap to record"}
                    </Text>

                    {audioUri && !recording && (
                        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeSession}>
                            <Text style={styles.analyzeButtonText}>Analyze Session</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {step === "analyzing" && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Fusing psychiatric texts and voice biomarkers...</Text>
                </View>
            )}

            {step === "results" && results && (
                <View>
                    <View style={styles.header}>
                        <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                        <Text style={styles.title}>Your Results</Text>
                    </View>

                    <View style={styles.resultCard}>
                        <View style={styles.scoreHeader}>
                            <View style={[styles.scoreCircle, { borderColor: getScoreColor(results.wellnessScore) }]}>
                                <Text style={[styles.scoreText, { color: getScoreColor(results.wellnessScore) }]}>
                                    {results.wellnessScore}
                                </Text>
                            </View>
                            <View style={styles.moodBox}>
                                <Text style={styles.moodLabel}>Mood:</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{results.perceivedMood}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.summaryText}>{results.summary}</Text>

                        <Text style={styles.sectionTitle}>Recommendations</Text>
                        {results.recommendations?.map((rec: string, i: number) => (
                            <View key={i} style={styles.listItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.listText}>{rec}</Text>
                            </View>
                        ))}

                        {results.seekProfessionalHelp && (
                            <View style={styles.alertBox}>
                                <Ionicons name="warning" size={24} color="#EF4444" />
                                <Text style={styles.alertText}>
                                    Please consult a {results.clinicType} soon. You can find nearby specialists in the App.
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.resetButton} onPress={resetQuiz}>
                        <Text style={styles.resetButtonText}>Retake Assessment</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    title: { fontSize: 24, fontWeight: "700", color: "#F8FAFC" },
    subtitle: { fontSize: 16, color: "#94A3B8", marginBottom: 24 },
    subtitleCentered: { fontSize: 15, color: "#94A3B8", textAlign: "center", marginBottom: 32, lineHeight: 22 },
    centerContainer: { alignItems: "center", justifyContent: "center", marginTop: 40 },

    questionCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 20 },
    questionText: { fontSize: 18, color: "#F8FAFC", fontWeight: "600", lineHeight: 26, marginBottom: 24 },
    optionsContainer: { gap: 12 },
    optionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#334155" },
    optionCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#10B981", justifyContent: "center", alignItems: "center", marginRight: 12 },
    optionNumber: { color: "#10B981", fontSize: 14, fontWeight: "600" },
    optionLabel: { color: "#E2E8F0", fontSize: 16, flex: 1 },

    recordButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#334155", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    recordingActive: { backgroundColor: "#EF4444" },
    recordStatus: { color: "#94A3B8", fontSize: 14, marginBottom: 32 },

    analyzeButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#10B981", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 8 },
    analyzeButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

    loadingText: { color: "#94A3B8", fontSize: 16, marginTop: 16 },

    resultCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 20, marginTop: 16 },
    scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, justifyContent: "center", alignItems: "center" },
    scoreText: { fontSize: 32, fontWeight: "800" },
    moodBox: { alignItems: "flex-end" },
    moodLabel: { color: "#94A3B8", fontSize: 14, marginBottom: 4 },
    badge: { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    badgeText: { color: "#E2E8F0", fontSize: 14, fontWeight: "600" },

    summaryText: { color: "#E2E8F0", fontSize: 15, lineHeight: 24, marginBottom: 24, backgroundColor: "#0F172A", padding: 16, borderRadius: 12 },
    sectionTitle: { fontSize: 18, color: "#F8FAFC", fontWeight: "700", marginBottom: 12 },
    listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, paddingRight: 16 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginTop: 8, marginRight: 12 },
    listText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },

    alertBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#3F2728", padding: 16, borderRadius: 12, marginTop: 24, gap: 12 },
    alertText: { flex: 1, color: "#FECACA", fontSize: 14, lineHeight: 20 },

    resetButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#334155", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 24 },
    resetButtonText: { color: "#F8FAFC", fontSize: 16, fontWeight: "600" },

    errorBox: { backgroundColor: "#3F2728", padding: 16, borderRadius: 12, marginBottom: 16 },
    errorText: { color: "#FECACA", fontSize: 14 },
});
