# Build Debug APK cho testing
Write-Host "🔨 Building Debug APK..." -ForegroundColor Green

# Navigate to mobile app directory
Set-Location "D:\Thai\root\ThoHCM\mobile\worker_app"

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
flutter clean

# Get dependencies
Write-Host "📦 Getting dependencies..." -ForegroundColor Yellow
flutter pub get

# Build debug APK
Write-Host "🔨 Building debug APK..." -ForegroundColor Yellow
flutter build apk --debug

# Show output location
$apkPath = "build\app\outputs\flutter-apk\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "✅ Debug APK built successfully!" -ForegroundColor Green
    Write-Host "📍 Location: $apkPath" -ForegroundColor Cyan
    
    # Get file size
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "📊 File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
}