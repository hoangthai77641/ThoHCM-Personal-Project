# 📱 Hướng dẫn Flutter Install Permanent trên Điện thoại Thật

## 🎯 Mục tiêu
Cài đặt ThoHCM Worker App **một lần** lên điện thoại thật, sau đó user có thể sử dụng **hoàn toàn độc lập** không cần kết nối Android Studio.

## 📋 Yêu cầu trước khi bắt đầu

### Điện thoại Android:
- [x] Enable Developer Options
- [x] Enable USB Debugging  
- [x] Allow Install from Unknown Sources
- [x] Kết nối USB với máy tính

### Máy tính:
- [x] Flutter SDK installed
- [x] Android Studio/ADB setup
- [x] USB drivers cho điện thoại

## 🚀 Các bước thực hiện

### **Bước 1: Kết nối và kiểm tra device**

```powershell
# Navigate to project
cd "D:\Thai\root\ThoHCM\mobile\worker_app"

# Kiểm tra device connected
flutter devices
```

**Expected output:**
```
Android device • <device-id> • android-arm64 • Android <version> (API <level>)
```

### **Bước 2: Build Release APK**

```powershell
# Build production APK with production API
flutter build apk --release --dart-define=API_BASE=https://thohcm-application-475603.as.r.appspot.com
```

**File output:** `build/app/outputs/flutter-apk/app-release.apk`

### **Bước 3: Install Release APK lên device**

```powershell
# Method 1: Flutter install (recommended)
flutter install --release

# Method 2: ADB install (alternative)
adb install build/app/outputs/flutter-apk/app-release.apk
```

### **Bước 4: Verify installation**

1. **Kiểm tra trên điện thoại:**
   - App "Điện lạnh Quy - Worker" xuất hiện trong app drawer
   - Tap vào app để mở (không cần kết nối máy tính)

2. **Test basic functions:**
   - Login với worker account
   - Check API connection
   - Test notifications

### **Bước 5: Disconnect và test độc lập**

```powershell
# Disconnect USB cable
# App vẫn hoạt động bình thường!
```

## ⚡ Script tự động (All-in-one)

Tạo script để automate toàn bộ process:

```powershell
# File: install-worker-app.ps1
Write-Host "🚀 ThoHCM Worker App - Permanent Installation" -ForegroundColor Green

# Check device connection
Write-Host "📱 Checking device connection..." -ForegroundColor Yellow
$devices = flutter devices
if ($devices -match "Android device") {
    Write-Host "✅ Android device connected!" -ForegroundColor Green
} else {
    Write-Host "❌ No Android device found! Please connect your phone." -ForegroundColor Red
    exit 1
}

# Build release APK
Write-Host "🔨 Building release APK..." -ForegroundColor Yellow
flutter build apk --release --dart-define=API_BASE=https://thohcm-application-475603.as.r.appspot.com

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Install to device
Write-Host "📲 Installing to device..." -ForegroundColor Yellow
flutter install --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App installed successfully!" -ForegroundColor Green
    Write-Host "🎉 You can now disconnect your phone and use the app independently!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}
```

## 🔧 Troubleshooting

### Problem 1: Device not found
```powershell
# Check ADB connection
adb devices

# Restart ADB if needed
adb kill-server
adb start-server
```

### Problem 2: Permission denied
```powershell
# Enable Unknown Sources on phone:
# Settings > Security > Install unknown apps > Enable for ADB/USB
```

### Problem 3: Build failed
```powershell
# Clean and retry
flutter clean
flutter pub get
flutter build apk --release
```

### Problem 4: App crashes after install
```powershell
# Check logs
adb logcat | grep flutter
```

## 📊 Comparison: Debug vs Release Install

| Aspect | Debug (`flutter run`) | Release (`flutter install`) |
|--------|----------------------|----------------------------|
| **Connection** | Requires continuous USB | One-time install |
| **Performance** | Slower, debug overhead | Optimized, production speed |
| **Hot Reload** | ✅ Available | ❌ Not available |
| **Independence** | ❌ Depends on Android Studio | ✅ Fully independent |
| **File Size** | ~100MB+ | ~70MB optimized |
| **Use Case** | Development/Testing | Production/End Users |

## 🎯 User Experience After Install

### ✅ What users CAN do:
- Open app from phone's app drawer
- Login và sử dụng tất cả features
- Receive real-time notifications
- Upload images, manage bookings
- Work completely offline (cached data)

### ❌ What users CANNOT do:
- Auto-update (cần install APK mới manually)
- Debug features (logs, hot reload)
- Development tools access

## 🔄 Updates Process

### Khi có app update:
1. Build new release APK
2. Share APK file với users (qua email/drive)
3. Users install new APK (overwrites old version)
4. Data và settings được preserve

### Future: Google Play Store
- Auto-updates qua Play Store
- Professional distribution
- Better user experience

## 📋 Checklist hoàn tất

### Pre-install:
- [ ] Device connected và recognized
- [ ] Developer options enabled
- [ ] USB debugging enabled
- [ ] Flutter project ready

### Installation:
- [ ] APK built successfully (`app-release.apk`)
- [ ] APK installed to device
- [ ] App launches without errors
- [ ] API connection works

### Post-install:
- [ ] Device disconnected
- [ ] App works independently  
- [ ] All features functional
- [ ] User can use normally

## 🚀 Final Steps

```powershell
# Complete installation command:
cd "D:\Thai\root\ThoHCM\mobile\worker_app"
flutter build apk --release --dart-define=API_BASE=https://thohcm-application-475603.as.r.appspot.com
flutter install --release

# Verify installation:
adb shell pm list packages | grep com.thohcm.workerapp
```

**Result**: App installed permanently, user có thể sử dụng độc lập! 🎉

---
*Last Updated: October 22, 2025*  
*Method: Flutter Release Install*  
*Status: Ready for deployment*