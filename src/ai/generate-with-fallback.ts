import { ai, FALLBACK_MODELS, PRIMARY_MODEL } from "@/ai/genkit";
import type { GenerateOptions } from "genkit";

const RETRYABLE_STATUS_CODES = [404, 429, 402, 503, 500];

const RETRYABLE_MARKERS = [
    "404",
    "not found",
    "429",
    "402",
    "rate limit",
    "too many requests",
    "quota",
    "throttle",
    "payment required",
    "more credits",
    "temporarily rate-limited",
    "capacity",
    "overloaded",
    "model not found",
    "invalid model",
    "no endpoints",
    "unavailable",
];

const isRetryableError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") {
        return false;
    }

    const e = error as { status?: number; message?: string; code?: number };

    // Retry on any of these HTTP status codes (including 404 for bad model names)
    if (RETRYABLE_STATUS_CODES.includes(e.status ?? 0)) return true;
    if (RETRYABLE_STATUS_CODES.includes(e.code ?? 0)) return true;

    const message = (e.message || String(error) || "").toLowerCase();
    return RETRYABLE_MARKERS.some((marker) => message.includes(marker));
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Full fallback chain (text-only features) ──
export async function generateWithModelFallback(
    request: GenerateOptions
) {
    const firstModel = request.model || PRIMARY_MODEL;
    const modelsToTry = [firstModel, ...FALLBACK_MODELS].filter(
        (model, index, list) => list.indexOf(model) === index
    );

    let lastError: unknown;

    for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        try {
            console.log(`[AI] Trying model ${i + 1}/${modelsToTry.length}: ${model}`);
            const result = await ai.generate({
                ...request,
                model,
            });
            console.log(`[AI] ✅ Success with: ${model}`);
            return result;
        } catch (error) {
            const msg = (error as any)?.message || String(error);
            console.warn(`[AI] ❌ ${model}: ${msg.substring(0, 120)}`);
            lastError = error;

            // Always try next model regardless of error type
            if (i < modelsToTry.length - 1) {
                const delay = isRetryableError(error) ? 1000 : 200;
                await sleep(delay);
            }
        }
    }

    throw lastError || new Error("All AI models are currently busy. Please try again in a moment.");
}

// ── Gemini-only (for image/audio features — OpenRouter free tier has no vision) ──
export async function generateWithGeminiOnly(
    request: GenerateOptions
) {
    // Gemini 1.5 Flash supports images and is on free tier
    const geminiModels = [
        "googleai/gemini-2.0-flash",
        "googleai/gemini-1.5-flash",
    ];

    let lastError: unknown;

    for (let i = 0; i < geminiModels.length; i++) {
        const model = geminiModels[i];
        try {
            console.log(`[AI:Vision] Trying ${model}`);
            const result = await ai.generate({
                ...request,
                model,
            });
            console.log(`[AI:Vision] ✅ Success with: ${model}`);
            return result;
        } catch (error) {
            const msg = (error as any)?.message || String(error);
            console.warn(`[AI:Vision] ❌ ${model}: ${msg.substring(0, 120)}`);
            lastError = error;

            if (i < geminiModels.length - 1) {
                await sleep(1500);
            }
        }
    }

    throw lastError || new Error("Image analysis is temporarily unavailable. Please try again in a moment.");
}
