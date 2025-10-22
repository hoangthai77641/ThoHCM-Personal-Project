# Test Firebase Setup
Write-Host "🔥 Testing Firebase Configuration..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

# Check if google-services.json exists
$googleServicesFile = "android\app\google-services.json"
if (Test-Path $googleServicesFile) {
    Write-Host "✅ google-services.json found in correct location" -ForegroundColor Green
    
    # Get file size
    $fileSize = (Get-Item $googleServicesFile).Length
    Write-Host "📊 File size: $fileSize bytes" -ForegroundColor Cyan
    
    # Check if it's a valid JSON
    try {
        $jsonContent = Get-Content $googleServicesFile -Raw | ConvertFrom-Json
        $projectId = $jsonContent.project_info.project_id
        $packageName = $jsonContent.client[0].client_info.android_client_info.package_name
        
        Write-Host "📋 Project ID: $projectId" -ForegroundColor Cyan
        Write-Host "📱 Package Name: $packageName" -ForegroundColor Cyan
        
        if ($packageName -eq "com.thohcm.workerapp") {
            Write-Host "✅ Package name matches app configuration" -ForegroundColor Green
        } else {
            Write-Host "❌ Package name mismatch! Expected: com.thohcm.workerapp, Got: $packageName" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Invalid JSON format in google-services.json" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ google-services.json not found!" -ForegroundColor Red
    Write-Host "Expected location: $googleServicesFile" -ForegroundColor Yellow
}

# Check gradle configuration
Write-Host "`n🔧 Checking Gradle configuration..." -ForegroundColor Yellow

$projectBuildGradle = "android\build.gradle.kts"
$appBuildGradle = "android\app\build.gradle.kts"

if (Test-Path $projectBuildGradle) {
    $projectContent = Get-Content $projectBuildGradle -Raw
    if ($projectContent -match "google-services") {
        Write-Host "✅ Project-level Gradle configured for Firebase" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Project-level Gradle may need Firebase configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Project build.gradle.kts not found" -ForegroundColor Red
}

if (Test-Path $appBuildGradle) {
    $appContent = Get-Content $appBuildGradle -Raw
    if ($appContent -match "google-services" -and $appContent -match "firebase") {
        Write-Host "✅ App-level Gradle configured for Firebase" -ForegroundColor Green
    } else {
        Write-Host "⚠️  App-level Gradle may need Firebase configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ App build.gradle.kts not found" -ForegroundColor Red
}

# Check pubspec.yaml
Write-Host "`n📦 Checking Flutter dependencies..." -ForegroundColor Yellow

$pubspecFile = "pubspec.yaml"
if (Test-Path $pubspecFile) {
    $pubspecContent = Get-Content $pubspecFile -Raw
    
    $firebasePackages = @("firebase_core", "firebase_messaging", "firebase_analytics")
    $foundPackages = @()
    
    foreach ($package in $firebasePackages) {
        if ($pubspecContent -match $package) {
            $foundPackages += $package
            Write-Host "✅ $package found in pubspec.yaml" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $package not found in pubspec.yaml" -ForegroundColor Yellow
        }
    }
    
    if ($foundPackages.Count -eq $firebasePackages.Count) {
        Write-Host "`n🎉 All Firebase packages configured!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Some Firebase packages missing" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ pubspec.yaml not found" -ForegroundColor Red
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: flutter pub get" -ForegroundColor White
Write-Host "2. Run: flutter build apk --debug" -ForegroundColor White
Write-Host "3. Check for Firebase initialization in app logs" -ForegroundColor White

Write-Host "`n🔥 Firebase Configuration Check Complete!" -ForegroundColor Green