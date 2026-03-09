"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SymptomCheckerInputSchema = z.object({
    symptoms: z.string(),
    age: z.number().optional(),
    gender: z.string().optional(),
});

const SymptomCheckerOutputSchema = z.object({
    likelyCondition: z.string(),
    conditionDescription: z.string(),
    simpleExplanation: z.string(),
    severity: z.enum(["Mild", "Moderate", "Severe"]),
    precautions: z.array(z.string()),
    otcMedicines: z.array(
        z.object({
            name: z.string(),
            purpose: z.string(),
            searchQuery: z.string(),
        })
    ),
    seekDoctor: z.boolean(),
    clinicType: z.string(),
    disclaimer: z.string(),
});

export async function checkSymptoms(input: z.infer<typeof SymptomCheckerInputSchema>) {
    const patientProfile = [
        input.age ? `Age: ${input.age}` : null,
        input.gender ? `Gender: ${input.gender}` : null,
    ]
        .filter(Boolean)
        .join(", ");

    const { output } = await ai.generate({
        prompt: `You are a knowledgeable medical AI assistant helping rural communities in India understand their health symptoms. Analyze the reported symptoms and provide a helpful, clear assessment.

${patientProfile ? `Patient Profile: ${patientProfile}` : ""}
Reported Symptoms: ${input.symptoms}

Provide a JSON response with:
1. "likelyCondition": the most probable condition or illness based on the symptoms (be specific, e.g., "Common Cold", "Viral Fever", "Tension Headache", "Gastroenteritis").
2. "conditionDescription": a clear, simple 2–3 sentence description of this condition in plain language that a rural patient can understand.
3. "severity": classify as "Mild", "Moderate", or "Severe" based on the symptoms described.
4. "simpleExplanation": 1-2 lines explaining the result in simple language a non-medical person can understand.
5. "precautions": an array of 4–6 specific, actionable precautions the patient should take at home (rest, hydration, diet tips, what to avoid, etc.).
5. "otcMedicines": an array of 1–3 safe over-the-counter medicines that may help. Each with "name" (medicine name), "purpose" (what it helps with), and "searchQuery" (a Google search query string to find it online, e.g., "Paracetamol 500mg tablet India").
6. "seekDoctor": true if the symptoms suggest something that requires professional evaluation (high fever, chest pain, difficulty breathing, symptoms lasting more than a week, etc.). Otherwise false.
7. "clinicType": if seekDoctor is true, suggest the type of doctor (e.g., "General Physician", "Gastroenterologist", "ENT Specialist"). If seekDoctor is false, respond with "Not required".
8. "disclaimer": a brief, empathetic 1-sentence disclaimer reminding them this is AI-generated information and not a medical diagnosis.

IMPORTANT: Be conservative with severity. Always err on the side of caution. If symptoms could indicate something serious, mark seekDoctor as true. Provide culturally relevant advice for rural India (mention home remedies where appropriate alongside OTC medicines).`,
        output: { schema: SymptomCheckerOutputSchema },
    });

    return output;
}
