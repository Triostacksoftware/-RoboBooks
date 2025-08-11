# PowerShell script to clear Next.js cache and optimize compilation
# Run this script as Administrator if you encounter permission issues

Write-Host "🧹 Clearing Next.js cache and optimizing compilation..." -ForegroundColor Green
Write-Host ""

$cacheDirs = @(
    ".next",
    ".turbo", 
    "node_modules\.cache",
    "dist",
    "out"
)

$currentDir = Get-Location

# Function to remove directory
function Remove-Directory {
    param($dirPath)
    
    if (Test-Path $dirPath) {
        try {
            Remove-Item -Path $dirPath -Recurse -Force
            Write-Host "✅ Removed: $dirPath" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not remove $dirPath : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  Directory not found: $dirPath" -ForegroundColor Blue
    }
}

# Clear all cache directories
Write-Host "📁 Clearing cache directories..." -ForegroundColor Cyan
foreach ($dir in $cacheDirs) {
    $fullPath = Join-Path $currentDir $dir
    Remove-Directory $fullPath
}

# Clear npm cache
Write-Host "`n📦 Clearing npm cache..." -ForegroundColor Cyan
try {
    npm cache clean --force
    Write-Host "✅ npm cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not clear npm cache" -ForegroundColor Yellow
}

# Clear Next.js cache
Write-Host "`n🚀 Clearing Next.js cache..." -ForegroundColor Cyan
try {
    npx next clear
    Write-Host "✅ Next.js cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not clear Next.js cache" -ForegroundColor Yellow
}

# Check if node_modules needs reinstallation
$nodeModulesPath = Join-Path $currentDir "node_modules"
$packageJsonPath = Join-Path $nodeModulesPath "package.json"

if (-not (Test-Path $nodeModulesPath) -or -not (Test-Path $packageJsonPath)) {
    Write-Host "`n📥 Reinstalling dependencies..." -ForegroundColor Cyan
    try {
        npm install
        Write-Host "✅ Dependencies reinstalled" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not reinstall dependencies" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Cache clearing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npm run dev:fast (for turbopack mode)" -ForegroundColor White
Write-Host "   2. Run: npm run dev (for regular mode)" -ForegroundColor White  
Write-Host "   3. Run: npm run build:fast (for fast builds)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your Next.js app should now compile much faster!" -ForegroundColor Green

# Optional: Start the development server
$startDev = Read-Host "`nWould you like to start the development server now? (y/n)"
if ($startDev -eq "y" -or $startDev -eq "Y") {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev:fast
}
