# Django Management Commands Helper Script
# Run this from the project root directory

# Activate virtual environment and run migrations
Write-Host "Running Django migrations..." -ForegroundColor Green
Set-Location "backend"
& "$PSScriptRoot\.venv\Scripts\python.exe" manage.py migrate

Write-Host "`nMigrations complete!" -ForegroundColor Green
Write-Host "Database is now set up in Supabase." -ForegroundColor Cyan
