# 🐾 PetRescue Connect Database Setup Guide

## Prerequisites

### 1. Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql` or download from website
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Start PostgreSQL Service
```bash
# Windows (if installed as service)
net start postgresql

# macOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Setup

### 1. Create Database and User
Connect to PostgreSQL as superuser and create the database:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE petrescue_connect;

-- Create user (optional - you can use postgres user)
CREATE USER petrescue_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE petrescue_connect TO petrescue_user;

-- Exit
\q
```

### 2. Run Database Scripts
Execute the schema and seed data scripts:

```bash
# Navigate to your project directory
cd "C:\Users\walid\Desktop\projects\petrescue-connect2"

# Run schema creation
psql -U postgres -d petrescue_connect -f scripts/01-create-database-schema.sql

# Run seed data
psql -U postgres -d petrescue_connect -f scripts/02-seed-sample-data.sql
```

### 3. Verify Database Setup
Connect to the database and verify tables:

```sql
psql -U postgres -d petrescue_connect

-- List all tables
\dt

-- Check some sample data
SELECT name, species, status FROM animals;
SELECT name, organization_type FROM organizations;
SELECT first_name, last_name, user_type FROM users;

-- Exit
\q
```

## Connection String Configuration

Your `appsettings.json` is already configured correctly:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=petrescue_connect;Username=postgres;Password=password"
}
```

**Note**: Update the password in the connection string if you set a different password for your PostgreSQL installation.

## Running the API

1. **Restore NuGet packages**:
   ```bash
   cd PetRescueConnect.API
   dotnet restore
   ```

2. **Run the API**:
   ```bash
   dotnet run
   ```

3. **Access Swagger UI**: 
   - Navigate to `https://localhost:7001/swagger` (or the port shown in console)

## Testing Database Connectivity

The API will automatically ensure the database is created when it starts (see Program.cs line 76).

## Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure PostgreSQL service is running
2. **Authentication failed**: Check username/password in connection string
3. **Database doesn't exist**: Run the database creation commands above
4. **Permission denied**: Make sure the user has proper privileges

### Useful PostgreSQL Commands:
```sql
-- Check if database exists
\l

-- Connect to specific database
\c petrescue_connect

-- Show table structure
\d table_name

-- Show all indexes
\di
```
