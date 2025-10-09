# 🚀 Quick Start Guide - PetRescue Connect

## ✅ What's Been Done

1. ✅ **SQLite Removed**: Completely removed SQLite database and package
2. ✅ **PostgreSQL Only**: Configured to use PostgreSQL exclusively
3. ✅ **Password Set**: Database password configured as `123`
4. ✅ **Static Data Removed**: No more automatic seeding - clean database
5. ✅ **Project Documented**: Complete structure explanation created

---

## 🎯 What You Need to Do Now

### Step 1: Install PostgreSQL (If Not Already Installed)

**Download**: https://www.postgresql.org/download/windows/

**During Installation**:
- ✅ Include pgAdmin 4
- ✅ Set password to: `123`
- ✅ Use port: `5432`

**Detailed Guide**: See `POSTGRESQL_SETUP_COMPLETE_GUIDE.md`

---

### Step 2: Create Database

**Option A - Using pgAdmin** (Recommended):
1. Open pgAdmin 4 from Start Menu
2. Connect to PostgreSQL (password: `123`)
3. Right-click "Databases" → Create → Database
4. Name: `petrescue` (lowercase, exactly)
5. Click Save

**Option B - Using Command Line**:
```cmd
psql -U postgres
# Enter password: 123
CREATE DATABASE petrescue;
\q
```

---

### Step 3: Start the API

```bash
cd PetRescueConnect.API

# Set environment
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Run the API
dotnet run
```

**Expected Output**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

**What Happens**:
- API connects to PostgreSQL
- Creates all tables automatically
- Database is ready (empty, no static data)

---

### Step 4: Verify Database Tables

**In pgAdmin**:
1. Refresh `petrescue` database
2. Expand: Schemas → public → Tables
3. You should see 9 tables:
   - Animals
   - Organizations
   - Users
   - AdoptionApplications
   - RescueReports
   - AnimalPhotos
   - MedicalRecords
   - RescuePhotos
   - TemporaryPhotos

---

### Step 5: Start the Frontend

```bash
# In project root
npm install  # First time only
npm run dev

# Or with pnpm
pnpm install  # First time only
pnpm dev
```

**Access**: http://localhost:3000

---

## 🎨 Add Your Own Data

### Option 1: Use the Frontend

1. **Register Account**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Add Animals**: Through shelter dashboard
4. **Add Organizations**: Through admin panel

### Option 2: Use pgAdmin

1. Open pgAdmin → petrescue → Tables
2. Right-click table → View/Edit Data → All Rows
3. Click "+" to add new row
4. Fill in data and save

### Option 3: Use SQL Scripts

Run the provided SQL scripts in pgAdmin Query Tool:
- `scripts/01-create-database-schema.sql` (already done by API)
- `scripts/02-seed-sample-data.sql` (optional sample data)
- `scripts/03-additional-mock-data.sql` (more samples)

### Option 4: Use API Endpoints

**Test with PowerShell**:

```powershell
# Register a user
$body = @{
    firstName = "John"
    lastName = "Doe"
    email = "john@example.com"
    password = "Password123!"
    role = "Citizen"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"

# Add an organization (requires authentication)
$orgBody = @{
    name = "Happy Paws Shelter"
    type = "Animal Shelter"
    address = "123 Main St"
    city = "Springfield"
    state = "IL"
    zipCode = "62701"
    phone = "555-1234"
    email = "info@happypaws.org"
    latitude = 39.7817
    longitude = -89.6501
    capacity = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/organizations" -Method POST -Body $orgBody -ContentType "application/json" -Headers @{Authorization="Bearer YOUR_TOKEN"}
```

---

## 📊 View Your Data

### In pgAdmin:
1. Navigate to table
2. Right-click → View/Edit Data → All Rows
3. See all records in grid view

### In API:
- **Animals**: http://localhost:5000/api/animals
- **Organizations**: http://localhost:5000/api/organizations
- **Users**: http://localhost:5000/api/users

### In Swagger:
- **URL**: http://localhost:5000/swagger
- **Try out** any endpoint
- **See** request/response examples

---

## 🔍 Troubleshooting

### Issue: "Could not connect to database"

**Check**:
1. PostgreSQL service is running (services.msc)
2. Database `petrescue` exists
3. Password is `123` in appsettings.Development.json
4. Port 5432 is not blocked

**Solution**:
```bash
# Test connection
psql -U postgres -d petrescue
# Enter password: 123
```

### Issue: "Tables not created"

**Solution**:
```bash
# Stop API (Ctrl+C)
# Drop and recreate database
psql -U postgres
DROP DATABASE petrescue;
CREATE DATABASE petrescue;
\q

# Restart API
dotnet run
```

### Issue: "Frontend can't connect to API"

**Check**:
1. API is running on port 5000
2. Frontend is running on port 3000
3. `.env.local` exists with: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

**Solution**:
```bash
# Restart both
# API: Ctrl+C, then dotnet run
# Frontend: Ctrl+C, then npm run dev
```

---

## 📚 Documentation Files

- **POSTGRESQL_SETUP_COMPLETE_GUIDE.md**: Detailed PostgreSQL installation
- **PROJECT_STRUCTURE_EXPLAINED.md**: Complete project structure
- **API_ENDPOINTS_GUIDE.md**: All API endpoints documented
- **FRONTEND_CONNECTION_FIX.md**: Frontend troubleshooting

---

## 🎯 Summary of Changes

### ✅ Removed:
- ❌ SQLite database file (`petrescue_connect.db`)
- ❌ SQLite package (`Microsoft.EntityFrameworkCore.Sqlite`)
- ❌ SQLite configuration in Program.cs
- ❌ DbSeeder.cs (static data seeding)
- ❌ Automatic data population

### ✅ Kept/Updated:
- ✅ PostgreSQL configuration
- ✅ Database password: `123`
- ✅ Database name: `petrescue`
- ✅ All API endpoints
- ✅ All models and controllers
- ✅ Frontend application
- ✅ Clean, empty database ready for your data

---

## 🚀 You're Ready!

Your PetRescue Connect application is now configured to use PostgreSQL exclusively with password `123`. The database starts empty, and you can add data through:
- Frontend UI
- pgAdmin
- API endpoints
- SQL scripts

**Next Steps**:
1. Install PostgreSQL (if not done)
2. Create `petrescue` database
3. Run the API
4. Start adding your data!

**Happy Coding! 🐾**
