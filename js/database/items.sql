-- Run this SQL in the Supabase SQL Editor (once).
-- It creates the table that stores every lost / found report.

create table if not exists public.items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('lost', 'found')),
    item_name text not null,
    category text not null,
    description text,
    item_date date,
    location text not null,
    image_url text,
    status text not null default 'open',
    created_at timestamptz not null default now()
);

alter table public.items enable row level security;

-- Anyone (even not logged in) can read reports, so search works for everyone.
drop policy if exists "Anyone can view items" on public.items;
create policy "Anyone can view items"
on public.items
for select
to anon, authenticated
using (true);

-- A logged-in user can save a report only as themselves.
drop policy if exists "Users can create their own items" on public.items;
create policy "Users can create their own items"
on public.items
for insert
to authenticated
with check (auth.uid() = user_id);

-- A user can update or delete only their own reports.
drop policy if exists "Users can update their own items" on public.items;
create policy "Users can update their own items"
on public.items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own items" on public.items;
create policy "Users can delete their own items"
on public.items
for delete
to authenticated
using (auth.uid() = user_id);