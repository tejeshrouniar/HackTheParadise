begin;

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

  -- Older clients can still unlock a Harry Potter hint without a wallet charge.
  price := case
    when book_key = 'harry-potter' and item = 'hint' then 0
    when book_key = 'harry-potter' or item = 'hint' then 10
    else 20
  end;
  if not unlimited_access and price > 0 then
    if funds < price then raise exception 'Not enough sparks'; end if;
    update public.spark_wallets set balance = balance - price where user_id = u;
    insert into public.spark_ledger(user_id, amount, reference)
    values (u, -price, 'unlock:' || u || ':' || book_key || ':' || lesson || ':' || item);
  end if;
  insert into public.spark_unlocks(user_id, book_id, lesson_id, kind)
  values (u, book_key, lesson, item);
  return public.spark_wallet();
end
$$;

-- Match the shorter starter patterns while retaining existing unlock keys.
insert into public.spark_content(book_id, lesson_id, kind, body) values
  ('harry-potter', 3, 'solution', $solution$def parseltongue(text):
    for vowel in "aeiouAEIOU":
        text = text.replace(vowel, "sss")
    return text$solution$),
  ('harry-potter', 6, 'solution', $solution$def track_nagini(start_pos, moves):
    x, y = start_pos
    x += moves.count("RIGHT") - moves.count("LEFT")
    y += moves.count("UP") - moves.count("DOWN")
    return [x, y]$solution$),
  ('harry-potter', 8, 'solution', $solution$def unwrap_turban(layers):
    flat = []
    for row in layers:
        flat += row
    return flat$solution$),
  ('harry-potter', 11, 'solution', $solution$def decrypt_wand_code(cipher):
    decoded = ""
    for letter in cipher:
        number = ord(letter)
        decoded += chr(number - 1)
    return decoded$solution$)
on conflict (book_id, lesson_id, kind) do update set body = excluded.body;

commit;
