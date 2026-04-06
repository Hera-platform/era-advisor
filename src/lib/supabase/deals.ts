import { createServiceClient } from "./service";
import type { ChatMessage, TeaserContent, InfoMemoContent } from "./types";

/**
 * Service-layer functions for deal and conversation operations.
 * Uses service role client — bypasses RLS for anonymous user writes.
 * Only use in API routes (server-side).
 */

export async function createAnonymousSeller(sessionToken: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from("sellers")
    .insert({
      email: `anonymous-${sessionToken.slice(0, 8)}@era.temp`,
      is_anonymous: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create anonymous seller: ${error.message}`);
  return data;
}

export async function createDeal(
  sellerId: string,
  companyName: string,
  pIva?: string
) {
  const db = createServiceClient();
  const { data, error } = await db
    .from("deals")
    .insert({
      seller_id: sellerId,
      company_name: companyName,
      p_iva: pIva || null,
      status: "discovery",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create deal: ${error.message}`);
  return data;
}

export async function updateDeal(
  dealId: string,
  fields: Record<string, unknown>
) {
  const db = createServiceClient();
  const { data, error } = await db
    .from("deals")
    .update(fields)
    .eq("id", dealId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update deal: ${error.message}`);
  return data;
}

export async function getDealById(dealId: string) {
  const db = createServiceClient();
  const { data } = await db
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();
  return data;
}

export async function createOrUpdateConversation(
  sessionToken: string,
  sellerId: string,
  dealId: string | null,
  messages: ChatMessage[]
) {
  const db = createServiceClient();
  const { data, error } = await db
    .from("conversations")
    .upsert(
      {
        session_token: sessionToken,
        seller_id: sellerId,
        deal_id: dealId,
        messages: messages,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_token" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert conversation: ${error.message}`);
  return data;
}

export async function getConversationBySession(sessionToken: string) {
  const db = createServiceClient();
  const { data } = await db
    .from("conversations")
    .select("*")
    .eq("session_token", sessionToken)
    .single();
  return data;
}

export async function getConversationBySeller(sellerId: string) {
  const db = createServiceClient();
  const { data } = await db
    .from("conversations")
    .select("*")
    .eq("seller_id", sellerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function migrateAnonymousToAuthenticated(
  anonymousSellerId: string,
  authUserId: string,
  authEmail: string
) {
  const db = createServiceClient();

  // Check if the auth trigger already created a seller row
  const { data: triggerSeller } = await db
    .from("sellers")
    .select("id")
    .eq("auth_id", authUserId)
    .single();

  if (triggerSeller) {
    // Move any deals from trigger-created seller to the anonymous one, then delete it
    await db
      .from("deals")
      .update({ seller_id: anonymousSellerId })
      .eq("seller_id", triggerSeller.id);
    await db.from("sellers").delete().eq("id", triggerSeller.id);
  }

  // Claim the anonymous seller row
  await db
    .from("sellers")
    .update({
      auth_id: authUserId,
      email: authEmail,
      is_anonymous: false,
    })
    .eq("id", anonymousSellerId);
}

// ── Materials ────────────────────────────────────────────

export async function saveMaterial(
  dealId: string,
  type: "teaser" | "info_memo",
  content: TeaserContent | InfoMemoContent
) {
  const db = createServiceClient();

  // Determine next version number
  const { data: existing } = await db
    .from("materials")
    .select("version")
    .eq("deal_id", dealId)
    .eq("type", type)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion =
    existing && existing.length > 0 ? existing[0].version + 1 : 1;

  const { data, error } = await db
    .from("materials")
    .insert({
      deal_id: dealId,
      type,
      version: nextVersion,
      content,
      status: "draft",
      pdf_url: null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save material: ${error.message}`);
  return data;
}

export async function getLatestMaterial(
  dealId: string,
  type: "teaser" | "info_memo"
) {
  const db = createServiceClient();
  const { data } = await db
    .from("materials")
    .select("*")
    .eq("deal_id", dealId)
    .eq("type", type)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  return data;
}
