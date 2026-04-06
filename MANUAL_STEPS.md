# ERA Advisor — Setup & Testing Guide

Last updated: 2026-04-06 (after Phase D)

## Quick Start (5 minutes)

### Step 1: Get API Keys

You need at minimum:
- **Anthropic API key** — https://console.anthropic.com → API Keys
  
Optional (enhance enrichment quality):
- **Firecrawl API key** — https://firecrawl.dev → free tier (500 credits)
- **Tavily API key** — https://tavily.com → free tier (1000/month)

### Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard → New Project
2. Name: `era-advisor`, Region: EU West
3. Wait for provisioning (~1 min)
4. Go to Settings → API and copy:
   - Project URL
   - anon (public) key
   - service_role key (under "Service role key — This key has the ability to bypass RLS")

### Step 3: Run Database Migrations

In Supabase Dashboard → SQL Editor:
1. Paste and run `supabase/migrations/001_initial_schema.sql`
2. Paste and run `supabase/migrations/002_anonymous_sellers.sql`

### Step 4: Create .env.local

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...      # optional
TAVILY_API_KEY=tvly-...        # optional
```

### Step 5: Run

```bash
npm run dev
```

Open http://localhost:3000

### Step 6 (Optional): Enable Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google
2. Create OAuth credentials in Google Cloud Console
3. Set Authorized redirect URI: `http://localhost:3000/auth/callback`
4. Copy Client ID and Client Secret to Supabase Google provider settings

---

## Testing Checklist

### Test 1: Basic Chat Flow
- [ ] Open http://localhost:3000
- [ ] Verify hero section shows "Sell your business with AI"
- [ ] Verify chat shows welcome message
- [ ] Type a company name (e.g., "Brembo SpA")
- [ ] Verify ERA responds and calls enrichment
- [ ] Verify enrichment card appears with financials, location, sector
- [ ] Verify source badges show on data points

### Test 2: Deal Creation + Auth Gate
- [ ] After enrichment, answer ERA's follow-up questions
- [ ] Verify deal gets created (green "Deal Created" card)
- [ ] Verify auth gate appears ("Your deal has been saved")
- [ ] Dismiss auth gate, continue chatting

### Test 3: Material Generation
- [ ] Continue conversation until ERA generates teaser
- [ ] Verify teaser preview card appears with headline
- [ ] Click "Preview" to expand — verify all 6 sections
- [ ] Verify ERA then generates info memo
- [ ] Verify info memo preview with 7 expandable sections

### Test 4: Auth + PDF Download
- [ ] Click "Sign in to download" on any material
- [ ] Verify auth gate appears with "download_request" copy
- [ ] Sign up with email (or Google if configured)
- [ ] Verify download button becomes active after auth
- [ ] Download teaser PDF — verify ERA branding, anonymized content
- [ ] Download info memo PDF — verify cover page, 7 sections

### Test 5: Session Persistence
- [ ] Close browser tab
- [ ] Reopen http://localhost:3000
- [ ] Verify previous conversation loads

### Test 6: Different Companies
Repeat Test 1-3 with:
- [ ] A real Italian SME (5M-30M range)
- [ ] A company name in Italian
- [ ] A company with just a P.IVA number

---

## Deployment

### Cloudflare Pages
1. Dashboard → Pages → Create → Connect to Git
2. Select `Hera-platform/era-advisor`
3. Build settings:
   - Framework: Next.js
   - Build command: `npx @cloudflare/next-on-pages`
   - Output directory: `.vercel/output/static`
4. Environment variables: same as .env.local
5. Note: May need `nodejs_compat` compatibility flag

### Vercel (Alternative)
1. vercel.com/new → Import `Hera-platform/era-advisor`
2. Environment variables: same as .env.local
3. Deploy — zero config needed

---

## Architecture Reference

```
src/
├── app/
│   ├── page.tsx                     # Landing + embedded chat
│   ├── api/
│   │   ├── chat/route.ts            # Claude AI streaming endpoint
│   │   ├── enrichment/route.ts      # Company research pipeline
│   │   ├── conversation/route.ts    # Load/save conversations
│   │   ├── materials/download/      # PDF download (auth required)
│   │   ├── seller/me/              # Get authenticated seller
│   │   ├── seller/migrate/         # Anonymous → auth migration
│   │   └── session/                # Session sync + pending migration
│   └── auth/callback/              # OAuth callback + migration
├── components/chat/
│   ├── chat-container.tsx           # Main chat state + stream parser
│   ├── chat-message.tsx             # Message bubble + tool cards
│   ├── chat-input.tsx               # Input + send button
│   ├── auth-gate.tsx                # Inline auth (Google + email)
│   ├── tool-result-card.tsx         # Router for enrichment/deal/material cards
│   ├── teaser-preview.tsx           # Expandable teaser document
│   └── info-memo-preview.tsx        # Expandable 7-section info memo
├── lib/
│   ├── ai/
│   │   ├── advisor-prompt.ts        # M&A advisor system prompt
│   │   ├── tools.ts                 # 5 tool definitions (factory)
│   │   ├── teaser-generator.ts      # Structural anonymization + Claude
│   │   └── info-memo-generator.ts   # 7-section document generation
│   ├── enrichment/
│   │   ├── pipeline.ts              # Parallel orchestrator
│   │   ├── aida.ts                  # Italian business DB (stub)
│   │   ├── website-crawler.ts       # Firecrawl + fallback
│   │   ├── news-search.ts           # Tavily news search
│   │   └── types.ts                 # Sourced<T>, EnrichmentResult
│   ├── materials/
│   │   └── pdf-export.tsx           # React-PDF renderer
│   ├── supabase/
│   │   ├── client.ts, server.ts     # Browser + SSR clients
│   │   ├── service.ts               # Service role (bypasses RLS)
│   │   ├── auth.ts                  # Sign in/up/out helpers
│   │   ├── deals.ts                 # Deal + material + conversation CRUD
│   │   └── types.ts                 # All TypeScript types
│   └── session.ts                   # localStorage session management
└── hooks/
    └── use-auth.ts                  # Supabase auth state hook
```
