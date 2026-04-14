import { NextResponse } from "next/server";
import { analyzeVisionScan } from "@/ai/flows/vision-scan";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, screenTime, sleepHours, stressLevel } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        const result = await analyzeVisionScan({ imageBase64, screenTime, sleepHours, stressLevel });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Vision Scan Flow Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze vision/face" }, { status: 500 });
    }
}
