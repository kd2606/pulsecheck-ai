import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password.");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert("Login Failed", error.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="pulse" size={40} color="#22C55E" />
                    </View>
                    <Text style={styles.title}>PulseCheck AI</Text>
                    <Text style={styles.subtitle}>Your AI-powered health companion</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to your account</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#475569"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#475569"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledButton]}
                        onPress={handleEmailLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.signupLink} onPress={() => router.push("/(auth)/signup")}>
                        <Text style={styles.signupText}>
                            Don't have an account?{" "}
                            <Text style={styles.signupTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
    header: { alignItems: "center", marginBottom: 32 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: "#0D2210", borderWidth: 2, borderColor: "#22C55E",
        justifyContent: "center", alignItems: "center", marginBottom: 16,
    },
    title: { fontSize: 28, fontWeight: "800", color: "#F8FAFC", letterSpacing: 0.5 },
    subtitle: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
    card: {
        backgroundColor: "#1E293B", borderRadius: 20, padding: 24,
        borderWidth: 1, borderColor: "#334155",
    },
    cardTitle: { fontSize: 22, fontWeight: "700", color: "#F8FAFC", marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: "#94A3B8", marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600", color: "#CBD5E1", marginBottom: 8 },
    inputWrapper: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#0F172A", borderRadius: 12,
        borderWidth: 1, borderColor: "#334155", paddingHorizontal: 14, height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#F8FAFC", fontSize: 15 },
    loginButton: {
        backgroundColor: "#22C55E", borderRadius: 12,
        height: 52, justifyContent: "center", alignItems: "center",
        marginTop: 8, shadowColor: "#22C55E", shadowOpacity: 0.3,
        shadowRadius: 12, elevation: 4,
    },
    disabledButton: { opacity: 0.7 },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#334155" },
    dividerText: { color: "#64748B", marginHorizontal: 12, fontSize: 13 },
    signupLink: { alignItems: "center" },
    signupText: { color: "#94A3B8", fontSize: 14 },
    signupTextBold: { color: "#22C55E", fontWeight: "700" },
});
