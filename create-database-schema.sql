-- Create database schema for PetRescue Connect
-- Execute this script in PostgreSQL to create all necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('citizen', 'shelter', 'veterinarian', 'admin')),
    phone VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('shelter', 'veterinarian')),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age_years INTEGER,
    age_months INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
    color VARCHAR(100),
    weight DECIMAL(5,2),
    description TEXT,
    medical_notes TEXT,
    behavioral_notes TEXT,
    is_spayed_neutered BOOLEAN,
    is_house_trained BOOLEAN,
    good_with_kids BOOLEAN,
    good_with_pets BOOLEAN,
    energy_level VARCHAR(20) CHECK (energy_level IN ('low', 'medium', 'high')),
    adoption_status VARCHAR(20) DEFAULT 'available' CHECK (adoption_status IN ('available', 'pending', 'adopted', 'not_available')),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rescue_reports table
CREATE TABLE IF NOT EXISTS rescue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'unknown')),
    color VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    age_estimate VARCHAR(50),
    description TEXT,
    location VARCHAR(500) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    injured_or_sick BOOLEAN DEFAULT false,
    injury_description TEXT,
    reporter_name VARCHAR(200) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    reporter_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'resolved', 'closed')),
    assigned_organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rescue_report_photos table (with binary storage)
CREATE TABLE IF NOT EXISTS rescue_report_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rescue_report_id UUID NOT NULL REFERENCES rescue_reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    photo_data BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create animal_photos table
CREATE TABLE IF NOT EXISTS animal_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size BIGINT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create adoption_applications table
CREATE TABLE IF NOT EXISTS adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id),
    applicant_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    application_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id),
    veterinarian_id UUID REFERENCES users(id),
    record_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    treatment_date DATE NOT NULL,
    medications TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_animals_organization_id ON animals(organization_id);
CREATE INDEX IF NOT EXISTS idx_animals_adoption_status ON animals(adoption_status);
CREATE INDEX IF NOT EXISTS idx_rescue_reports_status ON rescue_reports(status);
CREATE INDEX IF NOT EXISTS idx_rescue_reports_assigned_org ON rescue_reports(assigned_organization_id);
CREATE INDEX IF NOT EXISTS idx_rescue_photos_report_id ON rescue_report_photos(rescue_report_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal_id ON animal_photos(animal_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_animal_id ON adoption_applications(animal_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_applicant_id ON adoption_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_animal_id ON medical_records(animal_id);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for citizens, shelters, veterinarians, and admins';
COMMENT ON TABLE organizations IS 'Shelter and veterinary organizations';
COMMENT ON TABLE animals IS 'Animals available for adoption';
COMMENT ON TABLE rescue_reports IS 'Reports of animals needing rescue';
COMMENT ON TABLE rescue_report_photos IS 'Photos attached to rescue reports (stored as binary data)';
COMMENT ON COLUMN rescue_report_photos.photo_data IS 'Binary photo data stored directly in database';
COMMENT ON TABLE animal_photos IS 'Photos of animals available for adoption';
COMMENT ON TABLE adoption_applications IS 'Applications to adopt animals';
COMMENT ON TABLE medical_records IS 'Medical history and records for animals';

-- Display success message
SELECT 'Database schema created successfully!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organizations', 'animals', 'rescue_reports', 'rescue_report_photos', 'animal_photos', 'adoption_applications', 'medical_records')
ORDER BY table_name;
