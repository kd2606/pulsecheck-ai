import { NextRequest, NextResponse } from "next/server";
import { analyzeCough } from "@/ai/flows/cough-analysis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { audioBase64, duration, fever, breathingDifficulty } = body;
        if (!audioBase64) {
            return NextResponse.json({ error: "audioBase64 field is required" }, { status: 400 });
        }
        const result = await analyzeCough({ audioBase64, duration, fever, breathingDifficulty });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Cough analysis error:", error);
        return NextResponse.json({ error: error.message || "AI service error" }, { status: 500 });
    }
}
