begin;

-- Restore the privileges used by the profile form and public chat cards.
grant usage on schema public to authenticated;
grant select (id, username, display_name, avatar_url, bio, onboarding_completed, created_at, updated_at)
  on public.profiles to authenticated;
grant update (username, display_name, avatar_url, bio, phone_number, school_name, onboarding_completed)
  on public.profiles to authenticated;

alter table public.profiles enable row level security;
drop policy if exists "Members can see public profiles" on public.profiles;
create policy "Members can see public profiles" on public.profiles
  for select to authenticated using (true);
drop policy if exists "Players can update their own profile" on public.profiles;
create policy "Players can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Contact fields are read through an owner-scoped function after migration 020.
create or replace function public.get_my_library_profile() returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(p) from public.profiles p where p.id = (select auth.uid());
$$;
alter function public.get_my_library_profile() owner to postgres;
revoke all on function public.get_my_library_profile() from public, anon, authenticated;
grant execute on function public.get_my_library_profile() to authenticated;

notify pgrst, 'reload schema';
commit;
