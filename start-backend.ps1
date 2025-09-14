Write-Host "Starting Backend Server..." -ForegroundColor Green
Set-Location backend
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "Installing dependencies if needed..." -ForegroundColor Blue
npm install
Write-Host "Starting server..." -ForegroundColor Green
node server.js
