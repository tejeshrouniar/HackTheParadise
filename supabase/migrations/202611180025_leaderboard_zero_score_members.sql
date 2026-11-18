begin;

create or replace view public.library_leaderboard_ranked as
select id, username, display_name, school_name, cinder, harry, cinder + harry as total,
  rank() over (order by cinder + harry desc) as place
from public.library_leaderboard_scores
where visible;

revoke all on public.library_leaderboard_ranked from public, anon, authenticated;

notify pgrst, 'reload schema';
commit;
