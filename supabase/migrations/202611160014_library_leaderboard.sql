begin;

alter table public.user_preferences
  add column leaderboard_visible boolean not null default false;

create index leaderboard_visible_players on public.user_preferences (user_id)
  where leaderboard_visible;

-- Rank only opted-in accounts with progress. Return the caller's counts and
-- rank separately so they can see their place outside the top 25.
create function public.get_library_leaderboard() returns jsonb
language sql stable security definer set search_path = '' as $$
  with viewer as (select auth.uid() as id),
  candidates as (
    select p.id, p.username, prefs.leaderboard_visible and p.onboarding_completed as visible
    from public.user_preferences prefs
    join public.profiles p on p.id = prefs.user_id
    cross join viewer
    where viewer.id is not null
      and (p.id = viewer.id or (prefs.leaderboard_visible and p.onboarding_completed))
  ), scores as (
    select c.*,
      coalesce((select min(level) - 1 from generate_series(1, 12) level
        where not (level = any(coalesce(q.completed_lessons, array[]::integer[])))), 12) as cinder,
      (select coalesce(min(ch.position) filter (where sp.completed is distinct from true) - 1, count(*)::integer)
        from public.story_chapters ch
        left join public.story_progress sp on sp.chapter_id = ch.id and sp.user_id = c.id
        where ch.story_id = 'harry-potter-horcrux-code' and ch.published) as harry
    from candidates c
    left join public.player_progress q on q.user_id = c.id
  ), ranked as (
    select id, username, cinder, harry, cinder + harry as total,
      rank() over (order by cinder + harry desc) as place
    from scores where visible and cinder + harry > 0
  ), leaders as (
    select username, cinder, harry, total, place
    from ranked order by place, username limit 25
  )
  select jsonb_build_object(
    'leaders', coalesce((select jsonb_agg(to_jsonb(leaders) order by place, username) from leaders), '[]'::jsonb),
    'player', (select jsonb_build_object('username', s.username, 'visible', s.visible,
      'cinder', s.cinder, 'harry', s.harry, 'total', s.cinder + s.harry, 'place', r.place)
      from scores s left join ranked r on r.id = s.id where s.id = (select id from viewer))
  );
$$;

revoke all on function public.get_library_leaderboard() from public, anon;
grant execute on function public.get_library_leaderboard() to authenticated;

commit;
