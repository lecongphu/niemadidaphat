-- Add google_id column for Google One-Tap authentication
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id 
ON user_profiles(google_id);

-- Email index (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON user_profiles(email);

