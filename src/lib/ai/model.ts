import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenRouter model provider.
 *
 * Free models (limited tool calling, rate-limited):
 * - qwen/qwen3.6-plus:free
 * - meta-llama/llama-3.3-70b-instruct:free
 *
 * For production (reliable tool calling + higher limits):
 * - anthropic/claude-sonnet-4-20250514
 * - openai/gpt-4o-mini
 */

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://eradeal.com",
    "X-Title": "ERA Advisor",
  },
});

// Chat model — main conversation
// Using .chat() to hit /chat/completions (not /responses)
export const chatModel = openrouter.chat("qwen/qwen3.6-plus:free");

// Generation model — teaser/info memo documents
export const generationModel = openrouter.chat("qwen/qwen3.6-plus:free");

// Whether the current model reliably supports tool calling
// Free models on OpenRouter have aggressive rate limits on multi-step tool calls
// Set to false to disable tools and let the AI handle everything conversationally
export const TOOLS_ENABLED = false;
