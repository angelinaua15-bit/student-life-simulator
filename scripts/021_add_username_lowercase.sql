-- Add username_lowercase column for case-insensitive search
ALTER TABLE player_profiles 
ADD COLUMN IF NOT EXISTS username_lowercase TEXT;

-- Create index for fast searching
CREATE INDEX IF NOT EXISTS idx_player_profiles_username_lowercase 
ON player_profiles(username_lowercase);

-- Function to auto-update username_lowercase
CREATE OR REPLACE FUNCTION update_username_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.username_lowercase = LOWER(NEW.nickname);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update username_lowercase
DROP TRIGGER IF EXISTS trigger_update_username_lowercase ON player_profiles;
CREATE TRIGGER trigger_update_username_lowercase
  BEFORE INSERT OR UPDATE OF nickname ON player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_username_lowercase();

-- Update existing rows
UPDATE player_profiles 
SET username_lowercase = LOWER(nickname)
WHERE username_lowercase IS NULL OR username_lowercase = '';
