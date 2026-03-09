"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const VisionScanOutputSchema = z.object({
    fatigueDetected: z.boolean(),
    indicators: z.array(
        z.object({
            sign: z.string(),
            detected: z.boolean(),
            details: z.string(),
        })
    ),
    overallAssessment: z.string(),
    simpleExplanation: z.string(),
    lifestyleSuggestions: z.array(z.string()),
    otcMedicines: z.array(
        z.object({
            name: z.string(),
            purpose: z.string(),
            searchQuery: z.string(),
        })
    ),
});

export async function analyzeVisionScan(imageBase64: string) {
    const { output } = await ai.generate({
        prompt: [
            {
                media: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
                text: `Analyze this facial photo for signs of fatigue. Look for:
- Dark circles under the eyes
- Drooping or heavy eyelids
- Pale or dull skin tone
- Bloodshot or tired-looking eyes
- Overall facial expression suggesting exhaustion

Provide a JSON response with:
1. "fatigueDetected": boolean
2. "indicators": array with "sign", "detected" (boolean), and "details"
3. "overallAssessment": summary paragraph
4. "simpleExplanation": 1-2 lines explaining the result in simple language a non-medical person can understand.
5. "lifestyleSuggestions": array of lifestyle improvement suggestions
5. "otcMedicines": array with "name", "purpose", and "searchQuery" for Google search

Note: These are AI-generated estimations for educational purposes only, not medical diagnoses.`,
            },
        ],
        output: { schema: VisionScanOutputSchema },
    });

    return output;
}
