"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GovtSchemesOutputSchema = z.object({
    schemes: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            eligibility: z.string(),
            benefits: z.string(),
            howToApply: z.string(),
            officialLink: z.string(),
        })
    ),
    generalAdvice: z.string(),
});

export async function suggestGovtSchemes(profile: {
    age?: number;
    gender?: string;
    state?: string;
    income?: string;
    occupation?: string;
    healthConditions?: string;
}) {
    const { output } = await ai.generate({
        prompt: `
You are a knowledgeable assistant specializing in Indian Government Health and Social Welfare Schemes (both Central and State level).
Based on the following user profile, suggest the most relevant government schemes they might be eligible for.

User Profile:
- Age: ${profile.age || "Not specified"}
- Gender: ${profile.gender || "Not specified"}
- State of Residence: ${profile.state || "Not specified"} (Important for state-specific schemes)
- Income Bracket: ${profile.income || "Not specified"}
- Occupation/Category: ${profile.occupation || "Not specified"} (e.g., Farmer, Student, Pregnant Woman, Senior Citizen, Unorganized Worker)
- Known Health Conditions / Disability: ${profile.healthConditions || "None specified"}

Consider schemes like Ayushman Bharat (PM-JAY), Janani Suraksha Yojana (JSY), state-specific health insurance (e.g., Chiranjeevi Yojana in Rajasthan, Aarogyasri in AP/Telangana, etc.), National Blindness Control Program, PM Matru Vandana Yojana, dot center for TB, etc.

Provide a JSON response with:
1. "schemes": An array of highly relevant schemes. For each scheme provide:
   - "name": Official name of the scheme
   - "description": Brief summary
   - "eligibility": Key eligibility criteria
   - "benefits": Financial or health benefits provided
   - "howToApply": Steps or documents needed to apply
   - "officialLink": A search query or URL to find more info (e.g., "https://www.google.com/search?q=Ayushman+Bharat+apply")
2. "generalAdvice": A short paragraph summarizing the most important step they should take next regarding these schemes.

Ensure the recommendations are practical and tailored to rural/semi-urban Indian demographics.
        `,
        output: { schema: GovtSchemesOutputSchema },
    });

    return output;
}
