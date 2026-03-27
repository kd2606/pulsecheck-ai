import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const tabs = [
    { name: "dashboard", title: "Home", icon: "grid", iconOutline: "grid-outline" },
    { name: "symptom-checker", title: "Symptom", icon: "medical", iconOutline: "medical-outline" },
    { name: "cough-analysis", title: "Cough", icon: "mic", iconOutline: "mic-outline" },
    { name: "skin-scan", title: "Skin", icon: "scan", iconOutline: "scan-outline" },
    { name: "people", title: "Doctors", icon: "people", iconOutline: "people-outline" },
    { name: "profile", title: "Profile", icon: "person", iconOutline: "person-outline" },
    // hidden tabs
    { name: "mental-health", title: "Mental Health", icon: "pulse", iconOutline: "pulse-outline", hidden: true },
    { name: "vision-scan", title: "Vision Scan", icon: "eye", iconOutline: "eye-outline", hidden: true },
    { name: "chatbot", title: "Chat", icon: "chatbubbles", iconOutline: "chatbubbles-outline", hidden: true },
    { name: "govt-schemes", title: "Schemes", icon: "business", iconOutline: "business-outline", hidden: true },
    { name: "reminders", title: "Reminders", icon: "notifications", iconOutline: "notifications-outline", hidden: true },
    { name: "nearby-hospitals", title: "Nearby", icon: "medkit", iconOutline: "medkit-outline", hidden: true },
];

function GlassTabBar(props: any) {
    return (
        <BlurView intensity={60} tint="dark" style={styles.tabBarBlur}>
            <View style={styles.tabBarInner}>
                {props.state.routes.map((route: any, index: number) => {
                    const tab = tabs.find(t => t.name === route.name);
                    if (!tab || tab.hidden) return null;
                    const isFocused = props.state.index === index;
                    const color = isFocused ? "#34D399" : "#4B5563";

                    const onPress = () => {
                        const event = props.navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) {
                            props.navigation.navigate(route.name);
                        }
                    };

                    return (
                        <View key={route.key} style={styles.tabItem} onTouchEnd={onPress}>
                            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                                <Ionicons name={(isFocused ? tab.icon : tab.iconOutline) as any} size={22} color={color} />
                            </View>
                            <View style={styles.tabLabel}>
                                <Ionicons name="ellipse" size={5} color={isFocused ? "#34D399" : "transparent"} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </BlurView>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <GlassTabBar {...props} />}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        href: tab.hidden ? null : undefined,
                    }}
                />
            ))}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarBlur: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    tabBarInner: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        paddingTop: 10,
        backgroundColor: "rgba(6,14,30,0.55)",
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    tabLabel: {
        alignItems: "center",
        height: 6,
    },
    iconWrap: {
        width: 42,
        height: 36,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    iconWrapActive: {
        backgroundColor: "rgba(52,211,153,0.12)",
        borderWidth: 1,
        borderColor: "rgba(52,211,153,0.2)",
    },
});
