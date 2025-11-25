# PetRescue Connect Test Data Seeding

This directory contains scripts to seed test data into your PetRescue Connect application.

## Overview

The seeding system creates:
- **3 Users**: Regular user, Veterinarian, and Shelter staff
- **2 Organizations**: Walid's Clinic (veterinary) and Yasmine's Shelter
- **Profile Photos**: For all users
- **Additional Photos**: Gallery photos for vet and shelter users
- **Animals**: With adoption photos
- **Adoption Applications**: Sample application from the regular user
- **Rescue Reports**: With multiple photos

## Prerequisites

1. Backend API must be running on `http://localhost:5149`
2. PostgreSQL database must be set up and running
3. Node.js dependencies installed: `form-data` and `node-fetch@2`

## Installation

```bash
npm install form-data node-fetch@2
```

## Usage

### Seed Test Data

Run the main seeding script:

```bash
node scripts/seed-test-users.js
```

This will create all test data including:
- Organizations (Walid's Clinic, Yasmine's Shelter)
- Users with credentials:
  - `user@g.c` / `password123` (Regular User)
  - `vet@g.c` / `password123` (Veterinarian at Walid's Clinic)
  - `shelter@g.c` / `password123` (Shelter Staff at Yasmine's Shelter)
- Profile photos from `dataset_test` folder
- Additional user photos for vet and shelter
- Animals with adoption photos
- Adoption applications
- Rescue reports with photos

### Verify Test Data

Check that all data was created correctly:

```bash
node scripts/verify-test-data.js
```

### Check Database Directly

Use pgAdmin or psql to run the database check script:

```sql
\i scripts/check-database.sql
```

Or with psql:

```bash
psql -U postgres -d petrescue -p 5432 -f scripts/check-database.sql
```

### Cleanup Test Data

To remove all test data:

```sql
\i scripts/cleanup-test-data.sql
```

Or with psql:

```bash
psql -U postgres -d petrescue -p 5432 -f scripts/cleanup-test-data.sql
```

## Photo Files

The scripts expect the following photos in the `dataset_test` folder:

### Profile Photos:
- `user.png` - Profile photo for regular user
- `veterinare picture.png` - Profile photo for veterinarian
- `shelter picture.png` - Profile photo for shelter staff

### Additional User Photos:
- `veterinar photo.png` - Gallery photo for vet
- `veterinare photo 2.png` - Gallery photo for vet
- `shelter photo.png` - Gallery photo for shelter
- `shelter 2 photo.png` - Gallery photo for shelter

### Animal/Adoption Photos:
- `adoption dog.png` - Animal photo
- `adoption pet 1.png` - Animal photo

### Rescue Report Photos:
- `rescue report photo .png` - Rescue report photo
- `rescue report photo 2.png` - Rescue report photo
- `rescue report photo 3.png` - Rescue report photo

## Features

### Smart User Registration
The script automatically detects if users already exist and logs in instead of trying to register again.

### Photo Upload
All photos are uploaded as binary data (BYTEA) to the PostgreSQL database, following the project's architecture.

### Organization Association
- Veterinarian is automatically associated with Walid's Clinic
- Shelter staff is automatically associated with Yasmine's Shelter

### Complete Data Flow
The script demonstrates the complete data flow:
1. Create organizations
2. Register users with organization associations
3. Upload profile photos
4. Upload additional gallery photos
5. Create animals with photos
6. Create adoption applications
7. Create rescue reports with photos

## Troubleshooting

### "Email already exists" error
The script now handles this automatically by logging in instead.

### Backend not running
Make sure the .NET backend is running on port 5149:
```bash
cd backend
dotnet run
```

### Database connection issues
Check that PostgreSQL is running and the database `petrescue` exists with the correct schema.

### Photo files not found
Ensure all photo files are in the `dataset_test` folder with the exact names listed above.

## Notes

- The script creates duplicate organizations if run multiple times (this is expected behavior)
- User accounts are reused if they already exist
- Photos are stored as binary data in the database
- All API calls use proper authentication tokens

