import { streamText, stepCountIs } from "ai";
import { ADVISOR_SYSTEM_PROMPT } from "@/lib/ai/advisor-prompt";
import { chatModel, TOOLS_ENABLED } from "@/lib/ai/model";
import { createAdvisorTools, type ToolContext } from "@/lib/ai/tools";
import { createOrUpdateConversation } from "@/lib/supabase/deals";
import type { ChatMessage } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let messages, session_token, seller_id, deal_id;
  try {
    ({ messages, session_token, seller_id, deal_id } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const context: ToolContext = {
    sessionToken: session_token ?? crypto.randomUUID(),
    sellerId: seller_id ?? null,
  };

  // Build streamText config — tools only if the model supports them
  const toolsConfig = TOOLS_ENABLED
    ? {
        tools: createAdvisorTools(context),
        stopWhen: stepCountIs(5),
      }
    : {};

  let result;
  try {
    result = streamText({
      model: chatModel,
      system: ADVISOR_SYSTEM_PROMPT,
      messages,
      ...toolsConfig,
      maxRetries: 2,
      onError: ({ error }) => {
        console.error("[CHAT] Stream error:", error);
      },
      onFinish: async ({ response }) => {
        if (!session_token) return;

        const effectiveSellerId = context.resolvedSellerId ?? seller_id;
        const effectiveDealId = context.createdDealId ?? deal_id ?? null;

        if (effectiveSellerId) {
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
  } catch (error) {
    console.error("[CHAT] Failed to create stream:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start chat stream" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return result.toTextStreamResponse();
}
