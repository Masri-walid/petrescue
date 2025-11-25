-- Check database for test data

-- Check users
SELECT 'USERS' as section, email, user_type, first_name, last_name, 
       CASE WHEN profile_image_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_profile_image
FROM users 
WHERE email IN ('user@g.c', 'vet@g.c', 'shelter@g.c')
ORDER BY email;

-- Check organizations
SELECT 'ORGANIZATIONS' as section, name, organization_type, email, phone
FROM organizations
WHERE name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
ORDER BY created_at DESC;

-- Check user_photos
SELECT 'USER_PHOTOS' as section, u.email, up.caption, up.is_primary,
       CASE WHEN up.photo_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_photo_data
FROM user_photos up
JOIN users u ON up.user_id = u.id
WHERE u.email IN ('vet@g.c', 'shelter@g.c')
ORDER BY u.email, up.created_at;

-- Check animals
SELECT 'ANIMALS' as section, a.name, a.species, a.status, o.name as organization_name,
       a.id as animal_id
FROM animals a
LEFT JOIN organizations o ON a.organization_id = o.id
WHERE o.name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
ORDER BY a.created_at DESC;

-- Check animal_photos
SELECT 'ANIMAL_PHOTOS' as section, a.name as animal_name, ap.caption, ap.is_primary,
       CASE WHEN ap.photo_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_photo_data,
       ap.file_name
FROM animal_photos ap
JOIN animals a ON ap.animal_id = a.id
JOIN organizations o ON a.organization_id = o.id
WHERE o.name IN ('Walid''s Clinic', 'Yasmine''s Shelter')
ORDER BY a.name, ap.display_order;

-- Check adoption_applications
SELECT 'ADOPTION_APPLICATIONS' as section, aa.status, u.email as applicant_email,
       a.name as animal_name, o.name as organization_name
FROM adoption_applications aa
JOIN users u ON aa.applicant_id = u.id
JOIN animals a ON aa.animal_id = a.id
JOIN organizations o ON aa.organization_id = o.id
WHERE u.email = 'user@g.c'
ORDER BY aa.created_at DESC;

-- Check rescue_reports
SELECT 'RESCUE_REPORTS' as section, rr.animal_type, rr.urgency_level, rr.status,
       rr.contact_email, rr.location_address, rr.id as report_id
FROM rescue_reports rr
WHERE rr.contact_email = 'user@g.c'
ORDER BY rr.created_at DESC;

-- Check rescue_report_photos
SELECT 'RESCUE_REPORT_PHOTOS' as section, rr.animal_type, rrp.file_name,
       CASE WHEN rrp.photo_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_photo_data
FROM rescue_report_photos rrp
JOIN rescue_reports rr ON rrp.rescue_report_id = rr.id
WHERE rr.contact_email = 'user@g.c'
ORDER BY rr.created_at DESC, rrp.created_at;

