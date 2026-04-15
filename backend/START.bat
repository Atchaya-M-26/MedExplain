@echo off
REM MedExplain - Backend Startup Script
color 0A
cls
echo.
echo ========================================
echo   MedExplain Backend Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting Backend Server...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop
echo.

call npm run dev
pause
