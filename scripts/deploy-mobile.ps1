# Deploy Mobile App - All options
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release", "aab", "ios", "all")]
    [string]$BuildType = "debug"
)

Write-Host "🚀 ThoHCM Mobile App Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Navigate to mobile app directory
$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
if (!(Test-Path $appPath)) {
    Write-Host "❌ Mobile app directory not found: $appPath" -ForegroundColor Red
    exit 1
}

Set-Location $appPath
Write-Host "📂 Working directory: $appPath" -ForegroundColor Green

# Pre-build steps
function Prepare-Build {
    Write-Host "`n🧹 Preparing build environment..." -ForegroundColor Yellow
    
    # Clean previous builds
    flutter clean
    Write-Host "   ✅ Cleaned previous builds" -ForegroundColor Green
    
    # Get dependencies
    flutter pub get
    Write-Host "   ✅ Downloaded dependencies" -ForegroundColor Green
    
    # Check Flutter doctor
    Write-Host "`n🏥 Checking Flutter health..." -ForegroundColor Yellow
    flutter doctor --verbose
}

# Build functions
function Build-DebugApk {
    Write-Host "`n🔨 Building Debug APK..." -ForegroundColor Yellow
    flutter build apk --debug
    
    $apkPath = "build\app\outputs\flutter-apk\app-debug.apk"
    if (Test-Path $apkPath) {
        $fileSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "✅ Debug APK: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host "📍 Location: $apkPath" -ForegroundColor Cyan
    }
}

function Build-ReleaseApk {
    Write-Host "`n🔨 Building Release APK..." -ForegroundColor Yellow
    flutter build apk --release
    
    $apkPath = "build\app\outputs\flutter-apk\app-release.apk"
    if (Test-Path $apkPath) {
        $fileSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "✅ Release APK: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host "📍 Location: $apkPath" -ForegroundColor Cyan
    }
}

function Build-AAB {
    Write-Host "`n📦 Building Android App Bundle..." -ForegroundColor Yellow
    flutter build appbundle --release
    
    $aabPath = "build\app\outputs\bundle\release\app-release.aab"
    if (Test-Path $aabPath) {
        $fileSize = (Get-Item $aabPath).Length / 1MB
        Write-Host "✅ AAB: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host "📍 Location: $aabPath" -ForegroundColor Cyan
        Write-Host "🏪 Ready for Google Play Store!" -ForegroundColor Green
    }
}

function Build-iOS {
    if ($IsMacOS) {
        Write-Host "`n🍎 Building iOS..." -ForegroundColor Yellow
        flutter build ios --release
        Write-Host "✅ iOS build completed!" -ForegroundColor Green
    } else {
        Write-Host "❌ iOS build requires macOS!" -ForegroundColor Red
    }
}

# Main execution
try {
    Prepare-Build
    
    switch ($BuildType.ToLower()) {
        "debug" { Build-DebugApk }
        "release" { Build-ReleaseApk }
        "aab" { Build-AAB }
        "ios" { Build-iOS }
        "all" { 
            Build-DebugApk
            Build-ReleaseApk 
            Build-AAB
            Build-iOS
        }
    }
    
    Write-Host "`n🎉 Build process completed!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "🔧 Testing: Install APK on device for testing" -ForegroundColor White
Write-Host "🏪 Google Play: Upload AAB to Google Play Console" -ForegroundColor White
Write-Host "🍎 App Store: Use Xcode to archive and upload iOS" -ForegroundColor White
Write-Host "🚀 CI/CD: Automate with GitHub Actions or similar" -ForegroundColor White