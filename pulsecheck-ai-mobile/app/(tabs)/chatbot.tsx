import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

const VERCEL_API = "https://pulsecheckai-peach.vercel.app";

type ChatMessage = {
    role: "user" | "model" | "system";
    content: string;
};

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "model", content: "Hi! I'm Medu, your PulseCheck AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const res = await fetch(`${VERCEL_API}/api/pulse?stream=false`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!res.ok) throw new Error("API Connection Failed");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setMessages((prev) => [...prev, data]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "I'm having trouble connecting right now. Please check your internet and try again." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={["#060E1E", "#0D1B3E", "#0A1A2F", "#060E1E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Glow blobs */}
            <View style={s.blob1} />
            <View style={s.blob2} />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    {/* ─── HEADER ─── */}
                    <BlurView intensity={50} tint="dark" style={s.header}>
                        <View style={s.iconBg}>
                            <Ionicons name="chatbubbles" size={22} color="#60A5FA" />
                        </View>
                        <View>
                            <Text style={s.title}>Medu AI</Text>
                            <Text style={s.subtitle}>Your personal health assistant</Text>
                        </View>
                    </BlurView>

                    {/* ─── MESSAGES ─── */}
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={s.chatArea}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((msg, index) => (
                            <View
                                key={index}
                                style={[s.messageRow, msg.role === "user" ? s.rowUser : s.rowModel]}
                            >
                                {msg.role === "model" && (
                                    <View style={s.avatarModel}>
                                        <Ionicons name="medical" size={13} color="#fff" />
                                    </View>
                                )}

                                {msg.role === "user" ? (
                                    /* User bubble: solid gradient */
                                    <LinearGradient
                                        colors={["#3B82F6", "#2563EB"]}
                                        style={[s.messageBubble, s.bubbleUser]}
                                    >
                                        <Text style={[s.messageText, s.textUser]}>{msg.content}</Text>
                                    </LinearGradient>
                                ) : (
                                    /* AI bubble: frosted glass */
                                    <BlurView intensity={50} tint="dark" style={[s.messageBubble, s.bubbleModel]}>
                                        <Text style={[s.messageText, s.textModel]}>{msg.content}</Text>
                                    </BlurView>
                                )}

                                {msg.role === "user" && (
                                    <View style={s.avatarUser}>
                                        <Ionicons name="person" size={13} color="#fff" />
                                    </View>
                                )}
                            </View>
                        ))}

                        {isLoading && (
                            <View style={[s.messageRow, s.rowModel]}>
                                <View style={s.avatarModel}>
                                    <Ionicons name="medical" size={13} color="#fff" />
                                </View>
                                <BlurView intensity={50} tint="dark" style={[s.messageBubble, s.bubbleModel]}>
                                    <ActivityIndicator size="small" color="#60A5FA" />
                                </BlurView>
                            </View>
                        )}
                    </ScrollView>

                    {/* ─── INPUT BAR ─── */}
                    <BlurView intensity={60} tint="dark" style={s.inputArea}>
                        <TextInput
                            style={s.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#475569"
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={handleSend}
                            maxLength={500}
                            multiline
                        />
                        <TouchableOpacity
                            style={[s.sendButton, (!input.trim() || isLoading) && s.sendDisabled]}
                            onPress={handleSend}
                            disabled={!input.trim() || isLoading}
                        >
                            <LinearGradient
                                colors={input.trim() && !isLoading ? ["#3B82F6", "#2563EB"] : ["#1E293B", "#1E293B"]}
                                style={s.sendGradient}
                            >
                                <Ionicons name="send" size={17} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    blob1: { position: "absolute", top: -60, left: -40, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(96,165,250,0.08)" },
    blob2: { position: "absolute", bottom: 100, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(167,139,250,0.07)" },

    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    iconBg: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: "rgba(96,165,250,0.18)",
        borderWidth: 1, borderColor: "rgba(96,165,250,0.25)",
        justifyContent: "center", alignItems: "center",
    },
    title: { fontSize: 17, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },

    chatArea: { padding: 16, paddingBottom: 24, gap: 12 },

    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    rowUser: { justifyContent: "flex-end" },
    rowModel: { justifyContent: "flex-start" },

    avatarModel: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: "#3B82F6",
        justifyContent: "center", alignItems: "center",
    },
    avatarUser: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: "rgba(99,102,241,0.7)",
        justifyContent: "center", alignItems: "center",
    },

    messageBubble: { maxWidth: "76%", paddingVertical: 10, paddingHorizontal: 14 },
    bubbleUser: {
        borderTopLeftRadius: 18, borderTopRightRadius: 4,
        borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
        overflow: "hidden",
    },
    bubbleModel: {
        borderTopLeftRadius: 4, borderTopRightRadius: 18,
        borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
        overflow: "hidden",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    },

    messageText: { fontSize: 14, lineHeight: 21 },
    textUser: { color: "#fff" },
    textModel: { color: "#CBD5E1" },

    inputArea: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        paddingBottom: Platform.OS === "ios" ? 28 : 14,
        borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
        overflow: "hidden",
    },
    textInput: {
        flex: 1,
        color: "#F8FAFC", fontSize: 14,
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
        maxHeight: 120,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    },
    sendButton: { borderRadius: 22, overflow: "hidden" },
    sendGradient: { width: 44, height: 44, justifyContent: "center", alignItems: "center", borderRadius: 22 },
    sendDisabled: { opacity: 0.5 },
});
