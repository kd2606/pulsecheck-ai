import React, { useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Image, Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

const VERCEL_API = "https://diagnoverseai-peach.vercel.app";

type Medicine = { name: string; purpose: string; searchQuery: string };
type Condition = { name: string; confidence: "High" | "Medium" | "Low"; description: string };
type Result = {
    conditions: Condition[];
    overallAssessment: string;
    homeCare: string[];
    otcMedicines: Medicine[];
    seekDermatologist: boolean;
    clinicType: string;
};

const confColor = { High: "#22C55E", Medium: "#F59E0B", Low: "#EF4444" };

export default function SkinScanScreen() {
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
        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
            : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false, mediaTypes: ImagePicker.MediaTypeOptions.Images });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
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
            const res = await fetch(`${VERCEL_API}/api/skin-scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64 }),
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="scan" size={28} color="#F59E0B" />
                    </View>
                    <View>
                        <Text style={styles.title}>Skin Scan</Text>
                        <Text style={styles.subtitle}>AI-powered skin analysis</Text>
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
                                    <><Ionicons name="sparkles" size={16} color="#fff" /><Text style={styles.analyzeBtnText}> Analyze Skin</Text></>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.uploadCard}>
                        <Ionicons name="image-outline" size={52} color="#475569" style={{ marginBottom: 16 }} />
                        <Text style={styles.uploadTitle}>Upload Skin Photo</Text>
                        <Text style={styles.uploadSubtitle}>Take a clear photo of the skin area you want to analyze</Text>
                        <View style={styles.uploadButtons}>
                            <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)}>
                                <Ionicons name="camera" size={20} color="#F59E0B" />
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
                        <View style={styles.assessmentCard}>
                            <Text style={styles.assessmentTitle}>Overall Assessment</Text>
                            <Text style={styles.assessmentText}>{result.overallAssessment}</Text>
                        </View>

                        {result.conditions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Detected Conditions</Text>
                                {result.conditions.map((c, i) => (
                                    <View key={i} style={styles.conditionItem}>
                                        <View style={styles.conditionRow}>
                                            <Text style={styles.conditionName}>{c.name}</Text>
                                            <View style={[styles.confBadge, { backgroundColor: confColor[c.confidence] + "20", borderColor: confColor[c.confidence] }]}>
                                                <Text style={[styles.confText, { color: confColor[c.confidence] }]}>{c.confidence}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.conditionDesc}>{c.description}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {result.homeCare.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Home Care Tips</Text>
                                {result.homeCare.map((tip, i) => (
                                    <View key={i} style={styles.listItem}>
                                        <Ionicons name="leaf" size={14} color="#22C55E" />
                                        <Text style={styles.listText}>{tip}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

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
                                        <Ionicons name="open-outline" size={16} color="#F59E0B" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {result.seekDermatologist && (
                            <View style={styles.alertCard}>
                                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.alertTitle}>See a Specialist</Text>
                                    <Text style={styles.alertDesc}>Visit a {result.clinicType}</Text>
                                </View>
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
    iconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#2D1B00", justifyContent: "center", alignItems: "center" },
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
        backgroundColor: "#2D1B00", borderRadius: 14, borderWidth: 1, borderColor: "#F59E0B", paddingVertical: 14,
    },
    cameraBtnText: { color: "#F59E0B", fontWeight: "700", fontSize: 14 },
    galleryBtn: {
        flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center",
        backgroundColor: "#1E293B", borderRadius: 14, borderWidth: 1, borderColor: "#334155", paddingVertical: 14,
    },
    galleryBtnText: { color: "#F8FAFC", fontWeight: "700", fontSize: 14 },
    imageCard: { backgroundColor: "#1E293B", borderRadius: 20, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
    previewImage: { width: "100%", height: 260, resizeMode: "cover" },
    imageActions: { flexDirection: "row", gap: 12, padding: 16 },
    retakeBtn: {
        flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center",
        backgroundColor: "#0F172A", borderRadius: 12, borderWidth: 1, borderColor: "#334155", paddingVertical: 12,
    },
    retakeBtnText: { color: "#94A3B8", fontWeight: "600" },
    analyzeBtn: {
        flex: 2, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center",
        backgroundColor: "#F59E0B", borderRadius: 12, paddingVertical: 12,
    },
    disabledBtn: { opacity: 0.7 },
    analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    resultContainer: { gap: 12 },
    assessmentCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#334155" },
    assessmentTitle: { fontSize: 15, fontWeight: "700", color: "#F59E0B", marginBottom: 10 },
    assessmentText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },
    section: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F8FAFC", marginBottom: 12 },
    conditionItem: { marginBottom: 12 },
    conditionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    conditionName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14, flex: 1 },
    confBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, marginLeft: 8 },
    confText: { fontSize: 11, fontWeight: "700" },
    conditionDesc: { color: "#94A3B8", fontSize: 12, lineHeight: 18 },
    listItem: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
    listText: { flex: 1, color: "#CBD5E1", fontSize: 13, lineHeight: 20 },
    medicineCard: {
        backgroundColor: "#0F172A", borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1E293B",
    },
    medicineName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14 },
    medicinePurpose: { color: "#64748B", fontSize: 12, marginTop: 2 },
    alertCard: {
        backgroundColor: "#2D0A0A", borderRadius: 16, padding: 16, borderWidth: 1,
        borderColor: "#991B1B", flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 20,
    },
    alertTitle: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
    alertDesc: { color: "#FCA5A5", fontSize: 13, marginTop: 2 },
});
