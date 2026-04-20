#!/usr/bin/env pwsh
$frontendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Starting MedExplain Frontend from: $frontendDir"
Set-Location $frontendDir
Write-Host "Current directory: $(Get-Location)"
Write-Host "Starting npm start..."
& npm start
