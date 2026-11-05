import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const A = "00000000-0000-0000-0000-000000000001";
const B = "00000000-0000-0000-0000-000000000002";
const C = "00000000-0000-0000-0000-000000000003";

test("spark wallet: authorization, accounting and retry safety", async (t) => {
  const db = new PGlite();
  try {
    // Real PostgreSQL permissions and transactions. Payment webhook signatures,
    // concurrent network requests and live Supabase deployment need staging QA.
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
      $$;
      grant usage on schema public,auth to anon,authenticated,service_role;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant all on functions to anon,authenticated,service_role;
    `);
    await db.query("insert into auth.users values($1),($2),($3)", [A, B, C]);
    await db.exec(readFileSync(new URL("../supabase/migrations/202611050006_spark_wallet.sql", import.meta.url), "utf8"));
    async function as(role, user = "") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
      await db.exec(`set role ${role}`);
    }
    const wallet = async () => (await db.query("select public.spark_wallet() as wallet")).rows[0].wallet;
    const buy = async (lesson, item) => (await db.query("select public.spend_sparks($1,$2) as wallet", [lesson, item])).rows[0].wallet;
    const credit = (user, amount, reference) => db.query("select public.credit_sparks($1,$2,$3)", [user, amount, reference]);
    async function snapshot() {
      return {
        wallets: (await db.query("select * from public.spark_wallets order by user_id")).rows,
        ledger: (await db.query("select user_id,amount,reference from public.spark_ledger order by reference")).rows,
        unlocks: (await db.query("select * from public.spark_unlocks order by user_id,lesson_id,kind")).rows,
      };
    }

    await t.test("welcome grant happens once and purchases have fixed prices", async () => {
      await as("authenticated", A);
      assert.deepEqual(await wallet(), { balance: 30, unlocks: [] });
      assert.equal((await wallet()).balance, 30);
      assert.deepEqual((await db.query("select amount,reference from spark_ledger")).rows, [{ amount: 30, reference: `welcome:${A}` }]);
      assert.equal((await buy(1, "hint")).balance, 20);
      const purchased = await buy(1, "solution");
      assert.equal(purchased.balance, 0);
      assert.deepEqual(purchased.unlocks.map(x => x.kind).sort(), ["hint", "solution"]);
      assert.deepEqual((await db.query("select amount from spark_ledger order by id")).rows.map(x => x.amount), [30, -10, -20]);
    });

    await t.test("retries never charge again, even at zero balance", async () => {
      await as("authenticated", A);
      const before = await snapshot();
      assert.equal((await buy(1, "solution")).balance, 0);
      assert.equal((await buy(1, "hint")).balance, 0);
      assert.deepEqual(await snapshot(), before);
    });

    await t.test("insufficient funds and malformed purchases roll back", async () => {
      await as("authenticated", A);
      const before = await snapshot();
      await assert.rejects(buy(2, "hint"), /Not enough sparks/);
      for (const args of [[0, "hint"], [13, "solution"], [null, "hint"], [2, "free"], [2, null]]) {
        await assert.rejects(buy(...args), /Invalid purchase/);
      }
      assert.deepEqual(await snapshot(), before);
    });

    await t.test("another account cannot read or spend this account's funds", async () => {
      await as("authenticated", B);
      assert.deepEqual(await wallet(), { balance: 30, unlocks: [] });
      assert.equal((await buy(2, "hint")).balance, 20);
      for (const table of ["spark_wallets", "spark_ledger", "spark_unlocks"]) {
        assert.deepEqual((await db.query(`select * from public.${table} where user_id=$1`, [A])).rows, []);
        assert.ok((await db.query(`select user_id from public.${table}`)).rows.every(x => x.user_id === B));
      }
      await as("authenticated", A);
      assert.equal((await wallet()).balance, 0);
    });

    await t.test("browser roles cannot write tables or call the credit function", async () => {
      await as("authenticated", A);
      for (const statement of [
        `update public.spark_wallets set balance=99999 where user_id='${A}'`,
        `delete from public.spark_wallets where user_id='${A}'`,
        `insert into public.spark_wallets(user_id,balance) values('${C}',99999)`,
        `insert into public.spark_unlocks values('${A}',2,'solution')`,
        `delete from public.spark_unlocks where user_id='${A}'`,
        `update public.spark_unlocks set lesson_id=2 where user_id='${A}'`,
        `insert into public.spark_ledger(user_id,amount,reference) values('${A}',99999,'forged')`,
        `update public.spark_ledger set amount=99999 where user_id='${A}'`,
        `delete from public.spark_ledger where user_id='${A}'`,
      ]) await assert.rejects(db.exec(statement), /permission denied/);
      await assert.rejects(credit(A, 100, "forged"), /permission denied/);
      await as("anon");
      await assert.rejects(wallet(), /permission denied/);
      await assert.rejects(buy(1, "hint"), /permission denied/);
      await assert.rejects(credit(A, 100, "forged"), /permission denied/);
      await assert.rejects(db.query("select * from public.spark_wallets"), /permission denied/);
      await as("authenticated");
      await assert.rejects(wallet(), /Sign in/);
      await assert.rejects(buy(1, "hint"), /Sign in/);
    });

    await t.test("trusted credits are idempotent and reject conflicting references", async () => {
      await as("service_role");
      await credit(A, 100, "provider:payment-1");
      await credit(A, 100, "provider:payment-1");
      await assert.rejects(credit(A, 101, "provider:payment-1"), /Credit reference mismatch/);
      await assert.rejects(credit(C, 100, "provider:payment-1"), /Credit reference mismatch/);
      for (const [amount, reference] of [[0,"bad"], [-1,"bad"], [1000001,"bad"], [null,"bad"], [10,""], [10,null]]) {
        await assert.rejects(credit(A, amount, reference), /Invalid credit/);
      }
      await as("authenticated", A);
      assert.equal((await wallet()).balance, 100);
      assert.equal((await db.query("select count(*)::integer as n from spark_ledger where reference='credit:provider:payment-1'")).rows[0].n, 1);
      await db.exec("reset role");
      // A conflicting credit must also roll back the newly created wallet/grant.
      assert.deepEqual((await db.query("select * from spark_wallets where user_id=$1", [C])).rows, []);
      const reconciliation = (await db.query(`select w.user_id,w.balance,sum(l.amount)::integer as ledger_balance
        from spark_wallets w join spark_ledger l using(user_id) group by w.user_id,w.balance`)).rows;
      assert.ok(reconciliation.every(x => x.balance === x.ledger_balance));
    });
  } finally {
    await db.close();
  }
});
