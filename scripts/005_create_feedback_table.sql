-- Create feedback table to store player feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_avatar TEXT DEFAULT 'default',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_player_id ON feedback(player_id);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read feedback
CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert feedback
CREATE POLICY "Authenticated users can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Policy: Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = player_id);

-- Policy: Users can delete their own feedback
CREATE POLICY "Users can delete own feedback"
  ON feedback FOR DELETE
  USING (auth.uid() = player_id);
