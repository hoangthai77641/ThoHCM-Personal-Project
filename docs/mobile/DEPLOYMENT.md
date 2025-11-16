# Mobile App Deployment Guide

## 🚀 Deploy ThoHCM Worker Mobile App

### Prerequisites

- ✅ Flutter SDK (3.27.0 or later)
- ✅ Android Studio với Android SDK
- ✅ Git và PowerShell
- ✅ Keystore file (cho production builds)

### Quick Start

1. **Debug Build (Testing)**
   ```powershell
   cd "D:\Thai\root\ThoHCM"
   .\scripts\deploy-mobile.ps1 -BuildType debug
   ```

2. **Release Build (Production)**
   ```powershell
   .\scripts\deploy-mobile.ps1 -BuildType release
   ```

3. **AAB for Google Play Store**
   ```powershell
   .\scripts\deploy-mobile.ps1 -BuildType aab
   ```

### Manual Build Commands

```bash
# Navigate to app directory
cd mobile/worker_app

# Clean and prepare
flutter clean
flutter pub get

# Build options
flutter build apk --debug          # Debug APK
flutter build apk --release        # Release APK  
flutter build appbundle --release  # AAB for Play Store
flutter build ios --release        # iOS (macOS only)
```

### App Signing Setup

1. **Generate Keystore**
   ```bash
   keytool -genkey -v -keystore android/app/thohcm-key.jks \
           -keyalg RSA -keysize 2048 -validity 10000 -alias thohcm
   ```

2. **Configure key.properties**
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=thohcm
   storeFile=thohcm-key.jks
   ```

3. **Update build.gradle** (see setup-signing.ps1)

### Deployment Targets

| Build Type | Use Case | Output Location |
|------------|----------|----------------|
| Debug APK | Testing, Development | `build/app/outputs/flutter-apk/app-debug.apk` |
| Release APK | Production, Sideload | `build/app/outputs/flutter-apk/app-release.apk` |
| AAB | Google Play Store | `build/app/outputs/bundle/release/app-release.aab` |
| iOS | App Store | `build/ios/iphoneos/Runner.app` |

### Distribution Options

#### 🏪 Google Play Store
1. Build AAB: `flutter build appbundle --release`
2. Go to [Google Play Console](https://play.google.com/console)
3. Create new app or new release
4. Upload AAB file
5. Fill app information and submit for review

#### 📱 Direct Installation (APK)
1. Build APK: `flutter build apk --release`
2. Enable "Install from Unknown Sources" on device
3. Transfer APK to device and install

#### 🍎 Apple App Store
1. Build iOS on macOS: `flutter build ios --release`
2. Open `ios/Runner.xcworkspace` in Xcode
3. Configure signing & capabilities
4. Archive and upload to App Store Connect

### CI/CD with GitHub Actions

The project includes automated CI/CD pipeline:

- **Trigger**: Push to main/develop or manual dispatch
- **Builds**: Debug APK, Release APK, AAB, iOS
- **Artifacts**: Automatically uploaded for download

### Environment Configuration

App uses different backend URLs based on build:

- **API Base**: `https://thohcm-application-475603.as.r.appspot.com`
- **Socket.IO**: `https://thohcm-backend-181755246333.asia-southeast1.run.app`

### Version Management

Update version in `pubspec.yaml`:
```yaml
version: 1.0.0+1  # format: major.minor.patch+build
```

### Troubleshooting

**Build Errors:**
- Run `flutter doctor` to check setup
- Clear cache: `flutter clean && flutter pub get`
- Update dependencies: `flutter pub upgrade`

**Signing Issues:**
- Verify keystore path and passwords
- Check `key.properties` configuration
- Ensure keystore is in correct location

**Socket.IO Connection:**
- Verify backend URLs in `local_overrides.dart`
- Check network connectivity
- Test with different endpoints

### Support

For deployment issues:
1. Check logs and error messages
2. Verify Flutter and Android SDK versions
3. Test on different devices/emulators
4. Check backend API endpoints are working

---

📱 **ThoHCM Worker App v1.0.0**  
🔗 **Repository**: [ThoHCM-Personal-Project](https://github.com/hoangthai77641/ThoHCM-Personal-Project)