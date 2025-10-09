# Setup database for PetRescue Connect
Write-Host "Setting up PetRescue Connect database..." -ForegroundColor Green

# Database connection parameters
$server = "localhost"
$database = "petrescue"
$username = "postgres"
$password = "123"

# Try to find psql in common locations
$psqlPaths = @(
    "psql",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    try {
        if ($path -eq "psql") {
            $null = Get-Command psql -ErrorAction Stop
            $psqlPath = "psql"
            break
        } elseif (Test-Path $path) {
            $psqlPath = $path
            break
        }
    } catch {
        continue
    }
}

if (-not $psqlPath) {
    Write-Host "Error: psql command not found in common locations." -ForegroundColor Red
    Write-Host "Please install PostgreSQL or add psql to your PATH." -ForegroundColor Yellow
    Write-Host "Common locations checked:" -ForegroundColor Yellow
    foreach ($path in $psqlPaths) {
        Write-Host "  - $path" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "Found PostgreSQL client at: $psqlPath" -ForegroundColor Green

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $password
try {
    $result = & $psqlPath -h $server -U $username -d $database -c "SELECT NOW();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Database connection failed: $_" -ForegroundColor Red
    exit 1
}

# Create tables
Write-Host "Creating database tables..." -ForegroundColor Yellow
try {
    & $psqlPath -h $server -U $username -d $database -f "scripts/01-create-database-schema-simplified.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database tables" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to create database tables: $_" -ForegroundColor Red
    exit 1
}

# Insert test data
Write-Host "Inserting test data..." -ForegroundColor Yellow
try {
    & $psqlPath -h $server -U $username -d $database -f "scripts/02-insert-test-data.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test data inserted successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to insert test data" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to insert test data: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "You can now test the API with:" -ForegroundColor Yellow
Write-Host "  Email: user@example.com" -ForegroundColor Cyan
Write-Host "  Password: string" -ForegroundColor Cyan
