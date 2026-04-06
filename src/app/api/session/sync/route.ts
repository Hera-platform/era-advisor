import { NextRequest, NextResponse } from "next/server";
import { getConversationBySession } from "@/lib/supabase/deals";

export async function GET(req: NextRequest) {
  const sessionToken = req.nextUrl.searchParams.get("session_token");
  if (!sessionToken) {
    return NextResponse.json({ error: "session_token required" }, { status: 400 });
  }

  const conversation = await getConversationBySession(sessionToken);
  return NextResponse.json({
    seller_id: conversation?.seller_id || null,
    deal_id: conversation?.deal_id || null,
  });
}
