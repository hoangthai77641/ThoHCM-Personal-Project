# Build App Bundle for Google Play Store
Write-Host "📦 Building App Bundle for Google Play Store..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

Write-Host "`n🔍 Pre-build checks..." -ForegroundColor Yellow

# Check if keystore exists
$keystorePath = "android\app\thohcm-release-key.jks"
$keyPropertiesPath = "android\key.properties"

if (-not (Test-Path $keystorePath)) {
    Write-Host "❌ Production keystore not found: $keystorePath" -ForegroundColor Red
    Write-Host "💡 Run: .\scripts\create-production-keystore.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $keyPropertiesPath)) {
    Write-Host "❌ key.properties not found: $keyPropertiesPath" -ForegroundColor Red
    Write-Host "💡 Create key.properties file with your keystore passwords" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Keystore found: $keystorePath" -ForegroundColor Green
Write-Host "✅ Key properties found: $keyPropertiesPath" -ForegroundColor Green

# Check Firebase config
$firebaseConfig = "android\app\google-services.json"
if (-not (Test-Path $firebaseConfig)) {
    Write-Host "⚠️  Firebase config not found: $firebaseConfig" -ForegroundColor Yellow
} else {
    Write-Host "✅ Firebase config found: $firebaseConfig" -ForegroundColor Green
}

Write-Host "`n🧹 Cleaning previous builds..." -ForegroundColor Yellow
flutter clean
flutter pub get

Write-Host "`n📦 Building App Bundle (AAB)..." -ForegroundColor Green
Write-Host "This may take several minutes..." -ForegroundColor Gray

try {
    # Build App Bundle
    flutter build appbundle --release

    if (Test-Path "build\app\outputs\bundle\release\app-release.aab") {
        Write-Host "`n✅ App Bundle built successfully!" -ForegroundColor Green
        
        $aabFile = Get-Item "build\app\outputs\bundle\release\app-release.aab"
        Write-Host "📍 Location: $($aabFile.FullName)" -ForegroundColor Cyan
        Write-Host "📊 Size: $([math]::Round($aabFile.Length / 1MB, 2)) MB" -ForegroundColor Cyan
        
        Write-Host "`n📋 Next steps for Play Store:" -ForegroundColor Yellow
        Write-Host "================================" -ForegroundColor Yellow
        Write-Host "1. Go to Google Play Console" -ForegroundColor White
        Write-Host "2. Create new app or select existing" -ForegroundColor White
        Write-Host "3. Upload AAB file: app-release.aab" -ForegroundColor White
        Write-Host "4. Fill in app details and store listing" -ForegroundColor White
        Write-Host "5. Complete content rating" -ForegroundColor White
        Write-Host "6. Submit for review" -ForegroundColor White
        
        Write-Host "`n🔐 Don't forget to:" -ForegroundColor Red
        Write-Host "- Add production SHA1 to Firebase Console" -ForegroundColor White
        Write-Host "- Test app thoroughly before submission" -ForegroundColor White
        Write-Host "- Backup your keystore file safely!" -ForegroundColor White
        
    } else {
        Write-Host "`n❌ App Bundle build failed!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔗 Useful links:" -ForegroundColor Yellow
Write-Host "Google Play Console: https://play.google.com/console" -ForegroundColor Cyan
Write-Host "App signing guide: https://developer.android.com/studio/publish/app-signing" -ForegroundColor Cyan