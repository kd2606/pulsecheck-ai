"use server";

import { generateWithModelFallback } from "@/ai/generate-with-fallback";

export type PulseChatMessage = {
    role: "user" | "model";
    content: string;
};

const PULSE_SYSTEM_PROMPT = `You are Pulse, an empathetic AI health agent for PulseCheck AI — a rural health platform for India.
YOUR PERSONALITY:
- Warm & simple for general questions
- Clinical & detailed for specific medical queries
- Motivating for health habit questions

CRITICAL LANGUAGE RULE:
You MUST always reply in the EXACT same language the user wrote their message in.

- User writes in Hindi → Reply in Hindi
- User writes in English → Reply in English
- User writes in Hinglish (mix) → Reply in Hinglish
- User writes in any other Indian language (Tamil, Telugu, Bengali, Marathi, Gujarati etc.) → Reply in that same language

NEVER switch languages unless the user switches first.
NEVER assume a default language.
Auto-detect the user's language from their message and mirror it exactly.

YOUR RULES:
- For any symptom: always give verdict: 🔴 Visit doctor TODAY / 🟡 Monitor 24-48hrs / 🟢 Rest at home
- For serious symptoms (chest pain, difficulty breathing, high fever in child): say "Call 108 immediately" FIRST
- Never make definitive diagnoses
- Keep responses short — max 4-5 lines
- End serious responses with the disclaimer in the SAME language as the user`;

export async function chatWithPulse(history: PulseChatMessage[], newMessage: string, userContext?: any): Promise<PulseChatMessage> {
    try {
        let dynamicPrompt = PULSE_SYSTEM_PROMPT;

        if (userContext) {
            const formatReminders = (reminders: any[]) => {
                if (!reminders || reminders.length === 0) return "None";
                return reminders.filter(r => r.dueToday).map(r => `${r.name} at ${r.time}`).join(", ") || "None";
            };

            const contextBlock = `
USER HEALTH CONTEXT:
Holistic Score: ${userContext.holisticScore || 'Unknown'}/100
Recent Symptoms: ${(userContext.symptomHistory || []).join(", ") || 'None'}
Last Scan: ${userContext.lastScan ? `${userContext.lastScan.type} - ${userContext.lastScan.severity}` : 'No scans'}
Reminders Due Today: ${formatReminders(userContext.reminders)}

Use this context to give personalized responses.
If user asks "how am I doing?" or "mera health kaisa hai?" — answer using this real data.`;

            dynamicPrompt += `\n\n${contextBlock}`;
        }

        let validHistory: PulseChatMessage[] = [];
        for (const m of history) {
            if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === m.role) {
                validHistory[validHistory.length - 1].content += "\n\n" + m.content;
            } else {
                validHistory.push({ ...m });
            }
        }

        // Ensure first history item is from the user for provider compatibility.
        if (validHistory.length > 0 && validHistory[0].role !== "user") {
            validHistory.shift();
        }

        const formattedHistory = validHistory.map((m) => ({
            role: m.role,
            content: [{ text: m.content }],
        }));

        const { text } = await generateWithModelFallback({
            system: dynamicPrompt,
            messages: [
                ...formattedHistory,
                { role: "user", content: [{ text: newMessage }] },
            ],
            config: { temperature: 0.7 }
        });

        return { role: "model", content: text };
    } catch (error: any) {
        console.error("[Pulse Flow] Error:", error);
        if (error?.status === 429 || error?.message?.includes("429")) {
            return { role: "model", content: "A lot of people are asking right now 😊 Please wait a minute and try again." };
        }
        return { role: "model", content: "Pulse is resting right now 😴 Please try again later." };
    }
}
