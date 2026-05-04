import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { audioBase64, duration, fever, breathingDifficulty } = body;
        if (!audioBase64) {
            return NextResponse.json({ error: "audioBase64 field is required" }, { status: 400 });
        }

        // Mock Cough Analysis Results
        const mockResult = {
            triagePriority: breathingDifficulty === "Yes" || fever === "Yes" ? "High Priority" : "Moderate Priority",
            simpleExplanation: "Based on your cough analysis, I detect a dry, persistent cough with occasional wheezing. The cough pattern suggests possible respiratory irritation or early-stage bronchial inflammation. Given your reported symptoms, this condition requires attention and monitoring.",
            otcMedicines: [
                { name: "Cough Suppressant Syrup", dosage: "10ml every 4-6 hours as needed" },
                { name: "Expectorant Tablets", dosage: "1 tablet 3 times daily with water" },
                { name: "Paracetamol", dosage: "500mg every 6 hours if fever present" }
            ],
            precautions: [
                "Stay well hydrated with warm fluids",
                "Avoid cold and dry environments",
                "Use a humidifier to moisten the air",
                "Rest your voice and avoid shouting",
                "Stay away from smoke and strong odors"
            ],
            recommendations: [
                "Monitor temperature twice daily",
                "Seek immediate medical attention if breathing worsens",
                "Continue monitoring for 3-5 days",
                "Practice good hygiene to prevent spread"
            ],
            possibleConditions: [
                "Acute Bronchitis",
                "Upper Respiratory Infection",
                "Allergic Cough"
            ],
            severityScore: Math.floor(Math.random() * 30) + 40 // 40-70%
        };

        return NextResponse.json(mockResult);
    } catch (error: any) {
        console.error("Cough analysis error:", error);
        return NextResponse.json({ error: error.message || "AI service error" }, { status: 500 });
    }
}
