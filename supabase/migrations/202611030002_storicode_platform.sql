-- Run after 202611030001. Additive upgrade: existing accounts skip onboarding.
begin;

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists bio text not null default '';
-- The initial true default marks existing rows only; the trigger below creates new rows as false.
alter table public.profiles add column if not exists onboarding_completed boolean not null default true;
alter table public.profiles alter column onboarding_completed set default false;
update public.profiles set username = 'u_' || replace(id::text, '-', '') where username is null;
insert into public.profiles(id, display_name, avatar_url, username, onboarding_completed)
select id, left(coalesce(nullif(raw_user_meta_data->>'full_name',''),nullif(raw_user_meta_data->>'display_name',''),'Learner'),60),
  raw_user_meta_data->>'avatar_url', 'u_' || replace(id::text,'-',''), true
from auth.users on conflict(id) do nothing;
alter table public.profiles alter column username set not null;
create unique index if not exists profiles_username_unique on public.profiles(username);
alter table public.profiles add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,36}$');
alter table public.profiles add constraint profiles_bio_length check (char_length(bio) <= 280);
-- NOT VALID preserves unusually long legacy names while enforcing the rule on future edits.
alter table public.profiles add constraint profiles_name_length check (char_length(trim(display_name)) between 1 and 60) not valid;
alter table public.profiles add constraint profiles_avatar_https check (avatar_url is null or (avatar_url like 'https://%' and char_length(avatar_url) <= 2048)) not valid;
drop policy if exists "Players can read their own profile" on public.profiles;
create policy "Members can see public profiles" on public.profiles for select to authenticated using(true);
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(username,display_name,avatar_url,bio,onboarding_completed) on public.profiles to authenticated;

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  sound_effects boolean not null default false,
  reduced_motion boolean not null default false,
  music_volume real not null default 0.35 check(music_volume between 0 and 1),
  focus_minutes integer not null default 25 check(focus_minutes between 1 and 120),
  gender text not null default '' check(gender in ('','woman','man','nonbinary','self-described','prefer-not-to-say')),
  updated_at timestamptz not null default now()
);
insert into public.user_preferences(user_id) select id from public.profiles on conflict do nothing;
alter table public.user_preferences enable row level security;
revoke all on public.user_preferences from anon,authenticated;
grant select,insert,update on public.user_preferences to authenticated;
create policy "Own preferences" on public.user_preferences for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profile_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger preferences_updated before update on public.user_preferences for each row execute function public.touch_updated_at();

create or replace function public.create_storicode_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,username,display_name,avatar_url,onboarding_completed)
  values(new.id, 'u_' || replace(new.id::text,'-',''),
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),nullif(trim(new.raw_user_meta_data->>'full_name'),''),'Learner'),60),
    case when new.raw_user_meta_data->>'avatar_url' like 'https://%' then new.raw_user_meta_data->>'avatar_url' else null end, false)
  on conflict(id) do nothing;
  insert into public.user_preferences(user_id) values(new.id) on conflict do nothing;
  return new;
end; $$;

create function public.username_available(candidate text) returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and candidate ~ '^[a-z0-9_]{3,36}$'
    and not exists(select 1 from public.profiles where username=candidate and id<>auth.uid());
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to authenticated;

create table public.achievements (
  id text primary key, title text not null, description text not null, required_lessons integer not null check(required_lessons>0)
);
insert into public.achievements values
 ('first-spell','First spell','Complete your first coding quest.',1),
 ('finding-your-flow','Finding your flow','Complete four coding quests.',4),
 ('realm-restorer','Realm restorer','Complete all eight coding quests.',8);
create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  earned_at timestamptz not null default now(), primary key(user_id,achievement_id)
);
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
revoke all on public.achievements,public.user_achievements from anon,authenticated;
grant select on public.achievements to anon,authenticated;
grant select on public.user_achievements to authenticated;
create policy "Achievement catalog" on public.achievements for select using(true);
create policy "Own achievements" on public.user_achievements for select to authenticated using((select auth.uid())=user_id);
create function public.award_learning_achievements() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.user_achievements(user_id,achievement_id)
  select new.user_id,id from public.achievements where required_lessons <=
    (select count(distinct n) from unnest(new.completed_lessons) n where n between 1 and 8)
  on conflict do nothing;
  return new;
end; $$;
create trigger progress_achievements after insert or update on public.player_progress for each row execute function public.award_learning_achievements();
insert into public.user_achievements(user_id,achievement_id)
select p.user_id,a.id from public.player_progress p cross join public.achievements a
where a.required_lessons <= (select count(distinct n) from unnest(p.completed_lessons) n where n between 1 and 8) on conflict do nothing;

create function public.merge_player_progress(lesson_ids integer[]) returns integer[] language plpgsql security definer set search_path='' as $$
declare result integer[]; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in to save progress'; end if;
  if cardinality(lesson_ids)>8 or exists(select 1 from unnest(lesson_ids) n where n<1 or n>8 or n is null) then raise exception 'Invalid lesson identifiers'; end if;
  insert into public.player_progress(user_id,completed_lessons)
  values(uid,array(select distinct n from unnest(lesson_ids) n order by n))
  on conflict(user_id) do update set
    completed_lessons=array(select distinct n from unnest(public.player_progress.completed_lessons || excluded.completed_lessons) n order by n),
    updated_at=now()
  returning completed_lessons into result;
  return result;
end; $$;
revoke all on function public.merge_player_progress(integer[]) from public;
grant execute on function public.merge_player_progress(integer[]) to authenticated;
-- Existing clients may still write their own progress during the rollout; no rows are deleted.

create table public.stories (
  id text primary key check(id ~ '^[a-z0-9-]+$'), title text not null, description text not null,
  published boolean not null default false, updated_at timestamptz not null default now()
);
create table public.story_chapters (
  id text primary key check(id ~ '^[a-z0-9-]+$'), story_id text not null references public.stories(id),
  position integer not null, title text not null, subtitle text not null default '',
  lesson_id integer not null check(lesson_id between 1 and 8),
  content jsonb not null check(jsonb_typeof(content)='array'), published boolean not null default false,
  updated_at timestamptz not null default now(), unique(story_id,position)
);
create table public.story_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id text not null references public.story_chapters(id),
  completed boolean not null default false, choices jsonb not null default '{}' check(jsonb_typeof(choices)='object' and octet_length(choices::text)<=8192),
  updated_at timestamptz not null default now(), primary key(user_id,chapter_id)
);
alter table public.stories enable row level security;
alter table public.story_chapters enable row level security;
alter table public.story_progress enable row level security;
revoke all on public.stories,public.story_chapters,public.story_progress from anon,authenticated;
grant select on public.stories,public.story_chapters to anon,authenticated;
grant select,insert,update on public.story_progress to authenticated;
create policy "Published stories" on public.stories for select using(published);
create policy "Published chapters" on public.story_chapters for select using(published and exists(select 1 from public.stories where id=story_id and published));
create policy "Own story progress" on public.story_progress for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id and exists(select 1 from public.story_chapters where id=chapter_id));
create trigger story_progress_updated before update on public.story_progress for each row execute function public.touch_updated_at();

create table public.study_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check(kind in ('note','snippet')), title text not null check(char_length(trim(title)) between 1 and 100),
  body text not null default '' check(char_length(body)<=20000), language text not null default 'python' check(language in ('python','javascript','text')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index study_items_owner on public.study_items(user_id,updated_at desc);
alter table public.study_items enable row level security;
revoke all on public.study_items from anon,authenticated;
grant select,insert,update,delete on public.study_items to authenticated;
create policy "Own study items" on public.study_items for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create trigger study_items_updated before update on public.study_items for each row execute function public.touch_updated_at();

create table public.chat_rooms (id text primary key, name text not null, description text not null);
insert into public.chat_rooms values ('commons','The commons','Say hello, share a win, or ask for a little help.'),('code-help','Code help','Share your approach. Help someone understand the next step.');
create table public.chat_restrictions (user_id uuid primary key references public.profiles(id) on delete cascade, muted_until timestamptz not null, reason text not null);
-- Moderators manage restrictions and reports through the Supabase dashboard only.
alter table public.chat_restrictions enable row level security;
revoke all on public.chat_restrictions from anon,authenticated;
create table public.chat_rate_limits (user_id uuid primary key references public.profiles(id) on delete cascade, last_sent timestamptz not null, window_started timestamptz not null, sent_count integer not null);
alter table public.chat_rate_limits enable row level security;
revoke all on public.chat_rate_limits from anon,authenticated;
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(), room_id text not null references public.chat_rooms(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(trim(body)) between 1 and 2000), created_at timestamptz not null default now()
);
create index chat_messages_room_time on public.chat_messages(room_id,created_at desc,id desc);
create index chat_messages_author_time on public.chat_messages(user_id,created_at desc);
create table public.chat_reports (
  id uuid primary key default gen_random_uuid(), message_id uuid references public.chat_messages(id) on delete set null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check(char_length(trim(reason)) between 5 and 500), created_at timestamptz not null default now(),
  resolved_at timestamptz, unique(message_id,reporter_id)
);
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_reports enable row level security;
revoke all on public.chat_rooms,public.chat_messages,public.chat_reports from anon,authenticated;
grant select on public.chat_rooms to authenticated;
grant select,delete on public.chat_messages to authenticated;
grant insert(id,room_id,user_id,body) on public.chat_messages to authenticated;
grant insert(message_id,reporter_id,reason) on public.chat_reports to authenticated;
grant select on public.chat_reports to authenticated;
create policy "Members read rooms" on public.chat_rooms for select to authenticated using(true);
create policy "Members read messages" on public.chat_messages for select to authenticated using(true);
create policy "Members send their own messages" on public.chat_messages for insert to authenticated with check((select auth.uid())=user_id);
create policy "Authors delete messages" on public.chat_messages for delete to authenticated using((select auth.uid())=user_id);
create policy "Members report messages" on public.chat_reports for insert to authenticated with check((select auth.uid())=reporter_id and exists(select 1 from public.chat_messages m where m.id=message_id));
create policy "Own reports" on public.chat_reports for select to authenticated using((select auth.uid())=reporter_id);
create function public.guard_chat_message() returns trigger language plpgsql security definer set search_path='' as $$
declare rate public.chat_rate_limits%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
  if exists(select 1 from public.chat_restrictions where user_id=new.user_id and muted_until>now()) then raise exception 'Messaging is temporarily paused for this account.'; end if;
  if exists(select 1 from public.profiles where id=new.user_id and not onboarding_completed) then raise exception 'Complete your profile before sending messages.'; end if;
  select * into rate from public.chat_rate_limits where user_id=new.user_id;
  if rate.last_sent>now()-interval '2 seconds' or (rate.window_started>now()-interval '1 minute' and rate.sent_count>=15) then raise exception 'Please slow down. Try again in a moment.'; end if;
  insert into public.chat_rate_limits(user_id,last_sent,window_started,sent_count) values(new.user_id,now(),now(),1)
  on conflict(user_id) do update set last_sent=now(),
    window_started=case when public.chat_rate_limits.window_started<=now()-interval '1 minute' then now() else public.chat_rate_limits.window_started end,
    sent_count=case when public.chat_rate_limits.window_started<=now()-interval '1 minute' then 1 else public.chat_rate_limits.sent_count+1 end;
  new.body=trim(new.body); new.created_at=now(); return new;
end; $$;
create trigger chat_rate_limit before insert on public.chat_messages for each row execute function public.guard_chat_message();
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "Own avatar uploads" on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own avatar edits" on storage.objects for update to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own avatar removal" on storage.objects for delete to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own avatar listing" on storage.objects for select to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- No direct execution of internal trigger functions from the Data API.
revoke all on function public.create_storicode_profile(),public.touch_updated_at(),public.award_learning_achievements(),public.guard_chat_message() from public;
notify pgrst,'reload schema';
commit;
