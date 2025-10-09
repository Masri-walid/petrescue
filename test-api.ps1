# Test PetRescue Connect API
Write-Host "Testing PetRescue Connect API..." -ForegroundColor Green

$baseUrl = "http://localhost:5010/api"

# Test 1: Register a new user
Write-Host "`n1. Testing user registration..." -ForegroundColor Yellow
$registerData = @{
    firstName = "Test"
    lastName = "User"
    email = "user@example.com"
    password = "string"
    role = "citizen"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/register" -Method POST -ContentType "application/json" -Body $registerData
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Cyan
    Write-Host "Token: $($registerResponse.token.Substring(0, 50))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Login with the created user
Write-Host "`n2. Testing user login..." -ForegroundColor Yellow
$loginData = @{
    email = "user@example.com"
    password = "string"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.user.id)" -ForegroundColor Cyan
    Write-Host "Email: $($loginResponse.user.email)" -ForegroundColor Cyan
    Write-Host "Name: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Cyan
    Write-Host "Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🎉 API testing completed!" -ForegroundColor Green
