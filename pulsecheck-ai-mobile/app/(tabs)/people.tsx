import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator, FlatList, Linking, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

interface Facility {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    address: string;
    phone: string | null;
}

export default function PeopleScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                setLoading(false);
                return;
            }

            try {
                console.log("Requesting current location...");
                let loc = await Location.getCurrentPositionAsync({});
                console.log("Location received:", loc.coords.latitude, loc.coords.longitude);
                setLocation(loc);

                // Fetch nearby facilities directly from Overpass API to avoid Vercel Serverless IP rate limits
                const radius = 5000;
                const query = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="hospital"](around:${radius},${loc.coords.latitude},${loc.coords.longitude});
                      way["amenity"="hospital"](around:${radius},${loc.coords.latitude},${loc.coords.longitude});
                      relation["amenity"="hospital"](around:${radius},${loc.coords.latitude},${loc.coords.longitude});
                    );
                    out center;
                `;

                console.log("Fetching directly from Overpass API...");
                const res = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query,
                });

                if (!res.ok) {
                    throw new Error(`Overpass API error: ${res.status}`);
                }

                const data = await res.json();
                console.log("Overpass raw elements received:", data.elements?.length);

                const places: Facility[] = (data.elements || []).map((el: any) => ({
                    id: el.id,
                    name: el.tags?.name || "Unnamed Hospital",
                    type: el.tags?.amenity || "hospital",
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(", ") || "Address not available",
                    phone: el.tags?.phone || el.tags?.['contact:phone'] || null
                }));

                console.log("Mapped Facilities:", places.length);
                setFacilities(places);
            } catch (error: any) {
                console.error("DEBUG Error fetching location/facilities:", error);
                setErrorMsg(error.message || "Could not find nearby hospitals.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const openMaps = (lat: number, lng: number, name: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url);
    };

    if (loading && !location) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {location && (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    showsUserLocation={true}
                >
                    {facilities.map((fac) => (
                        <Marker
                            key={fac.id.toString()}
                            coordinate={{ latitude: fac.lat, longitude: fac.lng }}
                            title={fac.name}
                            description={fac.type}
                            pinColor="#10b981"
                        />
                    ))}
                </MapView>
            )}

            <View style={styles.listContainer}>
                <Text style={styles.title}>Nearby Facilities</Text>
                {facilities.length === 0 ? (
                    <Text style={styles.noDataText}>No hospitals found within 5km.</Text>
                ) : (
                    <FlatList
                        data={facilities}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.type}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <Ionicons name="location-outline" size={16} color="#6b7280" />
                                    <Text style={styles.addressText}>{item.address}</Text>
                                </View>
                                {item.phone && (
                                    <View style={styles.row}>
                                        <Ionicons name="call-outline" size={16} color="#6b7280" />
                                        <Text style={styles.phoneText}>{item.phone}</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => openMaps(item.lat, item.lng, item.name)}
                                >
                                    <Ionicons name="navigate-circle-outline" size={20} color="white" />
                                    <Text style={styles.navButtonText}>Get Directions</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6b7280",
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: "#ef4444",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    map: {
        height: "40%",
        width: "100%",
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 16,
    },
    noDataText: {
        color: "#6b7280",
        textAlign: "center",
        marginTop: 20,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#374151",
        textTransform: "capitalize",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        marginTop: 4,
    },
    addressText: {
        fontSize: 12,
        color: "#6b7280",
        marginLeft: 4,
        flex: 1,
    },
    phoneText: {
        fontSize: 12,
        color: "#10b981",
        marginLeft: 4,
    },
    navButton: {
        backgroundColor: "#10b981",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    navButtonText: {
        color: "white",
        fontWeight: "bold",
        marginLeft: 8,
    }
});
