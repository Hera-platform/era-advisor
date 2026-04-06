import { NextRequest, NextResponse } from "next/server";
import {
  getConversationBySession,
  getConversationBySeller,
} from "@/lib/supabase/deals";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const sessionToken = req.nextUrl.searchParams.get("session_token");
  const sellerId = req.nextUrl.searchParams.get("seller_id");

  // Authenticated user — load by seller_id
  if (sellerId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const conversation = await getConversationBySeller(sellerId);
    return NextResponse.json({ conversation });
  }

  // Anonymous — load by session token
  if (sessionToken) {
    const conversation = await getConversationBySession(sessionToken);
    return NextResponse.json({ conversation });
  }

  return NextResponse.json({ error: "session_token or seller_id required" }, { status: 400 });
}
