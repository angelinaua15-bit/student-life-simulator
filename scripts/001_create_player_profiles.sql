-- Create player profiles table with all game data
create table if not exists public.player_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null,
  
  -- Character data
  skin text default 'default',
  
  -- Stats
  level integer default 1,
  experience integer default 0,
  coins integer default 100,
  bank_balance integer default 0,
  energy integer default 80,
  happiness integer default 70,
  stress integer default 30,
  
  -- Progress
  completed_events text[] default '{}',
  achievements text[] default '{}',
  inventory text[] default '{}',
  
  -- High scores
  cafe_high_score integer default 0,
  library_high_score integer default 0,
  care_packages_high_score integer default 0,
  
  -- Settings
  sound_enabled boolean default true,
  music_enabled boolean default true,
  language text default 'ua',
  graphics_quality text default 'high',
  
  -- Metadata
  total_play_time integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.player_profiles enable row level security;

-- RLS Policies
create policy "players_select_own"
  on public.player_profiles for select
  using (auth.uid() = id);

create policy "players_insert_own"
  on public.player_profiles for insert
  with check (auth.uid() = id);

create policy "players_update_own"
  on public.player_profiles for update
  using (auth.uid() = id);

create policy "players_delete_own"
  on public.player_profiles for delete
  using (auth.uid() = id);

-- Create index for faster lookups
create index if not exists player_profiles_email_idx on public.player_profiles(email);
