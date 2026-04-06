import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("id, email, name")
    .eq("auth_id", user.id)
    .single();

  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  return NextResponse.json({
    seller_id: seller.id,
    email: seller.email,
    name: seller.name,
  });
}
