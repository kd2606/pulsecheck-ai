import { NextRequest, NextResponse } from "next/server";
import { chatWithPulse } from "@/ai/flows/pulse-chat";

export async function POST(req: NextRequest) {
    try {
        const { messages, userContext } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        const history = messages.slice(-20);

        // Split into previous history + last user message
        let lastUserIdx = -1;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === "user") { lastUserIdx = i; break; }
        }

        if (lastUserIdx === -1) {
            return NextResponse.json({ error: "No user message found" }, { status: 400 });
        }

        const lastUserContent = history[lastUserIdx].content;
        const previousHistory = history.slice(0, lastUserIdx);

        // Call the dedicated Pulse Genkit flow
        const result = await chatWithPulse(previousHistory, lastUserContent, userContext);
        const responseText = result.content;

        // Stream word by word for the natural typing effect
        const encoder = new TextEncoder();
        const words = responseText.split(" ");

        const stream = new ReadableStream({
            start(controller) {
                let i = 0;
                const send = () => {
                    if (i < words.length) {
                        const chunk = (i === 0 ? "" : " ") + words[i++];
                        const data = { choices: [{ delta: { content: chunk } }] };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                        setTimeout(send, 35);
                    } else {
                        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                        controller.close();
                    }
                };
                send();
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error: any) {
        console.error("[Pulse Route] Unexpected error:", error);
        // Always return 200 SSE so the client never throws
        const encoder = new TextEncoder();
        const msg = { choices: [{ delta: { content: "Pulse abhi rest kar raha hai 😴 Thodi der baad try karo." } }] };
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            }
        });
        return new Response(stream, {
            headers: { "Content-Type": "text/event-stream" },
            status: 200
        });
    }
}
