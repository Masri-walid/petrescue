# 🐘 PostgreSQL Installation Guide for PetRescue Connect

## Option 1: Install PostgreSQL with pgAdmin (Recommended)

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer for Windows
3. Choose the latest stable version (15.x or 16.x)

### Step 2: Install PostgreSQL
1. Run the installer as Administrator
2. **Important Settings**:
   - **Password**: Set to `password` (or update connection strings if different)
   - **Port**: Keep default `5432`
   - **Locale**: Keep default
   - **Components**: Make sure to include:
     - PostgreSQL Server
     - pgAdmin 4 (Web-based administration tool)
     - Command Line Tools

### Step 3: Verify Installation
Open Command Prompt and run:
```cmd
psql --version
```

### Step 4: Create Database
1. Open pgAdmin 4 (should be in Start Menu)
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → "Create" → "Database..."
4. **Database name**: `petrescue`
5. **Owner**: `postgres`
6. Click "Save"

## Option 2: Using Docker (If Available)

If you have Docker installed, you can use our docker-compose setup:

```bash
# Start PostgreSQL and pgAdmin
docker compose up -d

# Check if containers are running
docker compose ps
```

**Access pgAdmin**: http://localhost:8080
- **Email**: admin@petrescue.com
- **Password**: admin123

## Step 5: Configure Connection

The API is already configured to connect to:
- **Host**: localhost
- **Database**: petrescue
- **Username**: postgres
- **Password**: password
- **Port**: 5432

## Step 6: Test Connection

After installing PostgreSQL, restart the API:

```bash
cd PetRescueConnect.API
dotnet run
```

The API will automatically:
1. Connect to PostgreSQL
2. Create all necessary tables
3. Seed sample data

## Troubleshooting

### Connection Issues
If you get connection errors:

1. **Check PostgreSQL Service**:
   - Open Services (services.msc)
   - Find "postgresql-x64-15" (or similar)
   - Make sure it's "Running"

2. **Check Port**:
   ```cmd
   netstat -an | findstr :5432
   ```

3. **Test Connection**:
   ```cmd
   psql -h localhost -U postgres -d petrescue
   ```

### Password Issues
If password doesn't work:
1. Open pgAdmin
2. Right-click PostgreSQL server → Properties
3. Go to Connection tab
4. Update password

### Firewall Issues
Make sure Windows Firewall allows PostgreSQL:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Add PostgreSQL if not listed

## Next Steps

Once PostgreSQL is installed and the database "petrescue" is created:

1. **Restart the API** - It will automatically create tables and seed data
2. **Access pgAdmin** - View your data at http://localhost:5432 (or through pgAdmin app)
3. **Test Frontend** - The frontend connection issues should be resolved

## pgAdmin Access

### Local Installation:
- Open pgAdmin 4 from Start Menu
- Connect to localhost server

### Docker Installation:
- URL: http://localhost:8080
- Email: admin@petrescue.com
- Password: admin123

## Database Schema

Once connected, you'll see these tables in the "petrescue" database:
- Animals
- Organizations  
- Users
- AdoptionApplications
- RescueReports
- AnimalPhotos
- MedicalRecords
- RescuePhotos
- TemporaryPhotos

## Sample Data

The database will be automatically populated with:
- 3 sample animals (Buddy, Luna, Max)
- 2 organizations (Happy Paws Shelter, Springfield Animal Hospital)
- 3 users (Admin, Citizen, Veterinarian)
- Sample photos and medical records
