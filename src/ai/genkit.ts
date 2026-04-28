import { genkit } from "genkit";
import { openAI } from "genkitx-openai";

export const ai = genkit({
    plugins: [
        openAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            compatibility: "strict",
            models: [
                {
                    name: "google/gemini-2.5-flash:free",
                    info: {
                        label: "OpenRouter Gemini Flash Free",
                        versions: ["google/gemini-2.5-flash:free"],
                        supports: {
                            multiturn: true,
                            media: true,
                            tools: true,
                            systemRole: true
                        }
                    },
                    configSchema: { parse: (val: any) => val }
                }
            ]
        })
    ],
    model: "openai/google/gemini-2.5-flash:free",
});
