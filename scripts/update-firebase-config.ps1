# Update Firebase Configuration After Adding SHA1
Write-Host "🔥 Updating Firebase Configuration..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

$firebaseConfig = "android\app\google-services.json"

Write-Host "`n📋 Current Firebase Configuration:" -ForegroundColor Yellow

if (Test-Path $firebaseConfig) {
    $configInfo = Get-Item $firebaseConfig
    Write-Host "✅ File exists: $firebaseConfig" -ForegroundColor Green
    Write-Host "📊 Size: $($configInfo.Length) bytes" -ForegroundColor Cyan
    Write-Host "📅 Last modified: $($configInfo.LastWriteTime)" -ForegroundColor Cyan
    
    # Backup current config
    $backupPath = "android\app\google-services.json.backup"
    Copy-Item $firebaseConfig $backupPath -Force
    Write-Host "✅ Backed up to: $backupPath" -ForegroundColor Green
    
} else {
    Write-Host "❌ Firebase config not found: $firebaseConfig" -ForegroundColor Red
}

Write-Host "`n🔐 Production SHA1 Fingerprint:" -ForegroundColor Yellow
Write-Host "E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93" -ForegroundColor Cyan

Write-Host "`n📝 Steps to add SHA1 to Firebase:" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Select 'ThoHCM Frontend' project" -ForegroundColor White
Write-Host "3. Settings > Project settings" -ForegroundColor White
Write-Host "4. Find Android app (com.thohcm.workerapp)" -ForegroundColor White
Write-Host "5. Add fingerprint > SHA-1" -ForegroundColor White
Write-Host "6. Paste: E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93" -ForegroundColor White
Write-Host "7. Save" -ForegroundColor White
Write-Host "8. Download new google-services.json" -ForegroundColor White
Write-Host "9. Replace $firebaseConfig" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "- Keep both debug AND production SHA1 in Firebase" -ForegroundColor Yellow
Write-Host "- Debug SHA1: 48:F1:AE:73:33:71:15:D9:51:DE:DD:7D:DB:84:BB:59:FF:3B:76:63" -ForegroundColor Gray
Write-Host "- Production SHA1: E3:F4:62:8F:CF:42:45:35:19:EB:90:95:4F:92:93:BF:C7:A9:C3:93" -ForegroundColor Cyan

Write-Host "`n📱 After updating google-services.json:" -ForegroundColor Yellow
Write-Host "1. flutter clean" -ForegroundColor White
Write-Host "2. flutter pub get" -ForegroundColor White
Write-Host "3. Test the app with Firebase features" -ForegroundColor White

# Check if new file is downloaded
Write-Host "`n🔍 Waiting for new google-services.json..." -ForegroundColor Yellow
Write-Host "Press Enter after you've downloaded and replaced the file..." -ForegroundColor Gray
Read-Host

if (Test-Path $firebaseConfig) {
    $newConfigInfo = Get-Item $firebaseConfig
    Write-Host "`n✅ Updated Firebase Configuration:" -ForegroundColor Green
    Write-Host "📊 New size: $($newConfigInfo.Length) bytes" -ForegroundColor Cyan
    Write-Host "📅 Last modified: $($newConfigInfo.LastWriteTime)" -ForegroundColor Cyan
    
    # Clean and rebuild
    Write-Host "`n🧹 Cleaning and rebuilding..." -ForegroundColor Yellow
    flutter clean
    flutter pub get
    
    Write-Host "`n🎯 Ready to test Firebase with production keystore!" -ForegroundColor Green
} else {
    Write-Host "`n❌ google-services.json not found. Please download and place it in android\app\" -ForegroundColor Red
}