@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    SMARTVAHAN - VEHICLE HEALTH MONITOR
echo ==========================================
echo.
echo [1/2] Launching Backend Server (FastAPI)...
:: Check if venv exists, if not, try to use py to create it
if not exist "backend\venv" (
    echo Virtual environment not found. Attempting to create one...
    cd backend && python -m venv venv && cd ..
)

:: Start Backend in a new window
start "SmartVahan Backend" cmd /k "cd backend && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload"

echo [2/2] Launching Frontend Development Server (Vite)...
:: Start Frontend in a new window
start "SmartVahan Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ------------------------------------------
echo ALL SYSTEMS STARTING! 🚀
echo.
echo 1. Wait a few seconds for the servers to initialize.
2. Open your browser and go to: http://localhost:5173
3. The dashboard will automatically simulate sensor data.
echo.
echo (Keep the other two windows open!)
echo ------------------------------------------
echo.
pause
