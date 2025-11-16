# 🔧 GitHub Actions Setup - Internal Testing

## 📋 MỤC ĐÍCH

GitHub Actions workflow này dùng để:
- ✅ **Tự động build APK** khi push code
- ✅ **Upload lên Firebase App Distribution** 
- ✅ **Gửi email cho internal testers**

**LƯU Ý QUAN TRỌNG**:
- ❌ **KHÔNG** liên kết với Google Play Console
- ❌ **KHÔNG** tự động upload lên Play Store
- ✅ Chỉ dành cho **internal testing** (test nội bộ)

---

## 🎯 SO SÁNH: GitHub Actions vs Google Play Console

| Tính năng | GitHub Actions | Google Play Console |
|-----------|----------------|---------------------|
| **Mục đích** | Internal testing | Production release |
| **Đối tượng** | Testers nội bộ (2-3 người) | Người dùng công khai (hàng nghìn) |
| **File format** | APK | AAB (App Bundle) |
| **Tự động hóa** | Có (khi push code) | Không (upload thủ công) |
| **Review** | Không cần | Cần Google review 2-7 ngày |
| **Distribution** | Email từ Firebase | Google Play Store |
| **Chi phí** | FREE | $25 one-time |

---

## ✅ SETUP GITHUB ACTIONS (10 phút)

### Bước 1: Thêm Google Services JSON Secret

#### 1.1. Copy nội dung file
```bash
# File đã có sẵn tại:
mobile/worker_app/android/app/google-services.json
```

#### 1.2. Vào GitHub Secrets
```
https://github.com/hoangthai77641/ThoHCM-Personal-Project/settings/secrets/actions
```

#### 1.3. Tạo Secret mới
- Click **"New repository secret"**
- **Name**: `GOOGLE_SERVICES_JSON`
- **Value**: Copy toàn bộ nội dung file `google-services.json`
- Click **"Add secret"**

---

### Bước 2: Thêm Firebase App Distribution Secrets

#### 2.1. Lấy Firebase App ID

1. Vào https://console.firebase.google.com
2. Chọn project: **thohcm-frontend**
3. Click **⚙️ Project Settings** > **General** tab
4. Scroll xuống **"Your apps"**
5. Tìm app **"ThoHCM Worker"** (com.thohcm.workerapp)
6. Copy **App ID** (format: `1:934121380383:android:...`)

#### 2.2. Tạo Service Account Key

1. Vẫn trong **Project Settings** > Tab **Service accounts**
2. Click **"Generate new private key"**
3. Confirm và download file JSON
4. Mở file JSON, copy toàn bộ nội dung

#### 2.3. Thêm 2 Secrets vào GitHub

**Secret 1: FIREBASE_WORKER_APP_ID**
```
Name: FIREBASE_WORKER_APP_ID
Value: [Paste App ID từ bước 2.1]
```

**Secret 2: FIREBASE_SERVICE_ACCOUNT**
```
Name: FIREBASE_SERVICE_ACCOUNT  
Value: [Paste toàn bộ nội dung JSON từ bước 2.2]
```

---

### Bước 3: Setup Firebase App Distribution

#### 3.1. Bật App Distribution
```
1. Firebase Console > App Distribution
2. Click "Get started"
3. Chọn app "ThoHCM Worker"
```

#### 3.2. Tạo Tester Group
```
1. Tab "Testers & Groups"
2. Click "Add group"
3. Group name: testers
4. Click "Create group"
```

#### 3.3. Thêm Testers
```
1. Click vào group "testers"
2. Click "Add testers"
3. Nhập emails:
   - hongthongnguyen6@gmail.com
   - nguyenthai790e@gmail.com
4. Click "Add testers"
```

---

## 🚀 TEST WORKFLOW

### Trigger Build

```bash
cd d:\Thai\root\ThoHCM

# Sửa file bất kỳ trong mobile/worker_app
# Ví dụ: thay đổi version trong pubspec.yaml
# version: 1.1.0+4

git add .
git commit -m "Test GitHub Actions workflow"
git push origin main
```

### Theo dõi Build

1. **GitHub Actions**: https://github.com/hoangthai77641/ThoHCM-Personal-Project/actions
2. Xem workflow **"Deploy Worker App to Firebase App Distribution"**
3. Chờ ~7-10 phút để build hoàn tất

### Verify Kết Quả

✅ **Nếu thành công**:
- GitHub Actions: ✅ Green checkmark
- Firebase Console: Bản build mới xuất hiện
- Testers: Nhận email "New release available"

❌ **Nếu thất bại**:
- Check logs trong GitHub Actions
- Verify secrets đã thêm đúng
- Check Firebase permissions

---

## 📱 GOOGLE PLAY CONSOLE (Riêng biệt)

### Quy trình Upload lên Play Store

**KHÔNG tự động** - Cần làm thủ công:

```
1. Build AAB local:
   cd mobile/worker_app
   flutter build appbundle --release

2. Upload lên Google Play Console:
   - Vào: https://play.google.com/console
   - Production > Create release
   - Upload: build/app/outputs/bundle/release/app-release.aab
   - Fill release notes
   - Submit for review

3. Đợi Google review: 2-7 ngày

4. Sau khi approved: Publish to Production
```

**LƯU Ý**: Google Play Console và GitHub Actions là 2 hệ thống hoàn toàn riêng biệt!

---

## 🔄 QUY TRÌNH LÀM VIỆC ĐỀ XUẤT

### Development & Testing (Hàng ngày)

```
1. Code features
2. Git push → GitHub Actions tự động:
   ├─ Build APK
   ├─ Upload Firebase
   └─ Testers nhận email
3. Testers test và feedback
4. Fix bugs
5. Lặp lại 1-4
```

### Production Release (1-2 tuần/lần)

```
1. Khi đã test kỹ với testers
2. Tăng version trong pubspec.yaml
3. Build AAB thủ công
4. Upload lên Google Play Console
5. Đợi review
6. Publish
```

---

## ✅ CHECKLIST HOÀN THÀNH

### GitHub Secrets (3 secrets):
- [ ] GOOGLE_SERVICES_JSON
- [ ] FIREBASE_WORKER_APP_ID
- [ ] FIREBASE_SERVICE_ACCOUNT

### Firebase Setup:
- [ ] Bật App Distribution
- [ ] Tạo group "testers"
- [ ] Thêm 2 email testers

### Testing:
- [ ] Push code test
- [ ] Workflow chạy thành công
- [ ] Firebase có bản build mới
- [ ] Testers nhận email

---

## 🆘 TROUBLESHOOTING

### Lỗi: "google-services.json missing"
**Fix**: Đã thêm secret GOOGLE_SERVICES_JSON chưa?

### Lỗi: "Firebase credentials invalid"
**Fix**: 
- Verify FIREBASE_WORKER_APP_ID đúng format
- Verify FIREBASE_SERVICE_ACCOUNT là valid JSON

### Lỗi: "Testers không nhận email"
**Fix**:
- Check email đã được thêm vào group "testers"
- Check Firebase permissions

### Workflow không chạy
**Fix**:
- Verify file thay đổi trong `mobile/worker_app/**`
- Check GitHub Actions enabled
- Check secrets đã thêm đủ 3 cái

---

## 💡 TÓM TẮT

**GitHub Actions (Internal Testing)**:
- ✅ Tự động khi push code
- ✅ FREE
- ✅ Nhanh (5-10 phút)
- ✅ Cho testers nội bộ

**Google Play Console (Production)**:
- ❌ Thủ công upload
- ❌ Mất phí $25
- ❌ Chậm (2-7 ngày review)
- ✅ Cho người dùng công khai

**Kết luận**: Dùng GitHub Actions để test nhanh với testers, sau đó mới upload lên Play Store cho production! 🚀
