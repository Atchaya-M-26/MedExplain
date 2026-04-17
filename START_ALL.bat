@echo off
REM Start all services: MongoDB, Backend, Frontend, ML Server

echo.
echo ====================================
echo MedExplain - Starting All Services
echo ====================================
echo.

REM Start MongoDB
echo [1/4] Starting MongoDB...
start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%cd%\data"
timeout /t 3 /nobreak

REM Start Backend
echo [2/4] Starting Backend Server...
cd backend
start "Backend" cmd /k "npm start"
cd ..
timeout /t 5 /nobreak

REM Start Frontend
echo [3/4] Starting Frontend Server...
cd frontend
start "Frontend" cmd /k "npm start"
cd ..
timeout /t 5 /nobreak

REM Start ML Server
echo [4/4] Starting ML Server...
cd ml
start "ML Server" cmd /k "python main.py"
cd ..

echo.
echo ====================================
echo All services started!
echo ====================================
echo.
echo Services:
echo - MongoDB:   mongodb://localhost:27017
echo - Backend:   http://localhost:5000
echo - Frontend:  http://localhost:3000
echo - ML Server: http://localhost:5001
echo.
echo Logs are in separate windows.
echo.

pause
