-- PetRescue Connect Database Schema (Simplified)
-- This script creates all necessary tables for the platform
-- Temporary photos functionality has been removed for simplicity

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('citizen', 'shelter', 'veterinarian', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    coordinates POINT, -- For geolocation (lat, lng)
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table for shelters, rescues, and vet clinics
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL CHECK (organization_type IN ('shelter', 'rescue', 'veterinary_clinic', 'sanctuary')),
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    coordinates POINT NOT NULL, -- For geolocation
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    license_number VARCHAR(100),
    capacity INTEGER,
    current_animal_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization hours table
CREATE TABLE organization_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization services table
CREATE TABLE organization_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization specialties table
CREATE TABLE organization_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User organization relationships (for staff/volunteers)
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'volunteer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- Animals table for rescued and adoptable pets
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
    breed VARCHAR(100),
    age_category VARCHAR(20) CHECK (age_category IN ('puppy', 'kitten', 'young', 'adult', 'senior')),
    estimated_age INTEGER, -- in months
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
    color VARCHAR(100),
    weight DECIMAL(5,2), -- in kg
    description TEXT,
    personality_traits TEXT[],
    medical_conditions TEXT[],
    special_needs TEXT,
    microchip_id VARCHAR(50),
    is_spayed_neutered BOOLEAN,
    vaccination_status VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('rescued', 'in_care', 'available', 'adopted', 'fostered', 'medical_hold', 'deceased')),
    organization_id UUID REFERENCES organizations(id),
    rescue_report_id UUID, -- Will reference rescue_reports table
    adoption_fee DECIMAL(8,2),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Animal photos table
CREATE TABLE animal_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rescue reports table for citizen reports
CREATE TABLE rescue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id),
    animal_type VARCHAR(50) NOT NULL,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('critical', 'urgent', 'moderate', 'low')),
    animal_condition TEXT NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    coordinates POINT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'rescued', 'closed', 'cancelled')),
    assigned_organization_id UUID REFERENCES organizations(id),
    assigned_volunteer_id UUID REFERENCES users(id),
    rescue_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rescue report photos table
CREATE TABLE rescue_report_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rescue_report_id UUID NOT NULL REFERENCES rescue_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adoption applications table
CREATE TABLE adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id),
    applicant_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    application_data JSONB NOT NULL, -- Stores form responses
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccination', 'checkup', 'treatment', 'surgery', 'medication', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    medications TEXT[],
    next_appointment_date DATE,
    cost DECIMAL(8,2),
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vaccinations table
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(50) NOT NULL,
    administered_date DATE NOT NULL,
    next_due_date DATE,
    veterinarian_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table for organizations
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, reviewer_id)
);

-- Favorites table for users to save animals
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, animal_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rescue_update', 'adoption_update', 'system', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- Can reference rescue_reports, adoption_applications, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_coordinates ON users USING GIST(coordinates);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_coordinates ON organizations USING GIST(coordinates);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_organization ON animals(organization_id);
CREATE INDEX idx_rescue_reports_status ON rescue_reports(status);
CREATE INDEX idx_rescue_reports_coordinates ON rescue_reports USING GIST(coordinates);
CREATE INDEX idx_rescue_reports_urgency ON rescue_reports(urgency_level);
CREATE INDEX idx_adoption_applications_status ON adoption_applications(status);
CREATE INDEX idx_adoption_applications_animal ON adoption_applications(animal_id);
CREATE INDEX idx_medical_records_animal ON medical_records(animal_id);
CREATE INDEX idx_vaccinations_animal ON vaccinations(animal_id);
CREATE INDEX idx_reviews_organization ON reviews(organization_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescue_reports_updated_at BEFORE UPDATE ON rescue_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adoption_applications_updated_at BEFORE UPDATE ON adoption_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
