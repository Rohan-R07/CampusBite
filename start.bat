@echo off
title CampusBite - Daily Launcher
color 0A

echo.
echo  ============================================
echo    CampusBite - Campus Food Ordering App
echo  ============================================
echo.

:: ---- Backend ----
echo [1/2] Starting FastAPI Backend...
cd /d "%~dp0Backend"

:: Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo  [WARN] No venv found. Using system Python.
)

:: Install/update dependencies silently
echo  Installing dependencies...
pip install -r requirements.txt -q

:: Launch backend in a new window
start "CampusBite - Backend (FastAPI)" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo  Backend started at  http://localhost:8000
echo  API Docs available: http://localhost:8000/docs

:: Small delay to let backend initialize
timeout /t 2 /nobreak >nul

:: ---- Frontend ----
echo.
echo [2/2] Opening Frontend in browser...
cd /d "%~dp0Frontend"
start "" "index.html"
echo  Frontend opened: index.html

echo.
echo  ============================================
echo    Both services are running!
echo    Backend  : http://localhost:8000
echo    API Docs : http://localhost:8000/docs
echo    Frontend : Open in browser (index.html)
echo  ============================================
echo.
echo  Close the Backend window to stop the server.
echo.
pause
