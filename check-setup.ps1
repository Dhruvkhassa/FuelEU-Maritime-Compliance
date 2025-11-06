# Setup Checker Script
Write-Host "`n=== Checking Your Setup ===" -ForegroundColor Cyan

# Check Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "✓ Docker is installed!" -ForegroundColor Green
    $dockerRunning = docker ps -ErrorAction SilentlyContinue
    if ($dockerRunning) {
        Write-Host "✓ Docker is running!" -ForegroundColor Green
        Write-Host "`nYou can use Docker option (EASIEST):" -ForegroundColor Yellow
        Write-Host "  docker-compose up -d" -ForegroundColor White
    } else {
        Write-Host "⚠ Docker is installed but not running" -ForegroundColor Yellow
        Write-Host "  Start Docker Desktop first!" -ForegroundColor White
    }
} else {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    Write-Host "  Install from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
}

Write-Host ""

# Check PostgreSQL
$psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlInstalled) {
    Write-Host "✓ PostgreSQL is installed!" -ForegroundColor Green
    Write-Host "  Location: $($psqlInstalled.Source)" -ForegroundColor Gray
} else {
    Write-Host "✗ PostgreSQL is not installed" -ForegroundColor Red
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
}

Write-Host ""

# Check .env file
$envPath = "backend\.env"
if (Test-Path $envPath) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envPath
    if ($envContent -match "YOUR_PASSWORD") {
        Write-Host "⚠ .env still has placeholder password!" -ForegroundColor Yellow
        Write-Host "  Edit backend\.env and replace YOUR_PASSWORD" -ForegroundColor White
    } else {
        Write-Host "✓ .env looks configured" -ForegroundColor Green
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "  Creating it now..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fuel_eu_db?schema=public"
PORT=3001
"@ | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "  Created! Now edit it with your password." -ForegroundColor Green
}

Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
if ($dockerInstalled) {
    Write-Host "→ Use Docker (Option A) - It's already installed!" -ForegroundColor Green
} else {
    Write-Host "→ Install Docker Desktop for easiest setup" -ForegroundColor Yellow
    Write-Host "  OR install PostgreSQL directly (Option B)" -ForegroundColor Yellow
}

Write-Host "`nSee QUICK_SETUP.md for detailed instructions!" -ForegroundColor Cyan

