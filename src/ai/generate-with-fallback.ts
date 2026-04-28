import { ai, FALLBACK_MODELS, PRIMARY_MODEL } from "@/ai/genkit";
import type { GenerateOptions } from "genkit";

const RETRYABLE_MARKERS = [
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
];

const isRetryableError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") {
        return false;
    }

    const e = error as { status?: number; message?: string; code?: number };

    // 429 = rate limited, 402 = no credits, 503 = temporarily unavailable, 500 = server error
    if ([429, 402, 503, 500].includes(e.status ?? 0)) return true;
    if ([429, 402, 503, 500].includes(e.code ?? 0)) return true;

    const message = (e.message || String(error) || "").toLowerCase();
    return RETRYABLE_MARKERS.some((marker) => message.includes(marker));
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithModelFallback(
    request: GenerateOptions
) {
    const firstModel = request.model || PRIMARY_MODEL;
    const modelsToTry = [firstModel, ...FALLBACK_MODELS].filter(
        (model, index, list) => list.indexOf(model) === index
    );

    let lastError: unknown;

    // Try each model with a delay between attempts
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

            if (!isRetryableError(error)) {
                // Non-retryable (bad prompt, schema error etc.) — skip this model but try next
                // Some models can't handle certain prompts, so we continue
                lastError = error;
                continue;
            }
            lastError = error;

            // Wait 1.5s before trying next model to avoid hitting shared rate limits
            if (i < modelsToTry.length - 1) {
                await sleep(1500);
            }
        }
    }

    throw lastError || new Error("All AI models are busy. Please try again in a minute.");
}
