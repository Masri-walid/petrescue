-- Install PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify installation
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';

-- Check if POINT type is available
SELECT typname FROM pg_type WHERE typname = 'geometry';
