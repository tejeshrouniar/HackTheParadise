begin;

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

  -- Keep the account ID in the private archive so exports can resolve the
  -- current contact details without copying them into every saved round.
  with archive as (
    insert into public.library_leaderboard_archive (ended_at, standings)
    select round_end, coalesce(jsonb_agg(
      (to_jsonb(r) - 'username') order by r.place, r.username
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

create or replace function public.export_library_leaderboard() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_spark_admin() then
    raise exception 'Developer access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'current', coalesce((
      select jsonb_agg(
        (to_jsonb(r) - 'id' - 'username') ||
        jsonb_build_object('email', u.email, 'phone_number', p.phone_number)
        order by r.place, r.username
      )
      from public.library_leaderboard_ranked r
      join public.profiles p on p.id = r.id
      left join auth.users u on u.id = r.id
    ), '[]'::jsonb),
    'archive', coalesce((
      select jsonb_agg(jsonb_build_object(
        'ended_at', a.ended_at,
        'standings', coalesce((
          select jsonb_agg(
            (entry.row_data - 'id') ||
            jsonb_build_object('email', u.email, 'phone_number', p.phone_number)
            order by entry.position
          )
          from jsonb_array_elements(a.standings) with ordinality as entry(row_data, position)
          left join public.profiles p on p.id = (entry.row_data ->> 'id')::uuid
          left join auth.users u on u.id = p.id
        ), '[]'::jsonb)
      ) order by a.ended_at desc)
      from public.library_leaderboard_archive a
    ), '[]'::jsonb)
  );
end;
$$;

commit;
