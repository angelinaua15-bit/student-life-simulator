-- Add world system columns to player_profiles
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{"charisma": 1, "communication": 1, "resilience": 1, "creativity": 1, "agility": 1, "success": 1}',
ADD COLUMN IF NOT EXISTS friends JSONB DEFAULT '[]';

-- Add comment
COMMENT ON COLUMN player_profiles.skills IS 'Player skill levels for RPG mechanics';
COMMENT ON COLUMN player_profiles.friends IS 'Player friends and friendship levels';
