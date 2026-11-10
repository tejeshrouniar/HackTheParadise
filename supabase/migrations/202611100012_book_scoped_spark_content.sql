-- Scope paid hints and solutions by book. Chapter numbers can then restart at
-- one in each book without sharing unlocks or changing any saved balances.
begin;

alter table public.spark_unlocks
  add column if not exists book_id text not null default 'cinder';
alter table public.spark_content
  add column if not exists book_id text not null default 'cinder';

alter table public.spark_unlocks
  drop constraint if exists spark_unlocks_book_id_check;
alter table public.spark_unlocks
  add constraint spark_unlocks_book_id_check check (book_id ~ '^[a-z0-9][a-z0-9-]{0,47}$');
alter table public.spark_content
  drop constraint if exists spark_content_book_id_check;
alter table public.spark_content
  add constraint spark_content_book_id_check check (book_id ~ '^[a-z0-9][a-z0-9-]{0,47}$');

-- Existing tutorial unlocks and content keep their old lesson numbers under
-- the default book key. Harry Potter uses its own 1-12 range.
alter table public.spark_unlocks drop constraint if exists spark_unlocks_pkey;
alter table public.spark_unlocks
  add constraint spark_unlocks_pkey primary key (user_id, book_id, lesson_id, kind);
alter table public.spark_content drop constraint if exists spark_content_pkey;
alter table public.spark_content
  add constraint spark_content_pkey primary key (book_id, lesson_id, kind);

create or replace function public.spark_wallet()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  result jsonb;
begin
  if u is null then raise exception 'Sign in to use sparks'; end if;
  insert into public.spark_wallets(user_id) values (u) on conflict do nothing;
  insert into public.spark_ledger(user_id, amount, reference)
  values (u, 30, 'welcome:' || u) on conflict do nothing;
  select jsonb_build_object(
    'balance', w.balance,
    'unlimited', exists (
      select 1 from public.spark_unlimited_access a
      where a.user_id = u and a.revoked_at is null
    ),
    'unlocks', coalesce((
      select jsonb_agg(jsonb_build_object('book_id', x.book_id, 'lesson_id', x.lesson_id, 'kind', x.kind))
      from public.spark_unlocks x where x.user_id = u
    ), '[]'::jsonb)
  ) into result
  from public.spark_wallets w where w.user_id = u;
  return result;
end
$$;

create or replace function public.spend_sparks(book_key text, lesson integer, item text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  price integer;
  funds integer;
  unlimited_access boolean;
begin
  if u is null then raise exception 'Sign in to use sparks'; end if;
  if book_key is null or book_key !~ '^[a-z0-9][a-z0-9-]{0,47}$'
    or lesson is null or lesson not between 1 and 12
    or item is null or item not in ('hint', 'solution')
  then
    raise exception 'Invalid purchase';
  end if;
  perform public.spark_wallet();
  select w.balance into funds from public.spark_wallets w where w.user_id = u for update;
  select exists (
    select 1 from public.spark_unlimited_access a
    where a.user_id = u and a.revoked_at is null
  ) into unlimited_access;
  if exists (
    select 1 from public.spark_unlocks x
    where x.user_id = u and x.book_id = book_key and x.lesson_id = lesson and x.kind = item
  ) then return public.spark_wallet(); end if;
  price := case when item = 'hint' then 10 else 20 end;
  if not unlimited_access and funds < price then raise exception 'Not enough sparks'; end if;
  if not unlimited_access then
    update public.spark_wallets set balance = balance - price where user_id = u;
    insert into public.spark_ledger(user_id, amount, reference)
    values (u, -price, 'unlock:' || u || ':' || book_key || ':' || lesson || ':' || item);
  end if;
  insert into public.spark_unlocks(user_id, book_id, lesson_id, kind)
  values (u, book_key, lesson, item);
  return public.spark_wallet();
end
$$;

-- Keep old deployed clients working against the tutorial while the browser app
-- rolls forward to the book-scoped RPC signature.
create or replace function public.spend_sparks(lesson integer, item text)
returns jsonb
language sql
security definer
set search_path = ''
as $$ select public.spend_sparks('cinder', lesson, item) $$;

create or replace function public.get_spark_content(book_key text, lesson integer, item text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare result text;
begin
  if auth.uid() is null then raise exception 'Sign in to read this unlock'; end if;
  if book_key is null or book_key !~ '^[a-z0-9][a-z0-9-]{0,47}$'
    or lesson is null or lesson not between 1 and 12
    or item is null or item not in ('hint', 'solution')
  then raise exception 'Invalid unlock'; end if;
  if not exists (
    select 1 from public.spark_unlocks
    where user_id = auth.uid() and book_id = book_key and lesson_id = lesson and kind = item
  ) then raise exception 'Purchase required'; end if;
  select body into result from public.spark_content
  where book_id = book_key and lesson_id = lesson and kind = item;
  if result is null then raise exception 'Content unavailable'; end if;
  return result;
end
$$;

create or replace function public.get_spark_content(lesson integer, item text)
returns text
language sql
security definer
set search_path = ''
as $$ select public.get_spark_content('cinder', lesson, item) $$;

create or replace function public.require_spark_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.spark_content
    where book_id = new.book_id and lesson_id = new.lesson_id and kind = new.kind
  ) then raise exception 'Content unavailable; no sparks spent'; end if;
  return new;
end
$$;

drop trigger if exists require_spark_content on public.spark_unlocks;
create trigger require_spark_content before insert on public.spark_unlocks
  for each row execute function public.require_spark_content();

revoke all on function public.spend_sparks(text, integer, text), public.spend_sparks(integer, text)
  from public, anon, authenticated;
grant execute on function public.spend_sparks(text, integer, text), public.spend_sparks(integer, text)
  to authenticated;
revoke all on function public.get_spark_content(text, integer, text), public.get_spark_content(integer, text)
  from public, anon, authenticated;
grant execute on function public.get_spark_content(text, integer, text), public.get_spark_content(integer, text)
  to authenticated;
revoke all on function public.require_spark_content() from public, anon, authenticated;

insert into public.spark_content(book_id, lesson_id, kind, body) values
  ('harry-potter', 1, 'hint', $hint$A slice can read a string from the end. Try text[::-1]: the negative step walks backward.$hint$),
  ('harry-potter', 1, 'solution', $solution$def reveal_diary_secret(text):
    return text[::-1]$solution$),
  ('harry-potter', 2, 'hint', $hint$Create a new list with a comprehension. Keep each energy value when it is greater than or equal to zero.$hint$),
  ('harry-potter', 2, 'solution', $solution$def cleanse_ring(energy_levels):
    return [value for value in energy_levels if value >= 0]$solution$),
  ('harry-potter', 3, 'hint', $hint$Loop over the vowels and replace each one in the current text. Include uppercase and lowercase vowels.$hint$),
  ('harry-potter', 3, 'solution', $solution$def parseltongue(text):
    for vowel in ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]:
        text = text.replace(vowel, "sss")
    return text$solution$),
  ('harry-potter', 4, 'hint', $hint$The list count() method returns how many entries equal the target weight.$hint$),
  ('harry-potter', 4, 'solution', $solution$def count_real_cups(items, target_weight):
    return items.count(target_weight)$solution$),
  ('harry-potter', 5, 'hint', $hint$Both conditions must hold: wisdom must be greater than arrogance, and pure_intent must be true.$hint$),
  ('harry-potter', 5, 'solution', $solution$def can_unlock_diadem(wisdom, arrogance, pure_intent):
    return wisdom > arrogance and pure_intent$solution$),
  ('harry-potter', 6, 'hint', $hint$Unpack start_pos into x and y. For each direction, change only the matching coordinate; UP adds one to y.$hint$),
  ('harry-potter', 6, 'solution', $solution$def track_nagini(start_pos, moves):
    x, y = start_pos
    for direction in moves:
        if direction == "UP":
            y += 1
        elif direction == "DOWN":
            y -= 1
        elif direction == "LEFT":
            x -= 1
        elif direction == "RIGHT":
            x += 1
    return [x, y]$solution$),
  ('harry-potter', 7, 'hint', $hint$Use sorted(timestamps) to make a new list in ascending order. Return that list.$hint$),
  ('harry-potter', 7, 'solution', $solution$def sort_memories(timestamps):
    return sorted(timestamps)$solution$),
  ('harry-potter', 8, 'hint', $hint$Use one comprehension inside another: visit every row, then every item in that row.$hint$),
  ('harry-potter', 8, 'solution', $solution$def unwrap_turban(layers):
    return [item for row in layers for item in row]$solution$),
  ('harry-potter', 9, 'hint', $hint$Add the expected sum from 1 through n, then subtract the values that remain in sock_list.$hint$),
  ('harry-potter', 9, 'solution', $solution$def find_missing_sock(sock_list, n):
    expected = n * (n + 1) // 2
    return expected - sum(sock_list)$solution$),
  ('harry-potter', 10, 'hint', $hint$Handle time == 0 first. Otherwise, speed is distance divided by time.$hint$),
  ('harry-potter', 10, 'solution', $solution$def calculate_speed(distance, time):
    if time == 0:
        return 0
    return distance / time$solution$),
  ('harry-potter', 11, 'hint', $hint$Loop over the cipher characters. Convert one character with ord(), subtract one, then convert it back with chr().$hint$),
  ('harry-potter', 11, 'solution', $solution$def decrypt_wand_code(cipher):
    decoded = ""
    for letter in cipher:
        decoded += chr(ord(letter) - 1)
    return decoded$solution$),
  ('harry-potter', 12, 'hint', $hint$Start with an empty dictionary. Loop over the records and update the result from each one in order.$hint$),
  ('harry-potter', 12, 'solution', $solution$def combine_horcrux_keys(dict_list):
    result = {}
    for record in dict_list:
        result.update(record)
    return result$solution$)
on conflict (book_id, lesson_id, kind) do update set body = excluded.body;

commit;
