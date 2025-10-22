# Build Android App Bundle (AAB) cho Google Play Store
Write-Host "📦 Building Android App Bundle (AAB)..." -ForegroundColor Green

# Navigate to mobile app directory
Set-Location "D:\Thai\root\ThoHCM\mobile\worker_app"

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
flutter clean

# Get dependencies
Write-Host "📦 Getting dependencies..." -ForegroundColor Yellow
flutter pub get

# Build AAB
Write-Host "🔨 Building AAB..." -ForegroundColor Yellow
flutter build appbundle --release

# Show output location
$aabPath = "build\app\outputs\bundle\release\app-release.aab"
if (Test-Path $aabPath) {
    Write-Host "✅ AAB built successfully!" -ForegroundColor Green
    Write-Host "📍 Location: $aabPath" -ForegroundColor Cyan
    
    # Get file size
    $fileSize = (Get-Item $aabPath).Length / 1MB
    Write-Host "📊 File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "" -ForegroundColor White
    Write-Host "🏪 Ready for Google Play Store upload!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to Google Play Console" -ForegroundColor White
    Write-Host "   2. Create new app or new release" -ForegroundColor White
    Write-Host "   3. Upload this AAB file" -ForegroundColor White
    Write-Host "   4. Fill app information and submit for review" -ForegroundColor White
} else {
    Write-Host "❌ AAB build failed!" -ForegroundColor Red
}