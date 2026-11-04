import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const A = "00000000-0000-0000-0000-000000000001",
  B = "00000000-0000-0000-0000-000000000002",
  C = "00000000-0000-0000-0000-000000000003";
const migration = (name) =>
  readFileSync(
    new URL(`../supabase/migrations/${name}`, import.meta.url),
    "utf8",
  );
test("database upgrade preserves data and enforces member isolation", async (t) => {
  const db = new PGlite();
  try {
    // Minimal Supabase-owned schemas. This tests real PostgreSQL constraints/RLS;
    // GoTrue, Storage HTTP validation and Realtime transport require live staging tests.
    await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
      alter default privileges in schema public grant all on tables to anon,authenticated;
      create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
      grant usage on schema public,auth,storage to authenticated,anon;
      grant select,insert,update,delete on storage.objects to authenticated;`);
    await db.exec(migration("202611030001_storicode_auth_and_progress.sql"));
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [
        A,
        "existing@example.test",
        JSON.stringify({ full_name: "Existing Learner" }),
      ],
    );
    await db.query(
      "insert into public.player_progress(user_id,completed_lessons) values($1,$2)",
      [A, [1, 3]],
    );
    await db.exec(migration("202611030002_storicode_platform.sql"));
    await db.exec(migration("202611030003_first_light_content.sql"));
    await db.query(
      "insert into public.story_progress(user_id,chapter_id,completed,choices) values($1,'the-awakening',true,$2)",
      [A, JSON.stringify({ "first-response": "careful" })],
    );
    await db.exec(migration("202611030004_eldoria_story.sql"));
    await t.test(
      "Eldoria replaces the published story without losing reading choices or completion",
      async () => {
        const before = await db.query(
          "select completed,choices from public.story_progress where user_id=$1 and chapter_id='the-awakening'",
          [A],
        );
        assert.equal(before.rows[0].completed, true);
        assert.equal(before.rows[0].choices["first-response"], "careful");
        const story = await db.query(
          "select title,edition from public.stories where id='first-light'",
        );
        assert.equal(story.rows[0].title, "The Fragments of Eldoria");
        assert.equal(story.rows[0].edition, 2);
        const chapters = await db.query(
          "select id,content from public.story_chapters where story_id='first-light'",
        );
        assert.equal(chapters.rows.length, 8);
        assert.ok(JSON.stringify(chapters.rows).includes("Aether"));
        assert.ok(
          !JSON.stringify(chapters.rows.map((c) => c.content)).includes(
            "Sparky",
          ),
        );
        await db.exec(migration("202611030004_eldoria_story.sql"));
        const after = await db.query(
          "select completed,choices from public.story_progress where user_id=$1 and chapter_id='the-awakening'",
          [A],
        );
        assert.deepEqual(after.rows, before.rows);
      },
    );
    const as = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id ?? "",
      ]);
      await db.exec(`set role ${id ? "authenticated" : "anon"}`);
    };
    await t.test(
      "existing users retain progress and skip onboarding",
      async () => {
        const { rows } = await db.query("select * from profiles where id=$1", [
          A,
        ]);
        assert.equal(rows[0].onboarding_completed, true);
        assert.equal(rows[0].display_name, "Existing Learner");
        assert.deepEqual(
          (
            await db.query(
              "select completed_lessons from player_progress where user_id=$1",
              [A],
            )
          ).rows[0].completed_lessons,
          [1, 3],
        );
      },
    );
    await t.test(
      "new Google and email users get one incomplete profile and private preferences",
      async () => {
        await db.query(
          "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3),($4,$5,$6)",
          [
            B,
            "google@example.test",
            JSON.stringify({
              full_name: "Google Learner",
              avatar_url: "https://example.test/avatar.png",
            }),
            C,
            "email@example.test",
            JSON.stringify({ display_name: "Email Learner" }),
          ],
        );
        const { rows } = await db.query(
          "select id,onboarding_completed from profiles where id in ($1,$2)",
          [B, C],
        );
        assert.equal(rows.length, 2);
        assert.ok(rows.every((r) => !r.onboarding_completed));
        assert.equal(
          (await db.query("select count(*)::int n from user_preferences"))
            .rows[0].n,
          3,
        );
      },
    );
    await t.test(
      "usernames are unique and normalized at the database boundary",
      async () => {
        await as(A);
        await db.exec(
          "update profiles set username='sparky' where id=auth.uid()",
        );
        await as(B);
        assert.equal(
          (await db.query("select username_available('sparky') available"))
            .rows[0].available,
          false,
        );
        await assert.rejects(
          () =>
            db.exec(
              "update profiles set username='sparky' where id=auth.uid()",
            ),
          /unique/,
        );
        await assert.rejects(
          () =>
            db.exec(
              "update profiles set username='Sparky' where id=auth.uid()",
            ),
          /check constraint/,
        );
        await db.exec(
          "update profiles set username='new_learner',onboarding_completed=true where id=auth.uid()",
        );
      },
    );
    await t.test(
      "members cannot change another profile or read private preferences",
      async () => {
        await as(B);
        assert.equal(
          (
            await db.query(
              "update profiles set bio=$1 where id=$2 returning id",
              ["Not mine", A],
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query("select * from user_preferences where user_id=$1", [
              A,
            ])
          ).rows.length,
          0,
        );
        await assert.rejects(
          () =>
            db.query("insert into user_preferences(user_id) values($1)", [A]),
          /row-level security/,
        );
        await assert.rejects(
          () =>
            db.exec("update profiles set created_at=now() where id=auth.uid()"),
          /permission denied/,
        );
      },
    );
    await t.test(
      "progress merges atomically and awards server-derived milestones",
      async () => {
        await as(A);
        assert.deepEqual(
          (await db.query("select merge_player_progress($1) ids", [[2, 3]]))
            .rows[0].ids,
          [1, 2, 3],
        );
        assert.deepEqual(
          (await db.query("select merge_player_progress($1) ids", [[4]]))
            .rows[0].ids,
          [1, 2, 3, 4],
        );
        assert.equal(
          (await db.query("select * from user_achievements")).rows.length,
          2,
        );
        await assert.rejects(
          () => db.query("select merge_player_progress($1)", [[99]]),
          /Invalid lesson/,
        );
        await as(B);
        assert.equal(
          (
            await db.query("select * from player_progress where user_id=$1", [
              A,
            ])
          ).rows.length,
          0,
        );
        await assert.rejects(
          () =>
            db.query(
              "insert into user_achievements(user_id,achievement_id) values($1,$2)",
              [B, "realm-restorer"],
            ),
          /permission denied/,
        );
      },
    );
    await t.test(
      "private notes and reading progress stay with their owner",
      async () => {
        await as(A);
        await db.query(
          "insert into study_items(user_id,kind,title,body) values($1,$2,$3,$4)",
          [A, "note", "My note", "Private body"],
        );
        await db.query(
          "insert into story_progress(user_id,chapter_id,completed) values($1,$2,true)",
          [A, "a-little-alchemy"],
        );
        await as(B);
        assert.equal(
          (await db.query("select * from study_items")).rows.length,
          0,
        );
        assert.equal(
          (await db.query("select * from story_progress")).rows.length,
          0,
        );
        await assert.rejects(
          () =>
            db.query(
              "insert into study_items(user_id,kind,title) values($1,$2,$3)",
              [A, "note", "Intrusion"],
            ),
          /row-level security/,
        );
        await assert.rejects(
          () =>
            db.query(
              "insert into story_progress(user_id,chapter_id) values($1,$2)",
              [A, "the-awakening"],
            ),
          /row-level security/,
        );
      },
    );
    let message;
    await t.test(
      "chat validates authorship, rate limits, reports and deletion ownership",
      async () => {
        await as(B);
        message = (
          await db.query(
            "insert into chat_messages(room_id,user_id,body) values($1,$2,$3) returning id",
            ["commons", B, "Hello learners"],
          )
        ).rows[0].id;
        await assert.rejects(
          () =>
            db.query(
              "insert into chat_messages(room_id,user_id,body) values($1,$2,$3)",
              ["commons", B, "Too fast"],
            ),
          /slow down/,
        );
        await as(A);
        assert.equal(
          (
            await db.query(
              "delete from chat_messages where id=$1 returning id",
              [message],
            )
          ).rows.length,
          0,
        );
        await assert.rejects(
          () =>
            db.query(
              "insert into chat_messages(room_id,user_id,body) values($1,$2,$3)",
              ["commons", C, "Spoofed"],
            ),
          /profile|row-level/,
        );
        await db.query(
          "insert into chat_reports(message_id,reporter_id,reason) values($1,$2,$3)",
          [message, A, "Testing a report"],
        );
        await as(B);
        assert.equal(
          (await db.query("select * from chat_reports")).rows.length,
          0,
        );
        await db.exec("reset role");
        await db.query(
          "insert into chat_restrictions(user_id,muted_until,reason) values($1,now()+interval '1 day',$2)",
          [B, "Test restriction"],
        );
        await as(B);
        await assert.rejects(
          () =>
            db.query(
              "insert into chat_messages(room_id,user_id,body) values($1,$2,$3)",
              ["commons", B, "Blocked"],
            ),
          /temporarily paused/,
        );
        assert.equal(
          (
            await db.query(
              "delete from chat_messages where id=$1 returning id",
              [message],
            )
          ).rows.length,
          1,
        );
      },
    );
    await t.test(
      "avatar paths are restricted to the uploading account",
      async () => {
        await as(A);
        await db.query(
          "insert into storage.objects(bucket_id,name) values($1,$2)",
          ["avatars", `${A}/avatar.webp`],
        );
        await as(B);
        await assert.rejects(
          () =>
            db.query(
              "insert into storage.objects(bucket_id,name) values($1,$2)",
              ["avatars", `${A}/other.webp`],
            ),
          /row-level security/,
        );
        assert.equal(
          (
            await db.query(
              "delete from storage.objects where name=$1 returning id",
              [`${A}/avatar.webp`],
            )
          ).rows.length,
          0,
        );
        await db.exec("reset role");
        const bucket = (
          await db.query("select * from storage.buckets where id='avatars'")
        ).rows[0];
        assert.equal(Number(bucket.file_size_limit), 2097152);
        assert.deepEqual(bucket.allowed_mime_types, [
          "image/jpeg",
          "image/png",
          "image/webp",
        ]);
      },
    );
    await t.test(
      "guests only read published content, not profiles or chat",
      async () => {
        await as(null);
        assert.equal(
          (await db.query("select * from story_chapters")).rows.length,
          8,
        );
        for (const table of [
          "profiles",
          "chat_messages",
          "user_preferences",
          "study_items",
        ])
          await assert.rejects(
            () => db.query(`select * from ${table}`),
            /permission denied/,
          );
        await assert.rejects(
          () => db.query("select merge_player_progress($1)", [[1]]),
          /permission denied/,
        );
      },
    );
  } finally {
    await db.close();
  }
});
