import React, { useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, TextInput, Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Use the Vercel URL directly to avoid local network issues from Expo device testing
const VERCEL_API = "https://pulsecheckai-peach.vercel.app";

type Scheme = {
    name: string;
    description: string;
    eligibility: string;
    benefits: string;
    howToApply: string;
    officialLink: string;
};

type Result = {
    schemes: Scheme[];
    generalAdvice: string;
};

export default function GovtSchemesScreen() {
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [stateLocation, setStateLocation] = useState("");
    const [income, setIncome] = useState("");
    const [occupation, setOccupation] = useState("");
    const [healthConditions, setHealthConditions] = useState("");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Result | null>(null);

    const handleSearch = async () => {
        setLoading(true);
        setResults(null);
        try {
            const res = await fetch(`${VERCEL_API}/api/govt-schemes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile: {
                        age: age ? parseInt(age, 10) : undefined,
                        gender: gender || undefined,
                        state: stateLocation || undefined,
                        income: income || undefined,
                        occupation: occupation || undefined,
                        healthConditions: healthConditions || undefined,
                    }
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResults(data);
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to find schemes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="business" size={28} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Govt Schemes</Text>
                        <Text style={styles.subtitle}>Discover health and welfare schemes tailored to you.</Text>
                    </View>
                </View>

                {!results ? (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Enter Your Profile</Text>
                        <Text style={styles.formSubtitle}>Fill out details to check eligibility.</Text>

                        <Text style={styles.label}>Age</Text>
                        <TextInput style={styles.input} placeholder="e.g. 45" placeholderTextColor="#64748B" keyboardType="number-pad" value={age} onChangeText={setAge} />

                        <Text style={styles.label}>Gender</Text>
                        <TextInput style={styles.input} placeholder="Male, Female, Other" placeholderTextColor="#64748B" value={gender} onChangeText={setGender} />

                        <Text style={styles.label}>State of Residence</Text>
                        <TextInput style={styles.input} placeholder="e.g. Maharashtra, UP" placeholderTextColor="#64748B" value={stateLocation} onChangeText={setStateLocation} />

                        <Text style={styles.label}>Annual Income</Text>
                        <TextInput style={styles.input} placeholder="e.g. Below 50,000 INR" placeholderTextColor="#64748B" value={income} onChangeText={setIncome} />

                        <Text style={styles.label}>Occupation / Category</Text>
                        <TextInput style={styles.input} placeholder="Farmer, Student, etc." placeholderTextColor="#64748B" value={occupation} onChangeText={setOccupation} />

                        <Text style={styles.label}>Health Conditions (Optional)</Text>
                        <TextInput style={styles.input} placeholder="e.g. Diabetes, TB" placeholderTextColor="#64748B" value={healthConditions} onChangeText={setHealthConditions} />

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSearch} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="search" size={20} color="#fff" />
                                    <Text style={styles.submitBtnText}>Find Schemes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.resultsContainer}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setResults(null)}>
                            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
                            <Text style={styles.backBtnText}>Edit Profile</Text>
                        </TouchableOpacity>

                        <View style={styles.adviceCard}>
                            <Text style={styles.adviceTitle}>Next Steps & Guidance</Text>
                            <Text style={styles.adviceText}>{results.generalAdvice}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Recommended Schemes</Text>

                        {results.schemes.map((scheme, i) => (
                            <View key={i} style={styles.schemeCard}>
                                <View style={styles.schemeHeader}>
                                    <Text style={styles.schemeName}>{scheme.name}</Text>
                                    <Text style={styles.schemeDesc}>{scheme.description}</Text>
                                </View>

                                <View style={styles.schemeBody}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="person-circle" size={16} color="#94A3B8" />
                                        <Text style={styles.infoTitle}>Eligibility</Text>
                                    </View>
                                    <Text style={styles.infoText}>{scheme.eligibility}</Text>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="heart" size={16} color="#94A3B8" />
                                        <Text style={styles.infoTitle}>Key Benefits</Text>
                                    </View>
                                    <Text style={styles.infoText}>{scheme.benefits}</Text>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="document-text" size={16} color="#94A3B8" />
                                        <Text style={styles.infoTitle}>How to Apply</Text>
                                    </View>
                                    <Text style={styles.infoText}>{scheme.howToApply}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.linkBtn}
                                    onPress={() => Linking.openURL(scheme.officialLink)}
                                >
                                    <Ionicons name="open-outline" size={16} color="#F8FAFC" />
                                    <Text style={styles.linkBtnText}>Find Official Information</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
    iconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#FFEDD5", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 2, lineHeight: 18 },

    formCard: { backgroundColor: "#1E293B", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#334155" },
    formTitle: { fontSize: 18, fontWeight: "700", color: "#F8FAFC" },
    formSubtitle: { color: "#64748B", fontSize: 13, marginBottom: 20 },
    label: { color: "#E2E8F0", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155", borderRadius: 10, color: "#F8FAFC", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
    submitBtn: { flexDirection: "row", backgroundColor: "#EA580C", borderRadius: 12, paddingVertical: 14, justifyContent: "center", alignItems: "center", marginTop: 24, gap: 8 },
    submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    resultsContainer: { gap: 16 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#1E293B", borderRadius: 20 },
    backBtnText: { color: "#F8FAFC", fontWeight: "600", fontSize: 13 },

    adviceCard: { backgroundColor: "#FFF7ED", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#FFEDD5" },
    adviceTitle: { fontSize: 16, fontWeight: "700", color: "#C2410C", marginBottom: 8 },
    adviceText: { color: "#9A3412", fontSize: 14, lineHeight: 22 },

    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#F8FAFC", marginTop: 8 },

    schemeCard: { backgroundColor: "#1E293B", borderRadius: 16, borderWidth: 1, borderColor: "#334155", overflow: "hidden" },
    schemeHeader: { padding: 16, backgroundColor: "rgba(255,255,255,0.03)", borderBottomWidth: 1, borderBottomColor: "#334155" },
    schemeName: { fontSize: 16, fontWeight: "700", color: "#8B5CF6", marginBottom: 4 },
    schemeDesc: { color: "#CBD5E1", fontSize: 13, lineHeight: 18 },

    schemeBody: { padding: 16, gap: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
    infoTitle: { color: "#94A3B8", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    infoText: { color: "#F8FAFC", fontSize: 14, lineHeight: 20, paddingLeft: 22 },

    linkBtn: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 12, justifyContent: "center", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#334155" },
    linkBtnText: { color: "#F8FAFC", fontWeight: "600", fontSize: 13 },
});
