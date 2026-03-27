import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VERCEL_API = "https://pulsecheckai-orcin.vercel.app";

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

            if (!res.ok) {
                throw new Error("API Connection Failed");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setMessages((prev) => [...prev, data]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: "model", content: "Sorry, I had trouble processing that. Please try again." }]);
            Alert.alert("Network Error", "Unable to reach the AI. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={styles.header}>
                <View style={styles.iconBg}>
                    <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                </View>
                <View>
                    <Text style={styles.title}>Medu AI</Text>
                    <Text style={styles.subtitle}>Your personal health assistant</Text>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.chatArea}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageRow,
                            msg.role === "user" ? styles.rowUser : styles.rowModel
                        ]}
                    >
                        {msg.role === "model" && (
                            <View style={styles.avatarModel}>
                                <Ionicons name="medical" size={14} color="#fff" />
                            </View>
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                msg.role === "user" ? styles.bubbleUser : styles.bubbleModel
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                msg.role === "user" ? styles.textUser : styles.textModel
                            ]}>
                                {msg.content}
                            </Text>
                        </View>
                        {msg.role === "user" && (
                            <View style={styles.avatarUser}>
                                <Ionicons name="person" size={14} color="#fff" />
                            </View>
                        )}
                    </View>
                ))}

                {isLoading && (
                    <View style={[styles.messageRow, styles.rowModel]}>
                        <View style={styles.avatarModel}>
                            <Ionicons name="medical" size={14} color="#fff" />
                        </View>
                        <View style={[styles.messageBubble, styles.bubbleModel, { paddingHorizontal: 16 }]}>
                            <ActivityIndicator size="small" color="#3B82F6" />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#64748B"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !input.trim() || isLoading ? styles.sendDisabled : null]}
                    onPress={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: "#1E293B",
        backgroundColor: "#0F172A",
    },
    iconBg: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: "#172554",
        justifyContent: "center", alignItems: "center"
    },
    title: { fontSize: 18, fontWeight: "800", color: "#F8FAFC" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },

    chatArea: { padding: 16, paddingBottom: 32, gap: 16 },

    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
    rowUser: { justifyContent: "flex-end" },
    rowModel: { justifyContent: "flex-start" },

    avatarModel: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: "#3B82F6",
        justifyContent: "center", alignItems: "center", marginBottom: 4
    },
    avatarUser: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: "#64748B",
        justifyContent: "center", alignItems: "center", marginBottom: 4
    },

    messageBubble: { maxWidth: "75%", padding: 12, paddingHorizontal: 16 },
    bubbleUser: {
        backgroundColor: "#3B82F6",
        borderTopLeftRadius: 18, borderTopRightRadius: 4,
        borderBottomLeftRadius: 18, borderBottomRightRadius: 18
    },
    bubbleModel: {
        backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155",
        borderTopLeftRadius: 4, borderTopRightRadius: 18,
        borderBottomLeftRadius: 18, borderBottomRightRadius: 18
    },

    messageText: { fontSize: 15, lineHeight: 22 },
    textUser: { color: "#fff" },
    textModel: { color: "#E2E8F0" },

    inputArea: {
        flexDirection: "row", alignItems: "center", gap: 10,
        padding: 16, paddingBottom: Platform.OS === "ios" ? 32 : 16,
        backgroundColor: "#0F172A", borderTopWidth: 1, borderTopColor: "#1E293B"
    },
    textInput: {
        flex: 1, backgroundColor: "#1E293B", color: "#F8FAFC",
        borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 15, borderWidth: 1, borderColor: "#334155"
    },
    sendButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: "#3B82F6",
        justifyContent: "center", alignItems: "center"
    },
    sendDisabled: { backgroundColor: "#1E293B", borderColor: "#334155", borderWidth: 1 }
});
