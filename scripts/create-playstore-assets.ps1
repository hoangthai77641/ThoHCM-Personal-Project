# Create Play Store Assets Script
Write-Host "🎨 Creating Play Store Assets..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
$assetsPath = "D:\Thai\root\ThoHCM\assets"

# Create assets directory structure
Write-Host "`n📁 Creating asset directories..." -ForegroundColor Yellow

$directories = @(
    "$assetsPath\icons",
    "$assetsPath\screenshots\phone", 
    "$assetsPath\screenshots\tablet",
    "$assetsPath\feature-graphics",
    "$assetsPath\templates"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

# Copy current app icon if exists
$currentIcon = "$appPath\android\app\src\main\res\mipmap-xxxhdpi\launcher_icon.png"
if (Test-Path $currentIcon) {
    Copy-Item $currentIcon "$assetsPath\icons\current-launcher-icon.png"
    Write-Host "✅ Backed up current app icon" -ForegroundColor Green
}

# Create HTML templates
Write-Host "`n🎨 Creating design templates..." -ForegroundColor Yellow

# App Icon Template
$iconTemplate = @"
<!DOCTYPE html>
<html>
<head>
    <title>ThoHCM App Icon Generator</title>
    <style>
        body { background: #f0f0f0; padding: 20px; font-family: Arial, sans-serif; }
        .icon-container { text-align: center; }
        .icon {
            width: 512px; height: 512px;
            background: linear-gradient(135deg, #1976D2, #42A5F5);
            border-radius: 24px; display: inline-flex;
            align-items: center; justify-content: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            margin: 20px;
        }
        .content { text-align: center; color: white; }
        .tools { font-size: 100px; margin-bottom: 20px; }
        .logo { font-size: 80px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 32px; opacity: 0.9; }
        .instructions { max-width: 600px; margin: 20px auto; text-align: left; }
    </style>
</head>
<body>
    <div class="icon-container">
        <div class="icon" id="appIcon">
            <div class="content">
                <div class="tools">🔧</div>
                <div class="logo">THO</div>
                <div class="subtitle">HCM</div>
            </div>
        </div>
        <div class="instructions">
            <h3>📱 How to use:</h3>
            <ol>
                <li>Right-click on the icon above</li>
                <li>Select "Save image as..."</li>
                <li>Save as "app-icon-512.png"</li>
                <li>Use this for Google Play Store</li>
            </ol>
            <p><strong>Note:</strong> You can customize colors, text, and emoji by editing this HTML file.</p>
        </div>
    </div>
</body>
</html>
"@

Set-Content -Path "$assetsPath\templates\app-icon-generator.html" -Value $iconTemplate

# Feature Graphic Template  
$featureTemplate = @"
<!DOCTYPE html>
<html>
<head>
    <title>ThoHCM Feature Graphic</title>
    <style>
        .feature-graphic {
            width: 1024px; height: 500px;
            background: linear-gradient(135deg, #1976D2, #42A5F5);
            position: relative; font-family: Arial, sans-serif;
            overflow: hidden; margin: 20px auto;
            border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .left-content {
            position: absolute; left: 60px; top: 50%;
            transform: translateY(-50%); color: white; z-index: 2;
        }
        .logo { font-size: 48px; font-weight: bold; margin-bottom: 15px; }
        .tagline { font-size: 24px; margin-bottom: 25px; opacity: 0.95; }
        .features { font-size: 18px; opacity: 0.9; line-height: 1.4; }
        .phones {
            position: absolute; right: 80px; top: 50%;
            transform: translateY(-50%) rotate(-5deg);
        }
        .phone {
            width: 140px; height: 280px; background: #333;
            border-radius: 18px; margin: 0 15px; display: inline-block;
            box-shadow: 0 15px 40px rgba(0,0,0,0.4); 
            transform: rotate(10deg);
        }
        .phone:nth-child(2) { transform: rotate(-5deg) translateY(-20px); }
        .phone-screen {
            width: 120px; height: 240px; background: white;
            border-radius: 12px; margin: 20px 10px;
            background: linear-gradient(to bottom, #E3F2FD, #BBDEFB);
        }
    </style>
</head>
<body>
    <div style="text-align: center; padding: 20px;">
        <div class="feature-graphic">
            <div class="left-content">
                <div class="logo">🔧 ThoHCM</div>
                <div class="tagline">Skilled Workers On Demand</div>
                <div class="features">
                    ✓ Fast & Reliable Service<br>
                    ✓ Verified Professionals<br>
                    ✓ Transparent Pricing
                </div>
            </div>
            <div class="phones">
                <div class="phone"><div class="phone-screen"></div></div>
                <div class="phone"><div class="phone-screen"></div></div>
            </div>
        </div>
        <p><strong>Right-click and save as "feature-graphic-1024x500.png"</strong></p>
    </div>
</body>
</html>
"@

Set-Content -Path "$assetsPath\templates\feature-graphic-generator.html" -Value $featureTemplate

# Create README
$readmeContent = @"
# Play Store Assets for ThoHCM Worker App

## 📁 Directory Structure
- **icons/**: App icons (512x512)
- **screenshots/**: App screenshots (phone & tablet)  
- **feature-graphics/**: Play Store banner (1024x500)
- **templates/**: HTML generators for assets

## 🎨 Asset Creation Workflow

### 1. App Icon (512x512)
1. Open: `templates/app-icon-generator.html`
2. Right-click icon → Save image as `app-icon-512.png`
3. Move to: `icons/` folder

### 2. Feature Graphic (1024x500)
1. Open: `templates/feature-graphic-generator.html`
2. Right-click graphic → Save image as `feature-graphic-1024x500.png`
3. Move to: `feature-graphics/` folder

### 3. Screenshots
1. Run Flutter app in emulator/device
2. Take screenshots of key screens:
   - Home/Dashboard
   - Service booking
   - Worker profile
   - Chat/messaging
   - Booking management
3. Use device frame generators (deviceframes.com)
4. Save to: `screenshots/phone/` folder

## ✅ Checklist for Play Store
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG/JPG)
- [ ] 2+ phone screenshots
- [ ] App description (Vietnamese + English)
- [ ] Privacy policy URL
- [ ] Content rating completed

## 🔗 Useful Tools
- **Device Frames**: https://deviceframes.com/
- **Icon Generator**: https://romannurik.github.io/AndroidAssetStudio/
- **Canva**: https://canva.com/
- **Figma**: https://figma.com/
"@

Set-Content -Path "$assetsPath\README.md" -Value $readmeContent

Write-Host "`n✅ Asset creation setup completed!" -ForegroundColor Green
Write-Host "📍 Assets folder: $assetsPath" -ForegroundColor Cyan
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open templates/app-icon-generator.html in browser" -ForegroundColor White
Write-Host "2. Open templates/feature-graphic-generator.html in browser" -ForegroundColor White  
Write-Host "3. Take app screenshots using Flutter emulator" -ForegroundColor White
Write-Host "4. Upload assets to Google Play Console" -ForegroundColor White

# Open templates in default browser
Write-Host "`n🌐 Opening templates in browser..." -ForegroundColor Yellow
Start-Process "$assetsPath\templates\app-icon-generator.html"
Start-Process "$assetsPath\templates\feature-graphic-generator.html"