-- Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_player_profiles_updated_at
  before update on public.player_profiles
  for each row
  execute function public.update_updated_at_column();
