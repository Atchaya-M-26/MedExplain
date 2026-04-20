@echo off
echo Starting MedExplain ML Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Virtual environment created.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt

REM Train models if they don't exist
if not exist "models\diabetes_model.pkl" (
    echo.
    echo Training ML models (first run only)...
    echo This may take a minute...
    echo.
    python train_model.py
) else (
    echo ML models found. Skipping training.
)

REM Start the API server
echo.
echo Starting FastAPI server on http://localhost:5001
echo Press Ctrl+C to stop the server
echo.
python main.py
pause
