@echo off
REM MedExplain - Frontend Startup Script
color 0A
cls
echo.
echo ========================================
echo   MedExplain Frontend React App
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
)

echo.
echo Starting Frontend Server...
echo App will open in your browser at http://localhost:3000
echo Press Ctrl+C to stop
echo.

call npm start
pause
