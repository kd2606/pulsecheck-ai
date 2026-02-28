import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

const tabs = [
    { name: "dashboard", title: "Home", icon: "grid", iconOutline: "grid-outline" },
    { name: "symptom-checker", title: "Symptoms", icon: "medical", iconOutline: "medical-outline" },
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
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: "#34D399",
                tabBarInactiveTintColor: "#334155",
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        href: tab.hidden ? null : undefined,
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                                <Ionicons
                                    name={(focused ? tab.icon : tab.iconOutline) as any}
                                    size={22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "#060E1E",
        borderTopWidth: 1,
        borderTopColor: "#0F1929",
        paddingBottom: 8,
        paddingTop: 8,
        height: 68,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 0.3,
        marginTop: 0,
    },
    tabItem: {
        paddingTop: 4,
    },
    iconWrap: {
        width: 36,
        height: 32,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    iconWrapActive: {
        backgroundColor: "rgba(52,211,153,0.1)",
    },
});
