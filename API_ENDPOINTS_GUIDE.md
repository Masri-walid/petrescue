# 🐾 PetRescue Connect API Endpoints Guide

## Base URL
```
http://localhost:5000
```

## 🐕 Animals Endpoints

### Get All Animals
```http
GET /api/animals
```
**Response**: Returns paginated list of all animals with organization details and photos

**Sample Response**:
```json
{
  "animals": [
    {
      "id": 1,
      "name": "Buddy",
      "type": "Dog",
      "breed": "Golden Retriever",
      "age": "3 years",
      "gender": "Male",
      "size": "Large",
      "weight": "28.5 kg",
      "description": "Friendly and energetic dog who loves playing fetch and swimming. Great with kids and other dogs.",
      "vaccinated": true,
      "spayedNeutered": true,
      "adoptionFee": 250.0,
      "status": "Available",
      "organizationName": "Happy Paws Shelter",
      "photos": [...],
      "medicalRecords": [...]
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### Get Available Animals Only
```http
GET /api/animals/available
```

### Get Animal by ID
```http
GET /api/animals/{id}
```

### Search Animals
```http
GET /api/animals?type=Dog&size=Large&page=1&pageSize=10
```

**Query Parameters**:
- `type`: Dog, Cat, Rabbit, Bird, etc.
- `breed`: Specific breed
- `size`: Small, Medium, Large, Extra_Large
- `gender`: Male, Female
- `age`: Age category
- `vaccinated`: true/false
- `spayedNeutered`: true/false
- `goodWithKids`: true/false
- `goodWithPets`: true/false
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

## 🏢 Organizations Endpoints

### Get All Organizations
```http
GET /api/organizations
```

**Sample Response**:
```json
[
  {
    "id": 1,
    "name": "Happy Paws Shelter",
    "type": "Animal Shelter",
    "address": "123 Main Street, Downtown",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "phone": "(555) 123-4567",
    "email": "info@happypaws.org",
    "website": "www.happypaws.org",
    "latitude": 39.7817,
    "longitude": -89.6501,
    "rating": 4.8,
    "reviewCount": 127,
    "capacity": 150,
    "currentAnimals": 89,
    "specialties": [],
    "services": [],
    "featured": true
  }
]
```

### Get Shelters Only
```http
GET /api/organizations/shelters
```

### Get Veterinary Clinics Only
```http
GET /api/organizations/veterinarians
```

### Search Organizations by Location
```http
GET /api/organizations?latitude=39.7817&longitude=-89.6501&radius=50&sortBy=distance
```

**Query Parameters**:
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate  
- `radius`: Search radius in kilometers (default: 50)
- `sortBy`: distance, rating, name (default: distance)

### Get Organization by ID
```http
GET /api/organizations/{id}
```

## 🚨 Rescue Reports Endpoints

### Get All Rescue Reports
```http
GET /api/rescue-reports
```

### Create Rescue Report
```http
POST /api/rescue-reports
Content-Type: application/json

{
  "animalType": "Dog",
  "description": "Injured dog found near park",
  "location": "123 Park Ave, Springfield, IL",
  "latitude": 39.7823,
  "longitude": -89.6445,
  "urgencyLevel": "urgent",
  "animalCondition": "Injured leg, limping but alert",
  "reporterName": "John Doe",
  "reporterPhone": "555-0123",
  "reporterEmail": "john@example.com"
}
```

## 👥 Users Endpoints

### Get All Users
```http
GET /api/users
```

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "555-0123",
  "role": "Citizen"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

## 📋 Adoption Applications Endpoints

### Submit Adoption Application
```http
POST /api/adoption-applications
Content-Type: application/json

{
  "animalId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "housingType": "house",
  "petExperience": "5+ years",
  "whyAdopt": "Looking for a family companion",
  "agreeTerms": true,
  "agreeVisit": true,
  "agreeContact": true
}
```

### Get Applications by Animal
```http
GET /api/adoption-applications/animal/{animalId}
```

## 🔍 Testing the API

### Using PowerShell:
```powershell
# Get all animals
Invoke-RestMethod -Uri "http://localhost:5000/api/animals" -Method GET

# Get all organizations
Invoke-RestMethod -Uri "http://localhost:5000/api/organizations" -Method GET

# Get shelters only
Invoke-RestMethod -Uri "http://localhost:5000/api/organizations/shelters" -Method GET
```

### Using curl:
```bash
# Get all animals
curl http://localhost:5000/api/animals

# Get all organizations
curl http://localhost:5000/api/organizations

# Search for dogs
curl "http://localhost:5000/api/animals?type=Dog"
```

## 📊 Sample Data Available

### Animals:
1. **Buddy** - Golden Retriever, Male, 3 years, $250 adoption fee
2. **Luna** - Domestic Shorthair Cat, Female, 1.5 years, $150 adoption fee  
3. **Max** - Labrador Mix, Male, 7 years (senior), $100 adoption fee

### Organizations:
1. **Happy Paws Shelter** - Animal Shelter, 150 capacity, 4.8 rating
2. **Springfield Animal Hospital** - Veterinary Clinic, 50 capacity, 4.9 rating

### Users:
1. **Admin User** - admin@petrescue.com
2. **John Citizen** - john.citizen@email.com
3. **Dr. Sarah Smith** - dr.smith@vetclinic.com (Veterinarian)

## 🌐 Swagger Documentation
Access the interactive API documentation at:
```
http://localhost:5000/swagger
```
