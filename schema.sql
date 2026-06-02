-- ========================================
-- COMPLETE DATABASE RESET SCRIPT
-- ========================================

-- 1. Drop existing policies, triggers, and tables to start fresh
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;

drop table if exists public.payments cascade;
drop table if exists public.scans cascade;
drop table if exists public.users cascade;

-- ========================================
-- 2. Create Users Table (mirrors auth.users)
-- ========================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- ========================================
-- 3. Automatic Auth Trigger for public.users
-- ========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Пользователь')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================
-- 4. Create Scans Table
-- ========================================
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete set null,
  image text, 
  image_url text, 
  result jsonb, 
  payment_status text default 'pending', 
  shares_count integer default 0,
  user_name text, 
  user_telegram text, 
  user_email text, 
  referred_by_scan_id uuid references public.scans(id) on delete set null 
);

create index idx_scans_user_id on public.scans(user_id);
create index idx_scans_referred_by on public.scans(referred_by_scan_id);
create index idx_scans_contacts on public.scans(user_email, user_telegram);

alter table public.scans enable row level security;
create policy "Allow anonymous scans inserts" on public.scans for insert with check (true);
create policy "Allow anonymous scans updates" on public.scans for update using (true);
-- Разрешаем чтение либо владельцу скана, либо если скан еще не привязан к владельцу (анонимный)
create policy "Users can view own or pending scans" on public.scans for select using (auth.uid() = user_id or user_id is null);

-- ========================================
-- 5. Create Payments Table
-- ========================================
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  scan_id uuid references public.scans(id) on delete cascade,
  yookassa_payment_id text not null,
  amount numeric(10,2) not null default 490.00,
  status text default 'pending', 
  payment_url text
);

create index idx_payments_scan_id on public.payments(scan_id);
create index idx_payments_yookassa_id on public.payments(yookassa_payment_id);

alter table public.payments enable row level security;
create policy "Allow anonymous payments inserts" on public.payments for insert with check (true);
create policy "Allow anonymous payments updates" on public.payments for update using (true);
create policy "Allow anonymous payments select" on public.payments for select using (true);

-- ========================================
-- NOTE: Storage bucket 'scans-photos'
-- Must be created manually in Supabase Dashboard:
-- Storage → New Bucket → Name: scans-photos → Public: ON
-- ========================================
