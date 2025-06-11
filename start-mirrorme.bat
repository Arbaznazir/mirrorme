@echo off
echo Starting MirrorMe Application...
echo.

REM Check if we're in the correct directory
if not exist "backend" (
    echo Error: backend folder not found. Please run this script from the MirrorMe project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend folder not found. Please run this script from the MirrorMe project root directory.
    pause
    exit /b 1
)

echo Starting Backend Server...
start "MirrorMe Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8001"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "MirrorMe Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this script (servers will continue running)
pause >nul 