-- PetRescue Connect - Photo & ML schema patch
-- Run this AFTER scripts/01-create-database-schema.sql on the same database.

-- 1) Add binary profile image fields to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_data BYTEA,
    ADD COLUMN IF NOT EXISTS profile_image_content_type TEXT,
    ADD COLUMN IF NOT EXISTS profile_image_file_name TEXT,
    ADD COLUMN IF NOT EXISTS profile_image_file_size BIGINT;

-- 2) Extend animal_photos with binary image data and make photo_url optional
ALTER TABLE animal_photos
    ALTER COLUMN photo_url DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS photo_data BYTEA,
    ADD COLUMN IF NOT EXISTS content_type TEXT,
    ADD COLUMN IF NOT EXISTS file_name TEXT,
    ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- 3) Extend rescue_report_photos with binary image data and make photo_url optional
ALTER TABLE rescue_report_photos
    ALTER COLUMN photo_url DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS photo_data BYTEA,
    ADD COLUMN IF NOT EXISTS content_type TEXT,
    ADD COLUMN IF NOT EXISTS file_name TEXT,
    ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- 4) Ensure user_photos table exists and has binary image fields
CREATE TABLE IF NOT EXISTS user_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT,
    photo_data BYTEA,
    content_type TEXT,
    file_name TEXT,
    file_size BIGINT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_photos
    ADD COLUMN IF NOT EXISTS photo_data BYTEA,
    ADD COLUMN IF NOT EXISTS content_type TEXT,
    ADD COLUMN IF NOT EXISTS file_name TEXT,
    ADD COLUMN IF NOT EXISTS file_size BIGINT;

CREATE INDEX IF NOT EXISTS idx_user_photos_user_id
    ON user_photos(user_id);

-- 5) Reset ML tables to match current backend models
DROP TABLE IF EXISTS photo_embedding;
DROP TABLE IF EXISTS photo_characteristic;
DROP TABLE IF EXISTS characteristic;

CREATE TABLE characteristic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    data_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photo_characteristic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES rescue_report_photos(id) ON DELETE CASCADE,
    characteristic_id UUID NOT NULL REFERENCES characteristic(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    confidence DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photo_embedding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES rescue_report_photos(id) ON DELETE CASCADE,
    embedding FLOAT8[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photo_characteristic_characteristic_id
    ON photo_characteristic(characteristic_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_characteristic_photo_characteristic_unique
    ON photo_characteristic(photo_id, characteristic_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_embedding_photo_id_unique
    ON photo_embedding(photo_id);

