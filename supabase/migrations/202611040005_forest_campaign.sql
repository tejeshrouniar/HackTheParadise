-- Extend quest progress without changing or deleting existing completion records.
create or replace function public.merge_player_progress(lesson_ids integer[]) returns integer[] language plpgsql security definer set search_path='' as $$
declare result integer[]; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in to save progress'; end if;
  if cardinality(lesson_ids)>12 or exists(select 1 from unnest(lesson_ids) n where n<1 or n>12 or n is null) then raise exception 'Invalid lesson identifiers'; end if;
  insert into public.player_progress(user_id,completed_lessons)
  values(uid,array(select distinct n from unnest(lesson_ids) n order by n))
  on conflict(user_id) do update set completed_lessons=array(select distinct n from unnest(public.player_progress.completed_lessons || excluded.completed_lessons) n order by n), updated_at=now()
  returning completed_lessons into result;
  return result;
end; $$;
revoke all on function public.merge_player_progress(integer[]) from public;
grant execute on function public.merge_player_progress(integer[]) to authenticated;
