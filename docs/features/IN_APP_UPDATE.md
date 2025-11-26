# In-App Update - Hệ thống cập nhật tự động

## 📱 Tổng quan

Hệ thống In-App Update cho phép:
- ✅ Kiểm tra phiên bản từ Backend API
- ✅ Hiển thị dialog thông báo cập nhật đẹp mắt
- ✅ Cập nhật trực tiếp từ Play Store (Android)
- ✅ Hỗ trợ cập nhật bắt buộc (Force Update)
- ✅ Hiển thị danh sách tính năng mới
- ✅ Fallback về Play Store check nếu backend lỗi

## 🏗️ Kiến trúc

```
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐              ┌────────────────────┐
│ Backend API  │              │   Play Store       │
│ /app-version │              │   In-App Update    │
└──────────────┘              └────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Version Info (JSON)      │
│ - currentVersion         │
│ - latestVersion          │
│ - forceUpdate            │
│ - features[]             │
│ - updateUrl              │
└──────────────────────────┘
```

## 🔧 Backend API

### 1. Kiểm tra phiên bản

**Endpoint:** `GET /api/app-version/check`

**Query params:**
- `appType`: `worker` hoặc `customer`
- `currentVersion`: Version hiện tại (vd: `1.1.4`)

**Response:**
```json
{
  "success": true,
  "data": {
    "currentVersion": "1.1.4",
    "latestVersion": "1.2.0",
    "minRequiredVersion": "1.1.0",
    "needsUpdate": true,
    "forceUpdate": false,
    "updateUrl": "https://play.google.com/store/apps/details?id=com.thohcm.workerapp",
    "updateMessage": "Có phiên bản mới với nhiều cải tiến!",
    "features": [
      "Cải thiện hiệu suất ví",
      "Tối ưu giao diện nạp tiền",
      "Sửa lỗi thông báo"
    ],
    "releaseDate": "2025-11-26T10:00:00Z"
  }
}
```

### 2. Lấy thông tin version mới nhất

**Endpoint:** `GET /api/app-version/latest?appType=worker`

### 3. Cập nhật thông tin version (Admin only)

**Endpoint:** `PUT /api/app-version/update`

**Body:**
```json
{
  "appType": "worker",
  "latestVersion": "1.2.0",
  "minRequiredVersion": "1.1.0",
  "forceUpdate": false,
  "updateMessage": "Phiên bản mới với nhiều cải tiến!",
  "features": [
    "Tính năng A",
    "Tính năng B"
  ]
}
```

## 📱 Mobile Implementation

### 1. Dependencies (pubspec.yaml)

```yaml
dependencies:
  in_app_update: ^4.2.3          # Play Store in-app update
  package_info_plus: ^8.0.0      # Lấy version hiện tại
  url_launcher: ^6.3.0           # Mở Play Store URL
```

### 2. Sử dụng

```dart
// Trong main.dart hoặc splash screen
await AppUpdateService.checkForUpdateFromBackend(context);

// Hoặc kiểm tra thủ công (ví dụ: trong Settings)
ElevatedButton(
  onPressed: () => AppUpdateService.checkForUpdateFromBackend(context),
  child: Text('Kiểm tra cập nhật'),
)
```

### 3. Flow hoạt động

1. **App khởi động** → Gọi API `/api/app-version/check`
2. **Backend trả về** thông tin version
3. **Nếu cần update:**
   - Hiển thị dialog với thông tin chi tiết
   - Người dùng chọn "Cập nhật ngay" hoặc "Để sau"
4. **Khi nhấn cập nhật:**
   - Android: Dùng Play Store In-App Update (seamless)
   - iOS: Mở App Store URL
5. **Nếu forceUpdate = true:**
   - Không cho phép đóng dialog
   - Bắt buộc phải cập nhật mới dùng được

## 🎨 UI Dialog

### Normal Update (Optional)
```
┌────────────────────────────────────┐
│  🔄  Cập nhật mới                  │
│      Phiên bản 1.2.0               │
├────────────────────────────────────┤
│  Có phiên bản mới với nhiều        │
│  cải tiến!                         │
│                                    │
│  ✨ Tính năng mới:                 │
│  • Cải thiện hiệu suất ví          │
│  • Tối ưu giao diện nạp tiền       │
│  • Sửa lỗi thông báo               │
│                                    │
│           [Để sau]  [Cập nhật ngay]│
└────────────────────────────────────┘
```

### Force Update (Required)
```
┌────────────────────────────────────┐
│  ⚠️  Cập nhật bắt buộc             │
│      Phiên bản 1.2.0               │
├────────────────────────────────────┤
│  ...                               │
│                                    │
│  ⚠️ Bạn cần cập nhật để tiếp tục   │
│     sử dụng ứng dụng               │
│                                    │
│                    [Cập nhật ngay] │
└────────────────────────────────────┘
```

## 🚀 Quy trình deploy update

### Bước 1: Cập nhật code
```bash
# 1. Thay đổi code (ví dụ: tính năng nạp ví)
git add .
git commit -m "feat: update wallet UI"
git push
```

### Bước 2: Tăng version
```yaml
# mobile/worker_app/pubspec.yaml
version: 1.2.0+11  # Tăng version và build number
```

### Bước 3: Build và upload Play Store
```powershell
# Build AAB
flutter build appbundle --release

# Hoặc dùng script
.\scripts\build-playstore-aab.ps1
```

### Bước 4: Cập nhật Backend config
```javascript
// backend/controllers/appVersionController.js
const APP_VERSIONS = {
  worker: {
    currentVersion: '1.2.0',      // ← Cập nhật
    latestVersion: '1.2.0',       // ← Cập nhật
    minRequiredVersion: '1.1.0',  // Version tối thiểu
    forceUpdate: false,           // Bắt buộc update?
    updateMessage: 'Cải thiện giao diện nạp ví!',
    features: [
      'Tối ưu UI nạp ví',
      'Chỉ còn phương thức QR Banking',
      'Upload ảnh tự động quay về ví'
    ],
  }
}
```

### Bước 5: Restart backend
```bash
pm2 restart backend
# hoặc
npm run start
```

### Bước 6: User mở app
- App tự động kiểm tra
- Hiển thị dialog nếu có update
- User nhấn "Cập nhật ngay"
- Play Store update seamlessly

## ⚙️ Cấu hình

### Force Update (Bắt buộc cập nhật)

Khi nào nên dùng:
- ✅ Có breaking changes trong API
- ✅ Sửa lỗi bảo mật nghiêm trọng
- ✅ Thay đổi cấu trúc database
- ❌ Update UI nhỏ
- ❌ Tính năng mới không quan trọng

```javascript
// Bật force update
forceUpdate: true,
minRequiredVersion: '1.2.0', // Chặn tất cả version < 1.2.0
```

### Minimum Required Version

```javascript
// Cho phép user dùng từ 1.1.0 trở lên
minRequiredVersion: '1.1.0',

// Version 1.0.x sẽ bị force update
```

## 🧪 Testing

### Test update dialog
```dart
// Tạm thời giả lập có update
// Trong app_update_service.dart
final needsUpdate = true;  // Force true để test
```

### Test force update
```javascript
// Backend - Bật force update
forceUpdate: true,
```

### Test API
```bash
# Kiểm tra version
curl "http://localhost:3000/api/app-version/check?appType=worker&currentVersion=1.0.0"

# Cập nhật version info (cần auth token)
curl -X PUT http://localhost:3000/api/app-version/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "appType": "worker",
    "latestVersion": "1.2.0",
    "forceUpdate": false
  }'
```

## 📊 Analytics (Tương lai)

Có thể thêm tracking:
```javascript
// Log update events
analytics.logEvent('app_update_prompted', {
  current_version: '1.1.4',
  latest_version: '1.2.0',
  user_action: 'update_now' // hoặc 'dismiss'
});
```

## 🔐 Bảo mật

- ✅ API check version là public (không cần auth)
- ✅ API update config cần admin auth
- ✅ Version info lưu trong code (production nên dùng DB)
- ✅ HTTPS cho tất cả requests

## 📝 Notes

1. **Play Store Review**: Mất 1-3 ngày để approve
2. **Staged Rollout**: Có thể phát hành từng phần (10% → 50% → 100%)
3. **Beta Testing**: Test với Internal Testing trước
4. **Rollback**: Play Store cho phép rollback nếu có lỗi

## 🎯 Best Practices

1. **Tăng version đúng cách:**
   - Major: `2.0.0` - Breaking changes
   - Minor: `1.2.0` - New features
   - Patch: `1.1.5` - Bug fixes

2. **Build number luôn tăng:**
   ```yaml
   version: 1.2.0+12  # +12 là build number, phải > build trước
   ```

3. **Test kỹ trước khi force update**

4. **Có rollback plan**

5. **Monitor crash reports sau release**

## 🆘 Troubleshooting

### Update không hiện
- Kiểm tra backend có chạy không
- Xem log console Flutter
- Verify version trong pubspec.yaml
- Check Play Store đã approve chưa

### Force update vẫn đóng được
- Kiểm tra `forceUpdate` trong backend
- Verify logic `WillPopScope` trong dialog

### Play Store update fails
- Kiểm tra device có Google Play Services
- Verify app đã publish trên Play Store
- Check internet connection

## 📚 Tài liệu tham khảo

- [in_app_update package](https://pub.dev/packages/in_app_update)
- [Google Play In-App Updates](https://developer.android.com/guide/playcore/in-app-updates)
- [package_info_plus](https://pub.dev/packages/package_info_plus)
