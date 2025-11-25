# PowerShell script to restart RAG service with fresh database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restarting RAG Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running Python processes on port 5002 (RAG service)
Write-Host "Step 1: Checking for processes on port 5002..." -ForegroundColor Yellow
$processOnPort = Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processOnPort) {
    Write-Host "Found process(es) on port 5002. Stopping..." -ForegroundColor Yellow
    foreach ($pid in $processOnPort) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "Processes stopped." -ForegroundColor Green
} else {
    Write-Host "No processes found on port 5001." -ForegroundColor Green
}

# Step 2: Delete corrupted ChromaDB database
Write-Host ""
Write-Host "Step 2: Deleting corrupted ChromaDB database..." -ForegroundColor Yellow
$dbPath = "chroma_db_merck"
if (Test-Path $dbPath) {
    Remove-Item -Recurse -Force $dbPath
    Write-Host "Database deleted successfully." -ForegroundColor Green
} else {
    Write-Host "No database found to delete." -ForegroundColor Green
}

# Step 3: Start RAG service
Write-Host ""
Write-Host "Step 3: Starting RAG service..." -ForegroundColor Yellow
Write-Host "This will recreate the database from scratch (may take 2-5 minutes)..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment and run service
& ".\venv\Scripts\Activate.ps1"
python rag_service.py

