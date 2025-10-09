# 🐘 Complete PostgreSQL Setup Guide for PetRescue Connect

## 📋 Overview
This guide will walk you through setting up PostgreSQL with pgAdmin for the PetRescue Connect project. The database password is set to **123**.

---

## Part 1: Install PostgreSQL with pgAdmin

### Step 1: Download PostgreSQL

1. **Go to**: https://www.postgresql.org/download/windows/
2. **Click**: "Download the installer"
3. **Choose**: Latest stable version (PostgreSQL 15.x or 16.x)
4. **Download**: The Windows x86-64 installer

### Step 2: Run the Installer

1. **Run** the downloaded `.exe` file as Administrator
2. **Click** "Next" through the welcome screen

### Step 3: Select Installation Directory

- **Default**: `C:\Program Files\PostgreSQL\16` (or your version)
- **Click**: "Next"

### Step 4: Select Components

✅ **Make sure these are checked**:
- ✅ PostgreSQL Server (required)
- ✅ pgAdmin 4 (required - this is the web interface)
- ✅ Stack Builder (optional)
- ✅ Command Line Tools (required)

**Click**: "Next"

### Step 5: Select Data Directory

- **Default**: `C:\Program Files\PostgreSQL\16\data`
- **Click**: "Next"

### Step 6: Set Password

⚠️ **IMPORTANT**: This is the most critical step!

- **Password**: `123`
- **Confirm Password**: `123`

**Remember this password!** You'll need it to connect to the database.

**Click**: "Next"

### Step 7: Set Port

- **Port**: `5432` (default - don't change this)
- **Click**: "Next"

### Step 8: Advanced Options

- **Locale**: Default locale (or your preferred locale)
- **Click**: "Next"

### Step 9: Complete Installation

- **Review** your settings
- **Click**: "Next" to begin installation
- **Wait** for installation to complete (2-5 minutes)
- **Uncheck** "Launch Stack Builder" (not needed)
- **Click**: "Finish"

---

## Part 2: Verify PostgreSQL Installation

### Step 1: Check PostgreSQL Service

1. **Press**: `Win + R`
2. **Type**: `services.msc`
3. **Press**: Enter
4. **Find**: "postgresql-x64-16" (or your version)
5. **Verify**: Status shows "Running"

If not running:
- Right-click → Start

### Step 2: Test Command Line Access

1. **Open**: Command Prompt or PowerShell
2. **Type**: 
   ```cmd
   psql --version
   ```
3. **Expected Output**: 
   ```
   psql (PostgreSQL) 16.x
   ```

If command not found:
- Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

---

## Part 3: Create Database Using pgAdmin

### Step 1: Open pgAdmin 4

1. **Find**: pgAdmin 4 in Start Menu
2. **Launch**: pgAdmin 4
3. **Wait**: For browser window to open (http://localhost:5050 or similar)

### Step 2: Connect to PostgreSQL Server

1. **In left sidebar**: Expand "Servers"
2. **Click**: "PostgreSQL 16" (or your version)
3. **Enter Password**: `123`
4. **Check**: "Save Password" (optional, for convenience)
5. **Click**: "OK"

### Step 3: Create the Database

1. **Right-click**: "Databases" in the left sidebar
2. **Select**: "Create" → "Database..."
3. **In the dialog**:
   - **Database name**: `petrescue` (exactly this name, lowercase)
   - **Owner**: `postgres`
   - **Encoding**: `UTF8`
   - **Template**: `template0`
   - **Connection limit**: `-1` (unlimited)
4. **Click**: "Save"

### Step 4: Verify Database Creation

1. **Expand**: "Databases" in left sidebar
2. **You should see**: `petrescue` database listed
3. **Click**: on `petrescue` to select it

---

## Part 4: Alternative - Create Database Using Command Line

If you prefer command line:

```cmd
# Open Command Prompt or PowerShell

# Connect to PostgreSQL
psql -U postgres

# Enter password when prompted: 123

# Create database
CREATE DATABASE petrescue;

# Verify
\l

# Exit
\q
```

---

## Part 5: Configure and Run the API

### Step 1: Verify Configuration Files

The configuration is already set up with password `123`:

**File**: `PetRescueConnect.API/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=petrescue;Username=postgres;Password=123"
  },
  "DatabaseProvider": "PostgreSQL"
}
```

**File**: `PetRescueConnect.API/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=petrescue;Username=postgres;Password=123"
  }
}
```

### Step 2: Build the Project

```bash
cd PetRescueConnect.API
dotnet restore
dotnet build
```

### Step 3: Run the API

```bash
# Set environment to Development
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Run the API
dotnet run
```

### Step 4: Watch for Success Messages

You should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Step 5: Verify Database Tables Created

The API will automatically create all necessary tables when it starts.

**In pgAdmin**:
1. **Right-click**: `petrescue` database
2. **Select**: "Refresh"
3. **Expand**: `petrescue` → `Schemas` → `public` → `Tables`

**You should see these tables**:
- `Animals`
- `Organizations`
- `Users`
- `AdoptionApplications`
- `RescueReports`
- `AnimalPhotos`
- `MedicalRecords`
- `RescuePhotos`
- `TemporaryPhotos`

---

## Part 6: View and Manage Data in pgAdmin

### View Table Data

1. **In pgAdmin**: Navigate to `petrescue` → `Schemas` → `public` → `Tables`
2. **Right-click** on any table (e.g., `Animals`)
3. **Select**: "View/Edit Data" → "All Rows"
4. **Result**: Data grid shows all records

### Run SQL Queries

1. **Click**: Tools → Query Tool (or press F5)
2. **Type** your SQL query:
   ```sql
   -- View all animals
   SELECT * FROM "Animals";
   
   -- View all organizations
   SELECT * FROM "Organizations";
   
   -- View all users
   SELECT * FROM "Users";
   
   -- Count records
   SELECT COUNT(*) FROM "Animals";
   ```
3. **Click**: Execute (▶️ button) or press F5

### Add Sample Data Manually

```sql
-- Add a sample organization
INSERT INTO "Organizations" ("Name", "Type", "Address", "City", "State", "ZipCode", 
    "Phone", "Email", "Latitude", "Longitude", "Rating", "ReviewCount", 
    "Capacity", "CurrentAnimals", "Specialties", "Services", "Hours", 
    "Featured", "CreatedAt", "UpdatedAt")
VALUES ('Happy Paws Shelter', 'Animal Shelter', '123 Main St', 'Springfield', 'IL', '62701',
    '555-1234', 'info@happypaws.org', 39.7817, -89.6501, 4.8, 127,
    150, 0, '[]', '[]', '{}', true, NOW(), NOW());

-- Add a sample animal (replace OrganizationId with actual ID from above)
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

## Part 7: Troubleshooting

### Issue: "Connection refused" or "Could not connect"

**Solutions**:
1. Check PostgreSQL service is running (services.msc)
2. Verify password is `123`
3. Check port 5432 is not blocked by firewall
4. Restart PostgreSQL service

### Issue: "Database does not exist"

**Solution**:
```sql
-- Connect to postgres database first
psql -U postgres -d postgres

-- Then create petrescue
CREATE DATABASE petrescue;
```

### Issue: "Password authentication failed"

**Solution**:
1. Open pgAdmin
2. Right-click PostgreSQL server → Properties
3. Connection tab → Update password to `123`
4. Save

### Issue: Tables not created

**Solution**:
```bash
# Stop the API (Ctrl+C)
# Delete and recreate database
psql -U postgres
DROP DATABASE petrescue;
CREATE DATABASE petrescue;
\q

# Restart API
dotnet run
```

### Issue: Port 5432 already in use

**Check what's using the port**:
```cmd
netstat -ano | findstr :5432
```

**Solution**: Stop other PostgreSQL instances or change port

---

## Part 8: Connection String Explained

```
Host=localhost;Database=petrescue;Username=postgres;Password=123
```

- **Host=localhost**: Database is on your local machine
- **Database=petrescue**: Name of the database
- **Username=postgres**: Default PostgreSQL superuser
- **Password=123**: Your PostgreSQL password
- **Port**: 5432 (default, not specified means use default)

---

## Part 9: Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database `petrescue` created
3. ✅ API configured to use PostgreSQL
4. ✅ Tables automatically created
5. ✅ Ready to add data via API or pgAdmin

**Access Points**:
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **pgAdmin**: Start Menu → pgAdmin 4
- **Database**: petrescue on localhost:5432
