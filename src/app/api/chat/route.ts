import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ADVISOR_SYSTEM_PROMPT } from "@/lib/ai/advisor-prompt";
import { createAdvisorTools, type ToolContext } from "@/lib/ai/tools";
import { createOrUpdateConversation } from "@/lib/supabase/deals";

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
    onFinish: async () => {
      // Persist conversation — fire and forget
      if (!session_token) return;

      const effectiveSellerId = context.resolvedSellerId ?? seller_id;
      const effectiveDealId = context.createdDealId ?? deal_id ?? null;

      if (effectiveSellerId) {
        createOrUpdateConversation(
          session_token,
          effectiveSellerId,
          effectiveDealId,
          messages // Save what we received; full history with AI response reconstructed on load
        ).catch((err) => console.error("[CHAT] Conversation persist error:", err));
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
