import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuthContext } from "../src/context/AuthProvider";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav() {
    const { user, loading } = useAuthContext();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        const inAuthGroup = segments[0] === "(auth)";
        if (!user && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (user && inAuthGroup) {
            router.replace("/(tabs)/dashboard");
        }
    }, [user, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" }}>
                <ActivityIndicator size="large" color="#22C55E" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
