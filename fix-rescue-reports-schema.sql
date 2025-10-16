-- Fix rescue_reports table schema to match application model
-- Add missing columns that are causing database errors

-- Check if animal_condition column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'animal_condition'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN animal_condition VARCHAR(50) DEFAULT 'Unknown';
        RAISE NOTICE 'Added animal_condition column to rescue_reports table';
    ELSE
        RAISE NOTICE 'animal_condition column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if urgency_level column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'urgency_level'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN urgency_level VARCHAR(20) DEFAULT 'moderate';
        RAISE NOTICE 'Added urgency_level column to rescue_reports table';
    ELSE
        RAISE NOTICE 'urgency_level column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if description column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN description VARCHAR(1000);
        RAISE NOTICE 'Added description column to rescue_reports table';
    ELSE
        RAISE NOTICE 'description column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if location_address column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'location_address'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN location_address VARCHAR(500) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added location_address column to rescue_reports table';
    ELSE
        RAISE NOTICE 'location_address column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if contact_name column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'contact_name'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN contact_name VARCHAR(100) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added contact_name column to rescue_reports table';
    ELSE
        RAISE NOTICE 'contact_name column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if contact_phone column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN contact_phone VARCHAR(20) NOT NULL DEFAULT '';
        RAISE NOTICE 'Added contact_phone column to rescue_reports table';
    ELSE
        RAISE NOTICE 'contact_phone column already exists in rescue_reports table';
    END IF;
END $$;

-- Check if contact_email column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_reports' 
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE rescue_reports ADD COLUMN contact_email VARCHAR(255);
        RAISE NOTICE 'Added contact_email column to rescue_reports table';
    ELSE
        RAISE NOTICE 'contact_email column already exists in rescue_reports table';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'rescue_reports' 
ORDER BY ordinal_position;
