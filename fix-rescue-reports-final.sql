-- Final fix for rescue_reports table schema
-- Based on the error logs, these are the exact columns the application expects

-- Add missing columns one by one with explicit error handling
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

-- Verify the columns exist
SELECT 'animal_condition' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'animal_condition') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'location_address' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'location_address') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'contact_name' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_name') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'contact_phone' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_phone') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'contact_email' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'contact_email') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'status' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'status') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'assigned_organization_id' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'assigned_organization_id') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'reporter_id' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'reporter_id') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'created_at' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'created_at') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'updated_at' as column_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rescue_reports' AND column_name = 'updated_at') 
            THEN 'EXISTS' ELSE 'MISSING' END as status;
