import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { migrateAnonymousToAuthenticated } from "@/lib/supabase/deals";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check for pending anonymous → authenticated migration
      const pendingCookie = cookieStore.get("era_pending_migration");
      if (pendingCookie) {
        try {
          const { anonymous_seller_id } = JSON.parse(pendingCookie.value);
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user && anonymous_seller_id) {
            await migrateAnonymousToAuthenticated(
              anonymous_seller_id,
              user.id,
              user.email!
            );
          }
        } catch (e) {
          console.error("Migration error in callback:", e);
        }
        cookieStore.delete("era_pending_migration");
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
