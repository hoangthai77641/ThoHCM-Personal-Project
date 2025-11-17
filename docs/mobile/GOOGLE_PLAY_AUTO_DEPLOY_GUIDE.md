# 🚀 Hướng Dẫn Tự Động Deploy App Lên Google Play Store

## 🎯 MỤC TIÊU
Khi push code lên GitHub → App **trên Google Play Store** tự động cập nhật → **Người dùng thật** nhận thông báo update.

---

## ⚡ QUY TRÌNH TỰ ĐỘNG

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Developer: Edit code Worker App                              │
│    git push origin main                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. GitHub Actions Trigger                                        │
│    ├─ Detect changes in mobile/worker_app/**                    │
│    ├─ Setup Flutter & Java                                      │
│    ├─ Decode google-services.json                               │
│    ├─ Decode keystore                                           │
│    └─ Create key.properties                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Build AAB Release                                             │
│    flutter build appbundle --release                             │
│    Time: ~5-7 phút                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Upload to Google Play Store                                   │
│    ├─ Track: Internal Testing / Production                      │
│    ├─ Status: Completed (auto-publish)                          │
│    ├─ Update priority: 5 (urgent)                               │
│    └─ Release notes: Từ whatsnew/                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Google Play Review (nếu Production)                           │
│    ├─ Auto review: ~2-4 giờ (nếu minor update)                  │
│    └─ Manual review: 1-7 ngày (nếu major changes)               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Published on Play Store                                       │
│    ├─ Staged rollout: 10% → 50% → 100%                         │
│    └─ Full rollout: Tất cả users                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Users Receive Update Notification                             │
│    ├─ Play Store app: "Cập nhật có sẵn"                        │
│    ├─ Auto-update (if enabled): Install tự động                 │
│    └─ Manual update: User click "Cập nhật"                      │
└─────────────────────────────────────────────────────────────────┘
```

**Tổng thời gian**: 
- Internal testing: ~10-15 phút
- Production (auto-review): ~2-4 giờ
- Production (manual review): 1-7 ngày

---

## 📋 SETUP CHI TIẾT

### BƯỚC 1: Tạo Google Play Service Account (10 phút)

#### 1.1. Vào Google Cloud Console
```
https://console.cloud.google.com
→ Select project: thohcm-frontend (hoặc tạo mới)
→ APIs & Services > Credentials
```

#### 1.2. Tạo Service Account
```
1. Click "Create Credentials" > "Service Account"
2. Service account name: "github-actions-playstore"
3. Role: "Service Account User"
4. Click "Done"
```

#### 1.3. Tạo JSON Key
```
1. Click vào service account vừa tạo
2. Tab "Keys" > "Add Key" > "Create new key"
3. Type: JSON
4. Click "Create" → Download file JSON
5. Lưu file: playstore-service-account.json
```

#### 1.4. Enable APIs
```
1. APIs & Services > Library
2. Enable "Google Play Android Developer API"
```

---

### BƯỚC 2: Cấu hình Google Play Console (5 phút)

#### 2.1. Link Service Account
```
1. Vào https://play.google.com/console
2. Select app: Thợ HCM
3. Setup > API access
4. Click "Link" bên cạnh service account vừa tạo
```

#### 2.2. Grant Permissions
```
1. Users and permissions > Invite user
2. Email: service-account-email@project-id.iam.gserviceaccount.com
3. Permissions:
   ✅ Releases > Create and edit releases
   ✅ Releases > Manage testing tracks
   ✅ App access > View app information
4. Click "Invite user"
```

---

### BƯỚC 3: Chuẩn bị Secrets (15 phút)

#### 3.1. Encode google-services.json
```bash
# Trên máy local
cd d:\Thai\root\ThoHCM\mobile\worker_app\android\app

# Encode to base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("google-services.json")) | Set-Clipboard

# Copy từ clipboard
```

#### 3.2. Encode Keystore
```bash
cd d:\Thai\root\ThoHCM\mobile\worker_app\android\app

# Encode keystore
[Convert]::ToBase64String([IO.File]::ReadAllBytes("thohcm-release-key.jks")) | Set-Clipboard
```

#### 3.3. Lấy Keystore Info
```
Mở file: android/key.properties
Ghi nhớ:
- storePassword: [password của bạn]
- keyPassword: [password của bạn]
- keyAlias: [alias của bạn]
```

---

### BƯỚC 4: Thêm GitHub Secrets (10 phút)

Vào: https://github.com/hoangthai77641/ThoHCM-Personal-Project/settings/secrets/actions

**Tạo 6 secrets**:

#### Secret 1: GOOGLE_SERVICES_JSON
```
Name: GOOGLE_SERVICES_JSON
Value: [Paste base64 string từ bước 3.1]
```

#### Secret 2: ANDROID_KEYSTORE_BASE64
```
Name: ANDROID_KEYSTORE_BASE64
Value: [Paste base64 string từ bước 3.2]
```

#### Secret 3: KEYSTORE_PASSWORD
```
Name: KEYSTORE_PASSWORD
Value: [storePassword từ key.properties]
```

#### Secret 4: KEY_PASSWORD
```
Name: KEY_PASSWORD
Value: [keyPassword từ key.properties]
```

#### Secret 5: KEY_ALIAS
```
Name: KEY_ALIAS
Value: [keyAlias từ key.properties]
```

#### Secret 6: PLAYSTORE_SERVICE_ACCOUNT_JSON
```
Name: PLAYSTORE_SERVICE_ACCOUNT_JSON
Value: [Toàn bộ nội dung file playstore-service-account.json]
```

---

### BƯỚC 5: Tạo Release Notes Directory (2 phút)

```bash
cd d:\Thai\root\ThoHCM\mobile\worker_app

# Tạo folders
mkdir -p whatsnew/vi-VN
mkdir -p whatsnew/en-US

# Tạo file release notes (Vietnamese)
echo "🚀 Cập nhật mới:
- Sửa lỗi đăng nhập
- Cải thiện hiệu suất chat
- Thêm tính năng lọc booking

📱 Cập nhật ngay để trải nghiệm!" > whatsnew/vi-VN/default.txt

# Tạo file release notes (English)
echo "🚀 What's new:
- Fixed login issues
- Improved chat performance
- Added booking filter feature

📱 Update now for better experience!" > whatsnew/en-US/default.txt
```

---

### BƯỚC 6: Chọn Track (Internal/Production)

Edit file `.github/workflows/deploy-to-playstore.yml`:

**Option A: Internal Testing** (Khuyến nghị để test trước)
```yaml
track: internal
status: completed
```

**Option B: Production** (Cho người dùng thật)
```yaml
track: production
status: completed  # Auto-publish sau khi review
# hoặc
status: draft  # Cần manually approve trong Play Console
```

---

## 🚀 CÁCH SỬ DỤNG

### Cách 1: Tự động khi push code
```bash
# Mỗi khi sửa code Worker App
git add .
git commit -m "Fix bugs and improve performance"
git push origin main

# Workflow tự động chạy
# → Build AAB
# → Upload Play Store
# → Users nhận update
```

### Cách 2: Trigger bằng version tag
```bash
# Update version trong pubspec.yaml
# version: 1.2.0+4

git add .
git commit -m "Release v1.2.0"
git tag v1.2.0
git push origin main --tags

# Workflow trigger khi có tag v*.*.*
```

### Cách 3: Manual trigger
```
1. Vào GitHub repo > Actions
2. Select workflow "Deploy to Google Play Store"
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"
```

---

## 📱 NGƯỜI DÙNG NHẬN UPDATE NHƯ THẾ NÀO?

### In-App Update (Khuyến nghị)

Thêm code vào Worker App để check update tự động:

**File: `lib/services/play_store_update_service.dart`**
```dart
import 'package:in_app_update/in_app_update.dart';

class PlayStoreUpdateService {
  static Future<void> checkForUpdate() async {
    try {
      final updateInfo = await InAppUpdate.checkForUpdate();
      
      if (updateInfo.updateAvailability == UpdateAvailability.updateAvailable) {
        // Flexible update: User can continue using app
        await InAppUpdate.startFlexibleUpdate();
        
        // Or Immediate update: Force user to update
        // await InAppUpdate.performImmediateUpdate();
      }
    } catch (e) {
      print('Error checking update: $e');
    }
  }
}
```

**Thêm vào `pubspec.yaml`**:
```yaml
dependencies:
  in_app_update: ^4.2.3
```

**Gọi trong `main.dart`**:
```dart
void initState() {
  super.initState();
  PlayStoreUpdateService.checkForUpdate();
}
```

### Play Store Notification

**Người dùng sẽ nhận**:
1. ✅ Push notification từ Play Store: "Thợ HCM has an update"
2. ✅ Badge trên app icon: "Update available"
3. ✅ In-app dialog (nếu có code above): "Có phiên bản mới!"

---

## ⚙️ CẤU HÌNH NÂNG CAO

### Staged Rollout (Triển khai từng phần)

```yaml
- name: Upload to Google Play Store
  uses: r0adkll/upload-google-play@v1.1.3
  with:
    serviceAccountJsonPlainText: ${{ secrets.PLAYSTORE_SERVICE_ACCOUNT_JSON }}
    packageName: com.thohcm.workerapp
    releaseFiles: mobile/worker_app/build/app/outputs/bundle/release/app-release.aab
    track: production
    status: completed
    inAppUpdatePriority: 5
    userFraction: 0.1  # Bắt đầu với 10% users
    # Sau đó manually tăng: 10% → 20% → 50% → 100%
```

### Auto-increment Version

```yaml
- name: Auto-increment version
  run: |
    cd mobile/worker_app
    # Tăng build number tự động
    perl -i -pe 's/^(version:\s+\d+\.\d+\.\d+\+)(\d+)$/$1.($2+1)/e' pubspec.yaml
    
- name: Commit version bump
  run: |
    git config user.name "GitHub Actions"
    git config user.email "actions@github.com"
    git add mobile/worker_app/pubspec.yaml
    git commit -m "Bump version [skip ci]"
    git push
```

---

## 🔍 MONITORING & TROUBLESHOOTING

### Check Deployment Status

```
1. GitHub Actions:
   https://github.com/hoangthai77641/ThoHCM-Personal-Project/actions
   
2. Google Play Console:
   https://play.google.com/console
   → Production / Internal testing
   → View release status
```

### Common Errors

**Error: "Version code 3 already used"**
```bash
# Tăng version trong pubspec.yaml
version: 1.1.0+4  # Tăng build number
```

**Error: "Service account not authorized"**
```
1. Check Google Play Console > API access
2. Verify service account có đủ permissions
3. Re-link service account nếu cần
```

**Error: "AAB signature mismatch"**
```
1. Check keystore đúng chưa
2. Verify key.properties có đúng password
3. Re-encode keystore nếu cần
```

---

## ⏱️ TIMELINE

| Giai đoạn | Thời gian | Tự động |
|-----------|-----------|---------|
| Push code | 0 phút | ✋ Manual |
| GitHub Actions build | 5-7 phút | ✅ Auto |
| Upload Play Store | 1 phút | ✅ Auto |
| **Internal testing** | **~10 phút** | **✅ Auto** |
| **Production review** | **2-4 giờ** | **✅ Auto (minor)** |
| **Production review** | **1-7 ngày** | **⏳ Manual (major)** |
| Users receive notification | Ngay sau publish | ✅ Auto |
| Users install update | Tùy user | ✋ Manual/Auto |

---

## 💰 CHI PHÍ

- ✅ **GitHub Actions**: FREE (2000 phút/tháng)
- ✅ **Google Play Developer**: $25 (one-time)
- ✅ **Google Cloud APIs**: FREE (API calls trong quota)
- ✅ **Tổng**: **$25 một lần** + $0/tháng

---

## ✅ CHECKLIST HOÀN THÀNH

### Google Cloud:
- [x] Tạo Service Account
- [x] Download JSON key
- [x] Enable Play Android Developer API

### Google Play Console:
- [x] Link Service Account
- [x] Grant permissions (Releases, Testing tracks)
- [x] Verify app đã có Internal testing track

### GitHub Secrets:
- [x] GOOGLE_SERVICES_JSON
- [x] ANDROID_KEYSTORE_BASE64
- [x] KEYSTORE_PASSWORD
- [x] KEY_PASSWORD
- [x] KEY_ALIAS
- [x] PLAYSTORE_SERVICE_ACCOUNT_JSON

### Code:
- [ ] Tạo whatsnew/ directory
- [ ] Tạo release notes (vi-VN, en-US)
- [ ] (Optional) Add in_app_update package
- [ ] (Optional) Add PlayStoreUpdateService

### Testing:
- [ ] Test workflow với Internal track
- [ ] Verify testers nhận được update
- [ ] Test in-app update dialog
- [ ] Verify release notes hiển thị đúng

---

## 🎓 KẾT LUẬN

**Sau khi setup xong**:

1. **Bạn**: Chỉ cần `git push`
2. **GitHub Actions**: Tự động build & deploy
3. **Google Play**: Tự động review & publish (nếu minor update)
4. **Users**: Nhận notification và update

**Không cần**:
- ❌ Build AAB thủ công
- ❌ Upload lên Play Console thủ công
- ❌ Viết release notes mỗi lần
- ❌ Manually publish

**Thời gian tiết kiệm**: ~30-45 phút/release ✨
