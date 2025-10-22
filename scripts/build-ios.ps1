# Build iOS app (chỉ chạy được trên macOS)
Write-Host "🍎 Building iOS App..." -ForegroundColor Green

# Check if running on macOS
if ($IsMacOS) {
    Write-Host "✅ Running on macOS" -ForegroundColor Green
    
    # Navigate to mobile app directory
    Set-Location "D:\Thai\root\ThoHCM\mobile\worker_app"
    
    # Clean previous builds
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    flutter clean
    
    # Get dependencies
    Write-Host "📦 Getting dependencies..." -ForegroundColor Yellow
    flutter pub get
    
    # Build iOS
    Write-Host "🔨 Building iOS..." -ForegroundColor Yellow
    flutter build ios --release
    
    Write-Host "✅ iOS build completed!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Open ios/Runner.xcworkspace in Xcode" -ForegroundColor White
    Write-Host "   2. Configure signing & capabilities" -ForegroundColor White
    Write-Host "   3. Archive and upload to App Store Connect" -ForegroundColor White
    
} else {
    Write-Host "❌ iOS build requires macOS!" -ForegroundColor Red
    Write-Host "💡 Use macOS machine or CI/CD with macOS runner" -ForegroundColor Yellow
}