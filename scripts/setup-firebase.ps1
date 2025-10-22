# Script để setup Firebase cho Android
Write-Host "🔥 Setting up Firebase for Android..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
$androidAppPath = "$appPath\android\app"

Write-Host "📍 Application ID: com.thohcm.workerapp" -ForegroundColor Cyan
Write-Host "📂 Target directory: $androidAppPath" -ForegroundColor Cyan

# Check if google-services.json exists
$googleServicesPath = "$androidAppPath\google-services.json"
if (Test-Path $googleServicesPath) {
    Write-Host "✅ google-services.json already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  google-services.json not found!" -ForegroundColor Yellow
    Write-Host "📝 Please download from Firebase Console and place at:" -ForegroundColor Yellow
    Write-Host "   $googleServicesPath" -ForegroundColor Cyan
}

Write-Host "`n🔧 Firebase Setup Steps:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host "1. Go to https://console.firebase.google.com" -ForegroundColor White
Write-Host "2. Create new project: 'ThoHCM-Worker-App'" -ForegroundColor White
Write-Host "3. Add Android app with package: com.thohcm.workerapp" -ForegroundColor White
Write-Host "4. Download google-services.json" -ForegroundColor White
Write-Host "5. Place file at: android\app\google-services.json" -ForegroundColor White
Write-Host "6. Run this script again to configure dependencies" -ForegroundColor White

# Check and update build.gradle configurations
Write-Host "`n⚙️  Build Configuration Status:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Check project-level build.gradle
$projectBuildGradle = "$appPath\android\build.gradle.kts"
if (Test-Path $projectBuildGradle) {
    $content = Get-Content $projectBuildGradle -Raw
    if ($content -match "google-services") {
        Write-Host "✅ Project-level build.gradle has Google Services plugin" -ForegroundColor Green
    } else {
        Write-Host "❌ Need to add Google Services plugin to project build.gradle" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Project build.gradle not found" -ForegroundColor Red
}

# Check app-level build.gradle
$appBuildGradle = "$androidAppPath\build.gradle.kts"
if (Test-Path $appBuildGradle) {
    $content = Get-Content $appBuildGradle -Raw
    if ($content -match "google-services") {
        Write-Host "✅ App-level build.gradle has Google Services plugin" -ForegroundColor Green
    } else {
        Write-Host "❌ Need to add Google Services plugin to app build.gradle" -ForegroundColor Red
    }
} else {
    Write-Host "❌ App build.gradle not found" -ForegroundColor Red
}