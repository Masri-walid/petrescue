-- Sample data for PetRescue Connect platform
-- This script populates the database with realistic test data

-- Insert sample users
INSERT INTO users (id, email, password_hash, user_type, first_name, last_name, phone, address, city, state, zip_code, coordinates, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@petrescue.com', '$2b$10$hash1', 'admin', 'Admin', 'User', '555-0001', '100 Admin St', 'Springfield', 'IL', '62701', POINT(-89.6501, 39.7817), true),
('550e8400-e29b-41d4-a716-446655440002', 'john.citizen@email.com', '$2b$10$hash2', 'citizen', 'John', 'Citizen', '555-0002', '123 Main St', 'Springfield', 'IL', '62701', POINT(-89.6501, 39.7817), true),
('550e8400-e29b-41d4-a716-446655440003', 'dr.smith@vetclinic.com', '$2b$10$hash3', 'veterinarian', 'Dr. Sarah', 'Smith', '555-0003', '789 Elm St', 'Springfield', 'IL', '62704', POINT(-89.6398, 39.7756), true),
('550e8400-e29b-41d4-a716-446655440004', 'shelter.manager@happypaws.org', '$2b$10$hash4', 'shelter', 'Mike', 'Johnson', '555-0004', '123 Main Street', 'Springfield', 'IL', '62701', POINT(-89.6501, 39.7817), true);

-- Insert sample organizations
INSERT INTO organizations (id, name, organization_type, description, address, city, state, zip_code, coordinates, phone, email, website, capacity, current_animal_count, rating, review_count, is_featured, is_verified) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Happy Paws Shelter', 'shelter', 'A loving shelter dedicated to rescuing and rehoming animals in need', '123 Main Street, Downtown', 'Springfield', 'IL', '62701', POINT(-89.6501, 39.7817), '(555) 123-4567', 'info@happypaws.org', 'www.happypaws.org', 150, 89, 4.8, 127, true, true),
('660e8400-e29b-41d4-a716-446655440002', 'Springfield Animal Hospital', 'veterinary_clinic', 'Full-service veterinary clinic with emergency care', '789 Elm Street, Medical District', 'Springfield', 'IL', '62704', POINT(-89.6398, 39.7756), '(555) 987-6543', 'contact@springfieldvet.com', 'www.springfieldvet.com', 50, 23, 4.9, 156, true, true),
('660e8400-e29b-41d4-a716-446655440003', 'City Animal Rescue', 'rescue', 'Volunteer-run rescue focusing on cats and small animals', '456 Oak Avenue, Midtown', 'Springfield', 'IL', '62702', POINT(-89.644, 39.7901), '(555) 234-5678', 'contact@cityrescue.org', 'www.cityrescue.org', 75, 52, 4.6, 89, false, true);

-- Insert organization hours
INSERT INTO organization_hours (organization_id, day_of_week, open_time, close_time) VALUES
-- Happy Paws Shelter (Mon-Fri 9-6, Sat 10-4, Sun 12-4)
('660e8400-e29b-41d4-a716-446655440001', 1, '09:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440001', 2, '09:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440001', 3, '09:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440001', 4, '09:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440001', 5, '09:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440001', 6, '10:00', '16:00'),
('660e8400-e29b-41d4-a716-446655440001', 0, '12:00', '16:00'),
-- Springfield Animal Hospital (Mon-Fri 7-8, Sat 8-6, Sun 10-4)
('660e8400-e29b-41d4-a716-446655440002', 1, '07:00', '20:00'),
('660e8400-e29b-41d4-a716-446655440002', 2, '07:00', '20:00'),
('660e8400-e29b-41d4-a716-446655440002', 3, '07:00', '20:00'),
('660e8400-e29b-41d4-a716-446655440002', 4, '07:00', '20:00'),
('660e8400-e29b-41d4-a716-446655440002', 5, '07:00', '20:00'),
('660e8400-e29b-41d4-a716-446655440002', 6, '08:00', '18:00'),
('660e8400-e29b-41d4-a716-446655440002', 0, '10:00', '16:00');

-- Insert organization services
INSERT INTO organization_services (organization_id, service_name, description) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Adoption', 'Pet adoption services with thorough screening'),
('660e8400-e29b-41d4-a716-446655440001', 'Veterinary Care', 'Basic veterinary care for rescued animals'),
('660e8400-e29b-41d4-a716-446655440001', 'Spay/Neuter', 'Spay and neuter services'),
('660e8400-e29b-41d4-a716-446655440001', 'Microchipping', 'Pet microchipping services'),
('660e8400-e29b-41d4-a716-446655440002', 'Emergency Care', '24/7 emergency veterinary services'),
('660e8400-e29b-41d4-a716-446655440002', 'Surgery', 'Surgical procedures and operations'),
('660e8400-e29b-41d4-a716-446655440002', 'Vaccinations', 'Complete vaccination programs'),
('660e8400-e29b-41d4-a716-446655440002', 'Microchipping', 'Pet identification microchipping');

-- Insert organization specialties
INSERT INTO organization_specialties (organization_id, specialty) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Dogs'),
('660e8400-e29b-41d4-a716-446655440001', 'Cats'),
('660e8400-e29b-41d4-a716-446655440001', 'Emergency Care'),
('660e8400-e29b-41d4-a716-446655440002', 'Emergency Care'),
('660e8400-e29b-41d4-a716-446655440002', 'Surgery'),
('660e8400-e29b-41d4-a716-446655440002', 'Dental Care'),
('660e8400-e29b-41d4-a716-446655440003', 'Cats'),
('660e8400-e29b-41d4-a716-446655440003', 'Small Animals');

-- Insert user-organization relationships
INSERT INTO user_organizations (user_id, organization_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'admin'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'owner');

-- Insert sample animals
INSERT INTO animals (id, name, species, breed, age_category, estimated_age, gender, size, color, weight, description, personality_traits, medical_conditions, is_spayed_neutered, vaccination_status, status, organization_id, adoption_fee, is_featured) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Buddy', 'dog', 'Golden Retriever', 'adult', 36, 'male', 'large', 'Golden', 28.5, 'Friendly and energetic dog who loves playing fetch and swimming. Great with kids and other dogs.', ARRAY['friendly', 'energetic', 'good_with_kids', 'good_with_dogs'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440001', 250.00, true),
('770e8400-e29b-41d4-a716-446655440002', 'Luna', 'cat', 'Domestic Shorthair', 'young', 18, 'female', 'medium', 'Black and White', 4.2, 'Sweet and gentle cat who loves to cuddle. Perfect lap cat for a quiet home.', ARRAY['gentle', 'cuddly', 'quiet', 'indoor'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440001', 150.00, true),
('770e8400-e29b-41d4-a716-446655440003', 'Max', 'dog', 'Labrador Mix', 'senior', 84, 'male', 'large', 'Black', 32.1, 'Calm senior dog looking for a peaceful retirement home. Still enjoys gentle walks.', ARRAY['calm', 'gentle', 'senior_friendly'], ARRAY['arthritis'], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440001', 100.00, false);

-- Insert animal photos
INSERT INTO animal_photos (animal_id, photo_url, is_primary, display_order) VALUES
('770e8400-e29b-41d4-a716-446655440001', '/golden-retriever-dog-playing.jpg', true, 1),
('770e8400-e29b-41d4-a716-446655440002', '/orange-tabby-cat.png', true, 1),
('770e8400-e29b-41d4-a716-446655440003', '/black-labrador.png', true, 1);

-- Insert sample rescue reports
INSERT INTO rescue_reports (id, reporter_id, animal_type, urgency_level, animal_condition, description, location_address, coordinates, contact_name, contact_phone, contact_email, status, assigned_organization_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'dog', 'urgent', 'Injured leg, limping but alert', 'Small brown dog found near the park, appears to have injured front leg', '456 Park Avenue, Springfield, IL', POINT(-89.6445, 39.7823), 'John Citizen', '555-0002', 'john.citizen@email.com', 'assigned', '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'cat', 'moderate', 'Appears healthy but very thin', 'Orange tabby cat hanging around the shopping center, seems friendly but hungry', '789 Shopping Center Dr, Springfield, IL', POINT(-89.6512, 39.7789), 'John Citizen', '555-0002', 'john.citizen@email.com', 'reported', NULL);

-- Insert sample adoption applications
INSERT INTO adoption_applications (id, animal_id, applicant_id, organization_id, application_data, status) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 
'{"housing_type": "house", "yard": true, "other_pets": false, "experience": "5+ years", "reason": "Looking for a family companion"}', 'under_review');

-- Insert sample medical records
INSERT INTO medical_records (animal_id, veterinarian_id, organization_id, record_type, title, description, record_date, cost) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'checkup', 'Annual Health Checkup', 'Complete physical examination, all vitals normal', '2024-01-15', 85.00),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'vaccination', 'FVRCP Vaccination', 'Annual FVRCP vaccination administered', '2024-01-20', 45.00);

-- Insert sample vaccinations
INSERT INTO vaccinations (animal_id, vaccine_name, vaccine_type, administered_date, next_due_date, veterinarian_id, organization_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'DHPP', 'core', '2024-01-15', '2025-01-15', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', 'Rabies', 'core', '2024-01-15', '2027-01-15', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', 'FVRCP', 'core', '2024-01-20', '2025-01-20', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002');

-- Insert sample reviews
INSERT INTO reviews (organization_id, reviewer_id, rating, title, comment) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 5, 'Amazing shelter!', 'The staff at Happy Paws were incredibly helpful and caring. They made sure we found the perfect match for our family.'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 5, 'Excellent veterinary care', 'Dr. Smith and her team provided exceptional care for our rescue dog. Highly recommend!');

-- Insert sample favorites
INSERT INTO favorites (user_id, animal_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Rescue Report Update', 'Your rescue report has been assigned to Happy Paws Shelter. A volunteer will be dispatched soon.', 'rescue_update', '880e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', 'Adoption Application Received', 'Thank you for your adoption application for Buddy. We will review it within 2-3 business days.', 'adoption_update', '990e8400-e29b-41d4-a716-446655440001');
