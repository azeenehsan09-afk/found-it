-- Run this SQL in the Supabase SQL Editor.
-- This table stores public profile details linked to Supabase Auth users.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user can read their own profile.
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- A signed-in user can create their own profile.
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- A signed-in user can update their own profile.
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name)
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
