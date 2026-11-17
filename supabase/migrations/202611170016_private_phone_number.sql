begin;

-- Preferences are owner-only. Public profiles are readable by other members.
alter table public.user_preferences
  add column phone_number text,
  add constraint user_preferences_phone_number_format
    check (phone_number ~ '^[+][1-9][0-9]{6,14}$');

commit;
