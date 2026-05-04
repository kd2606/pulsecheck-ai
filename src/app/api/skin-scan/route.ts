import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64, itchingLevel, spreadRate, recentChanges } = body;
        if (!imageBase64) {
            return NextResponse.json({ error: "imageBase64 field is required" }, { status: 400 });
        }

        // Mock Skin Scan Results
        const mockResult = {
            triagePriority: itchingLevel === "Severe" ? "High Priority" : "Moderate Priority",
            simpleExplanation: "Your skin analysis shows mild to moderate inflammation with some redness and irritation. Based on the symptoms you've described, this appears to be a common skin condition that typically responds well to basic skincare and over-the-counter treatments. The condition doesn't appear to be severe but should be monitored.",
            otcMedicines: [
                { name: "Hydrocortisone Cream 1%", dosage: "Apply thin layer to affected area 2-3 times daily" },
                { name: "Moisturizing Lotion", dosage: "Apply 2-3 times daily, especially after bathing" },
                { name: "Antihistamine Tablets", dosage: "1 tablet daily if itching is severe" }
            ],
            precautions: [
                "Avoid scratching the affected area to prevent infection",
                "Use gentle, fragrance-free cleansers",
                "Apply cool compresses to reduce inflammation",
                "Wear loose-fitting cotton clothing",
                "Avoid harsh soaps and hot water"
            ],
            recommendations: [
                "Keep the area clean and dry",
                "Use hypoallergenic skincare products",
                "Monitor for changes in size or color",
                "Consult a dermatologist if condition worsens"
            ],
            possibleConditions: [
                "Contact Dermatitis",
                "Eczema",
                "Allergic Reaction"
            ]
        };

        return NextResponse.json(mockResult);
    } catch (error: any) {
        console.error("Skin scan error:", error);
        return NextResponse.json({ error: error.message || "AI service error" }, { status: 500 });
    }
}
