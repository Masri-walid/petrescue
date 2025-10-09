-- Insert test data for PetRescue Connect

-- Insert a test user
INSERT INTO users (
    email, 
    password_hash, 
    user_type, 
    first_name, 
    last_name, 
    phone,
    is_verified,
    is_active
) VALUES (
    'user@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- BCrypt hash for "string"
    'citizen',
    'Test',
    'User',
    '555-0123',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert a test organization
INSERT INTO organizations (
    name,
    organization_type,
    description,
    address,
    city,
    state,
    zip_code,
    coordinates,
    phone,
    email,
    website,
    capacity,
    current_animal_count,
    rating,
    review_count,
    is_featured,
    is_verified,
    is_active
) VALUES (
    'Happy Paws Animal Shelter',
    'shelter',
    'A loving shelter dedicated to finding homes for abandoned pets',
    '123 Main Street',
    'Anytown',
    'CA',
    '12345',
    POINT(34.0522, -118.2437), -- Los Angeles coordinates
    '555-0456',
    'info@happypaws.org',
    'https://happypaws.org',
    50,
    25,
    4.5,
    120,
    true,
    true,
    true
) ON CONFLICT DO NOTHING;

-- Insert a test animal
INSERT INTO animals (
    name,
    species,
    breed,
    age_category,
    estimated_age,
    gender,
    size,
    color,
    weight,
    description,
    status,
    organization_id,
    adoption_fee,
    is_featured
) VALUES (
    'Buddy',
    'dog',
    'Golden Retriever',
    'adult',
    36, -- 3 years old
    'male',
    'large',
    'Golden',
    30.5,
    'Buddy is a friendly and energetic dog who loves to play fetch and go for walks.',
    'available',
    (SELECT id FROM organizations WHERE name = 'Happy Paws Animal Shelter' LIMIT 1),
    250.00,
    true
) ON CONFLICT DO NOTHING;
