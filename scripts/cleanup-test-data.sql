-- Cleanup test data script for PetRescue Connect
-- Run this to remove all test data created by seed-test-users.js

-- Delete in correct order to respect foreign key constraints

-- Delete rescue report photos
DELETE FROM rescue_report_photos WHERE rescue_report_id IN (
    SELECT id FROM rescue_reports WHERE contact_email IN ('user@g.c')
);

-- Delete rescue reports
DELETE FROM rescue_reports WHERE contact_email IN ('user@g.c');

-- Delete adoption applications
DELETE FROM adoption_applications WHERE applicant_id IN (
    SELECT id FROM users WHERE email IN ('user@g.c', 'vet@g.c', 'shelter@g.c')
);

-- Delete animal photos
DELETE FROM animal_photos WHERE animal_id IN (
    SELECT id FROM animals WHERE organization_id IN (
        SELECT id FROM organizations WHERE name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
    )
);

-- Delete animals
DELETE FROM animals WHERE organization_id IN (
    SELECT id FROM organizations WHERE name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
);

-- Delete user photos
DELETE FROM user_photos WHERE user_id IN (
    SELECT id FROM users WHERE email IN ('user@g.c', 'vet@g.c', 'shelter@g.c')
);

-- Delete user organizations
DELETE FROM user_organizations WHERE user_id IN (
    SELECT id FROM users WHERE email IN ('user@g.c', 'vet@g.c', 'shelter@g.c')
);

-- Delete users
DELETE FROM users WHERE email IN ('user@g.c', 'vet@g.c', 'shelter@g.c');

-- Delete organization hours
DELETE FROM organization_hours WHERE organization_id IN (
    SELECT id FROM organizations WHERE name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
);

-- Delete organizations
DELETE FROM organizations WHERE name IN ('Walid''s Clinic', 'Yasmine''s Shelter');

-- Show remaining counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'Animals', COUNT(*) FROM animals
UNION ALL
SELECT 'Rescue Reports', COUNT(*) FROM rescue_reports
UNION ALL
SELECT 'Adoption Applications', COUNT(*) FROM adoption_applications;

