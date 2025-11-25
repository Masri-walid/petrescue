const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5149/api';

// Helper function to make API requests
async function apiRequest(endpoint, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Login function
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Login Error: ${JSON.stringify(data)}`);
  }
  
  return data.token;
}

async function verifyData() {
  console.log('🔍 Verifying Test Data...\n');
  
  try {
    // Login as each user
    console.log('=== Logging in as users ===');
    const userToken = await login('user@g.c', 'password123');
    console.log('✓ Logged in as user@g.c');
    
    const vetToken = await login('vet@g.c', 'password123');
    console.log('✓ Logged in as vet@g.c');
    
    const shelterToken = await login('shelter@g.c', 'password123');
    console.log('✓ Logged in as shelter@g.c');
    
    // Check organizations
    console.log('\n=== Organizations ===');
    const orgs = await apiRequest('/organizations');
    console.log(`✓ Found ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.organizationType})`);
    });
    
    // Check user photos for vet
    console.log('\n=== Veterinarian Photos ===');
    const vetProfile = await apiRequest('/auth/profile', vetToken);
    console.log(`✓ Vet profile: ${vetProfile.firstName} ${vetProfile.lastName}`);
    console.log(`  Profile image: ${vetProfile.profileImageUrl ? '✓' : '✗'}`);
    
    const vetPhotos = await apiRequest('/userphotos', vetToken);
    console.log(`✓ Vet has ${vetPhotos.length} additional photos`);
    
    // Check user photos for shelter
    console.log('\n=== Shelter Photos ===');
    const shelterProfile = await apiRequest('/auth/profile', shelterToken);
    console.log(`✓ Shelter profile: ${shelterProfile.firstName} ${shelterProfile.lastName}`);
    console.log(`  Profile image: ${shelterProfile.profileImageUrl ? '✓' : '✗'}`);
    
    const shelterPhotos = await apiRequest('/userphotos', shelterToken);
    console.log(`✓ Shelter has ${shelterPhotos.length} additional photos`);
    
    // Check animals
    console.log('\n=== Animals ===');
    const animalsResponse = await apiRequest('/animals');
    const animals = animalsResponse.animals || [];
    console.log(`✓ Found ${animals.length} animals:`);
    if (animals.length > 0) {
      animals.forEach(animal => {
        console.log(`  - ${animal.name} (${animal.species}, ${animal.status})`);
        console.log(`    Photos: ${animal.animalPhotos?.length || 0}`);
      });
    }

    // Check adoption applications
    console.log('\n=== Adoption Applications ===');
    const applicationsResponse = await apiRequest('/adoptionapplications', userToken);
    const applications = Array.isArray(applicationsResponse) ? applicationsResponse : (applicationsResponse.data || []);
    console.log(`✓ Found ${applications.length} adoption applications`);
    if (applications.length > 0) {
      applications.forEach(app => {
        console.log(`  - Application for animal ${app.animalId}`);
        console.log(`    Status: ${app.status}`);
      });
    }

    // Check rescue reports
    console.log('\n=== Rescue Reports ===');
    const reportsResponse = await apiRequest('/rescuereports', userToken);
    const reports = Array.isArray(reportsResponse) ? reportsResponse : (reportsResponse.data || []);
    console.log(`✓ Found ${reports.length} rescue reports:`);
    if (reports.length > 0) {
      reports.forEach(report => {
        console.log(`  - ${report.animalType} (${report.urgencyLevel})`);
        console.log(`    Location: ${report.locationAddress}`);
        console.log(`    Photos: ${report.rescueReportPhotos?.length || 0}`);
      });
    }
    
    console.log('\n✅ All data verified successfully!');
    
  } catch (error) {
    console.error('\n❌ Verification Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run verification
verifyData();

