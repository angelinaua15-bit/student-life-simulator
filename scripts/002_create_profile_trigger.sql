-- Auto-create profile on signup
create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_profiles (
    id, 
    email, 
    nickname,
    skin
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nickname', 'Player'),
    coalesce(new.raw_user_meta_data ->> 'skin', 'default')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_player_created on auth.users;

create trigger on_player_created
  after insert on auth.users
  for each row
  execute function public.handle_new_player();
