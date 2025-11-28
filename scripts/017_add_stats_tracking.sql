-- Add statistics tracking fields to player_profiles
-- These fields will automatically track game progress

-- Add games played counter (will be incremented after each mini-game)
ALTER TABLE player_profiles 
ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0;

-- Add events completed counter
ALTER TABLE player_profiles 
ADD COLUMN IF NOT EXISTS events_completed_count INTEGER DEFAULT 0;

-- Update events_completed_count based on completed_events array
UPDATE player_profiles 
SET events_completed_count = COALESCE(array_length(completed_events, 1), 0)
WHERE events_completed_count = 0;

-- Create function to auto-update counters
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update events completed count
  NEW.events_completed_count := COALESCE(array_length(NEW.completed_events, 1), 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_player_stats ON player_profiles;
CREATE TRIGGER trigger_update_player_stats
  BEFORE UPDATE ON player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();
