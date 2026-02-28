import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { PulseCheckLogoMobile } from "../../src/components/PulseCheckLogoMobile";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID_WEB = "218534686639-lv8pg2l9cv5922agntcqm9r9nisia620.apps.googleusercontent.com";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);
    const router = useRouter();

    const [, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
        clientId: GOOGLE_CLIENT_ID_WEB,
    });

    React.useEffect(() => {
        if (googleResponse?.type === "success") {
            const { id_token } = googleResponse.params;
            setGoogleLoading(true);
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .catch((e) => Alert.alert("Google Sign-Up Failed", e.message))
                .finally(() => setGoogleLoading(false));
        }
    }, [googleResponse]);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Passwords Don't Match", "Please confirm your password.");
            return;
        }
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(cred.user, { displayName: name.trim() });
            // Create user profile doc in Firestore
            await setDoc(doc(db, `users/${cred.user.uid}`), {
                displayName: name.trim(),
                email: email.trim(),
                phone: "",
                gender: "",
                dob: "",
                bio: "",
                createdAt: serverTimestamp(),
            });
        } catch (e: any) {
            const msg = e.code === "auth/email-already-in-use"
                ? "An account with this email already exists."
                : e.code === "auth/invalid-email"
                    ? "Please enter a valid email address."
                    : e.message;
            Alert.alert("Sign Up Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            await promptGoogleAsync();
        } catch (e: any) {
            Alert.alert("Google Sign-Up", e.message);
            setGoogleLoading(false);
        }
    };

    const anyLoading = loading || googleLoading;

    return (
        <SafeAreaView style={s.root}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* ── LOGO ── */}
                    <View style={s.hero}>
                        <PulseCheckLogoMobile size={80} />
                        <Text style={s.heroSub}>Create your account</Text>
                    </View>

                    {/* ── CARD ── */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Get Started</Text>
                        <Text style={s.cardSub}>Join thousands monitoring their health with AI</Text>

                        {/* Google Button */}
                        <TouchableOpacity
                            style={[s.googleBtn, anyLoading && s.disabled]}
                            onPress={handleGoogleSignup}
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
                            <Text style={s.dividerTxt}>or sign up with email</Text>
                            <View style={s.dividerLine} />
                        </View>

                        {/* Full Name */}
                        <Text style={s.label}>FULL NAME</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="person-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput style={s.input} placeholder="Your full name" placeholderTextColor="#334155" autoCapitalize="words" value={name} onChangeText={setName} />
                        </View>

                        {/* Email */}
                        <Text style={s.label}>EMAIL</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="mail-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor="#334155" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                        </View>

                        {/* Password */}
                        <Text style={s.label}>PASSWORD</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="lock-closed-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput style={s.input} placeholder="Min. 6 characters" placeholderTextColor="#334155" secureTextEntry={!showPw} value={password} onChangeText={setPassword} />
                            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <Text style={s.label}>CONFIRM PASSWORD</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="lock-closed-outline" size={18} color="#475569" style={s.inputIcon} />
                            <TextInput style={s.input} placeholder="Re-enter password" placeholderTextColor="#334155" secureTextEntry={!showCpw} value={confirmPassword} onChangeText={setConfirmPassword} returnKeyType="done" onSubmitEditing={handleSignup} />
                            <TouchableOpacity onPress={() => setShowCpw(v => !v)} style={s.eyeBtn}>
                                <Ionicons name={showCpw ? "eye-off-outline" : "eye-outline"} size={18} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Create Account */}
                        <TouchableOpacity
                            style={[s.signUpBtn, anyLoading && s.disabled]}
                            onPress={handleSignup}
                            disabled={anyLoading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.signUpBtnTxt}>Create Account</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={s.linkRow} onPress={() => router.back()} activeOpacity={0.7}>
                            <Text style={s.linkTxt}>Already have an account?  <Text style={s.linkBold}>Sign In</Text></Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.disclaimer}>By creating an account, you agree to our Terms of Service and Privacy Policy.</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#060E1E" },
    content: { flexGrow: 1, padding: 24, paddingTop: 20 },

    hero: { alignItems: "center", marginBottom: 24 },
    heroSub: { fontSize: 13, color: "#475569", marginTop: 10 },

    card: { backgroundColor: "#0F1929", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#1E293B" },
    cardTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginBottom: 4 },
    cardSub: { fontSize: 13, color: "#475569", marginBottom: 22 },

    googleBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
        backgroundColor: "#F8FAFC", borderRadius: 14, paddingVertical: 14, marginBottom: 18,
        shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    googleBtnTxt: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

    divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#1E293B" },
    dividerTxt: { fontSize: 12, color: "#334155", fontWeight: "500" },

    label: { fontSize: 11, fontWeight: "700", color: "#334155", letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#070E1A", borderRadius: 14,
        borderWidth: 1, borderColor: "#1E293B",
        paddingHorizontal: 14, height: 52, marginBottom: 14,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#F1F5F9", fontSize: 15 },
    eyeBtn: { padding: 4 },

    signUpBtn: {
        backgroundColor: "#6366F1", borderRadius: 14, height: 52,
        justifyContent: "center", alignItems: "center",
        marginTop: 6, marginBottom: 18,
        shadowColor: "#6366F1", shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
    },
    signUpBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
    disabled: { opacity: 0.5 },

    linkRow: { alignItems: "center" },
    linkTxt: { fontSize: 14, color: "#475569" },
    linkBold: { color: "#34D399", fontWeight: "700" },

    disclaimer: { textAlign: "center", fontSize: 11, color: "#1E293B", marginTop: 20, lineHeight: 16 },
});
