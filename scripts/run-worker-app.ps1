# ThoHCM Worker App Development Setup
Write-Host "🚀 Starting ThoHCM Worker App Development Setup..." -ForegroundColor Green
Write-Host ""

# Check Flutter installation
Write-Host "📱 Checking Flutter installation..." -ForegroundColor Yellow
try {
    $flutterVersion = flutter --version 2>$null
    Write-Host "✅ Flutter is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Flutter not found! Please install Flutter first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔧 Getting Flutter dependencies..." -ForegroundColor Yellow
Set-Location "mobile\worker_app"

try {
    flutter pub get
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📋 Available devices:" -ForegroundColor Yellow
flutter devices

Write-Host ""
Write-Host "🎯 Configuration:" -ForegroundColor Cyan
Write-Host "API Base URL: https://thohcm-application-475603.as.r.appspot.com"
Write-Host "WebSocket URL: https://thohcm-application-475603.as.r.appspot.com"
Write-Host ""

Write-Host "🔥 Building and running on Android emulator..." -ForegroundColor Green
Write-Host "Make sure Android Studio emulator is running!" -ForegroundColor Yellow
Write-Host ""

try {
    flutter run --debug
} catch {
    Write-Host "❌ Failed to run app!" -ForegroundColor Red
}

Read-Host "Press Enter to exit"