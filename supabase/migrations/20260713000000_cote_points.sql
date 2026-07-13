-- Add Classroom of the Elite (COTE) inspired Merit Points and Tier columns to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Class C • Regular',
ADD COLUMN IF NOT EXISTS student_id_code TEXT;

-- Index for fast Leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
