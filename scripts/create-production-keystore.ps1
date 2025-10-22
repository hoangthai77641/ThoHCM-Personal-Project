# Create Production Keystore for Google Play Store
Write-Host "🔐 Creating Production Keystore for Play Store..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

# Tạo thư mục android nếu chưa có
if (-not (Test-Path "android\app")) {
    Write-Host "❌ Android app directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Keystore Information Setup:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Keystore configuration
$keystorePath = "android\app\thohcm-release-key.jks"
$keyAlias = "thohcm-release"
$keySize = 2048
$validity = 25000  # ~68 years

Write-Host "Keystore file: $keystorePath" -ForegroundColor Cyan
Write-Host "Key alias: $keyAlias" -ForegroundColor Cyan
Write-Host "Key size: $keySize bits" -ForegroundColor Cyan
Write-Host "Validity: $validity days (~68 years)" -ForegroundColor Cyan

Write-Host "`n⚠️  IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host "1. You will be prompted for passwords - REMEMBER THEM!" -ForegroundColor Yellow
Write-Host "2. Store keystore file safely - losing it means you can't update your app!" -ForegroundColor Yellow
Write-Host "3. Never share keystore file publicly!" -ForegroundColor Yellow
Write-Host "4. Backup keystore file to secure location!" -ForegroundColor Yellow

Write-Host "`n🔧 Creating keystore..." -ForegroundColor Green

try {
    # Create keystore
    $keytoolCommand = @"
keytool -genkey -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize $keySize -validity $validity
"@

    Write-Host "Running command:" -ForegroundColor Cyan
    Write-Host $keytoolCommand -ForegroundColor Gray
    
    Write-Host "`n📝 You will be asked for:" -ForegroundColor Yellow
    Write-Host "- Keystore password (remember this!)" -ForegroundColor White
    Write-Host "- Key password (can be same as keystore)" -ForegroundColor White
    Write-Host "- Your name and organization details" -ForegroundColor White
    
    # Run keytool
    Invoke-Expression $keytoolCommand
    
    if (Test-Path $keystorePath) {
        Write-Host "`n✅ Keystore created successfully!" -ForegroundColor Green
        Write-Host "📍 Location: $keystorePath" -ForegroundColor Cyan
        
        # Get file size
        $fileInfo = Get-Item $keystorePath
        Write-Host "📊 Size: $($fileInfo.Length) bytes" -ForegroundColor Cyan
        
        # Create key.properties file
        Write-Host "`n📝 Creating key.properties file..." -ForegroundColor Yellow
        
        $keyPropertiesContent = @"
storePassword=YOUR_KEYSTORE_PASSWORD_HERE
keyPassword=YOUR_KEY_PASSWORD_HERE
keyAlias=$keyAlias
storeFile=$keystorePath
"@
        
        $keyPropertiesPath = "android\key.properties"
        Set-Content -Path $keyPropertiesPath -Value $keyPropertiesContent
        
        Write-Host "✅ key.properties template created at: $keyPropertiesPath" -ForegroundColor Green
        Write-Host "⚠️  EDIT key.properties file with your actual passwords!" -ForegroundColor Red
        
        # Extract SHA1 for Firebase
        Write-Host "`n🔐 Extracting SHA1 fingerprint for Firebase..." -ForegroundColor Yellow
        Write-Host "Command to get SHA1:" -ForegroundColor Cyan
        Write-Host "keytool -list -v -keystore $keystorePath -alias $keyAlias" -ForegroundColor Gray
        
    } else {
        Write-Host "`n❌ Keystore creation failed!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ Error creating keystore: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "1. Edit android\key.properties with actual passwords" -ForegroundColor White
Write-Host "2. Update android\app\build.gradle.kts for signing" -ForegroundColor White
Write-Show "3. Get production SHA1 and add to Firebase" -ForegroundColor White
Write-Host "4. Build signed AAB: flutter build appbundle --release" -ForegroundColor White