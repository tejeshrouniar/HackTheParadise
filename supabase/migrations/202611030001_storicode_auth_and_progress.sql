create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Apprentice',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  completed_lessons integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.player_progress enable row level security;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.player_progress to authenticated;

drop policy if exists "Players can read their own profile" on public.profiles;
create policy "Players can read their own profile"
  on public.profiles for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Players can update their own profile" on public.profiles;
create policy "Players can update their own profile"
  on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Players can read their own progress" on public.player_progress;
create policy "Players can read their own progress"
  on public.player_progress for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Players can create their own progress" on public.player_progress;
create policy "Players can create their own progress"
  on public.player_progress for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own progress" on public.player_progress;
create policy "Players can update their own progress"
  on public.player_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.create_storicode_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Apprentice'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_storicode_user_created on auth.users;
create trigger on_storicode_user_created
  after insert on auth.users
  for each row execute procedure public.create_storicode_profile();
