-- Additional comprehensive mock data for PetRescue Connect
-- Run this after the initial seed data for more realistic testing

-- Insert more users (citizens, vets, shelter staff)
INSERT INTO users (id, email, password_hash, user_type, first_name, last_name, phone, address, city, state, zip_code, coordinates, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'emily.johnson@email.com', '$2b$10$hash5', 'citizen', 'Emily', 'Johnson', '555-0105', '456 Oak Street', 'Springfield', 'IL', '62702', POINT(-89.644, 39.7901), true),
('550e8400-e29b-41d4-a716-446655440006', 'dr.martinez@animalcare.com', '$2b$10$hash6', 'veterinarian', 'Dr. Carlos', 'Martinez', '555-0106', '321 Pine Ave', 'Springfield', 'IL', '62703', POINT(-89.6423, 39.7834), true),
('550e8400-e29b-41d4-a716-446655440007', 'sarah.volunteer@cityrescue.org', '$2b$10$hash7', 'citizen', 'Sarah', 'Williams', '555-0107', '789 Maple Dr', 'Springfield', 'IL', '62704', POINT(-89.6398, 39.7756), true),
('550e8400-e29b-41d4-a716-446655440008', 'james.adopter@email.com', '$2b$10$hash8', 'citizen', 'James', 'Brown', '555-0108', '654 Cedar Lane', 'Springfield', 'IL', '62701', POINT(-89.6501, 39.7817), true);

-- Insert more organizations
INSERT INTO organizations (id, name, organization_type, description, address, city, state, zip_code, coordinates, phone, email, website, capacity, current_animal_count, rating, review_count, is_featured, is_verified) VALUES
('660e8400-e29b-41d4-a716-446655440004', 'Paws & Hearts Veterinary Clinic', 'veterinary_clinic', 'Specialized veterinary care with focus on rescue animals', '321 Pine Avenue, Westside', 'Springfield', 'IL', '62703', POINT(-89.6423, 39.7834), '(555) 321-9876', 'info@pawshearts.com', 'www.pawshearts.com', 30, 15, 4.7, 98, false, true),
('660e8400-e29b-41d4-a716-446655440005', 'Second Chance Animal Sanctuary', 'sanctuary', 'Sanctuary for special needs and senior animals', '987 Country Road, Rural Area', 'Springfield', 'IL', '62705', POINT(-89.7123, 39.8234), '(555) 456-7890', 'contact@secondchance.org', 'www.secondchance.org', 200, 145, 4.9, 67, true, true);

-- Insert more animals with diverse characteristics
INSERT INTO animals (id, name, species, breed, age_category, estimated_age, gender, size, color, weight, description, personality_traits, medical_conditions, is_spayed_neutered, vaccination_status, status, organization_id, adoption_fee, is_featured) VALUES
-- Dogs
('770e8400-e29b-41d4-a716-446655440004', 'Bella', 'dog', 'German Shepherd Mix', 'young', 24, 'female', 'large', 'Brown and Black', 25.3, 'Intelligent and loyal dog who needs an experienced owner. Great guard dog but gentle with family.', ARRAY['intelligent', 'loyal', 'protective', 'needs_training'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440001', 300.00, true),
('770e8400-e29b-41d4-a716-446655440005', 'Charlie', 'dog', 'Beagle', 'puppy', 6, 'male', 'medium', 'Tri-color', 8.5, 'Playful puppy who loves everyone! Perfect for families with children. Very social and energetic.', ARRAY['playful', 'social', 'energetic', 'good_with_kids'], ARRAY[], false, 'partial', 'available', '660e8400-e29b-41d4-a716-446655440001', 350.00, true),
('770e8400-e29b-41d4-a716-446655440006', 'Rocky', 'dog', 'Pit Bull Mix', 'adult', 48, 'male', 'large', 'Brindle', 30.2, 'Sweet and gentle giant who loves belly rubs. Despite his tough appearance, he is very affectionate.', ARRAY['gentle', 'affectionate', 'calm', 'good_with_dogs'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440003', 200.00, false),

-- Cats
('770e8400-e29b-41d4-a716-446655440007', 'Whiskers', 'cat', 'Persian', 'adult', 36, 'male', 'medium', 'White', 5.8, 'Fluffy Persian cat who loves to be pampered. Prefers quiet homes and enjoys being the only pet.', ARRAY['quiet', 'independent', 'fluffy', 'indoor'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440003', 200.00, true),
('770e8400-e29b-41d4-a716-446655440008', 'Mittens', 'cat', 'Domestic Shorthair', 'kitten', 4, 'female', 'small', 'Gray and White', 1.2, 'Adorable kitten who loves to play and explore. Very curious and social with other cats.', ARRAY['playful', 'curious', 'social', 'kitten'], ARRAY[], false, 'partial', 'available', '660e8400-e29b-41d4-a716-446655440001', 175.00, true),
('770e8400-e29b-41d4-a716-446655440009', 'Shadow', 'cat', 'Maine Coon Mix', 'senior', 96, 'male', 'large', 'Black', 7.1, 'Dignified senior cat looking for a peaceful retirement home. Very gentle and loves sunny windowsills.', ARRAY['calm', 'gentle', 'senior', 'independent'], ARRAY['mild_arthritis'], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440005', 100.00, false),

-- Other animals
('770e8400-e29b-41d4-a716-446655440010', 'Hopscotch', 'rabbit', 'Holland Lop', 'young', 18, 'female', 'small', 'Brown and White', 2.1, 'Sweet bunny who loves fresh vegetables and hopping around. Needs a quiet home with rabbit experience.', ARRAY['gentle', 'quiet', 'needs_special_care'], ARRAY[], true, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440003', 125.00, false),
('770e8400-e29b-41d4-a716-446655440011', 'Sunny', 'bird', 'Cockatiel', 'adult', 24, 'unknown', 'small', 'Yellow and Gray', 0.1, 'Friendly cockatiel who loves to whistle and interact with people. Comes with cage and accessories.', ARRAY['social', 'vocal', 'interactive'], ARRAY[], false, 'up_to_date', 'available', '660e8400-e29b-41d4-a716-446655440003', 150.00, false);

-- Insert more animal photos
INSERT INTO animal_photos (animal_id, photo_url, is_primary, display_order) VALUES
('770e8400-e29b-41d4-a716-446655440004', '/golden-retriever-dog-sitting.jpg', true, 1),
('770e8400-e29b-41d4-a716-446655440005', '/golden-retriever-dog-with-toy.jpg', true, 1),
('770e8400-e29b-41d4-a716-446655440006', '/black-labrador.png', true, 1),
('770e8400-e29b-41d4-a716-446655440007', '/persian-cat-white-fluffy.jpg', true, 1),
('770e8400-e29b-41d4-a716-446655440008', '/orange-tabby-cat.png', true, 1),
('770e8400-e29b-41d4-a716-446655440009', '/black-labrador.png', true, 1);

-- Insert more rescue reports
INSERT INTO rescue_reports (id, reporter_id, animal_type, urgency_level, animal_condition, description, location_address, coordinates, contact_name, contact_phone, contact_email, status, assigned_organization_id) VALUES
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'cat', 'critical', 'Injured, bleeding from leg', 'Black cat hit by car, conscious but injured. Needs immediate medical attention.', '123 Emergency St, Springfield, IL', POINT(-89.6501, 39.7817), 'Emily Johnson', '555-0105', 'emily.johnson@email.com', 'in_progress', '660e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'dog', 'low', 'Appears healthy, well-fed', 'Friendly dog wandering neighborhood, has collar but no tags. Seems lost rather than stray.', '456 Residential Ave, Springfield, IL', POINT(-89.6398, 39.7756), 'Sarah Williams', '555-0107', 'sarah.volunteer@cityrescue.org', 'reported', NULL);

-- Insert more adoption applications
INSERT INTO adoption_applications (id, animal_id, applicant_id, organization_id, application_data, status) VALUES
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 
'{"housing_type": "apartment", "yard": false, "other_pets": true, "experience": "first_time", "reason": "Companionship for elderly cat"}', 'submitted'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 
'{"housing_type": "house", "yard": true, "other_pets": false, "experience": "experienced", "reason": "Family pet for children"}', 'approved');

-- Insert more medical records
INSERT INTO medical_records (animal_id, veterinarian_id, organization_id, record_type, title, description, record_date, cost) VALUES
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'surgery', 'Spay Surgery', 'Routine spay surgery completed successfully. Recovery normal.', '2024-02-01', 250.00),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'vaccination', 'Puppy Vaccination Series', 'Second round of puppy vaccinations administered', '2024-02-15', 75.00),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'treatment', 'Arthritis Management', 'Started on joint supplements and pain management for mild arthritis', '2024-01-30', 120.00);

-- Insert more vaccinations
INSERT INTO vaccinations (animal_id, vaccine_name, vaccine_type, administered_date, next_due_date, veterinarian_id, organization_id) VALUES
('770e8400-e29b-41d4-a716-446655440004', 'DHPP', 'core', '2024-02-01', '2025-02-01', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440005', 'DHPP', 'core', '2024-02-15', '2024-05-15', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440007', 'FVRCP', 'core', '2024-01-25', '2025-01-25', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004');

-- Insert more reviews
INSERT INTO reviews (organization_id, reviewer_id, rating, title, comment) VALUES
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 4, 'Great cat rescue', 'City Animal Rescue helped me find the perfect cat. The adoption process was thorough but fair.'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 5, 'Excellent veterinary care', 'Dr. Martinez provided exceptional care for our newly adopted dog. Very knowledgeable and caring.'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 5, 'Amazing sanctuary', 'Second Chance Sanctuary does incredible work with special needs animals. Highly recommend supporting them.');

-- Insert more user-organization relationships
INSERT INTO user_organizations (user_id, organization_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'owner'),
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'volunteer');

-- Insert more favorites
INSERT INTO favorites (user_id, animal_id) VALUES
('550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440008');

-- Insert more notifications
INSERT INTO notifications (user_id, title, message, type, related_id) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'New Animal Available', 'A new German Shepherd mix named Bella is now available for adoption at Happy Paws Shelter.', 'system', '770e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440008', 'Application Approved', 'Congratulations! Your adoption application for Charlie has been approved. Please contact the shelter to schedule pickup.', 'adoption_update', '990e8400-e29b-41d4-a716-446655440003');
