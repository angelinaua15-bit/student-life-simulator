-- Add last_interest_claim field to player_profiles table for daily interest claim limit
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS last_interest_claim BIGINT DEFAULT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN player_profiles.last_interest_claim IS 'Timestamp of last bank interest claim (for 24h cooldown)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_player_profiles_last_interest_claim 
ON player_profiles(last_interest_claim);
