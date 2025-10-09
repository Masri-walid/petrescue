-- Make coordinates column nullable temporarily
ALTER TABLE rescue_reports ALTER COLUMN coordinates DROP NOT NULL;

-- Verify the change
\d rescue_reports;
