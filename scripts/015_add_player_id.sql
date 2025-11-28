-- Adding player_id column to player_profiles table

-- Add player_id column
ALTER TABLE player_profiles 
ADD COLUMN IF NOT EXISTS player_id TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_player_profiles_player_id 
ON player_profiles(player_id);

-- Add comment
COMMENT ON COLUMN player_profiles.player_id IS 'Unique player ID in format STU-XXXXX-XXXXX';
