import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tabs = [
    { name: "dashboard", title: "Dashboard", icon: "grid-outline" },
    { name: "symptom-checker", title: "Symptoms", icon: "medical-outline" },
    { name: "cough-analysis", title: "Cough", icon: "mic-outline" },
    { name: "skin-scan", title: "Skin", icon: "scan-outline" },
    { name: "people", title: "Doctors", icon: "people-outline" },
    { name: "profile", title: "Profile", icon: "person-outline" },
    { name: "mental-health", title: "Mental Health", icon: "brain-outline", hidden: true },
    { name: "vision-scan", title: "Vision Scan", icon: "eye-outline", hidden: true },
    { name: "chatbot", title: "Medu Chat", icon: "chatbubbles-outline", hidden: true },
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#1E293B",
                    borderTopColor: "#334155",
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    paddingTop: 6,
                    height: 64,
                },
                tabBarActiveTintColor: "#22C55E",
                tabBarInactiveTintColor: "#64748B",
                tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        href: tab.hidden ? null : undefined,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name={tab.icon as any} size={size} color={color} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}
