# Build and Upload to Google Play Store Script
# This script automates the build process for Play Store deployment

param(
    [switch]$Clean,
    [switch]$SkipBuild,
    [switch]$OpenOutputFolder
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Google Play Store Build Script" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Green

# Define paths
$ProjectRoot = "d:\Thai\root\ThoHCM"
$MobileAppPath = "$ProjectRoot\mobile\worker_app"
$OutputPath = "$MobileAppPath\build\app\outputs\bundle\release"
$AABFile = "$OutputPath\app-release.aab"

# Check if Flutter is installed
Write-Host "🔍 Checking Flutter installation..." -ForegroundColor Cyan
try {
    $flutterVersion = flutter --version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ Flutter found: $flutterVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Flutter not found! Please install Flutter first." -ForegroundColor Red
    exit 1
}

# Navigate to mobile app directory
Write-Host "`n📂 Navigating to mobile app directory..." -ForegroundColor Cyan
Set-Location $MobileAppPath
Write-Host "   ✅ Current directory: $MobileAppPath" -ForegroundColor Green

# Clean build (if requested)
if ($Clean) {
    Write-Host "`n🧹 Cleaning previous builds..." -ForegroundColor Cyan
    flutter clean
    Write-Host "   ✅ Clean completed" -ForegroundColor Green
}

# Get dependencies
Write-Host "`n📦 Getting Flutter dependencies..." -ForegroundColor Cyan
flutter pub get
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to get dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Dependencies updated" -ForegroundColor Green

# Check for issues
Write-Host "`n🔍 Running Flutter doctor..." -ForegroundColor Cyan
flutter doctor
Write-Host ""

# Read current version
Write-Host "`n📋 Checking app version..." -ForegroundColor Cyan
$pubspecContent = Get-Content "$MobileAppPath\pubspec.yaml" -Raw
if ($pubspecContent -match "version:\s*(\d+\.\d+\.\d+)\+(\d+)") {
    $versionName = $matches[1]
    $buildNumber = $matches[2]
    Write-Host "   ✅ Version: $versionName (Build $buildNumber)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Could not parse version from pubspec.yaml" -ForegroundColor Yellow
}

# Check keystore
Write-Host "`n🔑 Verifying keystore configuration..." -ForegroundColor Cyan
$keystorePath = "$MobileAppPath\android\app\thohcm-release-key.jks"
if (Test-Path $keystorePath) {
    Write-Host "   ✅ Keystore found: thohcm-release-key.jks" -ForegroundColor Green
} else {
    Write-Host "   ❌ Keystore not found!" -ForegroundColor Red
    Write-Host "      Expected path: $keystorePath" -ForegroundColor Yellow
    exit 1
}

$keyPropsPath = "$MobileAppPath\android\key.properties"
if (Test-Path $keyPropsPath) {
    Write-Host "   ✅ Key properties found" -ForegroundColor Green
} else {
    Write-Host "   ❌ key.properties not found!" -ForegroundColor Red
    exit 1
}

# Build AAB (if not skipped)
if (-not $SkipBuild) {
    Write-Host "`n🔨 Building App Bundle (AAB) for release..." -ForegroundColor Cyan
    Write-Host "   This may take several minutes..." -ForegroundColor Yellow
    
    flutter build appbundle --release
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n   ❌ Build failed! Check errors above." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n   ✅ Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⏭️  Skipping build (using existing AAB)" -ForegroundColor Yellow
}

# Verify output
Write-Host "`n📦 Verifying output file..." -ForegroundColor Cyan
if (Test-Path $AABFile) {
    $fileSize = (Get-Item $AABFile).Length / 1MB
    Write-Host "   ✅ AAB file found!" -ForegroundColor Green
    Write-Host "   📁 Location: $AABFile" -ForegroundColor White
    Write-Host "   📊 Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
} else {
    Write-Host "   ❌ AAB file not found!" -ForegroundColor Red
    exit 1
}

# Generate SHA-1 fingerprint (for Firebase)
Write-Host "`n🔐 Generating SHA-1 fingerprint..." -ForegroundColor Cyan
try {
    $keyPassword = Read-Host "Enter keystore password" -AsSecureString
    $keyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))
    
    $sha1Output = keytool -list -v -keystore $keystorePath -alias thohcm -storepass $keyPasswordPlain 2>&1
    
    if ($sha1Output -match "SHA1:\s*([A-F0-9:]+)") {
        $sha1 = $matches[1]
        Write-Host "   ✅ SHA-1: $sha1" -ForegroundColor Green
        Write-Host "   💡 Add this to Firebase Console if not already added" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not generate SHA-1. Please verify manually." -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Green
Write-Host "🎉 Build Complete - Ready for Upload!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Go to Google Play Console" -ForegroundColor White
Write-Host "   2. Navigate to: Production > Create new release" -ForegroundColor White
Write-Host "   3. Upload this file:" -ForegroundColor White
Write-Host "      $AABFile" -ForegroundColor Cyan
Write-Host "   4. Fill in release notes (version $versionName)" -ForegroundColor White
Write-Host "   5. Review and click 'Start rollout to Production'" -ForegroundColor White

Write-Host "`n📊 Build Info:" -ForegroundColor Yellow
Write-Host "   Version Name: $versionName" -ForegroundColor White
Write-Host "   Build Number: $buildNumber" -ForegroundColor White
Write-Host "   Package: com.thohcm.workerapp" -ForegroundColor White
Write-Host "   AAB Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White

Write-Host "`n💡 Useful Links:" -ForegroundColor Yellow
Write-Host "   Play Console: https://play.google.com/console" -ForegroundColor Cyan
Write-Host "   App Dashboard: https://play.google.com/console/u/0/developers/5872046532242430627/app-list" -ForegroundColor Cyan

# Open output folder if requested
if ($OpenOutputFolder) {
    Write-Host "`n📂 Opening output folder..." -ForegroundColor Cyan
    explorer $OutputPath
}

Write-Host "`n✅ Script completed successfully!`n" -ForegroundColor Green

# Return to project root
Set-Location $ProjectRoot
