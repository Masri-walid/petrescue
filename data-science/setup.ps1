# PetRescue Connect - Data Science Setup Script
# This script sets up the environment and runs the adoption prediction pipeline

Write-Host "========================================"
Write-Host "PetRescue Connect - Data Science Setup"
Write-Host "========================================"
Write-Host ""

# Check if Python is installed
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
}

$pythonVersion = python --version 2>&1
Write-Host "Python version: $pythonVersion" -ForegroundColor Green

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install requirements
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create data directories
Write-Host ""
Write-Host "Creating data directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "data/raw" | Out-Null
New-Item -ItemType Directory -Force -Path "data/processed" | Out-Null
New-Item -ItemType Directory -Force -Path "models" | Out-Null
New-Item -ItemType Directory -Force -Path "output/eda" | Out-Null

# Check if Kaggle is configured
Write-Host ""
Write-Host "Checking Kaggle configuration..." -ForegroundColor Yellow
$kaggleConfig = "$env:USERPROFILE\.kaggle\kaggle.json"
if (-not (Test-Path $kaggleConfig)) {
    Write-Host "Warning: Kaggle API credentials not found at $kaggleConfig" -ForegroundColor Yellow
    Write-Host "To download the dataset automatically, please:"
    Write-Host "  1. Go to https://www.kaggle.com/settings/account"
    Write-Host "  2. Click 'Create New Token' to download kaggle.json"
    Write-Host "  3. Place the file at $kaggleConfig"
    Write-Host ""
    Write-Host "Alternatively, manually download the dataset from:"
    Write-Host "  https://www.kaggle.com/datasets/chaudharisanika/pet-adoption-records-with-animal-and-adopter-data"
    Write-Host "  and extract to data-science/data/raw/"
} else {
    Write-Host "Kaggle credentials found. Downloading dataset..." -ForegroundColor Green
    kaggle datasets download chaudharisanika/pet-adoption-records-with-animal-and-adopter-data -p data/raw --unzip
}

Write-Host ""
Write-Host "========================================"
Write-Host "Setup Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Ensure the dataset is in data-science/data/raw/"
Write-Host "  2. Run the pipeline scripts in order:"
Write-Host "     python 01_data_cleaning.py"
Write-Host "     python 02_exploratory_analysis.py"
Write-Host "     python 03_predictive_model.py"
Write-Host "  3. Start the prediction API:"
Write-Host "     python 04_prediction_api.py"
Write-Host ""
Write-Host "  4. Apply the database migration:"
Write-Host "     psql -U postgres -d petrescue -f ../scripts/03-add-adoption-likelihood.sql"
Write-Host ""

