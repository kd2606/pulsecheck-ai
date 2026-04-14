import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const VERCEL_API = "https://pulsecheckai-peach.vercel.app";

export default function NearbyHospitalsScreen() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setLoading(true);
        setErrorMsg("");
        
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg("Location permission is required to find nearby hospitals.");
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const res = await fetch(`${VERCEL_API}/api/nearby-facilities?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("Failed to fetch facilities");
            
            const data = await res.json();
            setHospitals(data.results || []);
        } catch (error: any) {
            console.error("Fetch hospitals error:", error);
            setErrorMsg("Could not load hospitals. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const openDirections = (lat: number, lng: number, name: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open map.");
        });
    };

    return (
        <LinearGradient
            colors={["#060E1E", "#0D1B3E", "#060E1E"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={s2.blob1} />
            <View style={s2.blob2} />
            <SafeAreaView style={{ flex: 1 }}>
                <BlurView intensity={50} tint="dark" style={s2.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s2.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
                    </TouchableOpacity>
                    <Text style={s2.title}>Nearby Hospitals</Text>
                    <View style={{ width: 44 }} />
                </BlurView>

                {loading ? (
                    <View style={s2.center}>
                        <ActivityIndicator size="large" color="#34D399" />
                        <Text style={s2.loadingText}>Finding facilities near you...</Text>
                    </View>
                ) : errorMsg ? (
                    <View style={s2.center}>
                        <Ionicons name="location-outline" size={52} color="#EF4444" style={{ marginBottom: 14 }} />
                        <Text style={s2.errorText}>{errorMsg}</Text>
                        <TouchableOpacity onPress={fetchHospitals}>
                            <LinearGradient colors={["#3B82F6", "#2563EB"]} style={s2.retryBtn}>
                                <Text style={s2.retryText}>Retry</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={hospitals}
                        keyExtractor={(item, index) => item.place_id || index.toString()}
                        contentContainerStyle={s2.list}
                        renderItem={({ item }) => (
                            <BlurView intensity={40} tint="dark" style={s2.card}>
                                <View style={s2.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s2.name}>{item.name}</Text>
                                        <Text style={s2.address}>{item.vicinity}</Text>
                                    </View>
                                    {item.rating && (
                                        <View style={s2.ratingBadge}>
                                            <Ionicons name="star" size={12} color="#F59E0B" />
                                            <Text style={s2.ratingText}>{item.rating}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={s2.cardFooter}>
                                    <Text style={[s2.status, item.opening_hours?.open_now ? s2.statusOpen : s2.statusClosed]}>
                                        {item.opening_hours?.open_now ? "⬤  Open Now" : "⬤  Closed"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openDirections(item.geometry.location.lat, item.geometry.location.lng, item.name)}
                                    >
                                        <LinearGradient colors={["#3B82F6", "#2563EB"]} style={s2.dirBtn}>
                                            <Ionicons name="navigate" size={15} color="#FFF" />
                                            <Text style={s2.dirText}>Directions</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        )}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const s2 = StyleSheet.create({
    blob1: { position: "absolute", top: -60, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(20,184,166,0.07)" },
    blob2: { position: "absolute", bottom: 100, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(96,165,250,0.06)" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    backBtn: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
        justifyContent: "center", alignItems: "center",
    },
    title: { fontSize: 18, fontWeight: "800", color: "#F8FAFC" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
    loadingText: { marginTop: 16, color: "#94A3B8", fontSize: 15 },
    errorText: { color: "#F8FAFC", fontSize: 15, textAlign: "center", marginBottom: 20 },
    retryBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    list: { padding: 16, gap: 14, paddingBottom: 100 },
    card: {
        borderRadius: 20, padding: 16, overflow: "hidden",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
    name: { fontSize: 15, fontWeight: "700", color: "#F1F5F9", marginBottom: 4 },
    address: { fontSize: 12, color: "#94A3B8", lineHeight: 18 },
    ratingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.12)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
    ratingText: { color: "#F59E0B", fontWeight: "700", fontSize: 12, marginLeft: 4 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
    status: { fontSize: 12, fontWeight: "600" },
    statusOpen: { color: "#34D399" },
    statusClosed: { color: "#64748B" },
    dirBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, gap: 6 },
    dirText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
});
