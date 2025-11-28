-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  friendship_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (player1_id < player2_id),
  UNIQUE(player1_id, player2_id)
);

-- Add RLS policies for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they received"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Add RLS policies for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "System can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_player1 ON friendships(player1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_player2 ON friendships(player2_id);

-- Add online status to player_profiles
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Create function to update online status
CREATE OR REPLACE FUNCTION update_online_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_online = NOW();
  NEW.is_online = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update online status
DROP TRIGGER IF EXISTS update_player_online_status ON player_profiles;
CREATE TRIGGER update_player_online_status
  BEFORE UPDATE ON player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_online_status();
