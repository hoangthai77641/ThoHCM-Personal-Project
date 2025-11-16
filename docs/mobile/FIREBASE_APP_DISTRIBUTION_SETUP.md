# 🔥 Hướng Dẫn Setup Firebase App Distribution

## 📋 CÁC BƯỚC THIẾT LẬP

### 1. Lấy Firebase App ID
1. Vào https://console.firebase.google.com
2. Chọn project **thohcm-frontend** (hoặc project của bạn)
3. Vào **Project Settings** (⚙️ icon)
4. Tab **General** > Your apps
5. Tìm app **ThoHCM Worker** (com.thohcm.workerapp)
6. Copy **App ID** (dạng: `1:123456789:android:abc123...`)

### 2. Tạo Service Account Key
1. Vào **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download file JSON
4. Copy toàn bộ nội dung file JSON

### 3. Thêm GitHub Secrets
1. Vào GitHub repo: https://github.com/hoangthai77641/ThoHCM-Personal-Project
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

**Tạo 2 secrets:**

**Secret 1:**
- Name: `FIREBASE_WORKER_APP_ID`
- Value: [App ID từ bước 1]

**Secret 2:**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: [Toàn bộ nội dung file JSON từ bước 2]

### 4. Bật Firebase App Distribution
1. Vào Firebase Console > **App Distribution**
2. Click **Get started**
3. Chọn app **ThoHCM Worker**
4. Tạo tester group tên: **testers**
5. Thêm email người kiểm thử vào group

### 5. Thêm Tester
1. Trong **App Distribution** > **Testers & Groups**
2. Click **Add testers**
3. Nhập email: `hongthongnguyen6@gmail.com`, `nguyenthai790e@gmail.com`
4. Assign vào group **testers**

---

## 🎯 CÁCH HOẠT ĐỘNG

### Quy trình tự động:
```
1. Bạn edit code Worker App
2. Git push lên GitHub (branch main)
3. GitHub Actions tự động:
   ├── Build APK release
   ├── Upload lên Firebase App Distribution
   └── Gửi email thông báo cho testers
4. Tester nhận email
5. Click link trong email
6. Tải APK mới và cài đặt
7. App tự động cập nhật
```

### Thời gian:
- Build APK: ~3-5 phút
- Upload: ~1 phút
- Gửi email: Ngay lập tức
- **Tổng**: ~5-7 phút sau khi push code

---

## 📱 NGƯỜI KIỂM THỬ CẦN LÀM GÌ?

### Lần đầu tiên:
1. Nhận email từ Firebase App Distribution
2. Click **Get started**
3. Tải Firebase App Distribution app (hoặc dùng web)
4. Đăng nhập bằng email được mời

### Các lần sau:
1. Nhận email "New release available"
2. Mở Firebase App Distribution app
3. Click **Download** 
4. Click **Install**
5. App tự động cập nhật ✅

---

## ⚡ TỰ ĐỘNG CẬP NHẬT (IN-APP UPDATE)

Để app tự động kiểm tra và cài đặt bản mới, thêm vào code:

### Trong `pubspec.yaml`:
```yaml
dependencies:
  firebase_app_distribution: ^0.1.0  # Thêm package
```

### Trong main app:
```dart
import 'package:firebase_app_distribution/firebase_app_distribution.dart';

// Kiểm tra update khi mở app
void checkForUpdate() async {
  final appDistribution = FirebaseAppDistribution.instance;
  
  try {
    // Check if update available
    final result = await appDistribution.checkForUpdate();
    
    if (result.hasUpdate) {
      // Show update dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Có phiên bản mới!'),
          content: Text('Phiên bản ${result.version} đã sẵn sàng'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Để sau'),
            ),
            ElevatedButton(
              onPressed: () async {
                // Download and install
                await appDistribution.updateApp();
              },
              child: Text('Cập nhật ngay'),
            ),
          ],
        ),
      );
    }
  } catch (e) {
    print('Error checking update: $e');
  }
}
```

---

## 🔔 THÔNG BÁO TỰ ĐỘNG

### Email notification tự động gửi cho testers:
```
Subject: New release available for ThoHCM Worker

🚀 Version 1.1.0+3 is ready to install

📝 Changes:
- Fix bugs
- Add new features
- Improve performance

👤 Released by: hoangthai77641
🕒 Time: 2025-11-16 10:30:00

[Download Now] [View Release Notes]
```

---

## 💡 LƯU Ý QUAN TRỌNG

### ⚠️ Không dùng cho Production
- Firebase App Distribution chỉ cho **testing**
- Khi release chính thức, dùng **Google Play Store**

### 📊 Theo dõi
- Firebase Console > App Distribution > Dashboard
- Xem số lượng downloads, crashes, feedback

### 🔐 Bảo mật
- Chỉ thêm tester tin cậy
- Service Account key phải giữ bí mật
- Không commit file JSON vào Git

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Lấy Firebase App ID
- [ ] Tạo Service Account Key
- [ ] Thêm GitHub Secrets (2 secrets)
- [ ] Bật Firebase App Distribution
- [ ] Tạo tester group "testers"
- [ ] Thêm email testers
- [ ] Test push code lần đầu
- [ ] Verify testers nhận email
- [ ] Test download và install

---

## 🚀 TEST NGAY

Sau khi setup xong, test bằng cách:

```bash
# Sửa file bất kỳ trong mobile/worker_app
git add .
git commit -m "Test auto deployment"
git push

# Đợi 5-7 phút, check:
# 1. GitHub Actions > workflow "Deploy Worker App"
# 2. Email testers
# 3. Firebase Console > App Distribution
```

---

**Next Steps**: Sau khi test OK, có thể thêm:
- Slack notification
- Auto-increment version
- Changelog generator
- Screenshot capture
