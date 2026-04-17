# MedExplain ML Server Startup Script for PowerShell

Write-Host "Starting MedExplain ML Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher from https://www.python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Train models if they don't exist
if (-not (Test-Path "models\diabetes_model.pkl")) {
    Write-Host ""
    Write-Host "Training ML models (first run only)..." -ForegroundColor Yellow
    Write-Host "This may take a minute..." -ForegroundColor Gray
    Write-Host ""
    python train_model.py
    Write-Host ""
} else {
    Write-Host "✓ ML models found. Skipping training." -ForegroundColor Green
}

# Start the API server
Write-Host ""
Write-Host "Starting FastAPI server on http://localhost:5001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
python main.py
