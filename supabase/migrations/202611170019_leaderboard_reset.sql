begin;

create table public.library_leaderboard_state (
  singleton boolean primary key default true check (singleton),
  reset_at timestamptz
);

insert into public.library_leaderboard_state default values;

create table public.library_leaderboard_baselines (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  cinder integer not null,
  harry integer not null
);

alter table public.library_leaderboard_state enable row level security;
alter table public.library_leaderboard_baselines enable row level security;
revoke all on public.library_leaderboard_state, public.library_leaderboard_baselines
  from public, anon, authenticated;

-- Reuse the same sequential scoring for current rankings and reset baselines.
create view public.library_leaderboard_progress as
select p.id,
  coalesce((select min(level) - 1 from generate_series(1, 12) level
    where not (level = any(coalesce(q.completed_lessons, array[]::integer[])))), 12) as cinder,
  (select coalesce(min(ch.position) filter (where sp.completed is distinct from true) - 1, count(*)::integer)
    from public.story_chapters ch
    left join public.story_progress sp on sp.chapter_id = ch.id and sp.user_id = p.id
    where ch.story_id = 'harry-potter-horcrux-code' and ch.published) as harry
from public.profiles p
left join public.player_progress q on q.user_id = p.id;

revoke all on public.library_leaderboard_progress from public, anon, authenticated;

create function public.reset_library_leaderboard(p_previous_reset timestamptz) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_spark_admin() then
    raise exception 'Developer access required' using errcode = '42501';
  end if;
  update public.library_leaderboard_state set reset_at = clock_timestamp()
  where singleton and reset_at is not distinct from p_previous_reset;
  if not found then
    raise exception 'The leaderboard has already been reset. Refresh to see the current rankings.';
  end if;

  delete from public.library_leaderboard_baselines;
  insert into public.library_leaderboard_baselines (user_id, cinder, harry)
  select id, cinder, harry from public.library_leaderboard_progress
  where cinder + harry > 0;
end;
$$;

create or replace function public.get_library_leaderboard() returns jsonb
language sql stable security definer set search_path = '' as $$
  with viewer as (select auth.uid() as id), scores as (
    select p.id, p.username, coalesce(nullif(trim(p.display_name), ''), 'Learner') as display_name,
      prefs.leaderboard_visible and p.onboarding_completed as visible,
      greatest(progress.cinder - coalesce(baseline.cinder, 0), 0) as cinder,
      greatest(progress.harry - coalesce(baseline.harry, 0), 0) as harry
    from public.user_preferences prefs
    join public.profiles p on p.id = prefs.user_id
    join public.library_leaderboard_progress progress on progress.id = p.id
    left join public.library_leaderboard_baselines baseline on baseline.user_id = p.id
    cross join viewer
    where viewer.id is not null
      and (p.id = viewer.id or (prefs.leaderboard_visible and p.onboarding_completed))
  ), ranked as (
    select id, username, display_name, cinder, harry, cinder + harry as total,
      rank() over (order by cinder + harry desc) as place
    from scores where visible and cinder + harry > 0
  ), leaders as (
    select username, display_name, cinder, harry, total, place
    from ranked order by place, username limit 25
  )
  select jsonb_build_object(
    'reset_at', (select reset_at from public.library_leaderboard_state where singleton),
    'leaders', coalesce((select jsonb_agg(to_jsonb(leaders) order by place, username) from leaders), '[]'::jsonb),
    'player', (select jsonb_build_object('username', s.username, 'display_name', s.display_name, 'visible', s.visible,
      'cinder', s.cinder, 'harry', s.harry, 'total', s.cinder + s.harry, 'place', r.place)
      from scores s left join ranked r on r.id = s.id where s.id = (select id from viewer))
  );
$$;

revoke all on function public.reset_library_leaderboard(timestamptz) from public, anon, authenticated;
grant execute on function public.reset_library_leaderboard(timestamptz) to authenticated;

commit;
