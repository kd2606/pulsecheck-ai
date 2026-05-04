import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, screenTime, sleepHours, stressLevel } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // Mock Vision Scan Results
        const mockResult = {
            fatigueIndex: Math.floor(Math.random() * 30) + 20, // 20-50%
            triagePriority: stressLevel === "High" ? "High Fatigue Priority" : "Elevated Strain Profile",
            simpleExplanation: "Your vision analysis shows moderate signs of eye strain and fatigue. The dark circles and slight puffiness around your eyes suggest you may benefit from more rest and reduced screen time. Consider taking regular breaks during screen use and ensuring adequate sleep.",
            otcMedicines: [
                { name: "Lubricating Eye Drops", dosage: "1-2 drops in each eye, 2-3 times daily" },
                { name: "Artificial Tears", dosage: "Use as needed for dryness relief" }
            ],
            precautions: [
                "Take 20-20-20 breaks: every 20 minutes, look at something 20 feet away for 20 seconds",
                "Ensure proper lighting when using screens",
                "Maintain 6-8 hours of quality sleep",
                "Stay hydrated throughout the day",
                "Consider blue light filters on devices"
            ],
            recommendations: [
                "Schedule an eye exam if symptoms persist",
                "Adjust screen brightness and contrast",
                "Practice good eye hygiene"
            ]
        };

        return NextResponse.json(mockResult);
    } catch (error: any) {
        console.error("Vision Scan Flow Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze vision/face" }, { status: 500 });
    }
}
