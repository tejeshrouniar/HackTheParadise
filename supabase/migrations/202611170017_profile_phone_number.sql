begin;

alter table public.profiles
  add column phone_number text,
  add constraint profiles_phone_number_format
    check (phone_number ~ '^[+][1-9][0-9]{6,14}$');

-- Block writes to the old column until the backfill and removal are complete.
lock table public.user_preferences in access exclusive mode;

update public.profiles as profile
set phone_number = preferences.phone_number
from public.user_preferences as preferences
where profile.id = preferences.user_id and preferences.phone_number is not null;

alter table public.user_preferences drop column phone_number;

grant update (phone_number) on public.profiles to authenticated;

commit;
