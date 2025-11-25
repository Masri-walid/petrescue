const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5149/api';
const DATASET_PATH = path.join(__dirname, '..', 'dataset_test');

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`API Error: ${JSON.stringify(data)}`);
  }
  return data;
}

// Helper function to upload file
async function uploadFile(endpoint, filePath, token, additionalFields = {}) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  Object.entries(additionalFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...formData.getHeaders(),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Upload Error: ${JSON.stringify(data)}`);
  }
  return data;
}

// Step 1: Create organizations
async function createOrganizations() {
  console.log('\n=== Creating Organizations ===');
  
  // Create Walid's Clinic (Veterinary)
  const clinicData = {
    name: "Walid's Clinic",
    organizationType: "veterinary_clinic",
    description: "Professional veterinary care for all pets",
    address: "123 Vet Street",
    city: "Montreal",
    state: "QC",
    zipCode: "H1A 1A1",
    coordinates: "POINT(-73.5673 45.5017)",
    phone: "514-555-0101",
    email: "contact@walidsclinic.com",
    website: "https://walidsclinic.com",
    licenseNumber: "VET-2024-001",
    capacity: 50
  };
  
  const clinic = await apiRequest('/organizations/register', {
    method: 'POST',
    body: JSON.stringify(clinicData),
  });
  console.log('✓ Created Walid\'s Clinic:', clinic.data.id);
  
  // Create Yasmine's Shelter
  const shelterData = {
    name: "Yasmine's Shelter",
    organizationType: "shelter",
    description: "A safe haven for rescued animals",
    address: "456 Shelter Avenue",
    city: "Montreal",
    state: "QC",
    zipCode: "H2B 2B2",
    coordinates: "POINT(-73.5800 45.5100)",
    phone: "514-555-0202",
    email: "contact@yasminesshelter.com",
    website: "https://yasminesshelter.com",
    licenseNumber: "SHL-2024-001",
    capacity: 100
  };
  
  const shelter = await apiRequest('/organizations/register', {
    method: 'POST',
    body: JSON.stringify(shelterData),
  });
  console.log('✓ Created Yasmine\'s Shelter:', shelter.data.id);
  
  return { clinicId: clinic.data.id, shelterId: shelter.data.id };
}

// Helper function to register or login
async function registerOrLogin(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log(`✓ Registered ${userData.email}`);
    return response;
  } catch (error) {
    if (error.message.includes('Email already exists')) {
      console.log(`  ${userData.email} already exists, logging in...`);
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
      });
      return loginResponse;
    }
    throw error;
  }
}

// Step 2: Register users
async function registerUsers(clinicId, shelterId) {
  console.log('\n=== Registering Users ===');

  const users = [];

  // Register regular user
  const userData = {
    firstName: "Regular",
    lastName: "User",
    email: "user@g.c",
    password: "password123",
    userType: "citizen",
    phone: "514-555-1001"
  };

  const userResponse = await registerOrLogin(userData);
  users.push({ ...userResponse, role: 'citizen', photoFile: 'user.png' });

  // Register veterinarian
  const vetData = {
    firstName: "Vet",
    lastName: "Doctor",
    email: "vet@g.c",
    password: "password123",
    userType: "veterinarian",
    phone: "514-555-1002",
    address: "123 Vet Street",
    city: "Montreal",
    state: "QC",
    zipCode: "H1A 1A1",
    organizationId: clinicId
  };

  const vetResponse = await registerOrLogin(vetData);
  users.push({ ...vetResponse, role: 'veterinarian', photoFile: 'veterinare picture.png', additionalPhotos: ['veterinar photo.png', 'veterinare photo 2.png'] });

  // Register shelter staff
  const shelterUserData = {
    firstName: "Shelter",
    lastName: "Staff",
    email: "shelter@g.c",
    password: "password123",
    userType: "shelter",
    phone: "514-555-1003",
    address: "456 Shelter Avenue",
    city: "Montreal",
    state: "QC",
    zipCode: "H2B 2B2",
    organizationId: shelterId
  };

  const shelterResponse = await registerOrLogin(shelterUserData);
  users.push({ ...shelterResponse, role: 'shelter', photoFile: 'shelter picture.png', additionalPhotos: ['shelter photo.png', 'shelter 2 photo.png'] });

  return users;
}

// Step 3: Upload profile photos
async function uploadProfilePhotos(users) {
  console.log('\n=== Uploading Profile Photos ===');

  for (const user of users) {
    const photoPath = path.join(DATASET_PATH, user.photoFile);
    if (fs.existsSync(photoPath)) {
      try {
        await uploadFile('/images/upload/profile', photoPath, user.token);
        console.log(`✓ Uploaded profile photo for ${user.user.email}`);
      } catch (error) {
        console.error(`✗ Failed to upload profile photo for ${user.user.email}:`, error.message);
      }
    } else {
      console.warn(`⚠ Photo not found: ${photoPath}`);
    }
  }
}

// Step 4: Upload additional user photos (for vet and shelter)
async function uploadAdditionalPhotos(users) {
  console.log('\n=== Uploading Additional User Photos ===');

  for (const user of users) {
    if (user.additionalPhotos && user.additionalPhotos.length > 0) {
      for (let i = 0; i < user.additionalPhotos.length; i++) {
        const photoFile = user.additionalPhotos[i];
        const photoPath = path.join(DATASET_PATH, photoFile);

        if (fs.existsSync(photoPath)) {
          try {
            await uploadFile('/images/upload/user-photo', photoPath, user.token, {
              caption: `Photo ${i + 1}`,
              isPrimary: 'false'
            });
            console.log(`✓ Uploaded additional photo for ${user.user.email}: ${photoFile}`);
          } catch (error) {
            console.error(`✗ Failed to upload ${photoFile}:`, error.message);
          }
        } else {
          console.warn(`⚠ Photo not found: ${photoPath}`);
        }
      }
    }
  }
}

// Step 5: Create animals for adoption
async function createAnimalsForAdoption(users, shelterId) {
  console.log('\n=== Creating Animals for Adoption ===');

  const shelterUser = users.find(u => u.role === 'shelter');
  if (!shelterUser) {
    console.error('✗ Shelter user not found');
    return [];
  }

  const animals = [];

  // Create animal 1
  const animal1Data = {
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    ageCategory: "adult",
    estimatedAge: 36,
    gender: "male",
    size: "large",
    color: "Golden",
    weight: 30.5,
    description: "Friendly and energetic dog looking for a loving home",
    status: "available",
    organizationId: shelterId,
    adoptionFee: 250.00,
    isFeatured: true
  };

  const animal1 = await apiRequest('/animals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${shelterUser.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animal1Data),
  });
  console.log('✓ Created animal: Buddy (ID:', animal1.id, ')');
  animals.push(animal1);

  // Upload animal photos
  const adoptionPhotos = ['adoption dog.png', 'adoption pet 1.png'];
  for (let i = 0; i < adoptionPhotos.length; i++) {
    const photoFile = adoptionPhotos[i];
    const photoPath = path.join(DATASET_PATH, photoFile);

    if (fs.existsSync(photoPath)) {
      try {
        console.log(`  Uploading ${photoFile} for animal ${animal1.id}...`);
        const result = await uploadFile('/images/upload/animal-photo', photoPath, shelterUser.token, {
          animalId: animal1.id,
          caption: `Adoption photo ${i + 1}`,
          isPrimary: i === 0 ? 'true' : 'false',
          displayOrder: i.toString()
        });
        console.log(`✓ Uploaded animal photo: ${photoFile}`);
      } catch (error) {
        console.error(`✗ Failed to upload animal photo ${photoFile}:`, error.message);
      }
    } else {
      console.warn(`⚠ Photo not found: ${photoPath}`);
    }
  }

  return animals;
}

// Step 6: Create adoption applications
async function createAdoptionApplications(users, animals) {
  console.log('\n=== Creating Adoption Applications ===');

  const citizenUser = users.find(u => u.role === 'citizen');
  if (!citizenUser || animals.length === 0) {
    console.error('✗ Cannot create adoption application');
    return;
  }

  const animal = animals[0];

  const applicationData = {
    animalId: animal.id,
    applicantId: citizenUser.user.id,
    organizationId: animal.organizationId,
    applicationData: {
      hasYard: true,
      hasOtherPets: false,
      experience: "I have owned dogs for 10 years",
      reason: "Looking for a companion",
      workSchedule: "9-5 weekdays",
      references: [
        { name: "John Doe", phone: "514-555-9999", relationship: "Friend" }
      ]
    }
  };

  const application = await apiRequest('/adoptionapplications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${citizenUser.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });

  console.log('✓ Created adoption application');
  return application;
}

// Step 7: Create rescue reports
async function createRescueReports(users) {
  console.log('\n=== Creating Rescue Reports ===');

  const citizenUser = users.find(u => u.role === 'citizen');
  if (!citizenUser) {
    console.error('✗ Citizen user not found');
    return;
  }

  // Prepare rescue report data
  const rescuePhotos = [
    'rescue report photo .png',
    'rescue report photo 2.png',
    'rescue report photo 3.png'
  ];

  const formData = new FormData();
  formData.append('animalType', 'dog');
  formData.append('urgencyLevel', 'urgent');
  formData.append('animalCondition', 'Injured, needs immediate care');
  formData.append('description', 'Found injured dog near the park');
  formData.append('locationAddress', '789 Park Street, Montreal, QC');
  formData.append('coordinates', 'POINT(-73.5700 45.5050)');
  formData.append('contactName', 'Regular User');
  formData.append('contactPhone', '514-555-1001');
  formData.append('contactEmail', 'user@g.c');
  formData.append('reporterId', citizenUser.user.id);

  // Add photos
  for (const photoFile of rescuePhotos) {
    const photoPath = path.join(DATASET_PATH, photoFile);
    if (fs.existsSync(photoPath)) {
      formData.append('photos', fs.createReadStream(photoPath));
    }
  }

  const response = await fetch(`${API_BASE_URL}/RescueReports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${citizenUser.token}`,
      ...formData.getHeaders(),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Rescue Report Error: ${JSON.stringify(data)}`);
  }

  console.log('✓ Created rescue report with photos');
  return data;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting PetRescue Connect Test Data Seeding...');
    console.log(`📁 Dataset path: ${DATASET_PATH}`);

    // Step 1: Create organizations
    const { clinicId, shelterId } = await createOrganizations();

    // Step 2: Register users
    const users = await registerUsers(clinicId, shelterId);

    // Step 3: Upload profile photos
    await uploadProfilePhotos(users);

    // Step 4: Upload additional photos for vet and shelter
    await uploadAdditionalPhotos(users);

    // Step 5: Create animals for adoption
    const animals = await createAnimalsForAdoption(users, shelterId);

    // Step 6: Create adoption applications
    await createAdoptionApplications(users, animals);

    // Step 7: Create rescue reports
    await createRescueReports(users);

    console.log('\n✅ All test data created successfully!');
    console.log('\n📋 Summary:');
    console.log('   - 2 Organizations created');
    console.log('   - 3 Users registered');
    console.log('   - Profile photos uploaded');
    console.log('   - Additional photos uploaded for vet and shelter');
    console.log('   - Animals created with photos');
    console.log('   - Adoption application created');
    console.log('   - Rescue report created with photos');
    console.log('\n🔑 Login credentials:');
    console.log('   User: user@g.c / password123');
    console.log('   Vet: vet@g.c / password123');
    console.log('   Shelter: shelter@g.c / password123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();

