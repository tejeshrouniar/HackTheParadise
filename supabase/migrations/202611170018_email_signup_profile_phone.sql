begin;

create or replace function public.create_storicode_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  signup_phone text := new.raw_user_meta_data ->> 'signup_phone_number';
begin
  insert into public.profiles (
    id, username, display_name, avatar_url, onboarding_completed, phone_number
  )
  values (
    new.id,
    'u_' || replace(new.id::text, '-', ''),
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      'Learner'
    ), 60),
    case when new.raw_user_meta_data ->> 'avatar_url' like 'https://%'
      then new.raw_user_meta_data ->> 'avatar_url' end,
    false,
    case when signup_phone ~ '^[+][1-9][0-9]{6,14}$' then signup_phone end
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict do nothing;

  return new;
end;
$$;

commit;
