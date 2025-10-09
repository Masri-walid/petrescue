# PetRescue Connect Database Setup Script
# This script automates the database setup process

param(
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "password",
    [string]$DatabaseName = "petrescue_connect",
    [string]$Host = "localhost",
    [int]$Port = 5432
)

Write-Host "🐾 PetRescue Connect Database Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Function to execute SQL command
function Execute-SqlCommand {
    param(
        [string]$Command,
        [string]$Database = "postgres"
    )
    
    $env:PGPASSWORD = $PostgresPassword
    $result = psql -h $Host -p $Port -U $PostgresUser -d $Database -c $Command 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error executing SQL command: $Command" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to execute SQL file
function Execute-SqlFile {
    param(
        [string]$FilePath,
        [string]$Database = $DatabaseName
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ SQL file not found: $FilePath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "📄 Executing SQL file: $FilePath" -ForegroundColor Yellow
    $env:PGPASSWORD = $PostgresPassword
    $result = psql -h $Host -p $Port -U $PostgresUser -d $Database -f $FilePath 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error executing SQL file: $FilePath" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Successfully executed: $FilePath" -ForegroundColor Green
    return $true
}

# Test PostgreSQL connection
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $PostgresPassword
$connectionTest = psql -h $Host -p $Port -U $PostgresUser -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to PostgreSQL. Please check:" -ForegroundColor Red
    Write-Host "   - PostgreSQL is installed and running" -ForegroundColor Red
    Write-Host "   - Username and password are correct" -ForegroundColor Red
    Write-Host "   - Host and port are accessible" -ForegroundColor Red
    Write-Host "Error details: $connectionTest" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green

# Check if database exists
Write-Host "🔍 Checking if database '$DatabaseName' exists..." -ForegroundColor Yellow
$dbExists = Execute-SqlCommand "SELECT 1 FROM pg_database WHERE datname='$DatabaseName';" "postgres"

if ($dbExists) {
    $checkResult = psql -h $Host -p $Port -U $PostgresUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$DatabaseName';" 2>&1
    if ($checkResult -match "1") {
        Write-Host "⚠️  Database '$DatabaseName' already exists." -ForegroundColor Yellow
        $response = Read-Host "Do you want to recreate it? This will delete all existing data! (y/N)"
        
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "🗑️  Dropping existing database..." -ForegroundColor Yellow
            Execute-SqlCommand "DROP DATABASE IF EXISTS $DatabaseName;" "postgres" | Out-Null
            Write-Host "✅ Database dropped successfully!" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Using existing database. Skipping creation..." -ForegroundColor Blue
            $skipCreation = $true
        }
    }
}

# Create database if needed
if (-not $skipCreation) {
    Write-Host "🏗️  Creating database '$DatabaseName'..." -ForegroundColor Yellow
    $createDb = Execute-SqlCommand "CREATE DATABASE $DatabaseName;" "postgres"
    
    if ($createDb) {
        Write-Host "✅ Database '$DatabaseName' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database. Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Execute schema creation
Write-Host "🏗️  Creating database schema..." -ForegroundColor Yellow
$schemaResult = Execute-SqlFile "01-create-database-schema.sql"

if (-not $schemaResult) {
    Write-Host "❌ Failed to create schema. Exiting..." -ForegroundColor Red
    exit 1
}

# Execute initial seed data
Write-Host "🌱 Inserting initial seed data..." -ForegroundColor Yellow
$seedResult = Execute-SqlFile "02-seed-sample-data.sql"

if (-not $seedResult) {
    Write-Host "❌ Failed to insert seed data. Exiting..." -ForegroundColor Red
    exit 1
}

# Execute additional mock data
Write-Host "📊 Inserting additional mock data..." -ForegroundColor Yellow
$mockResult = Execute-SqlFile "03-additional-mock-data.sql"

if (-not $mockResult) {
    Write-Host "⚠️  Failed to insert additional mock data, but continuing..." -ForegroundColor Yellow
}

# Verify setup
Write-Host "🔍 Verifying database setup..." -ForegroundColor Yellow

# Count records in main tables
$env:PGPASSWORD = $PostgresPassword
$userCount = psql -h $Host -p $Port -U $PostgresUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM users;" 2>&1
$orgCount = psql -h $Host -p $Port -U $PostgresUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM organizations;" 2>&1
$animalCount = psql -h $Host -p $Port -U $PostgresUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM animals;" 2>&1

Write-Host "📊 Database Statistics:" -ForegroundColor Cyan
Write-Host "   Users: $($userCount.Trim())" -ForegroundColor White
Write-Host "   Organizations: $($orgCount.Trim())" -ForegroundColor White
Write-Host "   Animals: $($animalCount.Trim())" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "🔗 Connection String: Host=$Host;Database=$DatabaseName;Username=$PostgresUser;Password=$PostgresPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update appsettings.json with the correct connection string if needed" -ForegroundColor White
Write-Host "2. Run 'dotnet run' in the PetRescueConnect.API directory" -ForegroundColor White
Write-Host "3. Access Swagger UI at https://localhost:7001/swagger" -ForegroundColor White
