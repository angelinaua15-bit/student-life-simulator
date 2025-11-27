-- Update stats columns to allow decimal values
alter table public.player_profiles
  alter column energy type numeric(5,2),
  alter column happiness type numeric(5,2),
  alter column stress type numeric(5,2);
