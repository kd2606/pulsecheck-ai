import React, { useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    Alert, Modal, TextInput, Pressable, Linking, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/firebase/firebaseConfig";
import { useAuthContext } from "../../src/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";

// ─── ABOUT CONTENT ───────────────────────────────────────────────────────────
const ABOUT_SECTIONS = [
    {
        title: "About PulseCheck AI",
        subtitle: "Version 1.0.0",
        icon: "pulse-outline",
        color: "#34D399",
        content: `PulseCheck AI was built with a simple conviction: Every life in rural India deserves access to precise, timely, and affordable healthcare. Designed for Bharat, our AI-powered health monitoring platform empowers individuals to take control of their health through early detection and real-time health insights.`,
    },
    {
        title: "Our Platform Offers",
        icon: "apps-outline",
        color: "#60A5FA",
        content: `A comprehensive suite of health tools including AI-driven symptom analysis, skin condition monitoring, respiratory cough assessment, mental health screening, and access to nearby healthcare professionals — all within a single, unified platform.`,
    },
    {
        title: "Team Hackboard",
        icon: "people-outline",
        color: "#F472B6",
        content: `We are Team Hackboard. We believe that technology should serve humanity. By combining advanced artificial intelligence with an intuitive user experience, we are dedicated to bridging the gap between individuals and quality healthcare.`,
    },
    {
        title: "Medical Disclaimer",
        icon: "warning-outline",
        color: "#FBBF24",
        content: `PulseCheck AI is intended for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Users are strongly advised to consult a licensed healthcare professional for any medical concerns.`,
    },
];

const FAQ = [
    {
        q: "How do I perform a health scan?",
        a: "Navigate to the Dashboard and select from Symptoms, Cough Analysis, or Skin Scan to initiate your preferred health assessment.",
    },
    {
        q: "Are my health records securely stored?",
        a: "Yes. All scans, checkups, and reports are securely stored within your profile and are accessible only to you.",
    },
    {
        q: "How is my personal data protected?",
        a: "PulseCheck AI employs industry-standard encryption protocols to ensure your data remains private and confidential at all times.",
    },
    {
        q: "How reliable are the AI-generated results?",
        a: "Our AI models are trained on extensive medical datasets to deliver accurate and meaningful health insights. However, all results are intended to supplement — not replace — the advice of a qualified medical professional.",
    },
    {
        q: "Is PulseCheck AI suitable for medical emergencies?",
        a: "No. PulseCheck AI is not an emergency service. In the event of a medical emergency, please contact your local emergency services immediately.",
    },
];

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const { user } = useAuthContext();

    // Active modal
    const [activeModal, setActiveModal] = useState<"edit" | "privacy" | "notifications" | "help" | "about" | null>(null);

    // Edit profile fields
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bio, setBio] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // FAQ expand state
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // Load profile from Firestore
    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, `users/${user.uid}`)).then(snap => {
            if (snap.exists()) {
                const d = snap.data();
                setPhone(d.phone ?? "");
                setDob(d.dob ?? "");
                setGender(d.gender ?? "");
                setBio(d.bio ?? "");
            }
        }).catch(() => { });
    }, [user]);

    const close = () => setActiveModal(null);

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut(auth) },
        ]);
    };

    const handleSaveProfile = async () => {
        if (!displayName.trim()) { Alert.alert("Error", "Name cannot be empty."); return; }
        if (!auth.currentUser) return;
        setEditLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });
            await setDoc(doc(db, `users/${auth.currentUser.uid}`), {
                displayName: displayName.trim(),
                email: auth.currentUser.email ?? "",
                phone: phone.trim(),
                dob: dob.trim(),
                gender: gender.trim(),
                bio: bio.trim(),
            }, { merge: true });
            Alert.alert("✅ Saved", "Your profile has been updated.");
            close();
        } catch (e) {
            Alert.alert("Error", "Could not update profile. Please try again.");
        } finally {
            setEditLoading(false);
        }
    };

    const menuItems = [
        { key: "edit", icon: "person-outline", label: "Edit Profile", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
        { key: "privacy", icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
        { key: "notifications", icon: "notifications-outline", label: "Notifications", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
        { key: "help", icon: "help-circle-outline", label: "Help & Support", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
        { key: "about", icon: "information-circle-outline", label: "About PulseCheck AI", color: "#64748B", bg: "rgba(100,116,139,0.12)" },
    ] as const;

    const initials = (user?.displayName ?? "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* ── HEADER ── */}
                <View style={s.headerBar}>
                    <Text style={s.screenTitle}>Profile</Text>
                </View>

                {/* ── AVATAR + NAME ── */}
                <View style={s.hero}>
                    <View style={s.avatarWrap}>
                        <View style={s.avatar}>
                            <Text style={s.avatarInitials}>{initials}</Text>
                        </View>
                        <TouchableOpacity style={s.editAvatarBtn} onPress={() => setActiveModal("edit")}>
                            <Ionicons name="camera-outline" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={s.heroName}>{user?.displayName ?? "User"}</Text>
                    <Text style={s.heroEmail}>{user?.email ?? ""}</Text>
                    <View style={s.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={13} color="#34D399" />
                        <Text style={s.verifiedText}>Verified Account</Text>
                    </View>
                </View>

                {/* ── STATS ── */}
                <View style={s.statsRow}>
                    {[{ label: "Scans", val: "12", icon: "scan-outline", col: "#60A5FA" },
                    { label: "Checkups", val: "5", icon: "medical-outline", col: "#34D399" },
                    { label: "Reports", val: "8", icon: "document-text-outline", col: "#A78BFA" }].map(st => (
                        <View key={st.label} style={s.statCard}>
                            <Ionicons name={st.icon as any} size={18} color={st.col} style={{ marginBottom: 6 }} />
                            <Text style={[s.statVal, { color: st.col }]}>{st.val}</Text>
                            <Text style={s.statLbl}>{st.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── MENU ── */}
                <View style={s.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[s.menuRow, i < menuItems.length - 1 && s.menuDivider]}
                            onPress={() => setActiveModal(item.key)}
                            activeOpacity={0.7}
                        >
                            <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <Text style={s.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#334155" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── SIGN OUT ── */}
                <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={s.signOutTxt}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={s.footer}>© 2025 PulseCheck AI. All rights reserved.</Text>
            </ScrollView>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — EDIT PROFILE
             ══════════════════════════════════════════════════════════════ */}
            <BottomModal visible={activeModal === "edit"} onClose={close} title="Edit Profile">
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
                    {/* Name */}
                    <Text style={m.label}>DISPLAY NAME</Text>
                    <TextInput style={m.input} value={displayName} onChangeText={setDisplayName} placeholder="Your full name" placeholderTextColor="#334155" autoCapitalize="words" returnKeyType="next" />

                    {/* Email (read only) */}
                    <Text style={m.label}>EMAIL</Text>
                    <View style={[m.input, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
                        <Ionicons name="lock-closed-outline" size={14} color="#334155" />
                        <Text style={{ color: "#334155", fontSize: 15, flex: 1 }}>{user?.email}</Text>
                    </View>
                    <Text style={m.noteText}>Email cannot be changed here. Contact support.</Text>

                    {/* Phone */}
                    <Text style={m.label}>PHONE NUMBER</Text>
                    <TextInput style={m.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor="#334155" keyboardType="phone-pad" returnKeyType="next" />

                    {/* Date of Birth */}
                    <Text style={m.label}>DATE OF BIRTH</Text>
                    <TextInput style={m.input} value={dob} onChangeText={setDob} placeholder="DD / MM / YYYY" placeholderTextColor="#334155" keyboardType="numeric" returnKeyType="next" />

                    {/* Gender */}
                    <Text style={m.label}>GENDER</Text>
                    <View style={m.genderRow}>
                        {["Male", "Female", "Other"].map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[m.genderChip, gender === g && m.genderChipActive]}
                                onPress={() => setGender(g)}
                                activeOpacity={0.7}
                            >
                                <Text style={[m.genderChipTxt, gender === g && m.genderChipTxtActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bio */}
                    <Text style={m.label}>BIO</Text>
                    <TextInput style={[m.input, { height: 72, textAlignVertical: "top" }]} value={bio} onChangeText={setBio} placeholder="A short bio about yourself…" placeholderTextColor="#334155" multiline maxLength={160} />

                    <TouchableOpacity
                        style={[m.saveBtn, editLoading && { opacity: 0.5 }]}
                        onPress={handleSaveProfile}
                        disabled={editLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={m.saveBtnTxt}>{editLoading ? "Saving…" : "Save Changes"}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 12 }} />
                </ScrollView>
            </BottomModal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — PRIVACY & SECURITY
             ══════════════════════════════════════════════════════════════ */}
            <BottomModal visible={activeModal === "privacy"} onClose={close} title="Privacy & Security">
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                    {[
                        { icon: "shield-checkmark-outline", color: "#34D399", title: "Your Data Stays With You", body: "We use local-first processing where possible. When cloud analysis is needed, your data is processed, analyzed, and immediately discarded from active memory." },
                        { icon: "eye-off-outline", color: "#60A5FA", title: "No Ads. Ever.", body: "Your health is not a product. We will never sell your personal information or use it to serve you targeted advertisements." },
                        { icon: "server-outline", color: "#A78BFA", title: "What We Collect", body: "We only collect what's necessary: Basic Profile Info, Audio clips (for cough/voice analysis), and Images (for skin scans). All media is securely handled." },
                        { icon: "key-outline", color: "#FBBF24", title: "Your Rights", body: "You have complete control over your health data. You can export, delete, or manage your records at any time from your account settings." },
                    ].map(item => (
                        <View key={item.title} style={m.infoRow}>
                            <View style={[m.infoIcon, { backgroundColor: item.color + "20" }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={m.infoTitle}>{item.title}</Text>
                                <Text style={m.infoBody}>{item.body}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </BottomModal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — NOTIFICATIONS
             ══════════════════════════════════════════════════════════════ */}
            <BottomModal visible={activeModal === "notifications"} onClose={close} title="Notifications">
                <View style={m.notifInfo}>
                    <Ionicons name="notifications-outline" size={40} color="#FBBF24" style={{ marginBottom: 12 }} />
                    <Text style={m.notifTitle}>Push Notifications</Text>
                    <Text style={m.notifBody}>
                        Manage your reminder notifications from the Reminders section. Medication and appointment alerts are scheduled locally on your device.
                    </Text>
                    <TouchableOpacity style={[m.saveBtn, { marginTop: 20 }]} onPress={() => { close(); }} activeOpacity={0.8}>
                        <Text style={m.saveBtnTxt}>Go to Reminders</Text>
                    </TouchableOpacity>
                </View>
            </BottomModal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — HELP & SUPPORT
             ══════════════════════════════════════════════════════════════ */}
            <BottomModal visible={activeModal === "help"} onClose={close} title="Help & Support">
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                    <Text style={m.sectionHead}>Frequently Asked Questions</Text>
                    {FAQ.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={m.faqItem}
                            onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                            activeOpacity={0.7}
                        >
                            <View style={m.faqHeader}>
                                <Text style={m.faqQ}>{item.q}</Text>
                                <Ionicons name={expandedFaq === i ? "chevron-up" : "chevron-down"} size={16} color="#475569" />
                            </View>
                            {expandedFaq === i && <Text style={m.faqA}>{item.a}</Text>}
                        </TouchableOpacity>
                    ))}

                    <Text style={[m.sectionHead, { marginTop: 24 }]}>Contact Our Team</Text>
                    <View style={m.contactCard}>
                        <Ionicons name="person-circle-outline" size={32} color="#A78BFA" style={{ marginBottom: 8 }} />
                        <Text style={m.contactName}>Krrish Dewangan</Text>
                        <Text style={m.contactRole}>Project Lead</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("mailto:dewangankrrish50@gmail.com")}>
                            <Text style={m.contactEmail}>dewangankrrish50@gmail.com</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[m.contactCard, { marginTop: 12 }]}>
                        <Ionicons name="person-circle-outline" size={32} color="#60A5FA" style={{ marginBottom: 8 }} />
                        <Text style={m.contactName}>Hetansh Panigrahi</Text>
                        <Text style={m.contactRole}>Programmer</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("mailto:hetanshpanigrahi.official2006@gmail.com")}>
                            <Text style={m.contactEmail}>hetanshpanigrahi.official2006@gmail.com</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={m.responseBox}>
                        <Ionicons name="time-outline" size={16} color="#FBBF24" />
                        <Text style={m.responseText}>Response time: Within 24–48 business hours</Text>
                    </View>

                    <Text style={[m.sectionHead, { marginTop: 24 }]}>Report an Issue</Text>
                    <View style={m.issueBox}>
                        <Text style={m.issueText}>
                            If you encounter a bug, write to us with a brief description of the problem, your device model, and your current app version. Our team will investigate and resolve it promptly.
                        </Text>
                        <TouchableOpacity style={[m.saveBtn, { marginTop: 14 }]} onPress={() => Linking.openURL("mailto:dewangankrrish50@gmail.com?subject=Bug Report - PulseCheck AI v1.0.0")} activeOpacity={0.8}>
                            <Ionicons name="bug-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={m.saveBtnTxt}>Report a Bug</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 20 }} />
                </ScrollView>
            </BottomModal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — ABOUT PULSECHECK AI
             ══════════════════════════════════════════════════════════════ */}
            <BottomModal visible={activeModal === "about"} onClose={close} title="About PulseCheck AI">
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                    {/* Version badge */}
                    <View style={m.versionBadge}>
                        <View style={m.versionIcon}>
                            <Ionicons name="pulse" size={28} color="#34D399" />
                        </View>
                        <View>
                            <Text style={m.versionTitle}>PulseCheck AI</Text>
                            <Text style={m.versionNum}>Version 1.0.0</Text>
                        </View>
                    </View>

                    {ABOUT_SECTIONS.map(sec => (
                        <View key={sec.title} style={m.aboutSection}>
                            <View style={m.aboutHead}>
                                <View style={[m.aboutIcon, { backgroundColor: sec.color + "20" }]}>
                                    <Ionicons name={sec.icon as any} size={18} color={sec.color} />
                                </View>
                                <Text style={m.aboutTitle}>{sec.title}</Text>
                            </View>
                            {sec.subtitle && <Text style={m.aboutSubtitle}>{sec.subtitle}</Text>}
                            <Text style={m.aboutBody}>{sec.content}</Text>
                        </View>
                    ))}

                    <View style={m.footerCard}>
                        <Text style={m.footerCardTxt}>© 2025 PulseCheck AI. All rights reserved.</Text>
                        <Text style={[m.footerCardTxt, { marginTop: 4, color: "#334155" }]}>Built with ❤️ for accessible healthcare</Text>
                    </View>
                    <View style={{ height: 20 }} />
                </ScrollView>
            </BottomModal>
        </SafeAreaView>
    );
}

// ─── Reusable Bottom Modal ────────────────────────────────────────────────────
function BottomModal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" }}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={m.sheet}>
                    <View style={m.handle} />
                    <View style={m.sheetHeader}>
                        <Text style={m.sheetTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={m.closeBtn}>
                            <Ionicons name="close" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#060E1E" },
    content: { padding: 22, paddingBottom: 60 },
    headerBar: { marginBottom: 24 },
    screenTitle: { fontSize: 34, fontWeight: "800", color: "#F8FAFC", letterSpacing: -0.5 },

    // Hero
    hero: { alignItems: "center", marginBottom: 28 },
    avatarWrap: { position: "relative", marginBottom: 16 },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 2.5, borderColor: "#334155" },
    avatarInitials: { fontSize: 32, fontWeight: "800", color: "#34D399" },
    editAvatarBtn: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: "#6366F1", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#060E1E" },
    heroName: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginBottom: 4 },
    heroEmail: { fontSize: 13, color: "#475569", marginBottom: 12 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(52,211,153,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(52,211,153,0.25)" },
    verifiedText: { fontSize: 12, color: "#34D399", fontWeight: "600" },

    // Stats
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: "#0F1929", borderRadius: 18, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#1E293B" },
    statVal: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
    statLbl: { fontSize: 11, color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

    // Menu
    menuCard: { backgroundColor: "#0F1929", borderRadius: 20, borderWidth: 1, borderColor: "#1E293B", marginBottom: 20 },
    menuRow: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
    menuDivider: { borderBottomWidth: 1, borderBottomColor: "#0D1624" },
    menuIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: "center", alignItems: "center" },
    menuLabel: { flex: 1, color: "#E2E8F0", fontSize: 15, fontWeight: "600" },

    // Sign out
    signOutBtn: { backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 16, padding: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", marginBottom: 24 },
    signOutTxt: { color: "#EF4444", fontSize: 15, fontWeight: "700" },

    footer: { textAlign: "center", fontSize: 12, color: "#1E293B" },
});

const m = StyleSheet.create({
    // Sheet
    sheet: { backgroundColor: "#0C1526", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, borderTopWidth: 1, borderColor: "#1E293B" },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#1E293B", alignSelf: "center", marginBottom: 20 },
    sheetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    sheetTitle: { flex: 1, fontSize: 22, fontWeight: "800", color: "#F8FAFC" },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },

    // Form
    label: { fontSize: 11, fontWeight: "700", color: "#475569", letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" },
    input: { backgroundColor: "#070E1A", borderWidth: 1, borderColor: "#1E293B", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#F1F5F9", marginBottom: 14 },
    noteText: { fontSize: 12, color: "#334155", marginBottom: 20, lineHeight: 18 },
    saveBtn: { backgroundColor: "#6366F1", borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" },
    saveBtnTxt: { color: "#FFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
    genderRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    genderChip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", alignItems: "center", backgroundColor: "#070E1A" },
    genderChipActive: { borderColor: "#6366F1", backgroundColor: "rgba(99,102,241,0.15)" },
    genderChipTxt: { fontSize: 14, color: "#475569", fontWeight: "600" },
    genderChipTxtActive: { color: "#818CF8" },

    // Info rows (Privacy)
    infoRow: { flexDirection: "row", gap: 14, marginBottom: 20, alignItems: "flex-start" },
    infoIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: "center", alignItems: "center", flexShrink: 0 },
    infoTitle: { fontSize: 14, fontWeight: "700", color: "#F1F5F9", marginBottom: 4 },
    infoBody: { fontSize: 13, color: "#64748B", lineHeight: 20 },

    // Notifications
    notifInfo: { alignItems: "center", paddingVertical: 20 },
    notifTitle: { fontSize: 18, fontWeight: "700", color: "#F8FAFC", marginBottom: 10 },
    notifBody: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22 },

    // FAQ
    sectionHead: { fontSize: 13, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
    faqItem: { backgroundColor: "#0F1929", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#1E293B" },
    faqHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    faqQ: { flex: 1, fontSize: 14, fontWeight: "600", color: "#E2E8F0", lineHeight: 20 },
    faqA: { marginTop: 12, fontSize: 13, color: "#64748B", lineHeight: 22 },

    // Contact
    contactCard: { backgroundColor: "#0F1929", borderRadius: 16, padding: 18, alignItems: "center", borderWidth: 1, borderColor: "#1E293B" },
    contactName: { fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 2 },
    contactRole: { fontSize: 12, color: "#475569", marginBottom: 8 },
    contactEmail: { fontSize: 13, color: "#6366F1", fontWeight: "600" },
    responseBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(251,191,36,0.08)", borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: "rgba(251,191,36,0.2)" },
    responseText: { fontSize: 13, color: "#FBBF24", flex: 1 },
    issueBox: { backgroundColor: "#0F1929", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E293B" },
    issueText: { fontSize: 13, color: "#64748B", lineHeight: 21 },

    // About
    versionBadge: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#0F1929", borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B" },
    versionIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(52,211,153,0.12)", justifyContent: "center", alignItems: "center" },
    versionTitle: { fontSize: 18, fontWeight: "800", color: "#F8FAFC" },
    versionNum: { fontSize: 13, color: "#475569", marginTop: 2 },
    aboutSection: { marginBottom: 20 },
    aboutHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    aboutIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    aboutTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
    aboutSubtitle: { fontSize: 12, color: "#475569", marginBottom: 8, marginLeft: 46 },
    aboutBody: { fontSize: 13, color: "#64748B", lineHeight: 22, paddingLeft: 46 },
    footerCard: { backgroundColor: "#0F1929", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#1E293B" },
    footerCardTxt: { fontSize: 12, color: "#475569", textAlign: "center" },
});
