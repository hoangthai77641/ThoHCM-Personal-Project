# Build Release APK cho production
Write-Host "🔨 Building Release APK..." -ForegroundColor Green

# Navigate to mobile app directory
Set-Location "D:\Thai\root\ThoHCM\mobile\worker_app"

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
flutter clean

# Get dependencies
Write-Host "📦 Getting dependencies..." -ForegroundColor Yellow
flutter pub get

# Build release APK
Write-Host "🔨 Building release APK..." -ForegroundColor Yellow
flutter build apk --release

# Show output location
$apkPath = "build\app\outputs\flutter-apk\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "✅ Release APK built successfully!" -ForegroundColor Green
    Write-Host "📍 Location: $apkPath" -ForegroundColor Cyan
    
    # Get file size
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "📊 File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    
    # Show signing info
    Write-Host "🔐 Signing: Debug key (for testing only)" -ForegroundColor Yellow
    Write-Host "⚠️  For production, use proper signing key!" -ForegroundColor Red
} else {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
}