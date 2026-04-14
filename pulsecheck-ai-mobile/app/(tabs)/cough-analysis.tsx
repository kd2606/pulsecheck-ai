import React, { useState, useRef } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Linking,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

const VERCEL_API = "https://pulsecheckai-peach.vercel.app";

type Medicine = { name: string; purpose: string; searchQuery: string };
type Result = {
    coughType: string;
    confidence: string;
    description: string;
    possibleCauses: string[];
    homeRemedies: string[];
    otcMedicines: Medicine[];
    seekMedicalAttention: boolean;
    medicalNote: string;
};

const coughColors: Record<string, string> = {
    dry: "#3B82F6", wet: "#22C55E", wheezing: "#F59E0B",
    barking: "#EF4444", unknown: "#8B5CF6",
};

export default function CoughAnalysisScreen() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(false);
    const [recordingDone, setRecordingDone] = useState(false);
    const recordingRef = useRef<Audio.Recording | null>(null);

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission needed", "Microphone permission is required.");
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setRecording(recording);
            setIsRecording(true);
            setRecordingDone(false);
            setResult(null);
        } catch {
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const stopAndAnalyze = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        setLoading(true);
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            setRecordingDone(true);
            if (!uri) throw new Error("No recording found");

            const audioBase64 = await FileSystem.readAsStringAsync(uri, {
                encoding: "base64" as any,
            });

            const res = await fetch(`${VERCEL_API}/api/cough-analysis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audioBase64 }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e: any) {
            Alert.alert("Error", e.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const coughColor = result ? (coughColors[result.coughType] ?? "#8B5CF6") : "#8B5CF6";

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="mic" size={28} color="#8B5CF6" />
                    </View>
                    <View>
                        <Text style={styles.title}>Cough Analysis</Text>
                        <Text style={styles.subtitle}>Record your cough for AI analysis</Text>
                    </View>
                </View>

                <View style={styles.recorderCard}>
                    <Text style={styles.recorderHint}>
                        {isRecording ? "🔴 Recording... Tap to stop and analyze" :
                            recordingDone ? "✅ Recording complete" :
                                "Tap the button and cough naturally for 3–5 seconds"}
                    </Text>
                    <TouchableOpacity
                        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                        onPress={isRecording ? stopAndAnalyze : startRecording}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="large" />
                        ) : (
                            <Ionicons name={isRecording ? "stop" : "mic"} size={44} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.recordLabel}>
                        {loading ? "Analyzing with AI..." : isRecording ? "Tap to Stop & Analyze" : recordingDone ? "Tap to re-record" : "Tap to Start Recording"}
                    </Text>
                </View>

                {result && (
                    <View style={styles.resultContainer}>
                        <View style={[styles.coughTypeCard, { borderColor: coughColor + "60", backgroundColor: coughColor + "10" }]}>
                            <Text style={[styles.coughType, { color: coughColor }]}>{result.coughType.toUpperCase()} COUGH</Text>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>{result.confidence} Confidence</Text>
                            </View>
                            <Text style={styles.coughDesc}>{result.description}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Possible Causes</Text>
                            {result.possibleCauses.map((c, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={[styles.dot, { backgroundColor: coughColor }]} />
                                    <Text style={styles.listText}>{c}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Home Remedies</Text>
                            {result.homeRemedies.map((r, i) => (
                                <View key={i} style={styles.listItem}>
                                    <Ionicons name="leaf" size={14} color="#22C55E" />
                                    <Text style={styles.listText}>{r}</Text>
                                </View>
                            ))}
                        </View>

                        {result.otcMedicines.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>OTC Medicines</Text>
                                {result.otcMedicines.map((m, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.medicineCard}
                                        onPress={() => Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(m.searchQuery)}`)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.medicineName}>{m.name}</Text>
                                            <Text style={styles.medicinePurpose}>{m.purpose}</Text>
                                        </View>
                                        <Ionicons name="open-outline" size={16} color="#8B5CF6" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {result.seekMedicalAttention && (
                            <View style={styles.alertCard}>
                                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                <Text style={styles.alertText}>{result.medicalNote}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    content: { padding: 20, paddingTop: 56 },
    header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
    iconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#2D1B47", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
    recorderCard: {
        backgroundColor: "#1E293B", borderRadius: 20, padding: 28, borderWidth: 1,
        borderColor: "#334155", alignItems: "center", marginBottom: 20,
    },
    recorderHint: { color: "#94A3B8", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 20 },
    recordButton: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: "#8B5CF6", justifyContent: "center", alignItems: "center",
        shadowColor: "#8B5CF6", shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
        marginBottom: 16,
    },
    recordButtonActive: { backgroundColor: "#EF4444", shadowColor: "#EF4444" },
    recordLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
    resultContainer: { gap: 12 },
    coughTypeCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center" },
    coughType: { fontSize: 22, fontWeight: "900", letterSpacing: 2, marginBottom: 8 },
    confidenceBadge: { backgroundColor: "#1E293B", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12 },
    confidenceText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
    coughDesc: { color: "#CBD5E1", fontSize: 14, lineHeight: 22, textAlign: "center" },
    section: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F8FAFC", marginBottom: 12 },
    listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
    listText: { flex: 1, color: "#CBD5E1", fontSize: 13, lineHeight: 20 },
    medicineCard: {
        backgroundColor: "#0F172A", borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1E293B",
    },
    medicineName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14 },
    medicinePurpose: { color: "#64748B", fontSize: 12, marginTop: 2 },
    alertCard: {
        backgroundColor: "#2D0A0A", borderRadius: 16, padding: 16, borderWidth: 1,
        borderColor: "#991B1B", flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 20,
    },
    alertText: { flex: 1, color: "#FCA5A5", fontSize: 13, lineHeight: 20 },
});
