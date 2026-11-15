-- New accounts hear level feedback by default. Existing choices stay intact.
alter table public.user_preferences
  alter column sound_effects set default true;
