# Take App Screenshots Script
Write-Host "📱 Screenshot Taking Assistant for ThoHCM App" -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app" 
$assetsPath = "D:\Thai\root\ThoHCM\assets"

Set-Location $appPath

Write-Host "`n🎯 Screenshot Plan:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "1. Home/Dashboard - Show main services list" -ForegroundColor White
Write-Host "2. Service Booking - Show booking flow" -ForegroundColor White
Write-Host "3. Worker Profile - Show worker details & reviews" -ForegroundColor White
Write-Host "4. Chat/Messaging - Show communication" -ForegroundColor White
Write-Host "5. Booking Management - Show active bookings" -ForegroundColor White

Write-Host "`n📋 Screenshot Requirements:" -ForegroundColor Yellow
Write-Host "- Size: 1080x1920 (9:16) or 1280x720 (16:9)" -ForegroundColor White
Write-Host "- Format: PNG or JPG" -ForegroundColor White
Write-Host "- Minimum: 2 screenshots" -ForegroundColor White  
Write-Host "- Maximum: 8 screenshots" -ForegroundColor White

Write-Host "`n🚀 Starting Flutter app..." -ForegroundColor Green

# Check if emulator is running
$emulators = flutter emulators 2>$null
if ($emulators) {
    Write-Host "✅ Available emulators found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No emulators detected. Please start an Android emulator first." -ForegroundColor Yellow
}

Write-Host "`n📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. I'll start the Flutter app" -ForegroundColor White
Write-Host "2. Navigate to different screens" -ForegroundColor White
Write-Host "3. Use emulator screenshot button (camera icon)" -ForegroundColor White
Write-Host "4. Or use: Ctrl+S in emulator" -ForegroundColor White
Write-Host "5. Save screenshots to: $assetsPath\screenshots\phone\" -ForegroundColor White

$response = Read-Host "`nPress Enter to start Flutter app, or type 'skip' to skip"

if ($response -ne "skip") {
    try {
        Write-Host "`n🏃 Starting Flutter app in debug mode..." -ForegroundColor Green
        Write-Host "Use Ctrl+C to stop the app when done taking screenshots" -ForegroundColor Yellow
        
        # Run Flutter app
        flutter run --debug
        
    } catch {
        Write-Host "`n❌ Error starting Flutter app: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Try: flutter run manually in terminal" -ForegroundColor Yellow
    }
}

Write-Host "`n📸 After taking screenshots:" -ForegroundColor Yellow
Write-Host "1. Copy screenshots to: $assetsPath\screenshots\phone\" -ForegroundColor White
Write-Host "2. Rename files:" -ForegroundColor White
Write-Host "   - 1-home-dashboard.png" -ForegroundColor Gray
Write-Host "   - 2-service-booking.png" -ForegroundColor Gray
Write-Host "   - 3-worker-profile.png" -ForegroundColor Gray
Write-Host "   - 4-chat-messaging.png" -ForegroundColor Gray
Write-Host "   - 5-booking-management.png" -ForegroundColor Gray

Write-Host "`n🖼️ Optional: Add device frames" -ForegroundColor Yellow
Write-Host "- Visit: https://deviceframes.com/" -ForegroundColor Cyan
Write-Host "- Upload your screenshots" -ForegroundColor White
Write-Host "- Select device frame (Pixel, Samsung)" -ForegroundColor White
Write-Host "- Download framed versions" -ForegroundColor White

Write-Host "`n✅ Screenshot taking session completed!" -ForegroundColor Green