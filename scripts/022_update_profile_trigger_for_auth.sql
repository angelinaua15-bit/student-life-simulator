-- Update the profile creation trigger to properly handle new auth fields
create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_player_id text;
  random_suffix text;
begin
  -- Generate unique player_id like STU-XXXXX-XXXXX
  random_suffix := upper(substring(md5(random()::text) from 1 for 5)) || '-' || upper(substring(md5(random()::text) from 1 for 5));
  generated_player_id := 'STU-' || random_suffix;

  -- Create player profile with data from auth metadata
  insert into public.player_profiles (
    id, 
    email, 
    nickname,
    username_lowercase,
    player_id,
    skin,
    level,
    experience,
    coins,
    bank_balance,
    energy,
    happiness,
    stress
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nickname', 'Player'),
    lower(coalesce(new.raw_user_meta_data ->> 'nickname', 'Player')),
    generated_player_id,
    coalesce(new.raw_user_meta_data ->> 'skin', 'default'),
    1,
    0,
    100,
    0,
    80,
    70,
    30
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Recreate trigger to ensure it's using the updated function
drop trigger if exists on_player_created on auth.users;

create trigger on_player_created
  after insert on auth.users
  for each row
  execute function public.handle_new_player();
