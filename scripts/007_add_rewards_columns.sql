-- Add new columns for rewards system
alter table public.player_profiles 
add column if not exists unclaimed_rewards integer[] default '{}',
add column if not exists active_boosters jsonb default '[]'::jsonb;

-- Update existing profiles with default values
update public.player_profiles 
set unclaimed_rewards = '{}', active_boosters = '[]'::jsonb
where unclaimed_rewards is null or active_boosters is null;
