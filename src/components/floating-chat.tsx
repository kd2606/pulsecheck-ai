"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI, ChatMessage } from "@/ai/flows/chat";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function FloatingChat() {
    // Attempting to fetch translations, falling back if not found.
    let t: any;
    try {
        t = useTranslations("chat");
    } catch {
        t = (key: string) => {
            const fallbacks: Record<string, string> = {
                "title": "Medu",
                "placeholder": "Type a message...",
                "welcome": "Hi! I'm Medu, your PulseCheck AI assistant. How can I help you today?"
            };
            return fallbacks[key] || key;
        };
    }

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "model", content: t("welcome") }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const history = newMessages.slice(0, -1);
            const response = await chatWithAI(history, userMessage);
            setMessages((prev) => [...prev, response]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => [...prev, { role: "model", content: "Sorry, I had trouble processing that. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
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
                        className="w-[90vw] sm:w-[350px] shadow-2xl rounded-2xl border bg-background overflow-hidden flex flex-col"
                        style={{ height: '500px', maxHeight: '70vh' }}
                    >
                        {/* Header */}
                        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <span className="font-semibold text-sm">{t("title")}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground hover:bg-primary/90 rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"}`}>
                                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border shadow-sm rounded-tl-sm"}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted text-foreground border flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-background border shadow-sm rounded-tl-sm flex items-center gap-1">
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t bg-background">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={startListening}
                                    variant="ghost"
                                    size="icon"
                                    className={`shrink-0 rounded-full h-10 w-10 transition-colors ${isListening ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'text-muted-foreground hover:bg-muted'}`}
                                    title="Voice Input"
                                    disabled={isLoading}
                                >
                                    {isListening ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            <Mic className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <Mic className="h-5 w-5" />
                                    )}
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Listening..." : t("placeholder")}
                                    className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary h-10"
                                    disabled={isLoading || isListening}
                                    autoComplete="off"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-10 w-10 rounded-full shrink-0"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center relative overflow-hidden group"
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
                    <span className="absolute right-0 top-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
