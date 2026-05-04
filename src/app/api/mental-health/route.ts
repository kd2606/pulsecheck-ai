import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { answers, voiceMetrics } = body;

        if (!answers || !voiceMetrics) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Mock Mental Health Screen Results
        const mockResult = {
            overallScore: Math.floor(Math.random() * 20) + 60, // 60-80%
            triagePriority: "Moderate Priority",
            simpleExplanation: "Based on your assessment responses and voice analysis, you appear to be experiencing mild to moderate stress levels. Your speech patterns show some signs of anxiety, but overall your mental health indicators are within a manageable range. This is common in today's fast-paced lifestyle and can be effectively addressed with proper self-care and stress management techniques.",
            otcMedicines: [
                { name: "Stress Relief Supplements", dosage: "As directed on package" },
                { name: "Sleep Aid Tablets", dosage: "30 minutes before bedtime if needed" }
            ],
            precautions: [
                "Maintain a regular sleep schedule",
                "Practice daily relaxation techniques",
                "Limit caffeine and alcohol intake",
                "Stay physically active with regular exercise",
                "Take regular breaks from work and screens"
            ],
            recommendations: [
                "Consider talking to a trusted friend or family member",
                "Practice mindfulness or meditation for 10 minutes daily",
                "Keep a journal to track your thoughts and feelings",
                "Seek professional counseling if symptoms persist"
            ],
            mentalHealthIndicators: {
                stressLevel: "Moderate",
                anxietyLevel: "Mild",
                moodStability: "Fair",
                sleepQuality: "Needs Improvement",
                socialEngagement: "Good"
            },
            copingStrategies: [
                "Deep breathing exercises",
                "Progressive muscle relaxation",
                "Positive affirmations",
                "Time management techniques",
                "Social support networks"
            ]
        };

        return NextResponse.json(mockResult);
    } catch (error: any) {
        console.error("Mental Health Flow Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze mental health" }, { status: 500 });
    }
}
