import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message);
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join PulseCheck AI today</Text>
                </View>

                <View style={styles.card}>
                    {[
                        { label: "Full Name", icon: "person-outline", value: name, setter: setName, placeholder: "Your full name" },
                        { label: "Email", icon: "mail-outline", value: email, setter: setEmail, placeholder: "your@email.com", keyboard: "email-address" as any },
                        { label: "Password", icon: "lock-closed-outline", value: password, setter: setPassword, placeholder: "Min. 6 characters", secure: true },
                    ].map((field) => (
                        <View style={styles.inputGroup} key={field.label}>
                            <Text style={styles.label}>{field.label}</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name={field.icon as any} size={20} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={field.placeholder}
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                    keyboardType={field.keyboard}
                                    secureTextEntry={field.secure}
                                    value={field.value}
                                    onChangeText={field.setter}
                                />
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.disabledButton]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupButtonText}>Create Account</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
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
    title: { fontSize: 28, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
    card: { backgroundColor: "#1E293B", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#334155" },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600", color: "#CBD5E1", marginBottom: 8 },
    inputWrapper: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#0F172A", borderRadius: 12,
        borderWidth: 1, borderColor: "#334155", paddingHorizontal: 14, height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#F8FAFC", fontSize: 15 },
    signupButton: {
        backgroundColor: "#22C55E", borderRadius: 12, height: 52,
        justifyContent: "center", alignItems: "center", marginTop: 8,
        shadowColor: "#22C55E", shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
    },
    disabledButton: { opacity: 0.7 },
    signupButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    loginLink: { alignItems: "center", marginTop: 20 },
    loginText: { color: "#94A3B8", fontSize: 14 },
    loginTextBold: { color: "#22C55E", fontWeight: "700" },
});
