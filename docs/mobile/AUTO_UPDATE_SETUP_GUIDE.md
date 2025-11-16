# 🔔 Hướng Dẫn Setup Thông Báo Cập Nhật Tự Động

## 🎯 MỤC TIÊU
Khi bạn push code lên GitHub → App trên điện thoại testers **tự động nhận thông báo** có bản cập nhật mới.

---

## ✅ CÁC FILE ĐÃ TẠO

1. **.github/workflows/deploy-worker-app.yml** - GitHub Actions workflow
2. **lib/services/app_update_service.dart** - Service kiểm tra update
3. **pubspec.yaml** - Đã thêm `firebase_app_distribution: ^0.1.0+1`
4. **lib/main.dart** - Đã tích hợp auto-check khi mở app

---

## 📋 SETUP CHI TIẾT

### BƯỚC 1: Setup Firebase App Distribution (5 phút)

#### 1.1. Vào Firebase Console
```
https://console.firebase.google.com
→ Chọn project: thohcm-frontend
→ Click "App Distribution" trong menu bên trái
→ Click "Get started"
```

#### 1.2. Lấy Firebase App ID
```
1. Project Settings (⚙️ icon) > General tab
2. Scroll xuống "Your apps"
3. Tìm "ThoHCM Worker" (com.thohcm.workerapp)
4. Copy "App ID" (dạng: 1:123456789:android:abc123...)
```

#### 1.3. Tạo Service Account Key
```
1. Project Settings > Service accounts tab
2. Click "Generate new private key"
3. Confirm và download file JSON
4. Lưu file an toàn (KHÔNG commit vào Git)
```

---

### BƯỚC 2: Setup GitHub Secrets (2 phút)

#### 2.1. Vào GitHub Repository Settings
```
https://github.com/hoangthai77641/ThoHCM-Personal-Project/settings/secrets/actions
```

#### 2.2. Tạo 2 Secrets

**Secret 1: FIREBASE_WORKER_APP_ID**
```
Name: FIREBASE_WORKER_APP_ID
Value: [Paste App ID từ bước 1.2]
```

**Secret 2: FIREBASE_SERVICE_ACCOUNT**
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: [Paste toàn bộ nội dung file JSON từ bước 1.3]
```

---

### BƯỚC 3: Tạo Tester Group (2 phút)

#### 3.1. Trong Firebase Console > App Distribution
```
1. Click tab "Testers & Groups"
2. Click "Add group"
3. Group name: testers
4. Click "Create group"
```

#### 3.2. Thêm Testers vào Group
```
1. Click vào group "testers"
2. Click "Add testers"
3. Nhập emails:
   - hongthongnguyen6@gmail.com
   - nguyenthai790e@gmail.com
4. Click "Add testers"
```

---

### BƯỚC 4: Cài Firebase App Distribution trên điện thoại (1 phút)

#### Testers cần làm:
```
1. Mở email từ Firebase App Distribution
2. Click link "Get started"
3. Chọn 1 trong 2:
   
   Option A: Dùng Web (không cần cài app)
   - Mở link trong browser
   - Bookmark lại để dùng sau
   
   Option B: Cài Firebase App Distribution app
   - Tải app từ Play Store
   - Đăng nhập bằng email được mời
```

---

### BƯỚC 5: Test Workflow (5 phút)

#### 5.1. Trigger build đầu tiên
```bash
cd d:\Thai\root\ThoHCM

# Sửa version trong pubspec.yaml
# version: 1.1.0+4  (tăng lên)

git add .
git commit -m "Test auto deployment to testers"
git push origin main
```

#### 5.2. Theo dõi build
```
1. Vào: https://github.com/hoangthai77641/ThoHCM-Personal-Project/actions
2. Xem workflow "Deploy Worker App to Firebase App Distribution"
3. Chờ ~5-7 phút cho đến khi ✅ thành công
```

#### 5.3. Verify trên Firebase
```
1. Firebase Console > App Distribution > Releases
2. Sẽ thấy bản build mới với:
   - Version: 1.1.0 (4)
   - Release notes
   - Số lượng testers
```

---

## 🔔 CÁCH HOẠT ĐỘNG

### Quy trình tự động:

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Developer: Edit code Worker App                           │
│    ├─ Sửa bug                                                 │
│    ├─ Thêm feature mới                                        │
│    └─ Cải thiện UI/UX                                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Git Push                                                   │
│    $ git add .                                                │
│    $ git commit -m "Update feature X"                         │
│    $ git push origin main                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. GitHub Actions Auto Trigger                               │
│    ├─ Detect changes in mobile/worker_app/**                 │
│    ├─ Setup Flutter & Java                                   │
│    ├─ flutter build apk --release                            │
│    └─ Build time: ~3-5 phút                                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Upload to Firebase App Distribution                       │
│    ├─ Upload APK file                                        │
│    ├─ Create release notes from commit message               │
│    └─ Assign to "testers" group                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. Firebase Send Notifications                               │
│    ├─ Email to all testers                                   │
│    ├─ Push notification (if app installed)                   │
│    └─ In-app notification (if app opened)                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Tester Actions                                            │
│    ├─ Nhận email "New release available"                     │
│    ├─ Mở Firebase App Distribution                           │
│    ├─ Click "Download"                                       │
│    ├─ Click "Install"                                        │
│    └─ App tự động cập nhật ✅                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. In-App Update Check (Tự động)                             │
│    ├─ Mở app → Auto check update                             │
│    ├─ Hiển thị dialog "Có phiên bản mới"                     │
│    ├─ Show release notes                                     │
│    ├─ Click "Cập nhật ngay"                                  │
│    └─ Download & install trong app                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 TRẢI NGHIỆM NGƯỜI DÙNG

### Khi có bản cập nhật mới:

#### Thông báo Email:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email Subject:
"New release available for ThoHCM Worker"

📄 Email Body:
🚀 Version 1.1.0 (Build 4) is ready!

📝 What's new:
- Fix login bug
- Add booking filter
- Improve chat performance

👤 Released by: hoangthai77641
🕒 Time: 2025-11-16 14:30:00

[Download Now] [View in Firebase]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### In-App Dialog (Tự động):
```
┌────────────────────────────────────┐
│ 🔄 Có phiên bản mới!               │
├────────────────────────────────────┤
│                                    │
│ Phiên bản 1.1.0 (4) đã sẵn sàng   │
│                                    │
│ Nội dung cập nhật:                 │
│ ┌────────────────────────────────┐ │
│ │ - Sửa lỗi đăng nhập            │ │
│ │ - Thêm bộ lọc booking          │ │
│ │ - Cải thiện hiệu suất chat     │ │
│ └────────────────────────────────┘ │
│                                    │
│ ⚡ Cập nhật ngay để trải nghiệm!   │
│                                    │
├────────────────────────────────────┤
│         [Để sau]  [Cập nhật ngay] │
└────────────────────────────────────┘
```

---

## ⏱️ TIMELINE

| Bước | Thời gian | Ghi chú |
|------|-----------|---------|
| Push code | 0 phút | Bắt đầu |
| GitHub Actions build | 3-5 phút | Auto |
| Upload Firebase | 1 phút | Auto |
| Send notifications | Ngay lập tức | Auto |
| Tester nhận email | < 1 phút | |
| Tester download | 2-3 phút | Manual |
| Tester install | 30 giây | Manual |
| **TỔNG** | **~7-10 phút** | Từ push đến installed |

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Workflow không chạy"
**Nguyên nhân**: GitHub Actions chưa được bật
**Giải pháp**:
```
1. Repo Settings > Actions > General
2. "Allow all actions and reusable workflows"
3. Save
```

### Lỗi: "Build failed - Firebase credentials"
**Nguyên nhân**: Secrets chưa được thêm đúng
**Giải pháp**:
```
1. Check GitHub Secrets có 2 secrets:
   - FIREBASE_WORKER_APP_ID
   - FIREBASE_SERVICE_ACCOUNT
2. Verify nội dung không có khoảng trắng thừa
3. Re-create secrets nếu cần
```

### Lỗi: "Testers không nhận email"
**Nguyên nhân**: Email chưa được thêm vào tester group
**Giải pháp**:
```
1. Firebase Console > App Distribution
2. Testers & Groups > testers group
3. Verify email có trong danh sách
4. Resend invitation nếu cần
```

### Lỗi: "In-app update không hiện"
**Nguyên nhân**: Package firebase_app_distribution chưa cài
**Giải pháp**:
```bash
cd mobile/worker_app
flutter pub get
flutter clean
flutter build apk --release
```

---

## 🚀 CÁCH SỬ DỤNG SAU KHI SETUP

### Developer (Bạn):
```bash
# Mỗi khi sửa code Worker App:
git add .
git commit -m "Describe your changes"
git push

# Xong! Không cần làm gì thêm
```

### Tester:
```
Option 1: Nhận email → Click link → Download → Install

Option 2: Mở app → Dialog hiện "Có bản mới" 
          → Click "Cập nhật ngay" → Auto install

Option 3: Mở Firebase App Distribution app 
          → Xem danh sách releases → Download
```

---

## 💰 CHI PHÍ

- ✅ **GitHub Actions**: FREE (2000 phút/tháng)
- ✅ **Firebase App Distribution**: FREE (unlimited)
- ✅ **Tổng chi phí**: **$0 / tháng** 🎉

---

## 📊 THEO DÕI & PHÂN TÍCH

### Firebase Console Dashboard:
```
1. App Distribution > Releases
   - Số lượng downloads
   - Testers installed
   - Version adoption rate

2. Crashlytics (optional)
   - Crash reports
   - ANR reports
   - Custom logs

3. Analytics (optional)
   - User engagement
   - Feature usage
   - Screen views
```

---

## ✅ CHECKLIST HOÀN THÀNH

Đánh dấu ✅ khi hoàn thành:

### Firebase Setup:
- [ ] Lấy Firebase App ID
- [ ] Tạo Service Account Key
- [ ] Bật App Distribution
- [ ] Tạo tester group "testers"
- [ ] Thêm 2 emails vào group

### GitHub Setup:
- [ ] Thêm secret: FIREBASE_WORKER_APP_ID
- [ ] Thêm secret: FIREBASE_SERVICE_ACCOUNT
- [ ] Verify workflow file tồn tại
- [ ] Enable GitHub Actions

### Code Setup:
- [ ] pubspec.yaml có firebase_app_distribution
- [ ] AppUpdateService đã được tạo
- [ ] main.dart đã tích hợp checkForUpdate
- [ ] flutter pub get thành công

### Testing:
- [ ] Push code test
- [ ] Workflow chạy thành công
- [ ] Release xuất hiện trên Firebase
- [ ] Testers nhận email
- [ ] Download và install OK
- [ ] In-app update dialog hiện

---

## 🎓 NÂNG CAO (OPTIONAL)

### Thêm Slack notification:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'New Worker App deployed! Version: ${{ github.sha }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Auto-increment version:
```yaml
- name: Bump version
  run: |
    cd mobile/worker_app
    perl -i -pe 's/^(version:\s+\d+\.\d+\.\d+\+)(\d+)$/$1.($2+1)/e' pubspec.yaml
```

### Generate changelog:
```yaml
- name: Generate changelog
  run: |
    git log --oneline --no-merges $(git describe --tags --abbrev=0)..HEAD > CHANGELOG.md
```

---

**🎯 Kết quả**: Push code → Testers nhận thông báo sau 5-10 phút! ✅
