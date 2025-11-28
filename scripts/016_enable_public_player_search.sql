-- Enable public player search by creating RLS policy that allows all authenticated users to view basic profile info of other players

-- First, add a new RLS policy for public player search
CREATE POLICY "players_select_public_info"
ON public.player_profiles
FOR SELECT
TO authenticated
USING (true);

-- Also allow anonymous users to search (for friend invites)
CREATE POLICY "players_select_public_anonymous"
ON public.player_profiles
FOR SELECT
TO anon
USING (true);

-- Update is_online status for active users
CREATE OR REPLACE FUNCTION update_last_online()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_online = NOW();
  NEW.is_online = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_online on profile updates
DROP TRIGGER IF EXISTS update_player_last_online ON public.player_profiles;
CREATE TRIGGER update_player_last_online
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_online();
