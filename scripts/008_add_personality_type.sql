-- Add personality_type column to player_profiles
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS personality_type text DEFAULT 'default';

-- Add comment explaining the column
COMMENT ON COLUMN player_profiles.personality_type IS 'Student personality type: genius, social, coder, optimizer, activist, or default';
