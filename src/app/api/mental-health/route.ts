import { NextResponse } from "next/server";
import { analyzeMentalHealth } from "@/ai/flows/mental-health";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { answers, voiceMetrics } = body;

        if (!answers || !voiceMetrics) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await analyzeMentalHealth({ answers, voiceMetrics });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mental Health Flow Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze mental health" }, { status: 500 });
    }
}
