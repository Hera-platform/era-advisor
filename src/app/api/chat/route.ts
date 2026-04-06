import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ADVISOR_SYSTEM_PROMPT } from "@/lib/ai/advisor-prompt";
import { advisorTools } from "@/lib/ai/tools";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: ADVISOR_SYSTEM_PROMPT,
    messages,
    tools: advisorTools,
    stopWhen: stepCountIs(5),
    maxRetries: 2,
  });

  return result.toUIMessageStreamResponse();
}
