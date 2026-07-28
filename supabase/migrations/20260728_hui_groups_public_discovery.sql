-- Run through the Supabase SQL Editor or migration pipeline.
-- Allow visitors and authenticated members to discover recruitable/active hui groups.

alter table public.hui_groups enable row level security;

grant select on table public.hui_groups to anon, authenticated;

drop policy if exists "public can discover hui groups" on public.hui_groups;
create policy "public can discover hui groups"
on public.hui_groups for select
to anon, authenticated
using (status in ('recruiting', 'active'));
