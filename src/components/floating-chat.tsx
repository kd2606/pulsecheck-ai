"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, User, Mic, HeartPulse, Activity, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useUser } from "@/firebase/auth/useUser";
import { db } from "@/firebase/clientApp";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export type ChatMessage = {
    id?: string;
    role: "user" | "model" | "system";
    content: string;
    timestamp?: Date;
    type?: "text" | "card";
    cardData?: {
        title: string;
        description: string;
        href: string;
        icon: string;
    };
};

const QUICK_REPLIES = [
    "💊 How am I doing?",
    "🤒 Check my symptoms",
    "🏥 Find nearby hospital",
    "📊 My health score"
];

const WELCOME_MESSAGE = "👋 Hi! I'm Pulse, your personal health agent.\nI can help you check symptoms, understand your health data, find nearby hospitals, or just answer health questions.\nHow can I help you today?";

// Keyword to route matching
const KEYWORD_ROUTES = [
    { keywords: ["symptom", "symptoms", "bimaar", "bimari"], feature: "Symptom Checker", desc: "Analyze what you're feeling", href: "/en/symptom-checker", icon: "🤒" },
    { keywords: ["skin", "twacha", "daane", "rash"], feature: "Skin Scan", desc: "Analyze a skin condition", href: "/en/skin-scan", icon: "🔍" },
    { keywords: ["hospital", "doctor", "aspatal", "clinic"], feature: "Nearby Hospitals", desc: "Find closest medical help", href: "/en/nearby-hospitals", icon: "🏥" },
    { keywords: ["reminder", "yaad", "dawai", "pill"], feature: "Reminders", desc: "Manage your medical reminders", href: "/en/reminders", icon: "💊" },
    { keywords: ["scheme", "yojana", "sarkari", "govt"], feature: "Govt Schemes", desc: "Explore health financial aid", href: "/en/govt-schemes", icon: "📜" },
    { keywords: ["family", "parivaar", "member", "child"], feature: "Family Profiles", desc: "Manage dependent profiles", href: "/en/people", icon: "👨‍👩‍👧‍👦" },
];

export function FloatingChat() {
    const { user } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "model", content: WELCOME_MESSAGE, timestamp: new Date(), type: "text" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [agentContext, setAgentContext] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch user context when chat opens
    useEffect(() => {
        let fallbackTimeout: NodeJS.Timeout;

        const fetchContext = async () => {
            if (!isOpen || !user) return;
            // Only fetch once per session
            if (agentContext) return;

            const systemMsgId = "system-fetching";
            setMessages(prev => [...prev, { id: systemMsgId, role: "system", content: "🔍 Pulse is checking your health data...", timestamp: new Date(), type: "text" }]);

            fallbackTimeout = setTimeout(() => {
                setMessages(prev => prev.filter(m => m.id !== systemMsgId));
            }, 3000);

            try {
                const docRef = doc(db, "users", user.uid, "agentContext", "data");
                let docSnap = await getDoc(docRef);

                clearTimeout(fallbackTimeout);

                let data;
                if (!docSnap.exists()) {
                    // Seed dummy data
                    data = {
                        lastSeen: serverTimestamp(),
                        holisticScore: 78,
                        symptomHistory: ["fever", "headache"],
                        lastScan: { type: "skin", severity: "high", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // 2 days ago
                        reminders: [{ name: "BP Medicine", time: "9:00 AM", dueToday: true }]
                    };
                    await setDoc(docRef, data, { merge: true });
                } else {
                    data = docSnap.data();
                }

                setAgentContext(data);

                // Proactive message logic
                let proactiveMsg = "";
                if (data.reminders && data.reminders.some((r: any) => r.dueToday)) {
                    const reminder = data.reminders.find((r: any) => r.dueToday);
                    proactiveMsg = `💊 Yaad dila doon — aaj ${reminder.name} lena mat bhoolna!`;
                } else if (data.lastScan && data.lastScan.severity === "high") {
                    // Check if within 7 days. Assuming date is a firestore timestamp or JS Date
                    const scanDate = data.lastScan.date instanceof Timestamp ? data.lastScan.date.toDate() : new Date(data.lastScan.date);
                    const diffDays = (new Date().getTime() - scanDate.getTime()) / (1000 * 3600 * 24);
                    if (diffDays <= 7) {
                        proactiveMsg = `⚠️ Aapka recent ${data.lastScan.type} scan concerning tha. Kya aapne doctor se mila?`;
                    } else if (data.holisticScore < 60) {
                        proactiveMsg = `📉 Aapka health score ${data.holisticScore} hai jo thoda kam hai. Baat karte hain?`;
                    }
                } else if (data.holisticScore < 60) {
                    proactiveMsg = `📉 Aapka health score ${data.holisticScore} hai jo thoda kam hai. Baat karte hain?`;
                }

                setMessages(prev => {
                    // Remove the fetching message
                    const filtered = prev.filter(m => m.id !== systemMsgId);
                    if (proactiveMsg) {
                        return [...filtered, { role: "model", content: proactiveMsg, timestamp: new Date(), type: "text" }];
                    }
                    return filtered;
                });

            } catch (err) {
                clearTimeout(fallbackTimeout);
                console.error("Failed to fetch agent context", err);
                // Just remove the fetching message and continue seamlessly
                setMessages(prev => prev.filter(m => m.id !== systemMsgId));
            }
        };

        fetchContext();

        return () => {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
    }, [isOpen, user, agentContext]);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setInput("");
            toast.info("Listening...");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isOpen, isLoading]);

    const checkForActionCards = (text: string) => {
        const lowerText = text.toLowerCase();
        for (const route of KEYWORD_ROUTES) {
            if (route.keywords.some(kw => lowerText.includes(kw))) {
                setMessages(prev => [
                    ...prev,
                    {
                        role: "model",
                        content: "",
                        type: "card",
                        timestamp: new Date(),
                        cardData: {
                            title: route.feature,
                            description: route.desc,
                            href: route.href,
                            icon: route.icon
                        }
                    }
                ]);
                break; // Only push one card per message to avoid spam
            }
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: "user", content: text.trim(), timestamp: new Date(), type: "text" };
        setInput("");

        setMessages(prev => {
            const updated = [...prev, userMessage];
            if (updated.length > 20) return updated.slice(updated.length - 20);
            return updated;
        });

        // Optional: Instantly push relevant feature card based on user's message
        // Removed `checkForActionCards(text)` to prevent duplicate cards.
        // Action cards are now only checked against the final AI output.

        setIsLoading(true);

        try {
            // Create a placeholder message for the streaming response
            const modelMsgId = Date.now().toString();
            setMessages(prev => {
                const newMsg: ChatMessage = { id: modelMsgId, role: "model", content: "", timestamp: new Date(), type: "text" };
                const updated = [...prev, newMsg];
                if (updated.length > 20) return updated.slice(updated.length - 20);
                return updated;
            });

            const response = await fetch("/api/pulse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].filter(m => m.type !== "card" && m.role !== "system").slice(-20),
                    userContext: agentContext
                }),
            });

            if (!response.ok) throw new Error("Network response was not ok");
            if (!response.body) throw new Error("No response body");

            setIsLoading(false); // hide bouncing dots now that streaming starts

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullAiResponse = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices[0]?.delta?.content || "";
                                if (content) {
                                    fullAiResponse += content;
                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === modelMsgId
                                                ? { ...msg, content: msg.content + content }
                                                : msg
                                        )
                                    );
                                }
                            } catch (e) {
                                console.warn("Error parsing stream chunk", e);
                            }
                        }
                    }
                }
            }

            // Optional: push action cards based on user input or AI output
            checkForActionCards(`${text} ${fullAiResponse}`);

        } catch (error) {
            console.error("Error communicating with Pulse:", error);
            setIsLoading(false);
            setMessages(prev => {
                const updated = [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "model" as const,
                        content: "Pulse abhi rest kar raha hai 😴 Thodi der baad try karo.",
                        timestamp: new Date(),
                        type: "text" as const
                    }
                ];
                if (updated.length > 20) return updated.slice(updated.length - 20);
                return updated;
            });
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    const formatTime = (date?: Date) => {
        if (!date) return "";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCardClick = (href: string) => {
        setIsOpen(false);
        router.push(href);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-[100vw] h-[100dvh] sm:h-[520px] sm:w-[380px] sm:rounded-2xl shadow-2xl border bg-background overflow-hidden flex flex-col fixed inset-0 sm:static sm:inset-auto z-50"
                    >
                        {/* Header */}
                        <div className="bg-card border-b p-3 flex items-center justify-between shadow-sm shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 border border-emerald-500/20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <HeartPulse className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-none tracking-tight">Pulse</h3>
                                    <p className="text-xs text-muted-foreground mt-1 tracking-tight">Health Agent</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 dark:bg-background">
                            {messages.map((msg, idx) => {
                                if (msg.type === "card" && msg.cardData) {
                                    return (
                                        <div key={idx} className="flex items-start gap-2 max-w-[85%] mr-auto">
                                            <div className="bg-card border shadow-sm rounded-xl p-3 w-full border-l-4 border-l-teal-500">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xl">{msg.cardData.icon}</span>
                                                    <span className="font-bold text-sm">{msg.cardData.title}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-3">{msg.cardData.description}</p>
                                                <Button
                                                    onClick={() => handleCardClick(msg.cardData!.href)}
                                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs font-semibold"
                                                >
                                                    Open <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                }

                                if (msg.role === "system") {
                                    return (
                                        <div key={idx} className="flex justify-center w-full my-2">
                                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full animate-pulse">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                                    >
                                        <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                            <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-teal-600 text-white rounded-tr-sm" : "bg-card border shadow-sm rounded-tl-sm text-foreground"}`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {isLoading && (
                                <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                                    <div className="p-4 rounded-2xl bg-card border shadow-sm rounded-tl-sm flex items-center gap-1.5 h-10">
                                        <span className="h-1.5 w-1.5 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-1.5 w-1.5 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-1.5 w-1.5 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Replies */}
                        <AnimatePresence>
                            {messages.filter(m => m.role !== "system").length === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3 pb-2 bg-muted/20 dark:bg-background overflow-x-auto no-scrollbar"
                                >
                                    <div className="flex gap-2 w-max pb-2">
                                        {QUICK_REPLIES.map((reply, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(reply)}
                                                className="px-3 py-1.5 bg-card border shadow-sm rounded-full text-xs hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors whitespace-nowrap whitespace-pre"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer */}
                        <div className="p-3 border-t bg-card shrink-0">
                            <form onSubmit={onSubmit} className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={startListening}
                                    variant="ghost"
                                    size="icon"
                                    className={`shrink-0 rounded-full h-10 w-10 transition-colors ${isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-muted-foreground hover:bg-muted'}`}
                                    title="Voice Input"
                                    disabled={isLoading}
                                >
                                    {isListening ? (
                                        <span className="relative flex h-5 w-5 items-center justify-center">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <Mic className="relative h-5 w-5" />
                                        </span>
                                    ) : (
                                        <Mic className="h-5 w-5" />
                                    )}
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Ask Pulse anything..."}
                                    className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-emerald-500/50 bg-background h-10"
                                    disabled={isLoading || isListening}
                                    autoComplete="off"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-10 w-10 rounded-full shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group ${isOpen ? 'bg-muted text-foreground' : 'bg-emerald-500 text-white'
                    }`}
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <HeartPulse className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 0 : -90, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </motion.div>
                {/* Ping animation when closed */}
                {!isOpen && (
                    <span className="absolute right-0 top-0 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white/90"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
