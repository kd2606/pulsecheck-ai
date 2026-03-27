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

    try {
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

        if (!output) throw new Error("Genkit returned empty output");
        return output;

    } catch (error) {
        console.error("Failed to generate mental health analysis:", error);
        
        // Provide a highly empathetic safety fallback matching the schema
        // so the frontend doesn't hang forever
        const isHighDistress = totalScore >= 12;
        
        return {
            wellnessScore: Math.max(20, 100 - (totalScore * 5)),
            perceivedMood: isHighDistress ? "Highly Overwhelmed / High Stress" : "Stressed / Anxious",
            summary: "I care about what you're going through. My deeper analysis system is temporarily unavailable or your responses indicated deep distress that requires human care. Please know that your feelings are completely valid and you do not have to carry this heavy burden alone.",
            recommendations: [
                "Please reach out to an emergency helpline or a trusted loved one immediately if you feel unsafe.",
                "Practice the 4-7-8 breathing technique right now: Inhale for 4s, hold for 7s, exhale slowly for 8s.",
                "Ground yourself using the 5-4-3-2-1 method by naming things you can see, touch, and hear around you."
            ],
            seekProfessionalHelp: isHighDistress,
            clinicType: isHighDistress ? "Emergency Crisis Counselor" : "General Therapist"
        };
    }
}

const MentalHealthQuestionsSchema = z.object({
    questions: z.array(z.string()).describe("A list of uniquely generated psychiatric questions.")
});

export async function generateMentalHealthQuestions(count: number = 5) {
    try {
        const { output } = await ai.generate({
            prompt: `You are an expert psychiatrist. Generate exactly ${count} unique, deep psychiatric questions to assess a patient's mental wellness, stress, and anxiety. The questions should be written directly to the patient (e.g., "How often do you feel..."). They should be answerable on a scale of Never/Rarely/Sometimes/Often/Constantly. Avoid generic questions; aim for deep emotional intelligence indicators like emotional regulation, dissociation, lethargy, or self-criticism.`,
            output: { schema: MentalHealthQuestionsSchema },
        });

        if (!output || !output.questions || output.questions.length === 0) {
            throw new Error("Genkit returned empty questions");
        }
        return output;
    } catch (error) {
        console.error("Failed to generate dynamic questions:", error);
        return { questions: DEEP_PSYCH_QUESTIONS };
    }
}
