-- Add columns for Inner Voice and Shadow Student systems
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS inner_voice_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shadow_student_initialized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shadow_student_challenges_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shadow_student_challenges_lost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shadow_student_last_encounter BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS shadow_student_current_challenge_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN player_profiles.inner_voice_history IS 'Array of inner voice messages with emotion and timestamp';
COMMENT ON COLUMN player_profiles.shadow_student_initialized IS 'Whether shadow student alter-ego has been initialized';
COMMENT ON COLUMN player_profiles.shadow_student_challenges_won IS 'Number of challenges won against shadow student';
COMMENT ON COLUMN player_profiles.shadow_student_challenges_lost IS 'Number of challenges lost to shadow student';
COMMENT ON COLUMN player_profiles.shadow_student_last_encounter IS 'Timestamp of last encounter with shadow student';
COMMENT ON COLUMN player_profiles.shadow_student_current_challenge_id IS 'ID of current active challenge';
