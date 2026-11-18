begin;

-- Profile RPCs run as postgres and need table privileges independently of RLS.
grant usage on schema public to postgres;
grant select, insert, update on public.profiles, public.user_preferences to postgres;

alter function public.ensure_library_profile(uuid) owner to postgres;
alter function public.ensure_library_profile(uuid) security definer;
alter function public.get_my_library_profile() owner to postgres;
alter function public.get_my_library_profile() security definer;
alter function public.save_library_profile(text, text, text, text, text, text, boolean) owner to postgres;
alter function public.save_library_profile(text, text, text, text, text, text, boolean) security definer;
alter function public.create_storicode_profile() owner to postgres;
alter function public.create_storicode_profile() security definer;

revoke all on function public.ensure_library_profile(uuid), public.create_storicode_profile(),
  public.get_my_library_profile(), public.save_library_profile(text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.get_my_library_profile(),
  public.save_library_profile(text, text, text, text, text, text, boolean) to authenticated;

notify pgrst, 'reload schema';
commit;
