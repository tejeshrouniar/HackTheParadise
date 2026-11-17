begin;

alter table public.profiles
  add column school_name text check (char_length(btrim(school_name)) between 1 and 120);

-- Member profile lookups are used in chat. Keep contact and school details
-- available through the owner lookup and share school only in opted-in rankings.
revoke select on public.profiles from authenticated;
grant select (id, username, display_name, avatar_url, bio, onboarding_completed, created_at, updated_at)
  on public.profiles to authenticated;
grant update (school_name) on public.profiles to authenticated;

create function public.get_my_library_profile() returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(p) from public.profiles p where p.id = (select auth.uid());
$$;

create or replace function public.create_storicode_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  signup_phone text := new.raw_user_meta_data ->> 'signup_phone_number';
  signup_school text := btrim(new.raw_user_meta_data ->> 'signup_school_name');
begin
  insert into public.profiles (
    id, username, display_name, avatar_url, onboarding_completed, phone_number, school_name
  ) values (
    new.id, 'u_' || replace(new.id::text, '-', ''),
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      'Learner'
    ), 60),
    case when new.raw_user_meta_data ->> 'avatar_url' like 'https://%'
      then new.raw_user_meta_data ->> 'avatar_url' end,
    false,
    case when signup_phone ~ '^[+][1-9][0-9]{6,14}$' then signup_phone end,
    case when char_length(signup_school) between 1 and 120 then signup_school end
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create function public.check_library_onboarding_details() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.onboarding_completed and not old.onboarding_completed
    and (new.phone_number is null or new.school_name is null) then
    raise exception 'Enter your phone number and school name to complete your profile.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger library_onboarding_details before update of onboarding_completed on public.profiles
  for each row execute function public.check_library_onboarding_details();

create table public.library_leaderboard_archive (
  ended_at timestamptz primary key,
  standings jsonb not null
);
alter table public.library_leaderboard_archive enable row level security;
revoke all on public.library_leaderboard_archive from public, anon, authenticated;

create view public.library_leaderboard_scores as
select p.id, p.username, coalesce(nullif(btrim(p.display_name), ''), 'Learner') as display_name,
  nullif(btrim(p.school_name), '') as school_name,
  prefs.leaderboard_visible and p.onboarding_completed as visible,
  greatest(progress.cinder - coalesce(baseline.cinder, 0), 0) as cinder,
  greatest(progress.harry - coalesce(baseline.harry, 0), 0) as harry
from public.profiles p
join public.user_preferences prefs on prefs.user_id = p.id
join public.library_leaderboard_progress progress on progress.id = p.id
left join public.library_leaderboard_baselines baseline on baseline.user_id = p.id;

create view public.library_leaderboard_ranked as
select id, username, display_name, school_name, cinder, harry, cinder + harry as total,
  rank() over (order by cinder + harry desc) as place
from public.library_leaderboard_scores where visible and cinder + harry > 0;

revoke all on public.library_leaderboard_scores, public.library_leaderboard_ranked
  from public, anon, authenticated;

create or replace function public.get_library_leaderboard() returns jsonb
language sql stable security definer set search_path = '' as $$
  with viewer as (select auth.uid() as id), leaders as (
    select username, display_name, school_name, cinder, harry, total, place
    from public.library_leaderboard_ranked
    where (select id from viewer) is not null
    order by place, username limit 25
  )
  select jsonb_build_object(
    'reset_at', (select reset_at from public.library_leaderboard_state where singleton),
    'leaders', coalesce((select jsonb_agg(to_jsonb(leaders) order by place, username) from leaders), '[]'::jsonb),
    'player', (select jsonb_build_object('username', s.username, 'display_name', s.display_name,
      'school_name', s.school_name, 'visible', s.visible, 'cinder', s.cinder, 'harry', s.harry,
      'total', s.cinder + s.harry, 'place', r.place)
      from public.library_leaderboard_scores s
      left join public.library_leaderboard_ranked r on r.id = s.id
      where s.id = (select id from viewer))
  );
$$;

create or replace function public.reset_library_leaderboard(p_previous_reset timestamptz) returns void
language plpgsql security definer set search_path = '' as $$
declare round_end timestamptz;
begin
  if not public.is_spark_admin() then
    raise exception 'Developer access required' using errcode = '42501';
  end if;

  -- Finish any in-flight joins before archiving and block new joins until commit.
  lock table public.user_preferences in share row exclusive mode;
  update public.library_leaderboard_state set reset_at = clock_timestamp()
  where singleton and reset_at is not distinct from p_previous_reset
  returning reset_at into round_end;
  if not found then
    raise exception 'The leaderboard has already been reset. Refresh to see the current rankings.';
  end if;

  -- Archive and baseline read the same snapshot of completed levels.
  with archive as (
    insert into public.library_leaderboard_archive (ended_at, standings)
    select round_end, coalesce(jsonb_agg(
      (to_jsonb(r) - 'id' - 'username') order by r.place, r.username
    ), '[]'::jsonb)
    from public.library_leaderboard_ranked r
  )
  insert into public.library_leaderboard_baselines (user_id, cinder, harry)
  select id, cinder, harry from public.library_leaderboard_progress
  where cinder + harry > 0 or id in (select user_id from public.library_leaderboard_baselines)
  on conflict (user_id) do update set cinder = excluded.cinder, harry = excluded.harry;

  update public.user_preferences set leaderboard_visible = false where leaderboard_visible;
end;
$$;

create function public.export_library_leaderboard() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_spark_admin() then
    raise exception 'Developer access required' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'current', coalesce((select jsonb_agg((to_jsonb(r) - 'id' - 'username') order by r.place, r.username)
      from public.library_leaderboard_ranked r), '[]'::jsonb),
    'archive', coalesce((select jsonb_agg(to_jsonb(a) order by a.ended_at desc)
      from public.library_leaderboard_archive a), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_my_library_profile(), public.export_library_leaderboard()
  from public, anon, authenticated;
grant execute on function public.get_my_library_profile(), public.export_library_leaderboard()
  to authenticated;

commit;
