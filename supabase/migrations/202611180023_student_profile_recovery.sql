begin;

-- Shared by Auth signup and signed-in profile recovery.
create or replace function public.ensure_library_profile(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (
    id, username, display_name, avatar_url, onboarding_completed, phone_number, school_name
  )
  select u.id, 'u_' || replace(u.id::text, '-', ''),
    left(coalesce(nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''), 'Learner'), 60),
    case when u.raw_user_meta_data ->> 'avatar_url' like 'https://%'
      and char_length(u.raw_user_meta_data ->> 'avatar_url') <= 2048
      then u.raw_user_meta_data ->> 'avatar_url' end,
    false,
    case when u.raw_user_meta_data ->> 'signup_phone_number' ~ '^[+][1-9][0-9]{6,14}$'
      then u.raw_user_meta_data ->> 'signup_phone_number' end,
    case when char_length(btrim(u.raw_user_meta_data ->> 'signup_school_name')) between 1 and 120
      then btrim(u.raw_user_meta_data ->> 'signup_school_name') end
  from auth.users u where u.id = p_user_id
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  select id from public.profiles where id = p_user_id
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.create_storicode_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.ensure_library_profile(new.id);
  return new;
end;
$$;

create or replace function public.get_my_library_profile() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in to load your profile.' using errcode = '42501';
  end if;
  perform public.ensure_library_profile(uid);
  return (
    select to_jsonb(p) || jsonb_build_object('leaderboard_visible', prefs.leaderboard_visible)
    from public.profiles p join public.user_preferences prefs on prefs.user_id = p.id
    where p.id = uid
  );
end;
$$;

create or replace function public.save_library_profile(
  p_username text, p_display_name text, p_bio text, p_school_name text,
  p_phone_number text, p_avatar_url text, p_leaderboard_visible boolean
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in to save your profile.' using errcode = '42501';
  end if;
  if p_username is null or p_username !~ '^[a-z0-9_]{3,36}$'
    or nullif(btrim(p_display_name), '') is null
    or char_length(btrim(p_display_name)) > 60 then
    raise exception 'Enter a valid username and display name.' using errcode = '23514';
  end if;

  perform public.ensure_library_profile(uid);
  update public.profiles
  set username = p_username, display_name = btrim(p_display_name), bio = coalesce(btrim(p_bio), ''),
    school_name = nullif(btrim(p_school_name), ''), phone_number = nullif(btrim(p_phone_number), ''),
    avatar_url = nullif(p_avatar_url, ''), onboarding_completed = true
  where id = uid;

  update public.user_preferences
  set leaderboard_visible = coalesce(p_leaderboard_visible, leaderboard_visible)
  where user_id = uid;
  return public.get_my_library_profile();
end;
$$;

alter function public.ensure_library_profile(uuid) owner to postgres;
alter function public.create_storicode_profile() owner to postgres;
alter function public.get_my_library_profile() owner to postgres;
alter function public.save_library_profile(text, text, text, text, text, text, boolean) owner to postgres;
revoke all on function public.ensure_library_profile(uuid), public.create_storicode_profile(),
  public.get_my_library_profile(), public.save_library_profile(text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.get_my_library_profile(),
  public.save_library_profile(text, text, text, text, text, text, boolean) to authenticated;

-- Restore the existing avatar bucket and its owner-folder policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Own avatar uploads" on storage.objects;
create policy "Own avatar uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own avatar edits" on storage.objects;
create policy "Own avatar edits" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own avatar removal" on storage.objects;
create policy "Own avatar removal" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own avatar listing" on storage.objects;
create policy "Own avatar listing" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
commit;
