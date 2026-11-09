import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const A = "00000000-0000-0000-0000-000000000001";
const B = "00000000-0000-0000-0000-000000000002";
const C = "00000000-0000-0000-0000-000000000003";
const migration = (name) =>
  readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");

test("Spark codes work and migration 009 repairs a missing wallet foundation", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      create schema extensions;
      -- PGlite omits pgcrypto; PostgreSQL's built-in SHA-256 keeps the code path testable.
      create function extensions.digest(data text, algorithm text) returns bytea
        language sql immutable strict as $$
          select case when algorithm = 'sha256'
            then sha256(convert_to(data, 'UTF8'))
            else null end
        $$;
      grant usage on schema public, auth, extensions to anon, authenticated, service_role;
      alter default privileges in schema public
        grant all on tables to anon, authenticated, service_role;
      alter default privileges in schema public
        grant all on functions to anon, authenticated, service_role;
      create table auth.users(id uuid primary key, email text);
      insert into auth.users values
        ('${A}', 'admin@example.test'),
        ('${B}', 'learner@example.test'),
        ('${C}', 'referrer@example.test');
    `);

    // This recreates the reported hosted state: 008 is present, but migration 006's
    // wallet tables are not. The repair migration adds the missing foundation safely.
    const codesMigration = migration("202611090008_spark_codes_and_test_access.sql")
      .replace("create extension if not exists pgcrypto with schema extensions;", "-- pgcrypto is represented by the test SHA-256 shim above.");
    await db.exec(codesMigration);
    assert.equal(
      (await db.query("select to_regclass('public.spark_wallets') as table_name")).rows[0].table_name,
      null,
    );
    const repair = migration("202611090009_spark_wallet_foundation_repair.sql");
    await db.exec(repair);
    await db.exec(repair); // Reapplying it must preserve data and remain safe.
    await db.exec(migration("202611050007_spark_content.sql"));

    async function as(role, user = "") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
      await db.exec(`set role ${role}`);
    }
    const wallet = async () =>
      (await db.query("select public.spark_wallet() as wallet")).rows[0].wallet;
    const makeCode = async (amount, uses, source = "test", campaign = null, referrer = null) =>
      (await db.query(
        "select generated_code from public.create_spark_codes($1, 1, $2, $3, $4, $5, null)",
        [amount, uses, source, campaign, referrer],
      )).rows[0].generated_code;

    await db.query("insert into public.spark_admins(user_id) values ($1)", [A]);

    await t.test("the repair creates a secure wallet and the first grant is recorded once", async () => {
      await as("authenticated", A);
      assert.deepEqual(await wallet(), { balance: 30, unlimited: false, unlocks: [] });
      assert.deepEqual(
        (await db.query("select amount, reference from public.spark_ledger")).rows,
        [{ amount: 30, reference: `welcome:${A}` }],
      );
    });

    await t.test("admins mint hashed codes and redemptions are idempotent and limited", async () => {
      await as("authenticated", A);
      const code = await makeCode(100, 1);
      assert.match(code, /^STORI-[A-F0-9]{32}$/);
      await db.exec("reset role");
      const [stored] = (await db.query("select code_hash from public.spark_codes")).rows;
      assert.equal(stored.code_hash.length, 64);
      assert.notEqual(stored.code_hash, code);

      await as("authenticated", B);
      const redeemed = (await db.query("select public.redeem_spark_code($1) as wallet", [code])).rows[0].wallet;
      assert.equal(redeemed.credited, 100);
      assert.equal(redeemed.balance, 130);
      const retry = (await db.query("select public.redeem_spark_code($1) as wallet", [code])).rows[0].wallet;
      assert.equal(retry.already_redeemed, true);
      assert.equal(retry.credited, 0);
      assert.equal(retry.balance, 130);

      await as("authenticated", C);
      await assert.rejects(
        db.query("select public.redeem_spark_code($1)", [code]),
        /fully redeemed/,
      );
    });

    await t.test("referral tags are recorded, and revoked codes cannot be used", async () => {
      await as("authenticated", A);
      const referral = await makeCode(200, 2, "referral", "classroom-launch", C);
      const revoked = await makeCode(100, 1, "promotion", "launch-week");
      assert.equal(
        (await db.query("select public.revoke_spark_code($1) as revoked", [revoked])).rows[0].revoked,
        true,
      );

      await as("authenticated", B);
      const result = (await db.query("select public.redeem_spark_code($1) as wallet", [referral])).rows[0].wallet;
      assert.equal(result.credited, 200);
      await assert.rejects(
        db.query("select public.redeem_spark_code($1)", [revoked]),
        /revoked/,
      );

      await db.exec("reset role");
      const attribution = (await db.query(
        "select code_source, campaign_key, referrer_user_id from public.spark_code_redemptions where code_source = 'referral'",
      )).rows[0];
      assert.deepEqual(attribution, {
        code_source: "referral",
        campaign_key: "classroom-launch",
        referrer_user_id: C,
      });
    });

    await t.test("unlimited test access opens stored help without spending sparks", async () => {
      await as("authenticated", A);
      await db.query(
        "select public.set_spark_unlimited_access($1, true, $2)",
        ["referrer@example.test", "QA account"],
      );

      await as("authenticated", C);
      const before = await wallet();
      assert.equal(before.balance, 30);
      assert.equal(before.unlimited, true);
      const afterHint = (await db.query("select public.spend_sparks(1, 'hint') as wallet")).rows[0].wallet;
      const afterSolution = (await db.query("select public.spend_sparks(1, 'solution') as wallet")).rows[0].wallet;
      assert.equal(afterHint.balance, 30);
      assert.equal(afterSolution.balance, 30);
      assert.equal(
        (await db.query("select public.get_spark_content(1, 'solution') as solution")).rows[0].solution,
        "player.move_forward()\nplayer.move_forward()\nplayer.turn_right()\nplayer.move_forward()\nplayer.move_forward()\nplayer.collect_crystal()",
      );

      await as("authenticated", A);
      await db.query("select public.set_spark_unlimited_access($1, false, $2)", ["referrer@example.test", "QA finished"]);
      await as("authenticated", C);
      const paidWithSparks = (await db.query("select public.spend_sparks(2, 'hint') as wallet")).rows[0].wallet;
      assert.equal(paidWithSparks.balance, 20);
      assert.equal(paidWithSparks.unlimited, false);
    });

    await t.test("only the trusted service role can issue idempotent account credits", async () => {
      await as("service_role");
      await db.query("select public.credit_sparks($1, 100, $2)", [A, "provider:payment-1"]);
      await db.query("select public.credit_sparks($1, 100, $2)", [A, "provider:payment-1"]);
      await assert.rejects(
        db.query("select public.credit_sparks($1, 101, $2)", [A, "provider:payment-1"]),
        /Credit reference mismatch/,
      );
      await as("authenticated", A);
      assert.equal((await wallet()).balance, 130);

      await as("anon");
      await assert.rejects(wallet(), /permission denied/);
      await assert.rejects(db.query("select * from public.spark_wallets"), /permission denied/);
    });
  } finally {
    await db.close();
  }
});
