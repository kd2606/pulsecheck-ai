import { NextResponse } from "next/server";
import { analyzeCardioCheck, CardioCheckInput } from "@/ai/flows/cardio-check";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            age,
            gender,
            bmi,
            restingHR,
            chestPainType,
            exerciseAngina,
            bloodSugar,
            smokerTarget
        } = body;

        // Hardcoded Red Flag Override 
        // Do not rely solely on LLM to classify critical textbook emergencies
        if (chestPainType === "Typical Angina") {
            console.log("Cardio Check: Red Flag Override Triggered - Typical Angina");
            return NextResponse.json({
                triagePriority: "High Priority",
                wellnessScore: 10,
                overallAssessment: "Your reported symptoms match critical emergency criteria. Stop all activities. This system cannot diagnose, but your symptoms indicate a severe potential risk that requires immediate emergency clinical evaluation.",
                precautions: [
                    "Stop what you are doing and sit or lie down immediately.",
                    "If you are alone, call out for help or contact emergency services immediately.",
                    "Do not drive yourself to the hospital."
                ],
                recommendations: [
                    "Contact emergency medical services (e.g., 108/911).",
                    "Unlock your door to allow emergency responders to enter."
                ],
                seekEmergency: true,
                disclaimer: "This is an AI wellness triage tool. However, your symptoms require IMMEDIATE EMERGENCY RESPONDER evaluation. Do not delay."
            });
        }

        const input: CardioCheckInput = {
            age: Number(age),
            gender,
            bmi: bmi ? Number(bmi) : undefined,
            restingHR: restingHR ? Number(restingHR) : undefined,
            chestPainType,
            exerciseAngina,
            bloodSugar,
            smokerTarget
        };

        const result = await analyzeCardioCheck(input);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("CardioCheck Route Error:", error);
        return NextResponse.json(
            { error: "Failed to process cardio assessment. Please try again." },
            { status: 500 }
        );
    }
}
