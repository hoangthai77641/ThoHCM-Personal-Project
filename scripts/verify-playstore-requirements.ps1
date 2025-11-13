# Google Play Store Requirements Verification Script
# Checks if all requirements are met before submission

$ErrorActionPreference = "Continue"

Write-Host "`n🔍 Google Play Store Requirements Checker" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

# Define paths
$ProjectRoot = "d:\Thai\root\ThoHCM"
$MobileAppPath = "$ProjectRoot\mobile\worker_app"
$DocsPath = "$ProjectRoot\docs"
$AssetsPath = "$MobileAppPath\assets\playstore"

# Tracking
$totalChecks = 0
$passedChecks = 0
$warnings = @()
$errors = @()

function Test-Requirement {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$ErrorMessage,
        [bool]$IsWarning = $false
    )
    
    $script:totalChecks++
    
    if ($Condition) {
        Write-Host "   ✅ $Name" -ForegroundColor Green
        $script:passedChecks++
        return $true
    } else {
        if ($IsWarning) {
            Write-Host "   ⚠️  $Name" -ForegroundColor Yellow
            $script:warnings += $ErrorMessage
        } else {
            Write-Host "   ❌ $Name" -ForegroundColor Red
            $script:errors += $ErrorMessage
        }
        return $false
    }
}

# ============================================
# 1. APP BUILD REQUIREMENTS
# ============================================
Write-Host "📦 1. APP BUILD REQUIREMENTS" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan

# Check AAB file exists
$aabPath = "$MobileAppPath\build\app\outputs\bundle\release\app-release.aab"
Test-Requirement `
    -Name "Release AAB file exists" `
    -Condition (Test-Path $aabPath) `
    -ErrorMessage "AAB file not found. Run 'flutter build appbundle --release' first."

# Check AAB size
if (Test-Path $aabPath) {
    $aabSize = (Get-Item $aabPath).Length / 1MB
    Test-Requirement `
        -Name "AAB size under 150MB limit" `
        -Condition ($aabSize -lt 150) `
        -ErrorMessage "AAB file is too large: $([math]::Round($aabSize, 2)) MB"
}

# Check keystore
$keystorePath = "$MobileAppPath\android\app\thohcm-release-key.jks"
Test-Requirement `
    -Name "Production keystore exists" `
    -Condition (Test-Path $keystorePath) `
    -ErrorMessage "Keystore file not found at: $keystorePath"

# Check key.properties
$keyPropsPath = "$MobileAppPath\android\key.properties"
Test-Requirement `
    -Name "Key properties configured" `
    -Condition (Test-Path $keyPropsPath) `
    -ErrorMessage "key.properties not found. Signing may fail."

# Check version in pubspec.yaml
$pubspecPath = "$MobileAppPath\pubspec.yaml"
if (Test-Path $pubspecPath) {
    $pubspecContent = Get-Content $pubspecPath -Raw
    if ($pubspecContent -match "version:\s*(\d+\.\d+\.\d+)\+(\d+)") {
        $versionName = $matches[1]
        $buildNumber = $matches[2]
        Write-Host "   ✅ Version: $versionName (Build $buildNumber)" -ForegroundColor Green
        $script:passedChecks++
        $script:totalChecks++
    }
}

Write-Host ""

# ============================================
# 2. STORE LISTING ASSETS
# ============================================
Write-Host "🎨 2. STORE LISTING ASSETS" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan

# Check app icon
$appIconPath = "$AssetsPath\app-icon-512x512.png"
Test-Requirement `
    -Name "App icon (512x512)" `
    -Condition (Test-Path $appIconPath) `
    -ErrorMessage "App icon not found at: $appIconPath"

# Check feature graphic
$featureGraphicPath = "$AssetsPath\feature-graphic-1024x500.png"
Test-Requirement `
    -Name "Feature graphic (1024x500)" `
    -Condition (Test-Path $featureGraphicPath) `
    -ErrorMessage "Feature graphic not found at: $featureGraphicPath"

# Check screenshots
$screenshotsPath = "$AssetsPath\screenshots"
if (Test-Path $screenshotsPath) {
    $screenshots = Get-ChildItem $screenshotsPath -Filter "*.png"
    $screenshotCount = $screenshots.Count
    
    Test-Requirement `
        -Name "Screenshots (minimum 2 required)" `
        -Condition ($screenshotCount -ge 2) `
        -ErrorMessage "Only $screenshotCount screenshot(s) found. Need at least 2."
    
    if ($screenshotCount -lt 4) {
        Test-Requirement `
            -Name "Screenshots (4-6 recommended)" `
            -Condition $false `
            -ErrorMessage "Only $screenshotCount screenshots. Recommended: 4-6 for better conversion." `
            -IsWarning $true
    }
} else {
    Test-Requirement `
        -Name "Screenshots folder exists" `
        -Condition $false `
        -ErrorMessage "Screenshots folder not found at: $screenshotsPath"
}

Write-Host ""

# ============================================
# 3. DOCUMENTATION & POLICIES
# ============================================
Write-Host "📄 3. DOCUMENTATION & POLICIES" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan

# Check descriptions file
$descriptionsPath = "$DocsPath\PLAY_STORE_DESCRIPTIONS.md"
Test-Requirement `
    -Name "Store descriptions prepared" `
    -Condition (Test-Path $descriptionsPath) `
    -ErrorMessage "Descriptions file not found at: $descriptionsPath"

# Check store listing info
$storeListingPath = "$DocsPath\STORE_LISTING_INFO.md"
Test-Requirement `
    -Name "Store listing info prepared" `
    -Condition (Test-Path $storeListingPath) `
    -ErrorMessage "Store listing info not found at: $storeListingPath"

# Check privacy policy
$privacyPolicyPath = "$DocsPath\PRIVACY_POLICY.md"
Test-Requirement `
    -Name "Privacy policy document exists" `
    -Condition (Test-Path $privacyPolicyPath) `
    -ErrorMessage "Privacy policy not found at: $privacyPolicyPath"

# Privacy Policy URL check (manual)
Write-Host "   ⚠️  Privacy Policy URL (Manual verification required)" -ForegroundColor Yellow
$script:totalChecks++
$script:warnings += "Ensure Privacy Policy is hosted at public URL (e.g., https://thohcm.com/privacy-policy)"

Write-Host ""

# ============================================
# 4. PLAY CONSOLE CONFIGURATION (Manual)
# ============================================
Write-Host "⚙️  4. PLAY CONSOLE CONFIGURATION" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan
Write-Host "   The following must be completed in Google Play Console:`n" -ForegroundColor Yellow

$manualTasks = @(
    "Privacy Policy URL entered",
    "App permissions declared and explained",
    "Ads declaration (No ads for Thợ HCM)",
    "Content rating questionnaire completed (Target: Teen/PEGI 12)",
    "Target audience set (Adults 18+)",
    "Data safety section filled (Location, Camera, Storage, Financial)",
    "Government app declaration (No)",
    "Financial features declared (Payment processing)",
    "Health features declaration (No)",
    "App category selected (Lifestyle)",
    "Contact email provided (support@thohcm.com)",
    "Developer name set",
    "Website URL provided"
)

foreach ($task in $manualTasks) {
    Write-Host "   □ $task" -ForegroundColor White
}

Write-Host ""

# ============================================
# 5. TECHNICAL REQUIREMENTS
# ============================================
Write-Host "⚙️  5. TECHNICAL REQUIREMENTS" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan

# Check build.gradle for target SDK
$buildGradlePath = "$MobileAppPath\android\app\build.gradle.kts"
if (Test-Path $buildGradlePath) {
    $buildGradleContent = Get-Content $buildGradlePath -Raw
    
    # Check for targetSdk (should be 34+)
    if ($buildGradleContent -match "targetSdk\s*=\s*(\d+)") {
        $targetSdk = [int]$matches[1]
        Test-Requirement `
            -Name "Target SDK 34+ (Android 14)" `
            -Condition ($targetSdk -ge 34) `
            -ErrorMessage "Target SDK is $targetSdk. Google requires SDK 34+ for new apps."
    } else {
        Test-Requirement `
            -Name "Target SDK configuration found" `
            -Condition $false `
            -ErrorMessage "Could not find targetSdk in build.gradle.kts" `
            -IsWarning $true
    }
}

# Check Firebase configuration
$firebaseConfigPath = "$MobileAppPath\android\app\google-services.json"
Test-Requirement `
    -Name "Firebase google-services.json exists" `
    -Condition (Test-Path $firebaseConfigPath) `
    -ErrorMessage "Firebase configuration not found. Push notifications may not work."

Write-Host ""

# ============================================
# 6. PACKAGE INFORMATION
# ============================================
Write-Host "📦 6. PACKAGE INFORMATION" -ForegroundColor Cyan
Write-Host "--------------------------------`n" -ForegroundColor Cyan

Write-Host "   📱 Package Name: com.thohcm.workerapp" -ForegroundColor White
Write-Host "   📌 App Name: Thợ HCM - Thợ Chuyên Nghiệp" -ForegroundColor White
if ($versionName -and $buildNumber) {
    Write-Host "   🔢 Version: $versionName (Build $buildNumber)" -ForegroundColor White
}

Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "============================================" -ForegroundColor Green
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

$passRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
Write-Host "   Total Checks: $totalChecks" -ForegroundColor White
Write-Host "   Passed: $passedChecks ($passRate%)" -ForegroundColor Green
Write-Host "   Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "   Errors: $($errors.Count)" -ForegroundColor Red

Write-Host ""

# Display errors
if ($errors.Count -gt 0) {
    Write-Host "❌ ERRORS (MUST FIX):" -ForegroundColor Red
    Write-Host "================================`n" -ForegroundColor Red
    foreach ($errMsg in $errors) {
        Write-Host "   • $errMsg" -ForegroundColor Red
    }
    Write-Host ""
}

# Display warnings
if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS (RECOMMENDED):" -ForegroundColor Yellow
    Write-Host "================================`n" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Final verdict
if ($errors.Count -eq 0) {
    Write-Host "✅ READY FOR UPLOAD!" -ForegroundColor Green
    Write-Host "   Your app meets the technical requirements." -ForegroundColor White
    Write-Host "   Complete the manual Play Console configuration and submit!" -ForegroundColor White
    Write-Host "`n   📋 Follow the guide in: docs\GOOGLE_PLAY_DEPLOYMENT_STEPS.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ NOT READY FOR UPLOAD" -ForegroundColor Red
    Write-Host "   Please fix the errors above before submitting." -ForegroundColor White
}

Write-Host "`n============================================`n" -ForegroundColor Green

# Quick action suggestions
if ($errors.Count -gt 0) {
    Write-Host "🔧 QUICK FIXES:" -ForegroundColor Yellow
    
    if (-not (Test-Path $aabPath)) {
        Write-Host "   • Build AAB: cd mobile\worker_app && flutter build appbundle --release" -ForegroundColor White
    }
    
    if (-not (Test-Path "$AssetsPath\screenshots")) {
        Write-Host "   • Create screenshots folder: mkdir '$AssetsPath\screenshots'" -ForegroundColor White
        Write-Host "   • Capture 4-6 screenshots from app (1080x1920)" -ForegroundColor White
    }
    
    if (-not (Test-Path $appIconPath)) {
        Write-Host "   • Generate app icon using: scripts\create-playstore-assets.ps1" -ForegroundColor White
    }
    
    Write-Host ""
}

# Useful links
Write-Host "📚 RESOURCES:" -ForegroundColor Cyan
Write-Host "   • Play Console: https://play.google.com/console" -ForegroundColor White
Write-Host "   • Deployment Guide: $DocsPath\GOOGLE_PLAY_DEPLOYMENT_STEPS.md" -ForegroundColor White
Write-Host "   • Requirements: $DocsPath\PLAY_STORE_REQUIREMENTS.md" -ForegroundColor White

Write-Host ""
