# Manual Steps Required

Complete these steps once all code is built.
Last updated: 2026-04-06 (after Phase C completion)

## 1. Create Supabase Project
- Go to https://supabase.com/dashboard → New Project
- Name: `era-advisor`
- Region: EU West (closest to Italy)
- Copy the Project URL and anon key

## 2. Configure Environment Variables
Create `C:\tmp\era-advisor\.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=<your project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key (Settings → API)>
ANTHROPIC_API_KEY=<your Anthropic API key>
FIRECRAWL_API_KEY=<optional, get from firecrawl.dev>
TAVILY_API_KEY=<optional, get from tavily.com>
```

## 3. Run Database Migrations
In Supabase SQL Editor, run these files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_anonymous_sellers.sql`

## 4. Enable Google OAuth (Optional)
- Supabase Dashboard → Authentication → Providers → Google
- Set up Google Cloud OAuth credentials
- Add redirect URL: `http://localhost:3000/auth/callback`

## 5. Deploy to Hosting
- Connect GitHub repo to Cloudflare Pages or Vercel
- Set environment variables in hosting dashboard

## 6. Test End-to-End
- `npm run dev`
- Open http://localhost:3000
- Type a company name
- Verify enrichment card appears
- Verify deal gets created
- Test auth flow (email signup)
