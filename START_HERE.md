# 🎯 START HERE - PetRescue Connect Setup

## 📌 Quick Overview

Your PetRescue Connect project has been configured to use **PostgreSQL with password "123"**. SQLite has been completely removed, and there's no static data - you start with a clean, empty database.

---

## 🚦 Setup Status

### ✅ Already Done (By Me):
- ✅ Removed SQLite completely
- ✅ Configured PostgreSQL with password "123"
- ✅ Removed static data seeding
- ✅ Updated all configuration files
- ✅ Created comprehensive documentation

### ⏳ You Need to Do:
- ⏳ Install PostgreSQL
- ⏳ Create `petrescue` database
- ⏳ Run the API
- ⏳ Start adding your data

---

## 🎬 Step-by-Step Setup (5 Minutes)

### Step 1: Install PostgreSQL (2 minutes)

1. **Download**: https://www.postgresql.org/download/windows/
2. **Run installer** as Administrator
3. **Set password**: `123` ⚠️ IMPORTANT!
4. **Include**: pgAdmin 4 ✅
5. **Port**: 5432 (default)
6. **Complete** installation

**Detailed Guide**: `POSTGRESQL_SETUP_COMPLETE_GUIDE.md`

---

### Step 2: Create Database (30 seconds)

**Option A - pgAdmin (Easy)**:
1. Open pgAdmin 4 from Start Menu
2. Connect (password: `123`)
3. Right-click "Databases" → Create → Database
4. Name: `petrescue`
5. Save

**Option B - Command Line**:
```cmd
psql -U postgres
# Password: 123
CREATE DATABASE petrescue;
\q
```

---

### Step 3: Run the API (1 minute)

```bash
cd PetRescueConnect.API
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run
```

**Wait for**:
```
Now listening on: http://localhost:5000
```

**What happens**:
- Connects to PostgreSQL
- Creates 9 tables automatically
- Database ready (empty)

---

### Step 4: Verify Setup (30 seconds)

**In pgAdmin**:
1. Refresh `petrescue` database
2. Expand: Schemas → public → Tables
3. See 9 tables created ✅

**Test API**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/animals"
```

**Expected**: Empty array `[]` (no data yet)

---

### Step 5: Start Frontend (1 minute)

```bash
# In project root
npm install  # First time only
npm run dev
```

**Access**: http://localhost:3000

---

## 📚 Documentation Guide

### 🔴 Must Read First:
1. **START_HERE.md** (this file) - Quick setup
2. **QUICK_START_GUIDE.md** - Detailed quick start

### 🟡 Read When Needed:
3. **POSTGRESQL_SETUP_COMPLETE_GUIDE.md** - PostgreSQL installation help
4. **PROJECT_STRUCTURE_EXPLAINED.md** - Understand the project
5. **CHANGES_SUMMARY.md** - What was changed

### 🟢 Reference:
6. **API_ENDPOINTS_GUIDE.md** - API documentation
7. **FRONTEND_CONNECTION_FIX.md** - Troubleshooting

---

## 🎨 Adding Your First Data

### Method 1: Use the Frontend (Easiest)

1. **Register**: http://localhost:3000/register
   - Create an account
   - Choose role (Citizen/Shelter/Vet)

2. **Login**: http://localhost:3000/login
   - Use your credentials

3. **Add Data**: Through the UI
   - Add animals
   - Add organizations
   - Submit rescue reports

---

### Method 2: Use pgAdmin (Visual)

1. **Open pgAdmin** → `petrescue` → Tables
2. **Right-click** table → View/Edit Data → All Rows
3. **Click "+"** to add new row
4. **Fill data** and save

**Example - Add Organization**:
```
Name: Happy Paws Shelter
Type: Animal Shelter
Address: 123 Main St
City: Springfield
State: IL
ZipCode: 62701
Phone: 555-1234
Email: info@happypaws.org
Latitude: 39.7817
Longitude: -89.6501
Rating: 4.8
ReviewCount: 127
Capacity: 150
CurrentAnimals: 0
Specialties: []
Services: []
Hours: {}
Featured: true
```

---

### Method 3: Use API (Programmatic)

**Register User**:
```powershell
$body = @{
    firstName = "John"
    lastName = "Doe"
    email = "john@example.com"
    password = "Password123!"
    role = "Citizen"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

---

### Method 4: Use SQL Scripts (Bulk)

**In pgAdmin Query Tool**:
```sql
-- Add sample organization
INSERT INTO "Organizations" ("Name", "Type", "Address", "City", "State", "ZipCode", 
    "Phone", "Email", "Latitude", "Longitude", "Rating", "ReviewCount", 
    "Capacity", "CurrentAnimals", "Specialties", "Services", "Hours", 
    "Featured", "CreatedAt", "UpdatedAt")
VALUES ('Happy Paws Shelter', 'Animal Shelter', '123 Main St', 'Springfield', 'IL', '62701',
    '555-1234', 'info@happypaws.org', 39.7817, -89.6501, 4.8, 127,
    150, 0, '[]', '[]', '{}', true, NOW(), NOW());

-- Add sample animal
INSERT INTO "Animals" ("Name", "Type", "Breed", "Age", "Gender", "Size", "Weight",
    "Description", "Vaccinated", "SpayedNeutered", "Microchipped", 
    "GoodWithKids", "GoodWithPets", "GoodWithCats", "AdoptionFee", 
    "Featured", "HealthStatus", "SpecialNeeds", "HouseTrained", 
    "Personality", "Status", "OrganizationId", "CreatedAt", "UpdatedAt")
VALUES ('Buddy', 'Dog', 'Golden Retriever', '3 years', 'Male', 'Large', '28.5 kg',
    'Friendly and energetic dog', true, true, false, true, true, false, 250.00,
    true, 'Healthy', false, true, '["Friendly", "Energetic"]', 'Available', 1, NOW(), NOW());
```

---

## 🔍 Troubleshooting

### ❌ "Could not connect to database"

**Check**:
1. PostgreSQL service running? (services.msc)
2. Database `petrescue` exists?
3. Password is `123`?

**Fix**:
```bash
# Test connection
psql -U postgres -d petrescue
# Password: 123
```

---

### ❌ "Tables not created"

**Fix**:
```bash
# Stop API (Ctrl+C)
# Recreate database
psql -U postgres
DROP DATABASE petrescue;
CREATE DATABASE petrescue;
\q

# Restart API
dotnet run
```

---

### ❌ "Frontend can't connect"

**Check**:
1. API running on port 5000?
2. `.env.local` exists?

**Fix**:
```bash
# Create .env.local in project root
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Restart frontend
npm run dev
```

---

## 📊 What's in the Database?

### Tables Created (All Empty):

1. **Animals** - Pets available for adoption
2. **Organizations** - Shelters and vet clinics
3. **Users** - User accounts
4. **AdoptionApplications** - Adoption requests
5. **RescueReports** - Stray animal reports
6. **AnimalPhotos** - Animal images
7. **MedicalRecords** - Medical history
8. **RescuePhotos** - Rescue report images
9. **TemporaryPhotos** - Temp uploads (auto-deleted)

**All start empty** - you add the data!

---

## 🎯 Quick Commands Reference

```bash
# PostgreSQL
psql -U postgres                    # Connect to PostgreSQL
CREATE DATABASE petrescue;          # Create database
\l                                  # List databases
\c petrescue                        # Connect to petrescue
\dt                                 # List tables
\q                                  # Quit

# API
cd PetRescueConnect.API
dotnet restore                      # Restore packages
dotnet build                        # Build project
dotnet run                          # Run API

# Frontend
npm install                         # Install dependencies
npm run dev                         # Start dev server
npm run build                       # Build for production

# Test API
Invoke-RestMethod -Uri "http://localhost:5000/api/animals"
Invoke-RestMethod -Uri "http://localhost:5000/api/organizations"
```

---

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **pgAdmin**: Start Menu → pgAdmin 4
- **Database**: petrescue @ localhost:5432

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] Password set to `123`
- [ ] pgAdmin 4 installed
- [ ] Database `petrescue` created
- [ ] API running (port 5000)
- [ ] Tables created (9 tables)
- [ ] Frontend running (port 3000)
- [ ] Can access Swagger
- [ ] Can access pgAdmin
- [ ] Ready to add data!

---

## 🎊 You're All Set!

Once you complete the checklist above, your PetRescue Connect platform is fully operational and ready for use!

**Next**: Start adding your own animals, organizations, and users through the frontend or pgAdmin.

**Need Help?** Check the other documentation files for detailed guides.

**Happy Coding! 🐾**
