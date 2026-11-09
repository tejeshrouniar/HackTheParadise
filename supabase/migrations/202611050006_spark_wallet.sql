begin;
create table public.spark_wallets(user_id uuid primary key references auth.users(id) on delete cascade,balance integer not null default 30 check(balance>=0));
create table public.spark_ledger(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,amount integer not null check(amount<>0),reference text not null unique,created_at timestamptz not null default now());
create table public.spark_unlocks(user_id uuid not null references auth.users(id) on delete cascade,lesson_id integer not null check(lesson_id between 1 and 12),kind text not null check(kind in ('hint','solution')),primary key(user_id,lesson_id,kind));
alter table public.spark_wallets enable row level security;
alter table public.spark_ledger enable row level security;
alter table public.spark_unlocks enable row level security;
revoke all on public.spark_wallets,public.spark_ledger,public.spark_unlocks from anon,authenticated;
grant select on public.spark_wallets,public.spark_ledger,public.spark_unlocks to authenticated;
create policy own_wallet on public.spark_wallets for select to authenticated using(user_id=(select auth.uid()));
create policy own_ledger on public.spark_ledger for select to authenticated using(user_id=(select auth.uid()));
create policy own_unlocks on public.spark_unlocks for select to authenticated using(user_id=(select auth.uid()));
create function public.spark_wallet() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Sign in to use sparks'; end if;
 insert into public.spark_wallets(user_id) values(u) on conflict do nothing;
 insert into public.spark_ledger(user_id,amount,reference) values(u,30,'welcome:'||u) on conflict do nothing;
 select jsonb_build_object('balance',w.balance,'unlocks',coalesce((select jsonb_agg(jsonb_build_object('lesson_id',x.lesson_id,'kind',x.kind)) from public.spark_unlocks x where x.user_id=u),'[]'::jsonb)) into result from public.spark_wallets w where w.user_id=u;
 return result;
end $$;
create function public.spend_sparks(lesson integer,item text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); price integer; funds integer;
begin
 if u is null then raise exception 'Sign in to use sparks'; end if;
 if lesson is null or lesson not between 1 and 12 or item is null or item not in ('hint','solution') then raise exception 'Invalid purchase'; end if;
 perform public.spark_wallet();
 select balance into funds from public.spark_wallets where user_id=u for update;
 if exists(select 1 from public.spark_unlocks where user_id=u and lesson_id=lesson and kind=item) then return public.spark_wallet(); end if;
 price:=case when item='hint' then 10 else 20 end;
 if funds<price then raise exception 'Not enough sparks'; end if;
 update public.spark_wallets set balance=balance-price where user_id=u;
 insert into public.spark_unlocks values(u,lesson,item);
 insert into public.spark_ledger(user_id,amount,reference) values(u,-price,'unlock:'||u||':'||lesson||':'||item);
 return public.spark_wallet();
end $$;
-- Trusted backend only: verify provider payment/reward before calling.
-- Never use a browser-supplied quantity or trust browser progress as money.
create function public.credit_sparks(recipient uuid,quantity integer,payment_reference text) returns void language plpgsql security definer set search_path='' as $$
declare inserted integer; existing public.spark_ledger;
begin
 if quantity is null or quantity<=0 or quantity>1000000 or payment_reference is null or length(payment_reference) not between 3 and 200 then raise exception 'Invalid credit'; end if;
 insert into public.spark_wallets(user_id) values(recipient) on conflict do nothing;
 insert into public.spark_ledger(user_id,amount,reference) values(recipient,30,'welcome:'||recipient) on conflict do nothing;
 perform 1 from public.spark_wallets where user_id=recipient for update;
 insert into public.spark_ledger(user_id,amount,reference) values(recipient,quantity,'credit:'||payment_reference) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 then update public.spark_wallets set balance=balance+quantity where user_id=recipient;
 else
 select * into existing from public.spark_ledger where reference='credit:'||payment_reference;
 if existing.user_id<>recipient or existing.amount<>quantity then raise exception 'Credit reference mismatch'; end if;
 end if;
end $$;
revoke all on function public.spark_wallet(),public.spend_sparks(integer,text),public.credit_sparks(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.spark_wallet(),public.spend_sparks(integer,text) to authenticated;
grant execute on function public.credit_sparks(uuid,integer,text) to service_role;
commit;
