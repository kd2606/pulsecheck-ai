import { NextRequest, NextResponse } from "next/server";
import { analyzeSkinScan } from "@/ai/flows/skin-scan";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;
        if (!imageBase64) {
            return NextResponse.json({ error: "imageBase64 field is required" }, { status: 400 });
        }
        const result = await analyzeSkinScan(imageBase64);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Skin scan error:", error);
        return NextResponse.json({ error: error.message || "AI service error" }, { status: 500 });
    }
}
