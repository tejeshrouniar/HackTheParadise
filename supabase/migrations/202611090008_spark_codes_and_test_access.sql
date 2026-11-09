begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
revoke create on schema extensions from public, anon, authenticated;

-- Admin membership is written from the Supabase SQL Editor by the project owner.
create table public.spark_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

-- Only a digest is persisted. The plaintext code is returned once by the mint RPC.
create table public.spark_codes (
  code_hash text primary key check (length(code_hash) = 64),
  amount integer not null check (amount between 1 and 10000),
  max_redemptions integer not null default 1 check (max_redemptions between 1 and 10000),
  redemption_count integer not null default 0 check (redemption_count between 0 and max_redemptions),
  code_source text not null default 'test' check (code_source in ('test', 'promotion', 'referral')),
  campaign_key text check (campaign_key is null or length(campaign_key) between 1 and 80),
  referrer_user_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  constraint referral_codes_need_campaign check (code_source <> 'referral' or campaign_key is not null)
);

create table public.spark_code_redemptions (
  code_hash text not null references public.spark_codes(code_hash) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount between 1 and 10000),
  code_source text not null check (code_source in ('test', 'promotion', 'referral')),
  campaign_key text,
  referrer_user_id uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  primary key (code_hash, user_id)
);

-- Unlimited is a test entitlement, not an artificial numeric balance.
create table public.spark_unlimited_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null
);

alter table public.spark_admins enable row level security;
alter table public.spark_codes enable row level security;
alter table public.spark_code_redemptions enable row level security;
alter table public.spark_unlimited_access enable row level security;
revoke all on public.spark_admins, public.spark_codes, public.spark_code_redemptions, public.spark_unlimited_access from public, anon, authenticated, service_role;

create function public.spark_code_digest(p_code text)
returns text
language sql
immutable
security definer
set search_path = ''
as $$
  select encode(extensions.digest(p_code, 'sha256'), 'hex')
$$;
revoke all on function public.spark_code_digest(text) from public, anon, authenticated, service_role;

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
      select jsonb_agg(jsonb_build_object('lesson_id', x.lesson_id, 'kind', x.kind))
      from public.spark_unlocks x where x.user_id = u
    ), '[]'::jsonb)
  ) into result
  from public.spark_wallets w where w.user_id = u;
  return result;
end
$$;

create or replace function public.spend_sparks(lesson integer, item text)
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
  if lesson is null or lesson not between 1 and 12 or item is null or item not in ('hint', 'solution') then
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
    where x.user_id = u and x.lesson_id = lesson and x.kind = item
  ) then return public.spark_wallet(); end if;
  price := case when item = 'hint' then 10 else 20 end;
  if not unlimited_access and funds < price then raise exception 'Not enough sparks'; end if;
  if not unlimited_access then
    update public.spark_wallets set balance = balance - price where user_id = u;
    insert into public.spark_ledger(user_id, amount, reference)
    values (u, -price, 'unlock:' || u || ':' || lesson || ':' || item);
  end if;
  insert into public.spark_unlocks(user_id, lesson_id, kind) values (u, lesson, item);
  return public.spark_wallet();
end
$$;

create function public.is_spark_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.spark_admins a where a.user_id = auth.uid()
  )
$$;

create function public.create_spark_codes(
  p_amount integer,
  p_count integer default 1,
  p_max_redemptions integer default 1,
  p_source text default 'test',
  p_campaign_key text default null,
  p_referrer_user_id uuid default null,
  p_expires_at timestamptz default null
)
returns table(generated_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_id uuid := auth.uid();
  i integer;
  plain_code text;
  v_code_hash text;
  campaign text := nullif(trim(p_campaign_key), '');
begin
  if admin_id is null or not public.is_spark_admin() then raise exception 'Admin access required'; end if;
  if p_amount is null or p_amount not between 1 and 10000
    or p_count is null or p_count not between 1 and 50
    or p_max_redemptions is null or p_max_redemptions not between 1 and 10000
    or p_source is null or p_source not in ('test', 'promotion', 'referral')
    or (p_expires_at is not null and p_expires_at <= now())
  then raise exception 'Invalid spark code settings'; end if;
  if campaign is not null and length(campaign) > 80 then raise exception 'Campaign name is too long'; end if;
  if p_source = 'referral' and (campaign is null or p_referrer_user_id is null) then
    raise exception 'Referral codes need a campaign name and referrer';
  end if;
  if p_referrer_user_id = admin_id then raise exception 'A code cannot refer to its creator'; end if;

  for i in 1..p_count loop
    plain_code := 'STORI-' || upper(replace(gen_random_uuid()::text, '-', ''));
    v_code_hash := public.spark_code_digest(plain_code);
    insert into public.spark_codes(
      code_hash, amount, max_redemptions, code_source, campaign_key,
      referrer_user_id, created_by, expires_at
    ) values (
      v_code_hash, p_amount, p_max_redemptions, p_source, campaign,
      case when p_source = 'referral' then p_referrer_user_id else null end,
      admin_id, p_expires_at
    );
    generated_code := plain_code;
    return next;
  end loop;
end
$$;

create function public.redeem_spark_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  normalized_code text;
  v_code_hash text;
  gift public.spark_codes;
  wallet_result jsonb;
begin
  if u is null then raise exception 'Sign in to redeem a spark code'; end if;
  if p_code is null or length(trim(p_code)) not between 20 and 48 then raise exception 'Invalid spark code'; end if;
  normalized_code := upper(trim(p_code));
  if normalized_code !~ '^STORI-[A-F0-9]{32}$' then raise exception 'Invalid spark code'; end if;
  v_code_hash := public.spark_code_digest(normalized_code);
  select * into gift from public.spark_codes c where c.code_hash = v_code_hash for update;
  if not found then raise exception 'Invalid spark code'; end if;

  perform public.spark_wallet();
  if exists (
    select 1 from public.spark_code_redemptions r
    where r.code_hash = v_code_hash and r.user_id = u
  ) then
    return public.spark_wallet() || jsonb_build_object('credited', 0, 'already_redeemed', true);
  end if;
  if gift.revoked_at is not null or (gift.expires_at is not null and gift.expires_at <= now())
    or gift.redemption_count >= gift.max_redemptions
  then raise exception 'Spark code is expired, revoked, or fully redeemed'; end if;

  perform 1 from public.spark_wallets w where w.user_id = u for update;
  insert into public.spark_code_redemptions(
    code_hash, user_id, amount, code_source, campaign_key, referrer_user_id
  ) values (
    v_code_hash, u, gift.amount, gift.code_source, gift.campaign_key, gift.referrer_user_id
  );
  update public.spark_codes c set redemption_count = c.redemption_count + 1 where c.code_hash = v_code_hash;
  update public.spark_wallets set balance = balance + gift.amount where user_id = u;
  insert into public.spark_ledger(user_id, amount, reference)
  values (u, gift.amount, 'code:' || v_code_hash || ':' || u);

  wallet_result := public.spark_wallet();
  return wallet_result || jsonb_build_object(
    'credited', gift.amount,
    'already_redeemed', false,
    'code_source', gift.code_source,
    'campaign_key', gift.campaign_key
  );
end
$$;

create function public.revoke_spark_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text;
  changed integer;
begin
  if auth.uid() is null or not public.is_spark_admin() then raise exception 'Admin access required'; end if;
  if p_code is null then raise exception 'Invalid spark code'; end if;
  normalized_code := upper(trim(p_code));
  if normalized_code !~ '^STORI-[A-F0-9]{32}$' then raise exception 'Invalid spark code'; end if;
  update public.spark_codes set revoked_at = coalesce(revoked_at, now())
  where code_hash = public.spark_code_digest(normalized_code);
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'Spark code not found'; end if;
  return true;
end
$$;

create function public.set_spark_unlimited_access(
  p_email text,
  p_enabled boolean,
  p_reason text default 'Internal testing access'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_id uuid := auth.uid();
  target_id uuid;
  target_email text;
  note text := coalesce(nullif(trim(p_reason), ''), 'Internal testing access');
begin
  if admin_id is null or not public.is_spark_admin() then raise exception 'Admin access required'; end if;
  if p_email is null or length(trim(p_email)) not between 3 and 254 or p_enabled is null then
    raise exception 'Enter a valid account email and action';
  end if;
  select u.id, u.email into target_id, target_email
  from auth.users u where lower(u.email) = lower(trim(p_email)) limit 1;
  if target_id is null then raise exception 'No account found for that email'; end if;
  if p_enabled then
    insert into public.spark_unlimited_access(user_id, granted_by, reason)
    values (target_id, admin_id, left(note, 240))
    on conflict (user_id) do update set
      granted_by = excluded.granted_by,
      reason = excluded.reason,
      granted_at = now(),
      revoked_at = null,
      revoked_by = null;
  else
    update public.spark_unlimited_access
    set revoked_at = coalesce(revoked_at, now()), revoked_by = admin_id
    where user_id = target_id;
  end if;
  return jsonb_build_object('email', target_email, 'unlimited', p_enabled);
end
$$;

revoke all on function public.spark_wallet(), public.spend_sparks(integer, text) from public, anon, authenticated;
revoke all on function public.is_spark_admin() from public, anon, authenticated;
revoke all on function public.create_spark_codes(integer, integer, integer, text, text, uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.redeem_spark_code(text) from public, anon, authenticated;
revoke all on function public.revoke_spark_code(text) from public, anon, authenticated;
revoke all on function public.set_spark_unlimited_access(text, boolean, text) from public, anon, authenticated;
grant execute on function public.spark_wallet(), public.spend_sparks(integer, text) to authenticated;
grant execute on function public.is_spark_admin(), public.create_spark_codes(integer, integer, integer, text, text, uuid, timestamptz), public.redeem_spark_code(text), public.revoke_spark_code(text), public.set_spark_unlimited_access(text, boolean, text) to authenticated;

commit;
