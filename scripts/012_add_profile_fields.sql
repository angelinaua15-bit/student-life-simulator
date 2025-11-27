-- Add profile fields to player_profiles table
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS "group" TEXT,
ADD COLUMN IF NOT EXISTS social TEXT;
