-- Migration script to add latitude and longitude columns to users table
-- Execute this script in your PostgreSQL database

-- Check if columns already exist before adding them
DO $$
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE users ADD COLUMN latitude DECIMAL(10,8) NULL;
        RAISE NOTICE 'Added latitude column to users table';
    ELSE
        RAISE NOTICE 'latitude column already exists in users table';
    END IF;
    
    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE users ADD COLUMN longitude DECIMAL(11,8) NULL;
        RAISE NOTICE 'Added longitude column to users table';
    ELSE
        RAISE NOTICE 'longitude column already exists in users table';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, numeric_precision, numeric_scale
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('latitude', 'longitude')
ORDER BY column_name;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN users.latitude IS 'User location latitude coordinate (decimal degrees, WGS84)';
COMMENT ON COLUMN users.longitude IS 'User location longitude coordinate (decimal degrees, WGS84)';

-- Optional: Add index for location-based queries (if needed in the future)
-- CREATE INDEX CONCURRENTLY idx_users_coordinates ON users (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
