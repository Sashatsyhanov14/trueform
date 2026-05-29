-- Create scans table to store image scans, results, and locks
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image text, -- store base64 data URL or storage public URL
  image_url text, -- Supabase Storage public URL
  result jsonb, -- AI structural report
  payment_status text default 'pending', -- 'pending', 'paid', 'shared'
  shares_count integer default 0,
  user_name text, -- Lead name from registration
  user_telegram text, -- Telegram username
  user_email text, -- Lead email
  referred_by_scan_id uuid references public.scans(id) on delete set null -- referral relationship
);

-- Indexes for performance optimization
create index if not exists idx_scans_referred_by on public.scans(referred_by_scan_id);
create index if not exists idx_scans_contacts on public.scans(user_email, user_telegram);

-- Enable Row Level Security
alter table public.scans enable row level security;

-- Enable anonymous access (inserts, updates, selects)
drop policy if exists "Allow anonymous scans inserts" on public.scans;
create policy "Allow anonymous scans inserts" on public.scans for insert with check (true);

drop policy if exists "Allow anonymous scans updates" on public.scans;
create policy "Allow anonymous scans updates" on public.scans for update using (true);

drop policy if exists "Allow anonymous scans select" on public.scans;
create policy "Allow anonymous scans select" on public.scans for select using (true);

-- ========================================
-- Payments table for YooKassa integration
-- ========================================
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  scan_id uuid references public.scans(id) on delete cascade,
  yookassa_payment_id text not null,
  amount numeric(10,2) not null default 490.00,
  status text default 'pending', -- 'pending', 'succeeded', 'canceled'
  payment_url text
);

create index if not exists idx_payments_scan_id on public.payments(scan_id);
create index if not exists idx_payments_yookassa_id on public.payments(yookassa_payment_id);

alter table public.payments enable row level security;

drop policy if exists "Allow anonymous payments inserts" on public.payments;
create policy "Allow anonymous payments inserts" on public.payments for insert with check (true);

drop policy if exists "Allow anonymous payments updates" on public.payments;
create policy "Allow anonymous payments updates" on public.payments for update using (true);

drop policy if exists "Allow anonymous payments select" on public.payments;
create policy "Allow anonymous payments select" on public.payments for select using (true);

-- ========================================
-- NOTE: Storage bucket 'scans-photos'
-- Must be created manually in Supabase Dashboard:
-- Storage → New Bucket → Name: scans-photos → Public: ON
-- ========================================
