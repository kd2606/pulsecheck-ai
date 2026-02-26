"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const CoughAnalysisOutputSchema = z.object({
    coughType: z.enum(["dry", "wet", "wheezing", "barking", "unknown"]),
    confidence: z.enum(["High", "Medium", "Low"]),
    description: z.string(),
    possibleCauses: z.array(z.string()),
    homeRemedies: z.array(z.string()),
    otcMedicines: z.array(
        z.object({
            name: z.string(),
            purpose: z.string(),
            searchQuery: z.string(),
        })
    ),
    seekMedicalAttention: z.boolean(),
    medicalNote: z.string(),
});

export async function analyzeCough(audioBase64: string) {
    const { output } = await ai.generate({
        prompt: [
            {
                media: { url: `data:audio/webm;base64,${audioBase64}` },
            },
            {
                text: `Analyze this cough audio recording. Classify the cough type and provide recommendations.

Provide a JSON response with:
1. "coughType": one of "dry", "wet", "wheezing", "barking", "unknown"
2. "confidence": "High", "Medium", or "Low"
3. "description": brief description of the detected cough characteristics
4. "possibleCauses": array of possible causes for this type of cough
5. "homeRemedies": array of home remedy suggestions
6. "otcMedicines": array with "name", "purpose", and "searchQuery" for Google search
7. "seekMedicalAttention": boolean if the cough sounds concerning
8. "medicalNote": a note about when to see a doctor

Note: This is for educational purposes only, not a medical diagnosis.`,
            },
        ],
        output: { schema: CoughAnalysisOutputSchema },
    });

    return output;
}
