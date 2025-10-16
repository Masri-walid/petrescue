-- Migration script to add latitude and longitude columns to users table
-- Run this script to add coordinate support for user locations

-- Add latitude and longitude columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for location-based queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_users_coordinates ON users(latitude, longitude);

-- Add coordinates column to rescue_reports table if it doesn't exist
ALTER TABLE rescue_reports 
ADD COLUMN IF NOT EXISTS coordinates TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('latitude', 'longitude')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rescue_reports' 
AND column_name = 'coordinates'
ORDER BY column_name;
