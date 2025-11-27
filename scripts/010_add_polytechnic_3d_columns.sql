-- Add Lviv Polytechnic 3D game columns to player_profiles
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS polytechnic3d_completed_quests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS polytechnic3d_collected_items TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS polytechnic3d_visited_rooms TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN player_profiles.polytechnic3d_completed_quests IS 'Array of completed quest IDs in the 3D Polytechnic game';
COMMENT ON COLUMN player_profiles.polytechnic3d_collected_items IS 'Array of collected item IDs in the 3D Polytechnic game';
COMMENT ON COLUMN player_profiles.polytechnic3d_visited_rooms IS 'Array of visited room IDs in the 3D Polytechnic game';
