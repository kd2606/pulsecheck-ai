"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { DEEP_PSYCH_QUESTIONS } from "./constants";

const MentalHealthInputSchema = z.object({
    answers: z.array(
        z.object({
            question: z.string(),
            answer: z.number().min(0).max(4),
        })
    ),
    voiceMetrics: z.object({
        wpm: z.number(),
        tension: z.string(),
    })
});

const MentalHealthOutputSchema = z.object({
    wellnessScore: z.number().min(0).max(100),
    perceivedMood: z.string(),
    summary: z.string(),
    recommendations: z.array(z.string()),
    seekProfessionalHelp: z.boolean(),
    clinicType: z.string(),
});

export async function analyzeMentalHealth(input: z.infer<typeof MentalHealthInputSchema>) {
    const answersText = input.answers
        .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer Frequency: ${a.answer} (0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Almost Constantly)`)
        .join("\n\n");

    const totalScore = input.answers.reduce((sum, a) => sum + a.answer, 0);

    const { output } = await ai.generate({
        prompt: `You are an empathetic, highly-trained psychiatrist analyzing a patient's Deep Emotional Intelligence (EQ) assessment and Voice Biomarkers.
        
*** SELF-REPORTED ANSWERS ***
${answersText}

*** VOICE BIOMARKERS ***
Speaking Speed: ${input.voiceMetrics.wpm} Words Per Minute (WPM)
Vocal Tone Tension: ${input.voiceMetrics.tension}
(Note: Highly anxious/manic patients often speak >150 WPM with High tension. Depressed/lethargic patients often speak <110 WPM with Low tension.)

Total Raw Distress Score: ${totalScore}/20

Provide a JSON response with:
1. "wellnessScore": a wellness score from 0-100 (100 being best mental health, inversely proportional to the distress score and voice biomarkers).
2. "perceivedMood": a brief, accurate description of their perceived emotional state (factor in their vocal tension/speed too).
3. "summary": a compassionate, deep psychological summary. Speak directly to them, acknowledging their feelings and what their voice indicators might suggest about their current mental load.
4. "recommendations": array of deep, actionable emotional regulation and groundings techniques.
5. "seekProfessionalHelp": true if they are exhibiting high distress (>12) or severe vocal tension incongruent with a healthy state.
6. "clinicType": suggested professional to consult if needed (e.g., "Psychologist", "Psychiatrist", "Trauma Specialist")

Important: Maintain an immensely empathetic, clinical yet human tone. Read between the lines of what they are saying and the physical cues of their voice parameters.`,
        output: { schema: MentalHealthOutputSchema },
    });

    return output;
}
