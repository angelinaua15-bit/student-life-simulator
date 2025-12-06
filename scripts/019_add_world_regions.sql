-- Add world regions to player profiles

-- Add selected_region column to track player's chosen region
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS selected_region TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN player_profiles.selected_region IS 'Player selected region for gameplay bonuses (galician, podillian, slobozhan, bukovynian, capital)';
