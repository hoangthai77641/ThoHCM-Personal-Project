# Cấu hình App Signing cho Production
Write-Host "🔐 Setting up App Signing..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
$keystorePath = "$appPath\android\app\thohcm-key.jks"

# Check if keystore exists
if (!(Test-Path $keystorePath)) {
    Write-Host "🔑 Creating new keystore..." -ForegroundColor Yellow
    Write-Host "⚠️  Please run this command manually in Android Studio or with keytool:" -ForegroundColor Red
    Write-Host ""
    Write-Host "keytool -genkey -v -keystore android/app/thohcm-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias thohcm" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Save the keystore password securely!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Keystore already exists: $keystorePath" -ForegroundColor Green
}

# Create key.properties template
$keyPropertiesPath = "$appPath\android\key.properties"
if (!(Test-Path $keyPropertiesPath)) {
    Write-Host "📝 Creating key.properties template..." -ForegroundColor Yellow
    
    $keyPropertiesContent = @"
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=thohcm
storeFile=thohcm-key.jks
"@
    
    $keyPropertiesContent | Out-File -FilePath $keyPropertiesPath -Encoding UTF8
    Write-Host "✅ Created: $keyPropertiesPath" -ForegroundColor Green
    Write-Host "⚠️  Please edit this file with your actual passwords!" -ForegroundColor Yellow
}

# Show build.gradle configuration
Write-Host "`n📱 Android build.gradle configuration:" -ForegroundColor Yellow
Write-Host "=====================================/" -ForegroundColor Yellow

$buildGradleConfig = @"
// Add this before android block
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing configuration ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
"@

Write-Host $buildGradleConfig -ForegroundColor Cyan

Write-Host "`n📝 Manual Steps Required:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "1. Generate keystore using keytool command above" -ForegroundColor White
Write-Host "2. Edit key.properties with actual passwords" -ForegroundColor White
Write-Host "3. Add signing configuration to android/app/build.gradle" -ForegroundColor White
Write-Host "4. Test with: flutter build apk --release" -ForegroundColor White