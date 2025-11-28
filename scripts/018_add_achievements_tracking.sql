-- Add achievement tracking and statistics

-- Ensure achievements column exists and is properly indexed
CREATE INDEX IF NOT EXISTS idx_player_achievements ON player_profiles USING GIN (achievements);

-- Add comment explaining the achievements system
COMMENT ON COLUMN player_profiles.achievements IS 'Array of unlocked achievement IDs that track player progress and milestones';
