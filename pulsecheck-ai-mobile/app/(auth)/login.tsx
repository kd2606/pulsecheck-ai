import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DiagnoverseLogoMobile } from "../../src/components/DiagnoverseLogoMobile";

const GOOGLE_CLIENT_ID_WEB = "218534686639-lv8pg2l9cv5922agntcqm9r9nisia620.apps.googleusercontent.com";

GoogleSignin.configure({
    webClientId: GOOGLE_CLIENT_ID_WEB,
});

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // (Legacy Expo Auth Session removed)

    const handleEmailLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (e: any) {
            const msg = e.code === "auth/invalid-credential"
                ? "Incorrect email or password."
                : e.code === "auth/user-not-found"
                    ? "No account found with that email."
                    : e.message;
            Alert.alert("Sign In Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo?.data?.idToken || (userInfo as any)?.idToken;
            if (!idToken) throw new Error("No ID token returned from Google.");
            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
        } catch (e: any) {
            if (e.code !== 'SIGN_IN_CANCELLED' && e.code !== 'IN_PROGRESS') {
                Alert.alert("Google Sign-In Failed", e.message || "An error occurred during authentication.");
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const anyLoading = loading || googleLoading;

    return (
        <SafeAreaView style={s.root}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* ── LOGO + BRAND ── */}
                    <View style={s.hero}>
                        <DiagnoverseLogoMobile size={90} />
                        <Text style={s.tagline}>Your AI-Powered Health Companion</Text>
                    </View>

                    {/* ── CARD ── */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Welcome Back</Text>
                        <Text style={s.cardSub}>Sign in to continue</Text>

                        {/* Google Button */}
                        <TouchableOpacity
                            style={[s.googleBtn, anyLoading && s.disabled]}
                            onPress={handleGoogleLogin}
                            disabled={anyLoading}
                            activeOpacity={0.8}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color="#1E293B" />
                            ) : (
                                <>
                                    <Ionicons name="logo-google" size={20} color="#1E293B" />
                                    <Text style={s.googleBtnTxt}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={s.divider}>
                            <View style={s.dividerLine} />
                            <Text style={s.dividerTxt}>or sign in with email</Text>
                            <View style={s.dividerLine} />
                        </View>

                        {/* Email */}
                        <Text style={s.label}>EMAIL</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="mail-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#334155"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        {/* Password */}
                        <Text style={s.label}>PASSWORD</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="lock-closed-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                placeholder="Your password"
                                placeholderTextColor="#334155"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleEmailLogin}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[s.signInBtn, anyLoading && s.disabled]}
                            onPress={handleEmailLogin}
                            disabled={anyLoading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={s.signInBtnTxt}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Sign up link */}
                        <TouchableOpacity style={s.linkRow} onPress={() => router.push("/(auth)/signup")} activeOpacity={0.7}>
                            <Text style={s.linkTxt}>
                                Don't have an account?  <Text style={s.linkBold}>Create one</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.disclaimer}>
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#060E1E" },
    content: { flexGrow: 1, padding: 24, paddingTop: 30, justifyContent: "center" },

    hero: { alignItems: "center", marginBottom: 32 },
    tagline: { fontSize: 13, color: "#475569", marginTop: 14, textAlign: "center" },

    card: { backgroundColor: "#0F1929", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#1E293B" },
    cardTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginBottom: 4 },
    cardSub: { fontSize: 14, color: "#475569", marginBottom: 24 },

    googleBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
        backgroundColor: "#F8FAFC", borderRadius: 14, paddingVertical: 14,
        marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    googleBtnTxt: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

    divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#1E293B" },
    dividerTxt: { fontSize: 12, color: "#334155", fontWeight: "500" },

    label: { fontSize: 11, fontWeight: "700", color: "#334155", letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#070E1A", borderRadius: 14,
        borderWidth: 1, borderColor: "#1E293B",
        paddingHorizontal: 14, height: 52, marginBottom: 16,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#F1F5F9", fontSize: 15 },
    eyeBtn: { padding: 4 },

    signInBtn: {
        backgroundColor: "#6366F1", borderRadius: 14, height: 52,
        justifyContent: "center", alignItems: "center",
        marginTop: 4, marginBottom: 20,
        shadowColor: "#6366F1", shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
    },
    signInBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
    disabled: { opacity: 0.5 },

    linkRow: { alignItems: "center" },
    linkTxt: { fontSize: 14, color: "#475569" },
    linkBold: { color: "#34D399", fontWeight: "700" },

    disclaimer: { textAlign: "center", fontSize: 11, color: "#1E293B", marginTop: 24, paddingHorizontal: 10, lineHeight: 16 },
});
