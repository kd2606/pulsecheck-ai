"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SkinScanOutputSchema = z.object({
    conditions: z.array(
        z.object({
            name: z.string(),
            confidence: z.enum(["High", "Medium", "Low"]),
            description: z.string(),
        })
    ),
    overallAssessment: z.string(),
    homeCare: z.array(z.string()),
    otcMedicines: z.array(
        z.object({
            name: z.string(),
            purpose: z.string(),
            searchQuery: z.string(),
        })
    ),
    seekDermatologist: z.boolean(),
    clinicType: z.string(),
});

export async function analyzeSkinScan(imageBase64: string) {
    const { output } = await ai.generate({
        prompt: [
            {
                media: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
                text: `Analyze this skin photo and identify potential skin conditions. Look for:
- Acne or breakouts
- Eczema or dermatitis
- Suspicious moles or skin lesions
- Rashes or allergic reactions
- Dryness or skin discoloration
- Other visible skin conditions

Provide a JSON response with:
1. "conditions": array with "name", "confidence" (High/Medium/Low), and "description"
2. "overallAssessment": summary paragraph
3. "homeCare": array of home care suggestions
4. "otcMedicines": array with "name", "purpose", and "searchQuery" for Google search
5. "seekDermatologist": boolean if professional evaluation is recommended
6. "clinicType": type of clinic to visit (e.g., "Dermatologist", "General Practitioner")

Note: These are AI-generated estimations for educational purposes only, not medical diagnoses.`,
            },
        ],
        output: { schema: SkinScanOutputSchema },
    });

    return output;
}
