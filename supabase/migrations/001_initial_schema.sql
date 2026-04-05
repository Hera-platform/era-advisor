-- ERA Advisor: Initial Schema
-- 4 core tables: sellers, deals, materials, conversations

-- ============================================================
-- 1. SELLERS
-- ============================================================
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  auth_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.sellers enable row level security;

-- Sellers can only read/update their own row
create policy "sellers_select_own" on public.sellers
  for select using (auth.uid() = auth_id);

create policy "sellers_update_own" on public.sellers
  for update using (auth.uid() = auth_id);

-- Allow insert during signup (service role or authenticated user creating their own row)
create policy "sellers_insert_own" on public.sellers
  for insert with check (auth.uid() = auth_id);

-- ============================================================
-- 2. DEALS
-- ============================================================
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  company_name text not null,
  p_iva text,
  status text not null default 'discovery'
    check (status in ('discovery', 'materials_draft', 'materials_review', 'live', 'matched', 'engaged', 'closed')),
  company_profile jsonb default '{}'::jsonb,
  financial_data jsonb default '{}'::jsonb,
  deal_context jsonb default '{}'::jsonb,
  enrichment_data jsonb default '{}'::jsonb,
  valuation_range jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.deals enable row level security;

-- Sellers can only access their own deals
create policy "deals_select_own" on public.deals
  for select using (
    seller_id in (select id from public.sellers where auth_id = auth.uid())
  );

create policy "deals_insert_own" on public.deals
  for insert with check (
    seller_id in (select id from public.sellers where auth_id = auth.uid())
  );

create policy "deals_update_own" on public.deals
  for update using (
    seller_id in (select id from public.sellers where auth_id = auth.uid())
  );

-- Auto-update updated_at on deals
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. MATERIALS
-- ============================================================
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  type text not null check (type in ('teaser', 'info_memo')),
  version int default 1,
  content jsonb default '{}'::jsonb,
  pdf_url text,
  status text not null default 'generating'
    check (status in ('generating', 'draft', 'approved')),
  created_at timestamptz default now()
);

alter table public.materials enable row level security;

-- Materials accessible if the user owns the deal
create policy "materials_select_own" on public.materials
  for select using (
    deal_id in (
      select d.id from public.deals d
      join public.sellers s on d.seller_id = s.id
      where s.auth_id = auth.uid()
    )
  );

create policy "materials_insert_own" on public.materials
  for insert with check (
    deal_id in (
      select d.id from public.deals d
      join public.sellers s on d.seller_id = s.id
      where s.auth_id = auth.uid()
    )
  );

create policy "materials_update_own" on public.materials
  for update using (
    deal_id in (
      select d.id from public.deals d
      join public.sellers s on d.seller_id = s.id
      where s.auth_id = auth.uid()
    )
  );

-- ============================================================
-- 4. CONVERSATIONS
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete set null,
  messages jsonb default '[]'::jsonb,
  context_snapshot jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;

-- Conversations accessible if linked to a deal the user owns
create policy "conversations_select_own" on public.conversations
  for select using (
    deal_id is null  -- anonymous conversations (pre-auth)
    or deal_id in (
      select d.id from public.deals d
      join public.sellers s on d.seller_id = s.id
      where s.auth_id = auth.uid()
    )
  );

create policy "conversations_insert" on public.conversations
  for insert with check (true);  -- Anyone can create (anonymous flow)

create policy "conversations_update_own" on public.conversations
  for update using (
    deal_id is null
    or deal_id in (
      select d.id from public.deals d
      join public.sellers s on d.seller_id = s.id
      where s.auth_id = auth.uid()
    )
  );

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- HELPER: Auto-create seller on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.sellers (email, auth_id)
  values (new.email, new.id)
  on conflict (auth_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_deals_seller_id on public.deals(seller_id);
create index idx_deals_status on public.deals(status);
create index idx_materials_deal_id on public.materials(deal_id);
create index idx_conversations_deal_id on public.conversations(deal_id);
create index idx_sellers_auth_id on public.sellers(auth_id);
