import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { migrateAnonymousToAuthenticated } from "@/lib/supabase/deals";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { anonymous_seller_id } = await req.json();
  if (!anonymous_seller_id) {
    return NextResponse.json({ error: "anonymous_seller_id required" }, { status: 400 });
  }

  await migrateAnonymousToAuthenticated(anonymous_seller_id, user.id, user.email!);
  return NextResponse.json({ success: true });
}
