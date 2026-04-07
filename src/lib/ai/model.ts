import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenRouter model provider.
 * Uses the OpenAI-compatible API with OpenRouter's base URL.
 *
 * Free models with decent tool calling (verified 2026-04-04):
 * - qwen/qwen3.6-plus:free
 * - qwen/qwen3-coder:free
 * - nvidia/nemotron-3-super-120b-a12b:free
 * - meta-llama/llama-3.3-70b-instruct:free
 *
 * For production, switch to:
 * - anthropic/claude-sonnet-4-20250514
 * - anthropic/claude-opus-4-20250514
 */

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://eradeal.com",
    "X-Title": "ERA Advisor",
  },
});

// Chat model — used for the main conversation + tool calling
// NOTE: Must use .chat() — the default provider() uses OpenAI Responses API
// which OpenRouter does not support. .chat() uses /chat/completions.
export const chatModel = openrouter.chat("qwen/qwen3.6-plus:free");

// Generation model — used for teaser/info memo document generation
// (same model for now, can split later for quality/cost optimization)
export const generationModel = openrouter.chat("qwen/qwen3.6-plus:free");
