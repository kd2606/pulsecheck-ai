import React, { useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Image, Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";
import { useAuthContext } from "../../src/context/AuthProvider";

const VERCEL_API = "https://pulsecheckai-peach.vercel.app";

type Medicine = { name: string; purpose: string; searchQuery: string };
type Indicator = { sign: string; detected: boolean; details: string };
type Result = {
    fatigueDetected: boolean;
    indicators: Indicator[];
    overallAssessment: string;
    lifestyleSuggestions: string[];
    otcMedicines: Medicine[];
};

export default function VisionScanScreen() {
    const { user } = useAuthContext();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (fromCamera: boolean) => {
        const perms = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perms.granted) {
            Alert.alert("Permission needed", "Please allow access to continue.");
            return;
        }
        const pickerResult = fromCamera
            ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
            : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false, mediaTypes: ImagePicker.MediaTypeOptions.Images });

        if (!pickerResult.canceled && pickerResult.assets[0]) {
            setImageUri(pickerResult.assets[0].uri);
            setResult(null);
        }
    };

    const analyze = async () => {
        if (!imageUri) {
            Alert.alert("No image", "Please take or choose a photo first.");
            return;
        }
        setLoading(true);
        try {
            const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: "base64" as any,
            });
            const res = await fetch(`${VERCEL_API}/api/vision-scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64 }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);

            if (user && data) {
                await addDoc(collection(db, `users/${user.uid}/fatigueScans`), {
                    ...data,
                    timestamp: new Date().toISOString(),
                    type: "self"
                });
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="eye" size={28} color="#8B5CF6" />
                    </View>
                    <View>
                        <Text style={styles.title}>Vision Scan</Text>
                        <Text style={styles.subtitle}>AI-powered fatigue detection</Text>
                    </View>
                </View>

                {imageUri ? (
                    <View style={styles.imageCard}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <View style={styles.imageActions}>
                            <TouchableOpacity style={styles.retakeBtn} onPress={() => { setImageUri(null); setResult(null); }}>
                                <Ionicons name="refresh" size={16} color="#94A3B8" />
                                <Text style={styles.retakeBtnText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.analyzeBtn, loading && styles.disabledBtn]}
                                onPress={analyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><ActivityIndicator color="#fff" size="small" /><Text style={styles.analyzeBtnText}> Analyzing...</Text></>
                                ) : (
                                    <><Ionicons name="sparkles" size={16} color="#fff" /><Text style={styles.analyzeBtnText}> Detect Fatigue</Text></>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.uploadCard}>
                        <Ionicons name="camera-outline" size={52} color="#475569" style={{ marginBottom: 16 }} />
                        <Text style={styles.uploadTitle}>Upload Facial Photo</Text>
                        <Text style={styles.uploadSubtitle}>Take a clear selfie showing your eyes and face area</Text>
                        <View style={styles.uploadButtons}>
                            <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)}>
                                <Ionicons name="camera" size={20} color="#8B5CF6" />
                                <Text style={styles.cameraBtnText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
                                <Ionicons name="images" size={20} color="#F8FAFC" />
                                <Text style={styles.galleryBtnText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {result && (
                    <View style={styles.resultContainer}>
                        <View style={[styles.fatigueAlert, { backgroundColor: result.fatigueDetected ? "#3F2728" : "#0D2210", borderColor: result.fatigueDetected ? "#991B1B" : "#166534" }]}>
                            <Ionicons name={result.fatigueDetected ? "warning" : "checkmark-circle"} size={28} color={result.fatigueDetected ? "#EF4444" : "#22C55E"} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.fatigueAlertTitle, { color: result.fatigueDetected ? "#EF4444" : "#22C55E" }]}>
                                    {result.fatigueDetected ? "Fatigue Detected" : "No Serious Fatigue"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.assessmentCard}>
                            <Text style={styles.assessmentTitle}>Overall Assessment</Text>
                            <Text style={styles.assessmentText}>{result.overallAssessment}</Text>
                        </View>

                        {result.indicators.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Fatigue Indicators</Text>
                                {result.indicators.map((ind, i) => (
                                    <View key={i} style={styles.indicatorItem}>
                                        <View style={styles.indicatorRow}>
                                            <Text style={styles.indicatorName}>{ind.sign}</Text>
                                            <View style={[styles.confBadge, {
                                                backgroundColor: ind.detected ? "#3F2728" : "#0D2210",
                                                borderColor: ind.detected ? "#EF4444" : "#22C55E"
                                            }]}>
                                                <Text style={[styles.confText, { color: ind.detected ? "#EF4444" : "#22C55E" }]}>
                                                    {ind.detected ? "Found" : "Clear"}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.indicatorDesc}>{ind.details}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {result.lifestyleSuggestions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Lifestyle Suggestions</Text>
                                {result.lifestyleSuggestions.map((tip, i) => (
                                    <View key={i} style={styles.listItem}>
                                        <Ionicons name="sunny" size={14} color="#F59E0B" />
                                        <Text style={styles.listText}>{tip}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {result.otcMedicines.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Relevant OTC / Remedies</Text>
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
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
    iconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#2E1065", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },

    uploadCard: {
        backgroundColor: "#1E293B", borderRadius: 20, padding: 32, borderWidth: 1,
        borderColor: "#334155", borderStyle: "dashed", alignItems: "center", marginBottom: 16,
    },
    uploadTitle: { fontSize: 18, fontWeight: "700", color: "#F8FAFC", marginBottom: 8 },
    uploadSubtitle: { color: "#64748B", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 20 },
    uploadButtons: { flexDirection: "row", gap: 12 },
    cameraBtn: {
        flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center",
        backgroundColor: "#2E1065", borderRadius: 14, borderWidth: 1, borderColor: "#8B5CF6", paddingVertical: 14,
    },
    cameraBtnText: { color: "#A78BFA", fontWeight: "700", fontSize: 14 },
    galleryBtn: {
        flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center",
        backgroundColor: "#1E293B", borderRadius: 14, borderWidth: 1, borderColor: "#334155", paddingVertical: 14,
    },
    galleryBtnText: { color: "#F8FAFC", fontWeight: "700", fontSize: 14 },

    imageCard: { backgroundColor: "#1E293B", borderRadius: 20, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
    previewImage: { width: "100%", height: 320, resizeMode: "cover" },
    imageActions: { flexDirection: "row", gap: 12, padding: 16 },
    retakeBtn: {
        flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center",
        backgroundColor: "#0F172A", borderRadius: 12, borderWidth: 1, borderColor: "#334155", paddingVertical: 12,
    },
    retakeBtnText: { color: "#94A3B8", fontWeight: "600" },
    analyzeBtn: {
        flex: 2, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center",
        backgroundColor: "#8B5CF6", borderRadius: 12, paddingVertical: 12,
    },
    disabledBtn: { opacity: 0.7 },
    analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    resultContainer: { gap: 12 },
    fatigueAlert: { borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", marginBottom: 10 },
    fatigueAlertTitle: { fontWeight: "800", fontSize: 18 },

    assessmentCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#334155" },
    assessmentTitle: { fontSize: 15, fontWeight: "700", color: "#8B5CF6", marginBottom: 10 },
    assessmentText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },

    section: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F8FAFC", marginBottom: 12 },

    indicatorItem: { marginBottom: 12 },
    indicatorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    indicatorName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14, flex: 1 },
    confBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, marginLeft: 8 },
    confText: { fontSize: 11, fontWeight: "700" },
    indicatorDesc: { color: "#94A3B8", fontSize: 12, lineHeight: 18 },

    listItem: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
    listText: { flex: 1, color: "#CBD5E1", fontSize: 13, lineHeight: 20 },

    medicineCard: {
        backgroundColor: "#0F172A", borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1E293B",
    },
    medicineName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14 },
    medicinePurpose: { color: "#64748B", fontSize: 12, marginTop: 2 },
});
