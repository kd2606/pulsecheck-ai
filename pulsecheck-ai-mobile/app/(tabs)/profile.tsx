import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useAuthContext } from "../../src/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
    const { user } = useAuthContext();

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut(auth) },
        ]);
    };

    const menuItems = [
        { icon: "person-outline", label: "Edit Profile", color: "#3B82F6" },
        { icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#22C55E" },
        { icon: "notifications-outline", label: "Notifications", color: "#F59E0B" },
        { icon: "help-circle-outline", label: "Help & Support", color: "#8B5CF6" },
        { icon: "information-circle-outline", label: "About PulseCheck AI", color: "#64748B" },
    ];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={44} color="#22C55E" />
                    </View>
                    <Text style={styles.name}>{user?.displayName ?? "User"}</Text>
                    <Text style={styles.email}>{user?.email ?? ""}</Text>
                    <View style={styles.badge}>
                        <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
                        <Text style={styles.badgeText}>Verified Account</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    {[
                        { label: "Scans Done", value: "12" },
                        { label: "Checkups", value: "5" },
                        { label: "Reports", value: "8" },
                    ].map((s) => (
                        <View key={s.label} style={styles.statCard}>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#475569" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    content: { padding: 24, paddingTop: 56 },
    profileHeader: { alignItems: "center", marginBottom: 28 },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: "#0D2210",
        borderWidth: 3, borderColor: "#22C55E", justifyContent: "center", alignItems: "center", marginBottom: 14,
    },
    name: { fontSize: 22, fontWeight: "800", color: "#F8FAFC", marginBottom: 4 },
    email: { fontSize: 14, color: "#64748B", marginBottom: 10 },
    badge: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#0D2210", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "#166534" },
    badgeText: { color: "#22C55E", fontSize: 12, fontWeight: "600" },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: "#1E293B", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
    statValue: { fontSize: 22, fontWeight: "800", color: "#22C55E", marginBottom: 4 },
    statLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
    menuCard: { backgroundColor: "#1E293B", borderRadius: 20, borderWidth: 1, borderColor: "#334155", marginBottom: 20 },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#1E3A5F" },
    menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    menuLabel: { flex: 1, color: "#F8FAFC", fontSize: 14, fontWeight: "600" },
    signOutButton: {
        backgroundColor: "#1E293B", borderRadius: 16, padding: 18, flexDirection: "row",
        justifyContent: "center", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#EF4444",
    },
    signOutText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
});
