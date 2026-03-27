import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

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
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>
                <Text style={styles.title}>Nearby Hospitals</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Finding facilities near you...</Text>
                </View>
            ) : errorMsg ? (
                <View style={styles.center}>
                    <Ionicons name="location-outline" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchHospitals}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={hospitals}
                    keyExtractor={(item, index) => item.place_id || index.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.address}>{item.vicinity}</Text>
                                </View>
                                {item.rating && (
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#F59E0B" />
                                        <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={[styles.status, item.opening_hours?.open_now ? styles.statusOpen : styles.statusClosed]}>
                                    {item.opening_hours?.open_now ? "Open Now" : "Closed / Unspecified"}
                                </Text>
                                <TouchableOpacity 
                                    style={styles.dirBtn} 
                                    onPress={() => openDirections(item.geometry.location.lat, item.geometry.location.lng, item.name)}
                                >
                                    <Ionicons name="navigate" size={16} color="#FFF" />
                                    <Text style={styles.dirText}>Directions</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0F172A" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "700", color: "#F8FAFC" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
    loadingText: { marginTop: 16, color: "#94A3B8", fontSize: 16 },
    errorText: { color: "#F8FAFC", fontSize: 16, textAlign: "center", marginBottom: 20 },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#3B82F6", borderRadius: 8 },
    retryText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
    list: { padding: 16, gap: 16 },
    card: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    name: { fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 4 },
    address: { fontSize: 13, color: "#94A3B8", lineHeight: 18 },
    ratingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245, 158, 11, 0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
    ratingText: { color: "#F59E0B", fontWeight: "700", fontSize: 12, marginLeft: 4 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#334155" },
    status: { fontSize: 12, fontWeight: "600" },
    statusOpen: { color: "#10B981" },
    statusClosed: { color: "#64748B" },
    dirBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
    dirText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
});
