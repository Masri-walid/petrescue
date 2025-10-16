-- Fix column name mismatches between database and application mappings
-- The application expects different column names than what exists in the database

-- First, check what columns currently exist
SELECT 'Current rescue_reports columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'rescue_reports' 
ORDER BY ordinal_position;

-- Rename columns to match application expectations
-- Application maps Location -> location_address (but DB has 'location')
-- Application maps ReporterName -> contact_name (but DB has 'reporter_name')  
-- Application maps ReporterPhone -> contact_phone (but DB has 'reporter_phone')

-- Check if we need to rename columns
DO $$
BEGIN
    -- Rename location to location_address if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'location')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'location_address') THEN
        ALTER TABLE rescue_reports RENAME COLUMN location TO location_address;
        RAISE NOTICE 'Renamed location to location_address';
    END IF;

    -- Rename reporter_name to contact_name if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'reporter_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_name') THEN
        ALTER TABLE rescue_reports RENAME COLUMN reporter_name TO contact_name;
        RAISE NOTICE 'Renamed reporter_name to contact_name';
    END IF;

    -- Rename reporter_phone to contact_phone if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'reporter_phone')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_phone') THEN
        ALTER TABLE rescue_reports RENAME COLUMN reporter_phone TO contact_phone;
        RAISE NOTICE 'Renamed reporter_phone to contact_phone';
    END IF;

    -- Add contact_email if it doesn't exist (this should already exist from previous script)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_email') THEN
        ALTER TABLE rescue_reports ADD COLUMN contact_email VARCHAR(255);
        RAISE NOTICE 'Added contact_email column';
    END IF;
END $$;

-- Verify the final column structure matches application expectations
SELECT 'Final rescue_reports columns after fixes:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rescue_reports' 
ORDER BY ordinal_position;

-- Check that all required columns for the application exist
SELECT 'Checking required columns exist:' as info;
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'animal_condition') 
         THEN 'YES' ELSE 'NO' END as animal_condition_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'location_address') 
         THEN 'YES' ELSE 'NO' END as location_address_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_name') 
         THEN 'YES' ELSE 'NO' END as contact_name_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_phone') 
         THEN 'YES' ELSE 'NO' END as contact_phone_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_email') 
         THEN 'YES' ELSE 'NO' END as contact_email_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'status') 
         THEN 'YES' ELSE 'NO' END as status_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'created_at') 
         THEN 'YES' ELSE 'NO' END as created_at_exists,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'updated_at') 
         THEN 'YES' ELSE 'NO' END as updated_at_exists;
