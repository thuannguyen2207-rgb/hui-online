-- Run through the Supabase SQL Editor or migration pipeline after the app uses
-- Supabase Auth IDs for `profiles.id`. Profiles are the approval source of truth.

alter table public.profiles
  add column if not exists account_approval_status text not null default 'pending_approval'
  check (account_approval_status in ('pending_approval', 'approved', 'rejected'));

alter table public.profiles enable row level security;

create or replace function public.is_current_user_host()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id::text = auth.uid()::text and role = 'chu_hui'
  );
$$;

drop policy if exists "profiles insert own pending profile" on public.profiles;
create policy "profiles insert own pending profile"
on public.profiles for insert to authenticated
with check (
  auth.uid()::text = id::text
  and role = 'hui_vien'
  and account_approval_status = 'pending_approval'
);

drop policy if exists "profiles read own or host approval queue" on public.profiles;
create policy "profiles read own or host approval queue"
on public.profiles for select to authenticated
using (auth.uid()::text = id::text or public.is_current_user_host());

drop policy if exists "hosts update profile approval status" on public.profiles;
create policy "hosts update profile approval status"
on public.profiles for update to authenticated
using (public.is_current_user_host())
with check (public.is_current_user_host());
