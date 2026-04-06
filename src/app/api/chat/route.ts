import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ADVISOR_SYSTEM_PROMPT } from "@/lib/ai/advisor-prompt";
import { createAdvisorTools, type ToolContext } from "@/lib/ai/tools";
import { createOrUpdateConversation } from "@/lib/supabase/deals";
import type { ChatMessage } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, session_token, seller_id, deal_id } = await req.json();

  const context: ToolContext = {
    sessionToken: session_token ?? crypto.randomUUID(),
    sellerId: seller_id ?? null,
  };

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: ADVISOR_SYSTEM_PROMPT,
    messages,
    tools: createAdvisorTools(context),
    stopWhen: stepCountIs(5),
    maxRetries: 2,
    onFinish: async ({ response }) => {
      // Persist conversation with BOTH user and AI messages
      if (!session_token) return;

      const effectiveSellerId = context.resolvedSellerId ?? seller_id;
      const effectiveDealId = context.createdDealId ?? deal_id ?? null;

      if (effectiveSellerId) {
        // Build full message history including AI response
        const assistantMessages: ChatMessage[] = response.messages
          .filter((m) => m.role === "assistant")
          .map((m) => ({
            role: "assistant" as const,
            content:
              typeof m.content === "string"
                ? m.content
                : JSON.stringify(m.content),
            timestamp: new Date().toISOString(),
          }));

        const allMessages: ChatMessage[] = [
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date().toISOString(),
          })),
          ...assistantMessages,
        ];

        createOrUpdateConversation(
          session_token,
          effectiveSellerId,
          effectiveDealId,
          allMessages
        ).catch((err) =>
          console.error("[CHAT] Conversation persist error:", err)
        );
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
