# Simple PowerShell script to test Payments API
Write-Host "🧪 Testing Payments API..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Test 1: Test authentication endpoint
Write-Host "1. Testing authentication endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "test123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "   ✅ Login successful" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Test payments endpoint without token
Write-Host "2. Testing payments endpoint without token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payments" -Method GET
    Write-Host "   ✅ Unexpected success (should require token)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Correctly rejected (requires authentication)" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Test server health
Write-Host "3. Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000" -Method GET
    Write-Host "   ✅ Server is responding" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Basic API testing completed!" -ForegroundColor Green
