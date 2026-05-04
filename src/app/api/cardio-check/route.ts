import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

        // Mock Cardio Check Results
        const ageNum = Number(age);
        const bmiNum = bmi ? Number(bmi) : 25;
        const restingHRNum = restingHR ? Number(restingHR) : 72;
        
        // Calculate mock wellness score based on inputs
        let wellnessScore = 75;
        if (ageNum > 50) wellnessScore -= 10;
        if (bmiNum > 25) wellnessScore -= 15;
        if (restingHRNum > 80) wellnessScore -= 10;
        if (smokerTarget === "Yes") wellnessScore -= 20;
        if (bloodSugar === "Yes") wellnessScore -= 15;
        if (exerciseAngina === "Yes") wellnessScore -= 25;

        const mockResult = {
            triagePriority: wellnessScore < 50 ? "High Priority" : wellnessScore < 70 ? "Elevated Priority" : "Low Priority",
            wellnessScore: Math.max(wellnessScore, 20),
            overallAssessment: `Based on your cardiovascular assessment, your wellness score is ${Math.max(wellnessScore, 20)}/100. ${ageNum > 40 ? 'At your age, ' : ''}your heart health indicators suggest ${wellnessScore < 60 ? 'some areas that need attention' : wellnessScore < 80 ? 'moderate cardiovascular health' : 'good heart health'}. Regular monitoring and lifestyle adjustments can help improve your cardiovascular wellness.`,
            precautions: [
                "Monitor blood pressure regularly",
                "Maintain a heart-healthy diet low in saturated fats",
                "Engage in regular moderate exercise (30 minutes daily)",
                "Avoid smoking and limit alcohol consumption",
                "Manage stress through relaxation techniques"
            ],
            recommendations: [
                "Schedule regular check-ups with your healthcare provider",
                "Consider cardiac screening if you have risk factors",
                "Maintain a healthy weight through diet and exercise",
                "Stay hydrated and limit processed foods",
                "Get adequate sleep (7-8 hours nightly)"
            ],
            riskFactors: [
                ...(smokerTarget === "Yes" ? ["Smoking"] : []),
                ...(bloodSugar === "Yes" ? ["High Blood Sugar"] : []),
                ...(bmiNum > 25 ? ["Elevated BMI"] : []),
                ...(ageNum > 45 ? ["Age over 45"] : []),
                ...(restingHRNum > 80 ? ["Elevated Resting Heart Rate"] : [])
            ],
            seekEmergency: false
        };

        return NextResponse.json(mockResult);
    } catch (error: any) {
        console.error("CardioCheck Route Error:", error);
        return NextResponse.json(
            { error: "Failed to process cardio assessment. Please try again." },
            { status: 500 }
        );
    }
}
