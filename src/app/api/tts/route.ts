import { NextRequest, NextResponse } from "next/server";
import { sarvamTTS } from "@/ai/sarvam";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { text, languageCode } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const result = await sarvamTTS(text, languageCode || "hi-IN");
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("TTS API Error:", error);
        return NextResponse.json({ error: error.message || "TTS failed" }, { status: 500 });
    }
}
