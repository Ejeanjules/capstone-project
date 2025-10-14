# JobBoard Pro - Server Startup Options

This document explains how to start both the Django backend and React frontend servers for development.

## Quick Start Options

### Option 1: Batch Script (Windows)
Double-click `start-servers.bat` or run:
```cmd
start-servers.bat
```
This opens both servers in separate command prompt windows.

### Option 2: PowerShell Script (Recommended)
Right-click `start-servers.ps1` and select "Run with PowerShell" or run:
```powershell
./start-servers.ps1
```
This opens both servers in separate PowerShell windows with colored output.

### Option 3: NPM Script (Single Terminal)
```bash
npm run start:servers
```
This runs both servers in the same terminal with prefixed, colored output.

### Option 4: Manual Start (Traditional)
**Terminal 1 - Backend:**
```bash
cd backend
../.venv/Scripts/python.exe manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Server URLs
- **Backend API**: http://127.0.0.1:8000/
- **Frontend App**: http://localhost:5173/
- **Django Admin**: http://127.0.0.1:8000/admin/

## Features
- User registration and authentication
- Job posting and browsing
- Job application system
- Applicant tracking for employers
- Profile matching interface

## Stopping Servers
- For batch/PowerShell scripts: Close the individual terminal windows
- For NPM script: Press `Ctrl+C` in the terminal
- For manual start: Press `Ctrl+C` in each terminal

## Troubleshooting
- Make sure the virtual environment is activated
- Ensure all dependencies are installed (`pip install -r backend/requirements.txt` and `npm install`)
- Check that ports 8000 and 5173 aren't being used by other applications