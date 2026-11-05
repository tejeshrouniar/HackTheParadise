begin;
-- Paid unlock text is fetched only after server entitlement verification.
create table public.spark_content (
 lesson_id integer not null check(lesson_id between 1 and 12),
 kind text not null check(kind in ('hint','solution')),
 body text not null,
 primary key(lesson_id,kind)
);
alter table public.spark_content enable row level security;
revoke all on public.spark_content from public,anon,authenticated;
insert into public.spark_content(lesson_id,kind,body)
select lesson_id,kind,body from jsonb_to_recordset($content$[
  {
    "lesson_id": 1,
    "kind": "hint",
    "body": "your avatar starts at (0, 0) facing RIGHT. Write player.move_forward() twice, player.turn_right(), player.move_forward() twice, and finish with player.collect_crystal()!"
  },
  {
    "lesson_id": 1,
    "kind": "solution",
    "body": "player.move_forward()\nplayer.move_forward()\nplayer.turn_right()\nplayer.move_forward()\nplayer.move_forward()\nplayer.collect_crystal()"
  },
  {
    "lesson_id": 2,
    "kind": "hint",
    "body": "Type: mana_flask = 100, on the next line write: star_dew = 3, and on the third line write: cauldron.brew_elixir()"
  },
  {
    "lesson_id": 2,
    "kind": "solution",
    "body": "mana_flask = 100\nstar_dew = 3\ncauldron.brew_elixir()"
  },
  {
    "lesson_id": 3,
    "kind": "hint",
    "body": "Write: for step in range(6): and on the next line indent 4 spaces and write: grow_flower()"
  },
  {
    "lesson_id": 3,
    "kind": "solution",
    "body": "for step in range(6):\n    grow_flower()"
  },
  {
    "lesson_id": 4,
    "kind": "hint",
    "body": "Define: def build_bridge(): with place_starlight_tile() inside, and at the bottom call: build_bridge()"
  },
  {
    "lesson_id": 4,
    "kind": "solution",
    "body": "def build_bridge():\n    for step in range(4):\n        place_starlight_tile()\n\nbuild_bridge()"
  },
  {
    "lesson_id": 5,
    "kind": "hint",
    "body": "Change purify_rune(9) on line 4 to purify_rune(3). Then click Cast Spell!"
  },
  {
    "lesson_id": 5,
    "kind": "solution",
    "body": "purify_rune(1)\npurify_rune(2)\npurify_rune(3)"
  },
  {
    "lesson_id": 6,
    "kind": "hint",
    "body": "Call align_gate_rings(), define def calculate_flux(core_power): with return core_power * 2, then call charge_stargate(200)!"
  },
  {
    "lesson_id": 6,
    "kind": "solution",
    "body": "align_gate_rings()\n\ndef calculate_flux(core_power):\n    return core_power * 2\n\ncharge_stargate(calculate_flux(100))"
  },
  {
    "lesson_id": 7,
    "kind": "hint",
    "body": "Add crystals.sort() and stabilize_vortex(crystals) below the list declaration!"
  },
  {
    "lesson_id": 7,
    "kind": "solution",
    "body": "crystals = [4, 1, 3, 2]\ncrystals.sort()\nstabilize_vortex(crystals)"
  },
  {
    "lesson_id": 8,
    "kind": "hint",
    "body": "Write mana_shield = 100, then for bolt in range(3): cast_starlight_bolt(), and finally restore_core()!"
  },
  {
    "lesson_id": 8,
    "kind": "solution",
    "body": "mana_shield = 100\nfor bolt in range(3):\n    cast_starlight_bolt()\nrestore_core()"
  },
  {
    "lesson_id": 9,
    "kind": "hint",
    "body": "Repeat grow_flower() three times with range(3)."
  },
  {
    "lesson_id": 9,
    "kind": "solution",
    "body": "for seed in range(3):\n    grow_flower()"
  },
  {
    "lesson_id": 10,
    "kind": "hint",
    "body": "Define a function containing a loop of three place_starlight_tile() calls, then call it."
  },
  {
    "lesson_id": 10,
    "kind": "solution",
    "body": "def build_crossing():\n    for stone in range(3):\n        place_starlight_tile()\n\nbuild_crossing()"
  },
  {
    "lesson_id": 11,
    "kind": "hint",
    "body": "Call purify_rune(2) and purify_rune(3)."
  },
  {
    "lesson_id": 11,
    "kind": "solution",
    "body": "purify_rune(2)\npurify_rune(3)"
  },
  {
    "lesson_id": 12,
    "kind": "hint",
    "body": "Use align_gate_rings() and charge_stargate(120)."
  },
  {
    "lesson_id": 12,
    "kind": "solution",
    "body": "align_gate_rings()\ncharge_stargate(120)"
  }
]$content$::jsonb) as x(lesson_id integer,kind text,body text);
create function public.get_spark_content(lesson integer,item text) returns text
language plpgsql security definer set search_path='' as $$
declare result text;
begin
 if auth.uid() is null then raise exception 'Sign in to read this unlock'; end if;
 if not exists(select 1 from public.spark_unlocks where user_id=auth.uid() and lesson_id=lesson and kind=item) then raise exception 'Purchase required'; end if;
 select body into result from public.spark_content where lesson_id=lesson and kind=item;
 if result is null then raise exception 'Content unavailable'; end if;
 return result;
end $$;
revoke all on function public.get_spark_content(integer,text) from public,anon,authenticated;
grant execute on function public.get_spark_content(integer,text) to authenticated;
-- A missing content record must roll the entire debit transaction back.
create function public.require_spark_content() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.spark_content where lesson_id=new.lesson_id and kind=new.kind) then raise exception 'Content unavailable; no sparks spent'; end if;
 return new;
end $$;
revoke all on function public.require_spark_content() from public,anon,authenticated;
create trigger require_spark_content before insert on public.spark_unlocks for each row execute function public.require_spark_content();
commit;
