-- Recreate only the Spark wallet foundation if migration 006 was skipped.
-- This is safe after migration 008: existing wallet, ledger, and unlock rows remain intact.
begin;

create table if not exists public.spark_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 30 check (balance >= 0)
);

create table if not exists public.spark_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reference text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.spark_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null check (lesson_id between 1 and 12),
  kind text not null check (kind in ('hint', 'solution')),
  primary key (user_id, lesson_id, kind)
);

-- Restore the same owner-only read access used by the original wallet migration.
alter table public.spark_wallets enable row level security;
alter table public.spark_ledger enable row level security;
alter table public.spark_unlocks enable row level security;
revoke all on public.spark_wallets, public.spark_ledger, public.spark_unlocks
  from public, anon, authenticated, service_role;
grant select on public.spark_wallets, public.spark_ledger, public.spark_unlocks
  to authenticated;

drop policy if exists own_wallet on public.spark_wallets;
create policy own_wallet on public.spark_wallets
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists own_ledger on public.spark_ledger;
create policy own_ledger on public.spark_ledger
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists own_unlocks on public.spark_unlocks;
create policy own_unlocks on public.spark_unlocks
  for select to authenticated using (user_id = (select auth.uid()));

-- Keep payment credits server-only and retry-safe when a payment webhook retries.
create or replace function public.credit_sparks(
  recipient uuid,
  quantity integer,
  payment_reference text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted integer;
  existing public.spark_ledger;
begin
  if recipient is null
    or quantity is null or quantity <= 0 or quantity > 1000000
    or payment_reference is null
    or length(payment_reference) not between 3 and 200
  then
    raise exception 'Invalid credit';
  end if;

  insert into public.spark_wallets(user_id)
  values (recipient) on conflict do nothing;
  insert into public.spark_ledger(user_id, amount, reference)
  values (recipient, 30, 'welcome:' || recipient) on conflict do nothing;
  perform 1 from public.spark_wallets where user_id = recipient for update;

  insert into public.spark_ledger(user_id, amount, reference)
  values (recipient, quantity, 'credit:' || payment_reference)
  on conflict do nothing;
  get diagnostics inserted = row_count;

  if inserted = 1 then
    update public.spark_wallets
    set balance = balance + quantity
    where user_id = recipient;
  else
    select * into existing
    from public.spark_ledger
    where reference = 'credit:' || payment_reference;
    if not found or existing.user_id <> recipient or existing.amount <> quantity then
      raise exception 'Credit reference mismatch';
    end if;
  end if;
end
$$;

revoke all on function public.credit_sparks(uuid, integer, text)
  from public, anon, authenticated, service_role;
grant execute on function public.credit_sparks(uuid, integer, text)
  to service_role;

commit;
