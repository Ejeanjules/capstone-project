# JobBoard Pro Development Server Startup Script
Write-Host "Starting JobBoard Pro Development Servers..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Django backend server
Write-Host "Starting Django backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptDir "backend"
$pythonPath = Join-Path $scriptDir ".venv\Scripts\python.exe"

Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonPath' manage.py runserver" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start React frontend server
Write-Host "Starting React frontend server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")