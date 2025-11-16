# Firebase Setup Guide cho ThoHCM Worker App

## 🔥 Firebase Configuration Steps

### 1. Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" hoặc "Add project"
3. **Project name**: `ThoHCM-Worker-App`
4. **Project ID**: `thohcm-worker-app`
5. Enable Google Analytics (khuyến nghị)

### 2. Add Android App vào Firebase
1. Trong Firebase Console, click "Add app" → Android icon
2. **Android package name**: `com.thohcm.workerapp`
3. **App nickname**: `ThoHCM Worker App`
4. **Debug signing certificate SHA-1**: (tùy chọn, có thể thêm sau)

### 3. Download google-services.json
1. Download file `google-services.json` từ Firebase Console
2. Đặt file vào: `android/app/google-services.json`
3. **Đường dẫn chính xác**: `D:\Thai\root\ThoHCM\mobile\worker_app\android\app\google-services.json`

### 4. Cấu trúc file sau khi setup:
```
mobile/worker_app/
├── android/
│   ├── app/
│   │   ├── google-services.json  ← FILE FIREBASE
│   │   ├── build.gradle.kts      ← ĐÃ CẬP NHẬT
│   │   └── src/
│   ├── build.gradle.kts          ← ĐÃ CẬP NHẬT
│   └── ...
├── lib/
├── pubspec.yaml                  ← ĐÃ CẬP NHẬT
└── ...
```

### 5. Verify Setup
Sau khi đặt file và cập nhật config:

```bash
cd mobile/worker_app
flutter clean
flutter pub get
flutter build apk --debug
```

### 6. Firebase Services Setup

#### 🔔 Push Notifications (FCM)
- **Tự động hoạt động** sau khi setup
- Token sẽ được generate tự động
- Có thể gửi test notification từ Firebase Console

#### 📊 Analytics
- **Tự động track** basic events
- Custom events có thể được thêm vào code
- Dashboard sẽ hiển thị data sau 24h

#### 🔐 Authentication
- Enable Authentication trong Firebase Console
- Chọn providers: Email/Password, Phone, Google, etc.
- Code đã sẵn sàng để integrate

#### 💾 Firestore Database
- Enable Firestore trong Firebase Console
- Setup security rules
- Code đã sẵn sàng để integrate

### 7. Production Setup
Để deploy production:

1. **Add Production SHA-1**:
   ```bash
   keytool -list -v -keystore android/app/thohcm-key.jks -alias thohcm
   ```

2. **Add SHA-1 vào Firebase Console**:
   - Project Settings → Your apps → Android app
   - Add fingerprint

3. **Re-download google-services.json** với production config

### 8. Testing Firebase
Để test Firebase hoạt động:

1. **Build và chạy app**:
   ```bash
   flutter run --debug
   ```

2. **Check logs** cho Firebase initialization:
   ```
   I/flutter: Firebase initialized successfully
   I/flutter: FCM Token: [YOUR_TOKEN]
   ```

3. **Test push notification**:
   - Firebase Console → Cloud Messaging
   - Send test message đến device token

### 9. Environment Variables
Có thể setup multiple environments:

- **Development**: `google-services-dev.json`
- **Production**: `google-services.json`

```bash
# Switch environments
cp google-services-dev.json google-services.json  # Dev
cp google-services-prod.json google-services.json # Prod
```

### 10. Security Notes
⚠️ **Important Security:**

1. **Không commit** `google-services.json` vào public repo
2. **Add vào .gitignore**:
   ```
   android/app/google-services.json
   ```

3. **Use CI/CD secrets** cho production file

---

## 🚨 Troubleshooting

**Build errors sau khi add Firebase:**
1. `flutter clean && flutter pub get`
2. Check file `google-services.json` ở đúng vị trí
3. Verify package name match exactly: `com.thohcm.workerapp`

**FCM không hoạt động:**
1. Check permissions trong AndroidManifest.xml
2. Verify SHA-1 fingerprint trong Firebase Console
3. Test với Firebase Console → Cloud Messaging

**Analytics không show data:**
1. Đợi 24h để data xuất hiện
2. Verify app đã được run với network connection
3. Check debug events trong Firebase Console

---

📱 **ThoHCM Worker App Firebase Setup Complete!**