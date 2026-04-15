@echo off
REM MongoDB Startup Script
color 0A
cls
echo.
echo ========================================
echo   MongoDB Local Server
echo ========================================
echo.

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: MongoDB is not installed!
    echo.
    echo Please download and install MongoDB Community Edition:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Or install via Chocolatey:
    echo choco install mongodb-community
    echo.
    pause
    exit /b 1
)

echo.
echo Starting MongoDB on localhost:27017...
echo Database: medexplain
echo Keep this window open while using MedExplain
echo.

mongod
pause
