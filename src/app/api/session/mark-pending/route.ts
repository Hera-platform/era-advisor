import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { anonymous_seller_id, session_token } = await req.json();

  if (!anonymous_seller_id) {
    return NextResponse.json({ error: "anonymous_seller_id required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("era_pending_migration", JSON.stringify({
    anonymous_seller_id,
    session_token,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60, // 30 minutes
  });

  return NextResponse.json({ ok: true });
}
