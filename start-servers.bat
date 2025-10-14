@echo off
echo Starting JobBoard Pro Development Servers...
echo.

:: Start backend server in a new command prompt window
echo Starting Django backend server...
start "Django Backend" cmd /k "cd /d "%~dp0backend" && "%~dp0.venv\Scripts\python.exe" manage.py runserver"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server in a new command prompt window
echo Starting React frontend server...
start "React Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8000/
echo Frontend: http://localhost:5173/
echo.
echo Press any key to exit this script (servers will continue running)...
pause >nul