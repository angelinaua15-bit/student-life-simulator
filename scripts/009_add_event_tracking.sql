-- Add event tracking columns to player_profiles table
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS event_completions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS claimed_event_rewards TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for faster event queries
CREATE INDEX IF NOT EXISTS idx_player_profiles_event_completions 
ON player_profiles USING GIN (event_completions);

-- Add comment
COMMENT ON COLUMN player_profiles.event_completions IS 'Tracks how many times player completed each event';
COMMENT ON COLUMN player_profiles.claimed_event_rewards IS 'List of event reward IDs that have been claimed';
