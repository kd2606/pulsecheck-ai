import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthContext } from "../../src/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const features = [
    { title: "Medu AI Chat", icon: "chatbubbles-outline", color: "#EC4899", route: "/chatbot", desc: "Talk to your assistant" },
    { title: "Symptom Checker", icon: "medical-outline", color: "#3B82F6", route: "/symptom-checker", desc: "AI-powered diagnosis" },
    { title: "Cough Analysis", icon: "mic-outline", color: "#8B5CF6", route: "/cough-analysis", desc: "Analyze your cough" },
    { title: "Skin Scan", icon: "scan-outline", color: "#F59E0B", route: "/skin-scan", desc: "Detect skin issues" },
    { title: "Mental Health", icon: "pulse-outline", color: "#10B981", route: "/mental-health", desc: "Screen your well-being" },
    { title: "Vision Scan", icon: "eye-outline", color: "#8B5CF6", route: "/vision-scan", desc: "Check eye fatigue" },
    { title: "Find Doctors", icon: "people-outline", color: "#14B8A6", route: "/people", desc: "Nearby specialists" },
];

export default function DashboardScreen() {
    const { user } = useAuthContext();
    const router = useRouter();
    const firstName = user?.displayName?.split(" ")[0] ?? "User";

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good morning,</Text>
                        <Text style={styles.name}>{firstName} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push("/profile")}>
                        <Ionicons name="person" size={22} color="#22C55E" />
                    </TouchableOpacity>
                </View>

                <View style={styles.healthCard}>
                    <View style={styles.healthCardHeader}>
                        <Ionicons name="heart" size={20} color="#22C55E" />
                        <Text style={styles.healthCardTitle}>Health Overview</Text>
                    </View>
                    <Text style={styles.healthCardText}>
                        Use the tools below to monitor your health daily with AI-powered insights.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.grid}>
                    {features.map((f) => (
                        <TouchableOpacity
                            key={f.title}
                            style={styles.featureCard}
                            onPress={() => router.push(f.route as any)}
                        >
                            <View style={[styles.iconBg, { backgroundColor: f.color + "20" }]}>
                                <Ionicons name={f.icon as any} size={28} color={f.color} />
                            </View>
                            <Text style={styles.featureTitle}>{f.title}</Text>
                            <Text style={styles.featureDesc}>{f.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Tips for Today</Text>
                <View style={styles.tipCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                    <Text style={styles.tipText}>
                        Stay hydrated! Drinking enough water supports every function in your body, including immunity and digestion.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    content: { padding: 24, paddingTop: 56 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    greeting: { fontSize: 15, color: "#94A3B8" },
    name: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginTop: 2 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155",
        justifyContent: "center", alignItems: "center",
    },
    healthCard: {
        backgroundColor: "#0D2210", borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: "#166534", marginBottom: 28,
    },
    healthCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    healthCardTitle: { color: "#22C55E", fontWeight: "700", fontSize: 15 },
    healthCardText: { color: "#86EFAC", fontSize: 13, lineHeight: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#F8FAFC", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 28 },
    featureCard: {
        width: "47%", backgroundColor: "#1E293B", borderRadius: 16,
        padding: 18, borderWidth: 1, borderColor: "#334155",
    },
    iconBg: { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    featureTitle: { color: "#F8FAFC", fontWeight: "700", fontSize: 14, marginBottom: 4 },
    featureDesc: { color: "#64748B", fontSize: 12 },
    tipCard: {
        flexDirection: "row", gap: 12, backgroundColor: "#1E3A5F", borderRadius: 14,
        padding: 16, borderWidth: 1, borderColor: "#1D4ED8", alignItems: "flex-start",
    },
    tipText: { flex: 1, color: "#BFDBFE", fontSize: 13, lineHeight: 20 },
});
