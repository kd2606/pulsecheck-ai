import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { openAI } from "genkitx-openai";

// ── PRIMARY: Google Gemini 1.5 Flash (stable, widely available on free tier) ──
export const PRIMARY_MODEL = "googleai/gemini-2.0-flash";

// ── FALLBACK: Free OpenRouter models (validated & currently available) ──
// These are the EXACT model IDs used by OpenRouter API
const OPENROUTER_FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "deepseek/deepseek-r1:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
];

// These get registered in the openAI plugin under the "openai" namespace
// So they are referenced as "openai/<model-id>"
export const FALLBACK_MODELS = OPENROUTER_FREE_MODELS.map((m) => `openai/${m}`);

const modelInfo = {
    supports: {
        multiturn: true,
        media: false, // OpenRouter free models don't support images
        tools: false,
        systemRole: true,
    },
};

export const ai = genkit({
    plugins: [
        // Google AI — primary, supports images/audio
        googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),

        // OpenRouter — fallback pool (text-only)
        ...(process.env.OPENROUTER_API_KEY
            ? [
                  openAI({
                      apiKey: process.env.OPENROUTER_API_KEY,
                      baseURL: "https://openrouter.ai/api/v1",
                      models: OPENROUTER_FREE_MODELS.map((model) => ({
                          name: model,
                          info: {
                              label: `OpenRouter ${model}`,
                              versions: [model],
                              ...modelInfo,
                          },
                          configSchema: { parse: (val: unknown) => val },
                      })),
                  }),
              ]
            : []),
    ],
    model: PRIMARY_MODEL,
});
