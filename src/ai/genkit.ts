import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { openAI } from "genkitx-openai";

// ── PRIMARY: Google Gemini (supports images + audio, 15 RPM free tier) ──
export const PRIMARY_MODEL = "googleai/gemini-2.0-flash";

// ── FALLBACK: Free OpenRouter models across many providers ──
const OPENROUTER_FREE_MODELS = [
    "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free",
    "google/gemma-3-27b-it:free",
    "z-ai/glm-4.5-air:free",
    "openai/gpt-oss-20b:free",
    "google/gemma-3-12b-it:free",
];

export const FALLBACK_MODELS = OPENROUTER_FREE_MODELS.map((m) => `openai/${m}`);

const modelInfo = {
    supports: {
        multiturn: true,
        media: true,
        tools: true,
        systemRole: true,
    },
};

export const ai = genkit({
    plugins: [
        // Google AI — primary, supports images/audio
        googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),

        // OpenRouter — fallback pool
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
