# Clean Build Script - Fix Kotlin and Java warnings
Write-Host "🧹 Cleaning build artifacts và fix warnings..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

Write-Host "`n1. 🗑️ Flutter clean..." -ForegroundColor Yellow
flutter clean

Write-Host "`n2. 🗑️ Cleaning Gradle cache..." -ForegroundColor Yellow
if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle"
    Write-Host "✅ Removed android\.gradle" -ForegroundColor Green
}

if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "✅ Removed build directory" -ForegroundColor Green
}

Write-Host "`n3. 📦 Getting dependencies..." -ForegroundColor Yellow
flutter pub get

Write-Host "`n4. 🔧 Building clean APK..." -ForegroundColor Yellow
flutter build apk --release

Write-Host "`n✅ Clean build completed!" -ForegroundColor Green
Write-Host "📱 APK location: build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor Cyan