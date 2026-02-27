import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

type Medicine = { name: string; purpose: string; searchQuery: string };
type Result = {
    likelyCondition: string;
    conditionDescription: string;
    severity: "Mild" | "Moderate" | "Severe";
    precautions: string[];
    otcMedicines: Medicine[];
    seekDoctor: boolean;
    clinicType: string;
    disclaimer: string;
};

const severityColor = { Mild: "#22C55E", Moderate: "#F59E0B", Severe: "#EF4444" };
const severityBg = { Mild: "#0D2210", Moderate: "#2D1B00", Severe: "#2D0A0A" };

export default function SymptomCheckerScreen() {
    const [symptoms, setSymptoms] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        if (!symptoms.trim()) {
            Alert.alert("Enter symptoms", "Please describe your symptoms first.");
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${VERCEL_API}/api/symptom-checker`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symptoms,
                    age: age ? parseInt(age) : undefined,
                    gender: gender || undefined,
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e: any) {
            Alert.alert("Error", e.message || "Unable to connect to AI service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="medical" size={28} color="#3B82F6" />
                    </View>
                    <View>
                        <Text style={styles.title}>Symptom Checker</Text>
                        <Text style={styles.subtitle}>AI-powered health analysis</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Describe your symptoms</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="e.g. headache, fever for 2 days, sore throat..."
                        placeholderTextColor="#475569"
                        multiline
                        numberOfLines={4}
                        value={symptoms}
                        onChangeText={setSymptoms}
                        textAlignVertical="top"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Age (optional)</Text>
                            <TextInput
                                style={styles.smallInput}
                                placeholder="e.g. 25"
                                placeholderTextColor="#475569"
                                keyboardType="numeric"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Gender (optional)</Text>
                            <View style={styles.genderRow}>
                                {(["Male", "Female", "Other"] as const).map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                        onPress={() => setGender(gender === g ? "" : g)}
                                    >
                                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g[0]}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={analyze}
                        disabled={loading}
                    >
                        {loading ? (
                            <><ActivityIndicator color="#fff" /><Text style={styles.buttonText}> Analyzing...</Text></>
                        ) : (
                            <><Ionicons name="sparkles" size={18} color="#fff" /><Text style={styles.buttonText}> Analyze Symptoms</Text></>
                        )}
                    </TouchableOpacity>
                </View>

                {result && (
                    <View style={styles.resultContainer}>
                        {/* Condition */}
                        <View style={[styles.conditionCard, { backgroundColor: severityBg[result.severity], borderColor: severityColor[result.severity] + "60" }]}>
                            <View style={styles.conditionHeader}>
                                <Text style={styles.conditionName}>{result.likelyCondition}</Text>
                                <View style={[styles.severityBadge, { backgroundColor: severityColor[result.severity] + "20", borderColor: severityColor[result.severity] }]}>
                                    <Text style={[styles.severityText, { color: severityColor[result.severity] }]}>{result.severity}</Text>
                                </View>
                            </View>
                            <Text style={styles.conditionDesc}>{result.conditionDescription}</Text>
                        </View>

                        {/* Precautions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
                                <Text style={styles.sectionTitle}>Precautions</Text>
                            </View>
                            {result.precautions.map((p, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={styles.dot} />
                                    <Text style={styles.listText}>{p}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Medicines */}
                        {result.otcMedicines.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="medical" size={18} color="#8B5CF6" />
                                    <Text style={styles.sectionTitle}>OTC Medicines</Text>
                                </View>
                                {result.otcMedicines.map((m, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.medicineCard}
                                        onPress={() => Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(m.searchQuery)}`)}
                                    >
                                        <View style={styles.medicineInfo}>
                                            <Text style={styles.medicineName}>{m.name}</Text>
                                            <Text style={styles.medicinePurpose}>{m.purpose}</Text>
                                        </View>
                                        <Ionicons name="search" size={16} color="#8B5CF6" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* See Doctor */}
                        {result.seekDoctor && (
                            <View style={styles.doctorAlert}>
                                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.doctorAlertTitle}>See a Doctor</Text>
                                    <Text style={styles.doctorAlertText}>Visit a {result.clinicType}</Text>
                                </View>
                            </View>
                        )}

                        {/* Disclaimer */}
                        <View style={styles.disclaimerBox}>
                            <Ionicons name="warning-outline" size={14} color="#F59E0B" />
                            <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
                        </View>
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
    iconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#1D3461", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
    card: { backgroundColor: "#1E293B", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#334155", marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600", color: "#CBD5E1", marginBottom: 8 },
    textarea: {
        backgroundColor: "#0F172A", borderRadius: 12, borderWidth: 1, borderColor: "#334155",
        padding: 14, color: "#F8FAFC", fontSize: 14, minHeight: 100, marginBottom: 14,
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 16 },
    halfField: { flex: 1 },
    smallInput: {
        backgroundColor: "#0F172A", borderRadius: 10, borderWidth: 1, borderColor: "#334155",
        padding: 12, color: "#F8FAFC", fontSize: 14,
    },
    genderRow: { flexDirection: "row", gap: 6 },
    genderBtn: {
        flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: "#334155",
        backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center",
    },
    genderBtnActive: { backgroundColor: "#1D3461", borderColor: "#3B82F6" },
    genderText: { color: "#64748B", fontWeight: "700" },
    genderTextActive: { color: "#3B82F6" },
    button: {
        backgroundColor: "#3B82F6", borderRadius: 12, height: 52,
        flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
    },
    disabledButton: { opacity: 0.7 },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    resultContainer: { gap: 12 },
    conditionCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
    conditionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    conditionName: { fontSize: 18, fontWeight: "800", color: "#F8FAFC", flex: 1 },
    severityBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, marginLeft: 10 },
    severityText: { fontSize: 12, fontWeight: "700" },
    conditionDesc: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },
    section: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F8FAFC" },
    listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E", marginTop: 6 },
    listText: { flex: 1, color: "#CBD5E1", fontSize: 13, lineHeight: 20 },
    medicineCard: {
        backgroundColor: "#0F172A", borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1E293B",
    },
    medicineInfo: { flex: 1 },
    medicineName: { color: "#F8FAFC", fontWeight: "700", fontSize: 14, marginBottom: 2 },
    medicinePurpose: { color: "#64748B", fontSize: 12 },
    doctorAlert: {
        backgroundColor: "#2D0A0A", borderRadius: 16, padding: 16, borderWidth: 1,
        borderColor: "#991B1B", flexDirection: "row", gap: 12, alignItems: "center",
    },
    doctorAlertTitle: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
    doctorAlertText: { color: "#FCA5A5", fontSize: 13, marginTop: 2 },
    disclaimerBox: {
        flexDirection: "row", gap: 8, backgroundColor: "#292524", borderRadius: 12,
        padding: 14, borderWidth: 1, borderColor: "#44403C", marginBottom: 20,
    },
    disclaimerText: { flex: 1, color: "#FCD34D", fontSize: 12, lineHeight: 18 },
});
