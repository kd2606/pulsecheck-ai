import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../src/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PulseCheckLogoMobile } from "../../src/components/PulseCheckLogoMobile";

const { width } = Dimensions.get("window");

const features = [
    { title: "Medu AI Chat", icon: "chatbubbles-outline", color: "#EC4899", route: "/chatbot", desc: "AI health assistant" },
    { title: "Symptom Checker", icon: "medical-outline", color: "#3B82F6", route: "/symptom-checker", desc: "AI-powered diagnosis" },
    { title: "Cough Analysis", icon: "mic-outline", color: "#8B5CF6", route: "/cough-analysis", desc: "Analyze your cough" },
    { title: "Skin Scan", icon: "scan-outline", color: "#F59E0B", route: "/skin-scan", desc: "Detect skin issues" },
    { title: "Mental Health", icon: "pulse-outline", color: "#10B981", route: "/mental-health", desc: "Screen your well-being" },
    { title: "Vision Scan", icon: "eye-outline", color: "#A78BFA", route: "/vision-scan", desc: "Check eye fatigue" },
    { title: "Govt Schemes", icon: "business-outline", color: "#F97316", route: "/govt-schemes", desc: "Find health schemes" },
    { title: "Reminders", icon: "notifications-outline", color: "#34D399", route: "/reminders", desc: "Pills & Appointments" },
    { title: "Nearby Hospitals", icon: "medkit-outline", color: "#14B8A6", route: "/nearby-hospitals", desc: "Find nearest help" },
];

const TIPS = [
    "Stay hydrated — drink at least 8 glasses of water daily to support immunity and digestion.",
    "Take a 5-minute walk every hour to reduce the risks of a sedentary lifestyle.",
    "Consistent sleep of 7–9 hours is linked to a stronger immune system and better mood.",
    "Deep breathing for 2 minutes can significantly reduce stress and lower blood pressure.",
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

export default function DashboardScreen() {
    const { user } = useAuthContext();
    const router = useRouter();
    const firstName = user?.displayName?.split(" ")[0] ?? "there";
    const [tipIndex] = useState(Math.floor(Math.random() * TIPS.length));

    return (
        <SafeAreaView style={s.root}>
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* ── TOP BAR ── */}
                <View style={s.topBar}>
                    <PulseCheckLogoMobile size={52} />
                    <TouchableOpacity style={s.avatarBtn} onPress={() => router.push("/profile")} activeOpacity={0.7}>
                        <Text style={s.avatarInitial}>{firstName[0]?.toUpperCase() ?? "U"}</Text>
                    </TouchableOpacity>
                </View>

                {/* ── HERO HEALTH CARD ── */}
                <View style={s.heroCard}>
                    <View style={s.heroLeft}>
                        <View style={s.heroIconWrap}>
                            <Ionicons name="heart" size={22} color="#EF4444" />
                        </View>
                        <Text style={s.heroGreeting}>{getGreeting()}, {firstName} 👋</Text>
                        <Text style={s.heroTitle}>Health Overview</Text>
                        <Text style={s.heroBody}>
                            Monitor your health daily with AI-powered analysis and personalized insights.
                        </Text>
                        <View style={s.heroStatsRow}>
                            {[{ val: "12", lbl: "Scans" }, { val: "5", lbl: "Checkups" }, { val: "8", lbl: "Reports" }].map(st => (
                                <View key={st.lbl} style={s.heroStat}>
                                    <Text style={s.heroStatVal}>{st.val}</Text>
                                    <Text style={s.heroStatLbl}>{st.lbl}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={s.heroPulse}>
                        <Ionicons name="pulse" size={64} color="rgba(239,68,68,0.15)" />
                    </View>
                </View>

                {/* ── QUICK ACTIONS ── */}
                <Text style={s.sectionTitle}>Quick Actions</Text>
                <View style={s.grid}>
                    {features.map((f) => (
                        <TouchableOpacity
                            key={f.title}
                            style={s.featureCard}
                            onPress={() => router.push(f.route as any)}
                            activeOpacity={0.75}
                        >
                            <View style={[s.featureIconBg, { backgroundColor: f.color + "18" }]}>
                                <Ionicons name={f.icon as any} size={26} color={f.color} />
                            </View>
                            <Text style={s.featureTitle} numberOfLines={1}>{f.title}</Text>
                            <Text style={s.featureDesc} numberOfLines={1}>{f.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── TIP OF THE DAY ── */}
                <Text style={s.sectionTitle}>Tip of the Day</Text>
                <View style={s.tipCard}>
                    <View style={s.tipIconWrap}>
                        <Ionicons name="bulb-outline" size={22} color="#FBBF24" />
                    </View>
                    <Text style={s.tipText}>{TIPS[tipIndex]}</Text>
                </View>

                {/* ── DISCLAIMER ── */}
                <View style={s.disclaimer}>
                    <Ionicons name="information-circle-outline" size={14} color="#334155" />
                    <Text style={s.disclaimerText}>
                        AI results are for informational purposes only. Always consult a qualified healthcare professional.
                    </Text>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const CARD_W = (width - 44 - 14) / 2;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#060E1E" },
    content: { padding: 22, paddingTop: 8 },

    // Top bar
    topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    greeting: { fontSize: 14, color: "#475569", fontWeight: "500" },
    name: { fontSize: 26, fontWeight: "800", color: "#F8FAFC", letterSpacing: -0.3, marginTop: 2 },
    avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#334155" },
    avatarInitial: { fontSize: 18, fontWeight: "800", color: "#34D399" },

    // Hero card
    heroCard: { backgroundColor: "#0F1929", borderRadius: 22, padding: 22, marginBottom: 30, borderWidth: 1, borderColor: "#1E293B", flexDirection: "row", overflow: "hidden" },
    heroLeft: { flex: 1 },
    heroIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.12)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    heroGreeting: { fontSize: 13, color: "#475569", marginBottom: 6 },
    heroTitle: { fontSize: 17, fontWeight: "700", color: "#F8FAFC", marginBottom: 8 },
    heroBody: { fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 16 },
    heroStatsRow: { flexDirection: "row", gap: 20 },
    heroStat: {},
    heroStatVal: { fontSize: 20, fontWeight: "800", color: "#34D399" },
    heroStatLbl: { fontSize: 11, color: "#475569", fontWeight: "600" },
    heroPulse: { justifyContent: "center", alignItems: "center", marginLeft: 8 },

    // Grid
    sectionTitle: { fontSize: 17, fontWeight: "700", color: "#F8FAFC", marginBottom: 16, letterSpacing: -0.2 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 30 },
    featureCard: { width: CARD_W, backgroundColor: "#0F1929", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#1E293B" },
    featureIconBg: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    featureTitle: { color: "#F1F5F9", fontWeight: "700", fontSize: 14, marginBottom: 4 },
    featureDesc: { color: "#475569", fontSize: 12 },

    // Tip
    tipCard: { backgroundColor: "#0F1929", borderRadius: 18, padding: 18, marginBottom: 20, flexDirection: "row", gap: 14, alignItems: "flex-start", borderWidth: 1, borderColor: "#1E293B" },
    tipIconWrap: { width: 38, height: 38, borderRadius: 11, backgroundColor: "rgba(251,191,36,0.1)", justifyContent: "center", alignItems: "center", flexShrink: 0 },
    tipText: { flex: 1, color: "#94A3B8", fontSize: 13, lineHeight: 22 },

    // Disclaimer
    disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 4 },
    disclaimerText: { flex: 1, fontSize: 11, color: "#334155", lineHeight: 18 },
});
