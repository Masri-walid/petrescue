# Test script for PetRescue Connect API endpoints
# This script tests the main API endpoints to ensure they work with the database

param(
    [string]$BaseUrl = "https://localhost:7001",
    [switch]$SkipCertificateCheck
)

Write-Host "🧪 PetRescue Connect API Testing" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Skip certificate validation for local testing
if ($SkipCertificateCheck) {
    add-type @"
        using System.Net;
        using System.Security.Cryptography.X509Certificates;
        public class TrustAllCertsPolicy : ICertificatePolicy {
            public bool CheckValidationResult(
                ServicePoint srvPoint, X509Certificate certificate,
                WebRequest request, int certificateProblem) {
                return true;
            }
        }
"@
    [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
}

# Function to make HTTP request
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Description
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "   Endpoint: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method $Method -ErrorAction Stop
        Write-Host "   ✅ Success - Returned $($response.Count) items" -ForegroundColor Green
        
        # Show sample data if available
        if ($response -is [array] -and $response.Count -gt 0) {
            $sample = $response[0]
            if ($sample.name) {
                Write-Host "   📋 Sample: $($sample.name)" -ForegroundColor Cyan
            } elseif ($sample.firstName) {
                Write-Host "   📋 Sample: $($sample.firstName) $($sample.lastName)" -ForegroundColor Cyan
            }
        }
        return $true
    }
    catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test if API is running
Write-Host "🔍 Checking if API is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$BaseUrl/swagger/index.html" -Method GET -ErrorAction Stop
    Write-Host "✅ API is running and accessible!" -ForegroundColor Green
}
catch {
    Write-Host "❌ API is not accessible. Please make sure:" -ForegroundColor Red
    Write-Host "   1. Run 'dotnet run' in PetRescueConnect.API directory" -ForegroundColor Red
    Write-Host "   2. API is running on the correct port" -ForegroundColor Red
    Write-Host "   3. Database connection is working" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Testing API Endpoints..." -ForegroundColor Cyan

# Test main endpoints
$tests = @(
    @{ Endpoint = "/api/animals"; Description = "Get all animals for adoption" },
    @{ Endpoint = "/api/animals/available"; Description = "Get available animals" },
    @{ Endpoint = "/api/organizations"; Description = "Get all organizations" },
    @{ Endpoint = "/api/organizations/shelters"; Description = "Get shelters" },
    @{ Endpoint = "/api/organizations/veterinarians"; Description = "Get veterinary clinics" },
    @{ Endpoint = "/api/rescue-reports"; Description = "Get rescue reports" },
    @{ Endpoint = "/api/users"; Description = "Get users" }
)

$successCount = 0
$totalTests = $tests.Count

foreach ($test in $tests) {
    if (Test-Endpoint -Endpoint $test.Endpoint -Description $test.Description) {
        $successCount++
    }
    Write-Host ""
}

# Summary
Write-Host "📊 Test Results Summary:" -ForegroundColor Cyan
Write-Host "   Successful: $successCount/$totalTests" -ForegroundColor Green
Write-Host "   Failed: $($totalTests - $successCount)/$totalTests" -ForegroundColor Red

if ($successCount -eq $totalTests) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Your API is working correctly with the database." -ForegroundColor Green
    Write-Host "🌐 You can now access the Swagger UI at: $BaseUrl/swagger" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please check:" -ForegroundColor Yellow
    Write-Host "   1. Database connection in appsettings.json" -ForegroundColor White
    Write-Host "   2. Database schema and data are properly loaded" -ForegroundColor White
    Write-Host "   3. API controllers are properly configured" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Useful URLs:" -ForegroundColor Cyan
Write-Host "   Swagger UI: $BaseUrl/swagger" -ForegroundColor White
Write-Host "   Animals API: $BaseUrl/api/animals" -ForegroundColor White
Write-Host "   Organizations API: $BaseUrl/api/organizations" -ForegroundColor White
