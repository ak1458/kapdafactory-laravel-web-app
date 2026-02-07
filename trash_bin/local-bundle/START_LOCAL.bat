@echo off
echo ==========================================
echo KapdaFactory Local Launcher
echo ==========================================

if not exist "kapda-backend\vendor" (
    echo [WARNING] Dependencies not found!
    echo Running First-Time Installation...
    call install.bat
)

echo Starting Servers...
start "Kapda Backend" cmd /k "call run_backend.bat"

echo Waiting for Backend to initialize...
timeout /t 5 /nobreak >nul

start "Kapda Frontend" cmd /k "call run_frontend.bat"

echo.
echo Servers are running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Press CTRL+C in the other windows to stop.
pause
