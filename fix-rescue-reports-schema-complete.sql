-- Complete fix for rescue_reports table schema
-- Add all missing columns that the application expects

-- First, add missing columns to rescue_reports table
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS animal_condition VARCHAR(50) DEFAULT 'Unknown';
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS location_address VARCHAR(500) DEFAULT '';
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100) DEFAULT '';
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT '';
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'reported';
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS assigned_organization_id UUID;
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS reporter_id UUID;
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rescue_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create rescue_report_photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS rescue_report_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rescue_report_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    photo_data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rescue_report_id) REFERENCES rescue_reports(id) ON DELETE CASCADE
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for reporter_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_rescue_reports_reporter_id' 
        AND table_name = 'rescue_reports'
    ) THEN
        ALTER TABLE rescue_reports 
        ADD CONSTRAINT fk_rescue_reports_reporter_id 
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key for assigned_organization_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_rescue_reports_assigned_organization_id' 
        AND table_name = 'rescue_reports'
    ) THEN
        ALTER TABLE rescue_reports 
        ADD CONSTRAINT fk_rescue_reports_assigned_organization_id 
        FOREIGN KEY (assigned_organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Verify all required columns exist
SELECT 'rescue_reports table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rescue_reports' 
ORDER BY ordinal_position;

SELECT 'rescue_report_photos table exists:' as info;
SELECT CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'rescue_report_photos'
) THEN 'YES' ELSE 'NO' END as table_exists;

-- Show rescue_report_photos table structure if it exists
SELECT 'rescue_report_photos table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rescue_report_photos' 
ORDER BY ordinal_position;
