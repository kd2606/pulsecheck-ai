import { NextRequest, NextResponse } from "next/server";
import { checkSymptoms } from "@/ai/flows/symptom-checker";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { symptoms, age, gender } = body;
        if (!symptoms) {
            return NextResponse.json({ error: "symptoms field is required" }, { status: 400 });
        }
        const result = await checkSymptoms({ symptoms, age, gender });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Symptom checker error:", error);
        return NextResponse.json({ error: error.message || "AI service error" }, { status: 500 });
    }
}
