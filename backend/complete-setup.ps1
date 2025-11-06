# Complete Setup Script for Fuel EU Backend
Write-Host "=== Fuel EU Backend Complete Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file with default settings..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fuel_eu_db?schema=public"
PORT=3001
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host ".env created! Default password is 'postgres'" -ForegroundColor Green
    Write-Host "If your PostgreSQL password is different, edit .env now" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue or Ctrl+C to edit .env first..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client. Check your .env file." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating database (if it doesn't exist)..." -ForegroundColor Cyan
Write-Host "Attempting to create database..." -ForegroundColor Yellow

# Try to create database
$envContent = Get-Content .env
$dbUrl = ($envContent | Select-String "DATABASE_URL").ToString().Split("=")[1].Trim('"')
$dbName = "fuel_eu_db"

# Extract connection info
if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)") {
    $pgUser = $matches[1]
    $pgPass = $matches[2]
    $pgHost = $matches[3]
    $pgPort = $matches[4]
    
    Write-Host "Database will be created during migration if it doesn't exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Running database migrations..." -ForegroundColor Cyan
npm run db:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed!" -ForegroundColor Red
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL is not running" -ForegroundColor White
    Write-Host "2. Wrong password in .env file" -ForegroundColor White
    Write-Host "3. Database doesn't exist (will be created)" -ForegroundColor White
    Write-Host ""
    Write-Host "To create database manually, run:" -ForegroundColor Cyan
    Write-Host "  psql -U postgres" -ForegroundColor White
    Write-Host "  CREATE DATABASE fuel_eu_db;" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Step 4: Seeding database..." -ForegroundColor Cyan
npm run db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "Seeding failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the backend server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The server will run on http://localhost:3001" -ForegroundColor Cyan

