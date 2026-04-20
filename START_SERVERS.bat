@echo off
REM Start Backend, Frontend, and ML Server in parallel
REM MongoDB should be running separately

echo.
echo =====================================
echo Starting Backend, Frontend, and ML...
echo =====================================
echo.

REM Backend (Port 5000)
echo Starting Backend on port 5000...
cd "%~dp0backend"
start "MedExplain-Backend" cmd /k "title MedExplain Backend && npm start"
cd ..

timeout /t 3

REM Frontend (Port 3000)
echo Starting Frontend on port 3000...
cd "%~dp0frontend"
start "MedExplain-Frontend" cmd /k "title MedExplain Frontend && npm start"
cd ..

timeout /t 3

REM ML Server (Port 5001)
echo Starting ML Server on port 5001...
cd "%~dp0ml"
start "MedExplain-ML" cmd /k "title MedExplain ML Server && python main.py"
cd ..

echo.
echo =====================================
echo Services starting...
echo =====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ML:       http://localhost:5001
echo.

pause
