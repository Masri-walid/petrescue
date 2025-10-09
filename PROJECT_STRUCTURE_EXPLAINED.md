# 📁 PetRescue Connect - Complete Project Structure Explained

## 🌳 Project Root Structure

```
petrescue-connect2/
├── 📁 PetRescueConnect.API/      # Backend .NET API
├── 📁 app/                        # Next.js Frontend Pages
├── 📁 components/                 # React Components
├── 📁 lib/                        # Frontend Utilities
├── 📁 scripts/                    # Database Scripts
├── 📁 public/                     # Static Assets
├── 📄 Configuration Files         # Various config files
└── 📄 Documentation Files         # Guides and docs
```

---

## 🔷 Part 1: Backend API (PetRescueConnect.API/)

### 📁 PetRescueConnect.API/
**Purpose**: The .NET 8.0 Web API that handles all backend logic, database operations, and business rules.

---

### 📂 Controllers/
**Purpose**: API endpoints that handle HTTP requests and responses.

#### 📄 AnimalsController.cs
- **What it does**: Manages all animal-related operations
- **Endpoints**:
  - `GET /api/animals` - Get all animals (with filters)
  - `GET /api/animals/{id}` - Get specific animal
  - `POST /api/animals` - Create new animal
  - `PUT /api/animals/{id}` - Update animal
  - `DELETE /api/animals/{id}` - Delete animal
- **Features**: Filtering, pagination, search, sorting

#### 📄 OrganizationsController.cs
- **What it does**: Manages shelters and veterinary clinics
- **Endpoints**:
  - `GET /api/organizations` - Get all organizations
  - `GET /api/organizations/shelters` - Get only shelters
  - `GET /api/organizations/veterinarians` - Get only vets
  - `GET /api/organizations/{id}` - Get specific organization
- **Features**: Location-based search, distance calculation, ratings

#### 📄 AuthController.cs
- **What it does**: Handles user authentication and registration
- **Endpoints**:
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/profile` - Get user profile
- **Features**: JWT token generation, password hashing, role-based access

#### 📄 AdoptionApplicationsController.cs
- **What it does**: Manages adoption applications
- **Endpoints**:
  - `POST /api/adoption-applications` - Submit application
  - `GET /api/adoption-applications` - Get all applications
  - `GET /api/adoption-applications/{id}` - Get specific application
  - `PUT /api/adoption-applications/{id}/status` - Update status
- **Features**: Application scoring, status tracking

#### 📄 RescueReportsController.cs
- **What it does**: Handles stray animal rescue reports
- **Endpoints**:
  - `POST /api/rescue-reports` - Create rescue report
  - `GET /api/rescue-reports` - Get all reports
  - `GET /api/rescue-reports/{id}` - Get specific report
  - `PUT /api/rescue-reports/{id}/assign` - Assign to organization
- **Features**: Urgency levels, location tracking, photo uploads

#### 📄 ImagesController.cs
- **What it does**: Handles image uploads and management
- **Endpoints**:
  - `POST /api/images/upload` - Upload image
  - `DELETE /api/images/{id}` - Delete image
- **Features**: File validation, size limits, temporary storage

---

### 📂 Models/
**Purpose**: Database entity classes that represent tables in PostgreSQL.

#### 📄 Animal.cs
```csharp
// Represents an animal available for adoption
Properties:
- Id, Name, Type (Dog/Cat/etc), Breed, Age, Gender
- Size, Weight, Description
- Vaccinated, SpayedNeutered, Microchipped
- GoodWithKids, GoodWithPets, GoodWithCats
- AdoptionFee, Status (Available/Adopted/Pending)
- OrganizationId (which shelter/org has this animal)
- Photos, MedicalRecords (related data)
```

#### 📄 Organization.cs
```csharp
// Represents a shelter or veterinary clinic
Properties:
- Id, Name, Type (Shelter/Vet)
- Address, City, State, ZipCode
- Phone, Email, Website
- Latitude, Longitude (for location-based search)
- Rating, ReviewCount
- Capacity, CurrentAnimals
- Specialties, Services, Hours
- Featured (highlighted organizations)
```

#### 📄 User.cs
```csharp
// Represents a user account
Properties:
- Id, FirstName, LastName, Email
- PasswordHash (encrypted password)
- Phone, Role (Admin/Citizen/Veterinarian/Shelter)
- OrganizationId (if user belongs to an org)
- CreatedAt, UpdatedAt
```

#### 📄 AdoptionApplication.cs
```csharp
// Represents an adoption application
Properties:
- Id, AnimalId, ApplicantId
- Personal info (name, email, phone, address)
- Housing info (type, own/rent, yard, fenced)
- Pet experience, current pets, veterinarian
- References, why adopt, expectations
- Status (Pending/Approved/Rejected)
- Score (compatibility score)
```

#### 📄 RescueReport.cs
```csharp
// Represents a stray animal rescue report
Properties:
- Id, AnimalType, Breed, Size, Color
- Description, Location, Latitude, Longitude
- UrgencyLevel (Low/Medium/High/Critical)
- AnimalCondition, InjuredOrSick
- Reporter info (name, phone, email)
- Status (Reported/Assigned/Rescued/Completed)
- AssignedOrganizationId
```

#### 📄 AnimalPhoto.cs
```csharp
// Represents a photo of an animal
Properties:
- Id, AnimalId
- FilePath, FileName, ContentType
- FileSize, IsPrimary (main photo)
- CreatedAt
```

#### 📄 MedicalRecord.cs
```csharp
// Represents medical history of an animal
Properties:
- Id, AnimalId
- Type (Vaccination/Checkup/Surgery/Treatment)
- Title, Description
- VeterinarianName, Clinic
- Date, NextDue (for recurring treatments)
- Notes
```

#### 📄 RescuePhoto.cs
```csharp
// Photo attached to a rescue report
```

#### 📄 TemporaryPhoto.cs
```csharp
// Temporary uploaded photos (cleaned up after 24h)
```

---

### 📂 Data/
**Purpose**: Database context and configuration.

#### 📄 PetRescueDbContext.cs
- **What it does**: Entity Framework Core database context
- **Responsibilities**:
  - Defines all database tables (DbSet properties)
  - Configures relationships between tables
  - Sets up indexes for performance
  - Handles database migrations
- **Key Features**:
  - Foreign key relationships
  - Cascade delete rules
  - Index configuration for fast queries
  - Default values and constraints

**Tables Defined**:
```csharp
DbSet<Animal> Animals
DbSet<Organization> Organizations
DbSet<User> Users
DbSet<AdoptionApplication> AdoptionApplications
DbSet<RescueReport> RescueReports
DbSet<AnimalPhoto> AnimalPhotos
DbSet<MedicalRecord> MedicalRecords
DbSet<RescuePhoto> RescuePhotos
DbSet<TemporaryPhoto> TemporaryPhotos
```

---

### 📂 DTOs/ (Data Transfer Objects)
**Purpose**: Objects used to transfer data between API and clients (not stored in database).

#### 📄 AnimalDTOs.cs
- `AnimalDto` - Full animal data for responses
- `CreateAnimalRequest` - Data needed to create animal
- `UpdateAnimalRequest` - Data needed to update animal

#### 📄 OrganizationDTOs.cs
- `OrganizationDto` - Organization data with distance calculation

#### 📄 AuthDTOs.cs
- `RegisterRequest` - User registration data
- `LoginRequest` - Login credentials
- `AuthResponse` - Login response with JWT token

#### 📄 AdoptionDTOs.cs
- `AdoptionApplicationDto` - Application data
- `CreateApplicationRequest` - New application data

#### 📄 RescueDTOs.cs
- `RescueReportDto` - Rescue report data
- `CreateRescueReportRequest` - New report data

#### 📄 ImageDTOs.cs
- `ImageUploadResult` - Upload response

**Why DTOs?**
- Separate API contracts from database models
- Control what data is exposed
- Add computed properties (like distance)
- Validate input data

---

### 📂 Services/
**Purpose**: Business logic and reusable functionality.

#### 📄 IAuthService.cs & AuthService.cs
- **What it does**: Authentication and authorization logic
- **Methods**:
  - `RegisterAsync()` - Create new user account
  - `LoginAsync()` - Authenticate user and generate JWT
  - `ValidateTokenAsync()` - Verify JWT token
- **Features**: Password hashing with BCrypt, JWT token generation

#### 📄 IImageService.cs & ImageService.cs
- **What it does**: Image upload and management
- **Methods**:
  - `UploadImageAsync()` - Save uploaded image
  - `DeleteImageAsync()` - Remove image file
  - `ValidateImage()` - Check file type and size
- **Features**: File validation, size limits, path management

#### 📄 ILocationService.cs & LocationService.cs
- **What it does**: Geographic calculations
- **Methods**:
  - `CalculateDistance()` - Distance between two coordinates
  - `GetNearbyOrganizations()` - Find orgs within radius
- **Features**: Haversine formula for accurate distance

---

### 📂 BackgroundServices/
**Purpose**: Background tasks that run periodically.

#### 📄 ImageCleanupService.cs
- **What it does**: Cleans up temporary uploaded images
- **How it works**: Runs every hour, deletes images older than 24 hours
- **Why**: Prevents disk space from filling up with abandoned uploads

---

### 📄 Program.cs
**Purpose**: Application entry point and configuration.

**What it configures**:
1. **Database**: PostgreSQL connection
2. **Authentication**: JWT bearer tokens
3. **CORS**: Allow frontend to call API
4. **Services**: Dependency injection
5. **Swagger**: API documentation
6. **Middleware**: Request pipeline

**Key Sections**:
```csharp
// Database setup
builder.Services.AddDbContext<PetRescueDbContext>(...)

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

// CORS for frontend
builder.Services.AddCors(...)

// Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>()

// Middleware pipeline
app.UseAuthentication()
app.UseAuthorization()
app.UseCors("AllowFrontend")
```

---

### 📄 appsettings.json & appsettings.Development.json
**Purpose**: Configuration settings for the application.

**appsettings.json** (Production):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=petrescue;Username=postgres;Password=123"
  },
  "Jwt": {
    "Key": "Secret key for JWT tokens",
    "Issuer": "PetRescueConnect",
    "Audience": "PetRescueConnect",
    "ExpiryInHours": 24
  },
  "ImageStorage": {
    "BasePath": "wwwroot/uploads",
    "MaxFileSizeInMB": 10,
    "AllowedExtensions": [".jpg", ".jpeg", ".png"]
  }
}
```

**appsettings.Development.json** (Development):
- Overrides production settings for local development
- Uses local PostgreSQL database

---

### 📄 PetRescueConnect.API.csproj
**Purpose**: Project file defining dependencies and build settings.

**Key Packages**:
- `Microsoft.EntityFrameworkCore` - Database ORM
- `Npgsql.EntityFrameworkCore.PostgreSQL` - PostgreSQL provider
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT auth
- `BCrypt.Net-Next` - Password hashing
- `Swashbuckle.AspNetCore` - Swagger/OpenAPI docs

---

### 📂 wwwroot/
**Purpose**: Static files served by the API.

#### 📂 wwwroot/uploads/
- **animals/**: Animal photos
- **rescues/**: Rescue report photos
- **temp/**: Temporary uploads (cleaned automatically)

---

### 📂 bin/ & obj/
**Purpose**: Build output and intermediate files.
- **bin/**: Compiled application
- **obj/**: Temporary build files
- **Note**: These are auto-generated, don't edit manually

---

## 🔷 Part 2: Frontend (Next.js)

### 📁 app/
**Purpose**: Next.js 13+ App Router pages.

#### 📄 app/page.tsx
- **What it is**: Home page (landing page)
- **URL**: http://localhost:3000/
- **Features**: Hero section, features overview, call-to-action

#### 📄 app/adopt/page.tsx
- **What it is**: Browse animals for adoption
- **URL**: http://localhost:3000/adopt
- **Features**:
  - Search and filter animals
  - View animal cards with photos
  - Pagination
  - Filter by type, age, size

#### 📄 app/shelters/page.tsx
- **What it is**: Find shelters and veterinary clinics
- **URL**: http://localhost:3000/shelters
- **Features**:
  - Location-based search
  - Distance calculation
  - Filter by type (shelter/vet)
  - Sort by distance/rating

#### 📄 app/report/page.tsx
- **What it is**: Report a stray animal
- **URL**: http://localhost:3000/report
- **Features**:
  - Upload photos
  - Set location on map
  - Describe animal and condition
  - Set urgency level

#### 📄 app/login/page.tsx
- **What it is**: User login page
- **URL**: http://localhost:3000/login

#### 📄 app/register/page.tsx
- **What it is**: User registration page
- **URL**: http://localhost:3000/register
- **Features**: Register as Citizen, Shelter, or Veterinarian

#### 📄 app/shelter-dashboard/page.tsx
- **What it is**: Dashboard for shelter staff
- **URL**: http://localhost:3000/shelter-dashboard
- **Features**:
  - Manage animals
  - View adoption applications
  - Handle rescue reports
  - Statistics

#### 📄 app/layout.tsx
- **What it is**: Root layout wrapper
- **Purpose**: Wraps all pages with common elements
- **Includes**: Navigation, footer, global styles

#### 📄 app/globals.css
- **What it is**: Global CSS styles
- **Includes**: Tailwind CSS, custom styles

---

### 📁 components/
**Purpose**: Reusable React components.

#### 📂 components/ui/
**Purpose**: UI components from shadcn/ui library.

- **button.tsx**: Button component
- **card.tsx**: Card container
- **input.tsx**: Form input
- **select.tsx**: Dropdown select
- **dialog.tsx**: Modal dialog
- **badge.tsx**: Status badges
- **avatar.tsx**: User avatars
- **tabs.tsx**: Tab navigation
- And many more...

**Why shadcn/ui?**
- Pre-built, accessible components
- Customizable with Tailwind CSS
- Copy-paste into your project
- No external dependencies

#### 📄 components/navbar.tsx
- **What it is**: Navigation bar
- **Features**: Logo, menu links, user menu

#### 📄 components/footer.tsx
- **What it is**: Page footer
- **Features**: Links, copyright, social media

#### 📄 components/animal-card.tsx
- **What it is**: Display animal in card format
- **Used in**: Adopt page, dashboard

#### 📄 components/organization-card.tsx
- **What it is**: Display shelter/vet in card format
- **Used in**: Shelters page

---

### 📁 lib/
**Purpose**: Utility functions and API client.

#### 📄 lib/api.ts
- **What it is**: API client for calling backend
- **Features**:
  - Centralized API calls
  - Token management
  - Error handling
  - Type-safe requests

**Example Methods**:
```typescript
apiClient.getAnimals({ type: "Dog", page: 1 })
apiClient.register({ email, password, ... })
apiClient.login(email, password)
apiClient.createRescueReport(reportData)
```

#### 📄 lib/utils.ts
- **What it is**: Helper functions
- **Examples**: Class name merging, date formatting

---

### 📁 public/
**Purpose**: Static assets served directly.

- **images/**: Logo, icons, placeholder images
- **favicon.ico**: Browser tab icon

---

### 📄 Configuration Files

#### 📄 package.json
- **What it is**: Node.js project configuration
- **Contains**:
  - Project dependencies
  - Scripts (dev, build, start)
  - Project metadata

**Key Dependencies**:
- `next`: Next.js framework
- `react`: React library
- `tailwindcss`: CSS framework
- `@radix-ui/*`: UI component primitives

#### 📄 tsconfig.json
- **What it is**: TypeScript configuration
- **Purpose**: Configure TypeScript compiler
- **Settings**: Module resolution, paths, strict mode

#### 📄 next.config.mjs
- **What it is**: Next.js configuration
- **Settings**: Build options, image optimization

#### 📄 tailwind.config.ts
- **What it is**: Tailwind CSS configuration
- **Purpose**: Customize colors, fonts, spacing

#### 📄 components.json
- **What it is**: shadcn/ui configuration
- **Purpose**: Configure UI component library

#### 📄 .env.local
- **What it is**: Environment variables (local)
- **Contains**: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- **Note**: Not committed to git (in .gitignore)

#### 📄 .gitignore
- **What it is**: Files to exclude from git
- **Excludes**: node_modules, .env.local, build files

---

## 🔷 Part 3: Database Scripts

### 📁 scripts/

#### 📄 01-create-database-schema.sql
- **What it is**: PostgreSQL schema creation script
- **Purpose**: Manually create all tables
- **Use**: Alternative to Entity Framework migrations

#### 📄 02-seed-sample-data.sql
- **What it is**: Sample data insertion script
- **Purpose**: Populate database with test data
- **Note**: Optional, for testing

#### 📄 03-additional-mock-data.sql
- **What it is**: More sample data
- **Purpose**: Additional test records

#### 📄 setup-database.ps1
- **What it is**: PowerShell automation script
- **Purpose**: Automate database setup
- **Use**: Run all SQL scripts automatically

#### 📄 test-api-endpoints.ps1
- **What it is**: API testing script
- **Purpose**: Test all endpoints after setup

---

## 🔷 Part 4: Documentation Files

### 📄 README.md
- Project overview and quick start

### 📄 DATABASE_SETUP.md
- Database setup instructions

### 📄 API_ENDPOINTS_GUIDE.md
- Complete API documentation

### 📄 POSTGRESQL_SETUP_COMPLETE_GUIDE.md
- Detailed PostgreSQL installation guide

### 📄 PROJECT_STRUCTURE_EXPLAINED.md
- This file - complete project structure

### 📄 FRONTEND_CONNECTION_FIX.md
- Troubleshooting frontend issues

---

## 🔷 Part 5: Docker Configuration

### 📄 docker-compose.yml
- **What it is**: Docker Compose configuration
- **Purpose**: Run PostgreSQL and pgAdmin in containers
- **Services**:
  - `postgres`: PostgreSQL database
  - `pgadmin`: pgAdmin web interface

**Usage**:
```bash
docker compose up -d    # Start services
docker compose down     # Stop services
docker compose ps       # Check status
```

---

## 📊 Data Flow Diagram

```
User Browser (Frontend)
    ↓ HTTP Request
Next.js App (Port 3000)
    ↓ API Call
.NET API (Port 5000)
    ↓ Query/Command
PostgreSQL Database (Port 5432)
    ↓ Data
.NET API
    ↓ JSON Response
Next.js App
    ↓ Render
User Browser
```

---

## 🔐 Security Features

1. **Password Hashing**: BCrypt for secure password storage
2. **JWT Tokens**: Secure authentication tokens
3. **CORS**: Controlled cross-origin requests
4. **Input Validation**: DTOs validate all input
5. **SQL Injection Protection**: Entity Framework parameterized queries
6. **File Upload Validation**: Type and size checks

---

## 🚀 How Everything Works Together

1. **User visits website** → Next.js serves page
2. **User clicks "Browse Animals"** → Frontend calls `/api/animals`
3. **API receives request** → AnimalsController handles it
4. **Controller queries database** → Entity Framework translates to SQL
5. **PostgreSQL returns data** → Rows from Animals table
6. **API formats response** → Converts to AnimalDto
7. **Frontend receives JSON** → Displays animal cards
8. **User clicks animal** → Navigate to detail page
9. **User submits adoption** → POST to `/api/adoption-applications`
10. **Application saved** → Stored in database
11. **Shelter staff logs in** → JWT token issued
12. **Staff views dashboard** → Protected route, token verified
13. **Staff approves application** → Status updated in database

---

## 📈 Key Technologies

### Backend:
- **.NET 8.0**: Modern C# framework
- **Entity Framework Core**: ORM for database
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **Swagger**: API documentation

### Frontend:
- **Next.js 14**: React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Component library
- **React**: UI library

---

## 🎯 Summary

This is a **full-stack web application** with:
- **Backend API**: .NET handles business logic and data
- **Frontend**: Next.js provides user interface
- **Database**: PostgreSQL stores all data
- **Authentication**: JWT tokens secure the app
- **File Storage**: Images stored on server
- **Real-time**: Background services clean up files

The project follows **best practices**:
- Separation of concerns (MVC pattern)
- RESTful API design
- Type safety (TypeScript, C#)
- Security (hashing, tokens, validation)
- Scalability (services, dependency injection)
- Maintainability (clear structure, documentation)
