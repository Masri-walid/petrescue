-- Migration script to remove latitude/longitude columns from users table
-- and add photo_data column to rescue_report_photos table
-- Execute this script in your PostgreSQL database

-- Part 1: Remove latitude and longitude columns from users table if they exist
DO $$
BEGIN
    -- Drop latitude column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE users DROP COLUMN latitude;
        RAISE NOTICE 'Dropped latitude column from users table';
    ELSE
        RAISE NOTICE 'latitude column does not exist in users table';
    END IF;
    
    -- Drop longitude column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE users DROP COLUMN longitude;
        RAISE NOTICE 'Dropped longitude column from users table';
    ELSE
        RAISE NOTICE 'longitude column does not exist in users table';
    END IF;
END $$;

-- Part 2: Update rescue_report_photos table for database photo storage
DO $$
BEGIN
    -- Add photo_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_report_photos' AND column_name = 'photo_data'
    ) THEN
        ALTER TABLE rescue_report_photos ADD COLUMN photo_data BYTEA NOT NULL DEFAULT '\x'::bytea;
        RAISE NOTICE 'Added photo_data column to rescue_report_photos table';
    ELSE
        RAISE NOTICE 'photo_data column already exists in rescue_report_photos table';
    END IF;
    
    -- Drop file_path column if it exists (no longer needed)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_report_photos' AND column_name = 'file_path'
    ) THEN
        ALTER TABLE rescue_report_photos DROP COLUMN file_path;
        RAISE NOTICE 'Dropped file_path column from rescue_report_photos table';
    ELSE
        RAISE NOTICE 'file_path column does not exist in rescue_report_photos table';
    END IF;
    
    -- Ensure file_name column is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_report_photos' AND column_name = 'file_name' AND is_nullable = 'YES'
    ) THEN
        -- First update any NULL values
        UPDATE rescue_report_photos SET file_name = 'unknown.jpg' WHERE file_name IS NULL;
        -- Then make it NOT NULL
        ALTER TABLE rescue_report_photos ALTER COLUMN file_name SET NOT NULL;
        RAISE NOTICE 'Made file_name column NOT NULL in rescue_report_photos table';
    END IF;
    
    -- Ensure content_type column is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_report_photos' AND column_name = 'content_type' AND is_nullable = 'YES'
    ) THEN
        -- First update any NULL values
        UPDATE rescue_report_photos SET content_type = 'image/jpeg' WHERE content_type IS NULL;
        -- Then make it NOT NULL
        ALTER TABLE rescue_report_photos ALTER COLUMN content_type SET NOT NULL;
        RAISE NOTICE 'Made content_type column NOT NULL in rescue_report_photos table';
    END IF;
END $$;

-- Part 3: Verify the changes
SELECT 'Users table columns after migration:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('latitude', 'longitude', 'first_name', 'last_name', 'email')
ORDER BY column_name;

SELECT 'Rescue photos table columns after migration:' as info;
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'rescue_report_photos'
ORDER BY ordinal_position;

-- Part 4: Add comments to document the changes
COMMENT ON COLUMN rescue_report_photos.photo_data IS 'Binary photo data stored directly in database (BYTEA format)';
COMMENT ON COLUMN rescue_report_photos.file_name IS 'Original filename of the uploaded photo';
COMMENT ON COLUMN rescue_report_photos.content_type IS 'MIME type of the photo (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN rescue_report_photos.file_size IS 'Size of the photo in bytes';

-- Optional: Add index for better performance when querying photos by rescue report
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rescue_photos_report_id 
ON rescue_report_photos (rescue_report_id);

RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE 'Summary:';
RAISE NOTICE '- Removed latitude and longitude columns from users table';
RAISE NOTICE '- Added photo_data BYTEA column to rescue_report_photos table';
RAISE NOTICE '- Removed file_path column from rescue_report_photos table';
RAISE NOTICE '- Made file_name and content_type columns NOT NULL';
RAISE NOTICE '- Added performance index for rescue report photos';
