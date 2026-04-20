#!/usr/bin/env pwsh
# MedExplain - Complete Startup Script

Write-Host "🏥 MedExplain - Startup Guide" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "✓ Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
Write-Host "✓ Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "  npm: $npmVersion" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. INSTALL MONGODB (if not already installed):" -ForegroundColor Yellow
Write-Host "   Download from: https://www.mongodb.com/try/download/community"
Write-Host "   Or use: choco install mongodb-community"
Write-Host ""

Write-Host "2. START MONGODB in a separate PowerShell window:" -ForegroundColor Yellow
Write-Host "   mongod"
Write-Host ""

Write-Host "3. START BACKEND in another PowerShell window:" -ForegroundColor Yellow
Write-Host "   cd backend"
Write-Host "   npm run dev"
Write-Host ""

Write-Host "4. START FRONTEND in another PowerShell window:" -ForegroundColor Yellow
Write-Host "   cd frontend"
Write-Host "   npm start"
Write-Host ""

Write-Host "5. OPEN IN BROWSER:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API: http://localhost:5000/api/health"
Write-Host ""

Read-Host "Press Enter to continue..."
