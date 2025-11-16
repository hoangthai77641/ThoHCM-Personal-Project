# 📱 Hướng Dẫn Chi Tiết Deploy App "Thợ HCM" Lên Google Play Store

> **Trạng thái hiện tại**: App đã được tạo trên Google Play Console (đang ở trạng thái "Bản nháp")
> **Version**: 1.1.0 (Build 2)
> **Package**: com.thohcm.workerapp

---

## 🎯 Tổng Quan: Các Bước Cần Hoàn Thành

Dựa trên ảnh screenshot, bạn cần hoàn thành **11 bước** trước khi submit app:

### ✅ Đã Hoàn Thành
- [x] Tạo app trên Google Play Console
- [x] Production keystore đã có (thohcm-release-key.jks)
- [x] Signing config đã được setup

### 📋 Cần Hoàn Thành (Theo Thứ Tự)

---

## BƯỚC 1: Hoàn Tất Cài Đặt Chính Sách Quyền Riêng Tư 🔒

### Yêu cầu:
- **Privacy Policy URL** (BẮT BUỘC)
- Phải là URL công khai, có thể truy cập được

### Cách thực hiện:

#### Option 1: Tạo Privacy Policy trên GitHub Pages (Khuyến nghị)
```bash
# 1. Tạo file privacy-policy.html trong thư mục docs/
# 2. Push lên GitHub
# 3. Bật GitHub Pages trong Settings > Pages
# 4. URL sẽ là: https://yourusername.github.io/ThoHCM/privacy-policy.html
```

#### Option 2: Host trên website thohcm.com
- Upload file privacy policy lên `https://thohcm.com/privacy-policy`
- Đảm bảo URL này trả về nội dung HTML hợp lệ

### Nội dung Privacy Policy:
Sử dụng template có sẵn trong `docs/PRIVACY_POLICY.md` và chuyển thành HTML.

**Các điểm quan trọng cần có:**
1. ✅ Dữ liệu thu thập (Location, Camera, Storage)
2. ✅ Cách sử dụng dữ liệu
3. ✅ Chia sẻ dữ liệu với bên thứ 3 (Firebase, Payment providers)
4. ✅ Quyền người dùng
5. ✅ Thông tin liên hệ

### Nhập vào Play Console:
1. Vào **Thiết lập > Chính sách quyền riêng tư**
2. Nhập URL privacy policy
3. Click **Lưu**

---

## BƯỚC 2: Quyền Truy Cập Vào Ứng Dụng 📱

### Yêu cầu:
Giải thích các quyền mà app yêu cầu

### Các quyền của Thợ HCM:

```yaml
Location (Vị trí GPS):
  - Mục đích: Tìm thợ gần nhất, hiển thị vị trí trên bản đồ
  - Loại: Foreground location
  - Có thể từ chối: Có (app vẫn hoạt động nhưng giới hạn)

Camera:
  - Mục đích: Chụp ảnh công việc, cập nhật avatar
  - Có thể từ chối: Có

Storage (Lưu trữ):
  - Mục đích: Lưu ảnh, cache dữ liệu
  - Có thể từ chối: Không (cần thiết)

Internet:
  - Mục đích: Kết nối API, real-time messaging
  - Có thể từ chối: Không (cần thiết)

Notifications (Thông báo):
  - Mục đích: Nhận thông báo booking mới
  - Có thể từ chối: Có
```

### Cách khai báo trong Play Console:
1. Vào **Chính sách ứng dụng > Quyền truy cập**
2. Chọn từng quyền và giải thích mục đích sử dụng
3. Đánh dấu quyền nào là bắt buộc, quyền nào là tùy chọn

---

## BƯỚC 3: Quảng Cáo 📺

### Câu hỏi:
**"Ứng dụng của bạn có hiển thị quảng cáo không?"**

### Trả lời cho Thợ HCM:
- ✅ **KHÔNG** - App không có quảng cáo

### Cách khai báo:
1. Vào **Chính sách ứng dụng > Quảng cáo**
2. Chọn: **"Không, ứng dụng của tôi không hiển thị quảng cáo"**
3. Click **Lưu**

---

## BƯỚC 4: Mục Phân Loại Nội Dung (Content Rating) ⭐

### Yêu cầu:
Hoàn thành bảng câu hỏi về nội dung app

### Khuyến nghị cho Thợ HCM:
- **Rating**: Teen (13+) / PEGI 12
- **Lý do**: App không có nội dung nhạy cảm, phù hợp cho người lớn

### Cách hoàn thành:
1. Vào **Chính sách ứng dụng > Xếp hạng nội dung**
2. Click **Bắt đầu bảng câu hỏi**
3. Trả lời các câu hỏi:
   - Violence: No
   - Sexual content: No
   - Drugs/Alcohol: No
   - Language: None
   - Gambling: No
   - User-generated content: Yes (Reviews/Ratings)
   - User communication: Yes (Chat)
   - Social features: Yes (Booking system)
4. Submit và nhận rating

### Kết quả mong đợi:
```
IARC: Teen
PEGI: 12
ESRB: Teen
USK: 12
```

---

## BƯỚC 5: Đối Tượng Mục Tiêu 🎯

### Yêu cầu:
Khai báo độ tuổi người dùng mục tiêu

### Cho Thợ HCM:
```yaml
Độ tuổi chính: 18+
Lý do: Ứng dụng dành cho người trưởng thành cần dịch vụ sửa chữa

Có hướng đến trẻ em dưới 13 tuổi: KHÔNG
```

### Cách khai báo:
1. Vào **Chính sách ứng dụng > Đối tượng mục tiêu**
2. Chọn: **"Người lớn (18+)"**
3. Xác nhận app không hướng đến trẻ em
4. Click **Lưu**

---

## BƯỚC 6: An Toàn Dữ Liệu 🔐

### Yêu cầu:
Khai báo cách thu thập, sử dụng và bảo vệ dữ liệu người dùng

### Dữ liệu Thợ HCM thu thập:

#### 1. **Thông tin cá nhân**
- ✅ Tên, số điện thoại
- ✅ Địa chỉ
- ✅ Ảnh đại diện
- **Mục đích**: Tạo profile, liên hệ
- **Chia sẻ**: Không chia sẻ với bên thứ 3
- **Mã hóa**: Có (HTTPS, database encryption)

#### 2. **Vị trí**
- ✅ Vị trí GPS chính xác
- **Mục đích**: Tìm thợ gần nhất
- **Chia sẻ**: Với thợ được chọn
- **Thu thập**: Khi sử dụng app

#### 3. **Dữ liệu tài chính**
- ✅ Thông tin thanh toán
- **Mục đích**: Xử lý giao dịch
- **Chia sẻ**: VNPay, ZaloPay, Stripe (payment processors)
- **Bảo mật**: PCI-DSS compliant

#### 4. **Ảnh và video**
- ✅ Ảnh công việc, ảnh profile
- **Mục đích**: Ghi nhận công việc
- **Lưu trữ**: Google Cloud Storage
- **Xóa**: Có thể xóa bất kỳ lúc nào

### Cách khai báo:
1. Vào **Chính sách ứng dụng > An toàn dữ liệu**
2. Điền form cho từng loại dữ liệu
3. Giải thích mục đích thu thập
4. Khai báo cách bảo vệ dữ liệu
5. Xác nhận người dùng có thể yêu cầu xóa dữ liệu

---

## BƯỚC 7: Ứng Dụng Của Chính Phủ 🏛️

### Câu hỏi:
**"Ứng dụng này có phải do chính phủ phát triển không?"**

### Trả lời:
- ✅ **KHÔNG** - Thợ HCM là app thương mại

### Cách khai báo:
1. Vào **Chính sách ứng dụng > Ứng dụng chính phủ**
2. Chọn: **"Không"**
3. Click **Lưu**

---

## BƯỚC 8: Tính Năng Tài Chính 💰

### Yêu cầu:
Khai báo nếu app có tính năng tài chính

### Cho Thợ HCM:
```yaml
App có xử lý thanh toán: CÓ
Loại: Service booking payments

Tính năng:
  - Thanh toán dịch vụ qua VNPay, ZaloPay, Stripe
  - Ví điện tử nội bộ (Wallet)
  - Lịch sử giao dịch

Tuân thủ:
  - PCI-DSS (payment security)
  - Know Your Customer (KYC) cho thợ
  - Anti-money laundering compliance
```

### Cách khai báo:
1. Vào **Chính sách ứng dụng > Tính năng tài chính**
2. Chọn: **"Có, app có xử lý thanh toán"**
3. Chọn loại: **"Digital goods/services"**
4. Liệt kê payment providers: VNPay, ZaloPay, Stripe
5. Xác nhận tuân thủ quy định tài chính
6. Click **Lưu**

---

## BƯỚC 9: Sức Khỏe 🏥

### Câu hỏi:
**"App có cung cấp dịch vụ y tế/sức khỏe không?"**

### Trả lời cho Thợ HCM:
- ✅ **KHÔNG** - App về dịch vụ sửa chữa, không liên quan y tế

### Cách khai báo:
1. Vào **Chính sách ứng dụng > Sức khỏe**
2. Chọn: **"Không"**
3. Click **Lưu**

---

## BƯỚC 10: Thiết Lập Trang Thông Tin Trên Cửa Hàng Play 🎨

### 📱 **10.1. Thông Tin Cơ Bản**

```yaml
Tên app: "Thợ HCM - Thợ Chuyên Nghiệp"
Mô tả ngắn (80 ký tự): 
  "Ứng dụng đặt thợ sửa chữa tại nhà nhanh chóng, tiện lợi"
```

### 📝 **10.2. Mô Tả Đầy Đủ**
Copy từ file `docs/PLAY_STORE_DESCRIPTIONS.md` (Vietnamese version)

### 🎨 **10.3. Đồ Họa Bắt Buộc**

#### **App Icon** (512x512px) ✅
- File: `assets/playstore/app-icon-512x512.png`
- Đã tạo sẵn

#### **Feature Graphic** (1024x500px) ✅
- File: `assets/playstore/feature-graphic-1024x500.png`
- Đã tạo sẵn

#### **Screenshots** (CHƯA CÓ) ⚠️
Cần chụp **ít nhất 2 screenshots**, khuyến nghị 4-6:

**Nội dung screenshots nên có:**
1. 📱 Màn hình Home - Danh sách dịch vụ
2. 📅 Màn hình Booking - Đặt lịch
3. 💬 Màn hình Chat - Nhắn tin với thợ
4. 📊 Màn hình Dashboard - Thống kê thu nhập
5. ⭐ Màn hình Reviews - Đánh giá
6. 💰 Màn hình Wallet - Ví điện tử

**Yêu cầu kỹ thuật:**
- Kích thước: 1080 x 1920 pixels (9:16)
- Format: PNG hoặc JPG
- Max size: 8MB/file
- Không có text overlay quá nhiều
- Hiển thị UI thật của app

**Cách chụp:**
```bash
# Sử dụng Android Emulator hoặc thiết bị thật
# Chụp màn hình: Power + Volume Down
# Hoặc dùng Android Studio > Logcat > Screenshot icon
```

### 📞 **10.4. Thông Tin Liên Hệ**
```yaml
Email: support@thohcm.com
Website: https://thohcm.com
Phone: 1900-xxx-xxx (optional)
```

---

## BƯỚC 11: Chọn Danh Mục và Thông Tin Liên Hệ 📂

### Danh mục:
- **Primary**: Lifestyle
- **Secondary**: Business (optional)

### Tags:
- Home & Garden
- Local Services
- Utilities

### Cách chọn:
1. Vào **Store presence > Main store listing**
2. Scroll xuống **App category**
3. Chọn: **Lifestyle**
4. Click **Lưu**

---

## BƯỚC 12: Build và Upload AAB File 📦

### **12.1. Kiểm Tra Cấu Hình**

Verify version trong `pubspec.yaml`:
```yaml
version: 1.1.0+2  # 1.1.0 là version name, 2 là build number
```

### **12.2. Clean Build**

```powershell
# Di chuyển vào thư mục mobile app
cd d:\Thai\root\ThoHCM\mobile\worker_app

# Clean old builds
flutter clean

# Get dependencies
flutter pub get

# Verify no errors
flutter doctor
```

### **12.3. Build Release AAB**

```powershell
# Build App Bundle (khuyến nghị)
flutter build appbundle --release

# Output file sẽ ở:
# build/app/outputs/bundle/release/app-release.aab
```

**Lưu ý quan trọng:**
- ✅ File AAB được sign tự động bằng keystore trong `android/key.properties`
- ✅ Kích thước AAB: ~47MB
- ✅ AAB nhỏ hơn APK và được Google tối ưu hóa

### **12.4. Verify Build**

```powershell
# Kiểm tra AAB file có tồn tại
ls build\app\outputs\bundle\release\app-release.aab

# Kiểm tra kích thước (should be ~47MB)
```

### **12.5. Upload AAB lên Play Console**

**Bước upload:**

1. Vào **Google Play Console**
2. Chọn app **"Thợ HCM"**
3. Vào **Release > Production**
4. Click **Create new release**
5. Click **Upload** và chọn file:
   ```
   d:\Thai\root\ThoHCM\mobile\worker_app\build\app\outputs\bundle\release\app-release.aab
   ```
6. Đợi upload hoàn tất (có thể mất vài phút)
7. Google sẽ scan app và báo lỗi (nếu có)

**Release notes (Ghi chú phát hành):**
```
Phiên bản 1.1.0 (Build 2)

Tính năng mới:
- Hệ thống booking thợ chuyên nghiệp
- Chat real-time với khách hàng
- Quản lý lịch làm việc
- Ví điện tử và rút tiền
- Đánh giá và phản hồi
- Thông báo đẩy

Cải thiện:
- Tối ưu hiệu suất
- Cải thiện UX/UI
- Sửa lỗi nhỏ
```

---

## BƯỚC 13: Submit For Review 🚀

### **13.1. Final Checklist**

Trước khi submit, đảm bảo:

```
✅ Privacy Policy URL đã nhập
✅ Content Rating đã hoàn thành
✅ Data Safety đã khai báo đầy đủ
✅ App icon 512x512 đã upload
✅ Feature graphic 1024x500 đã upload
✅ Screenshots (2-8 cái) đã upload
✅ Short description đã điền
✅ Full description đã điền
✅ App category đã chọn
✅ Contact email đã điền
✅ AAB file đã upload thành công
✅ Pricing: Free (nếu miễn phí)
✅ Countries: Chọn Vietnam và các nước muốn phát hành
```

### **13.2. Submit**

1. Vào **Production release**
2. Review tất cả thông tin
3. Click **Review release**
4. Kiểm tra warnings/errors
5. Nếu mọi thứ OK, click **Start rollout to Production**
6. Confirm: **Rollout**

### **13.3. Thời Gian Review**

```
⏱️ First submission: 2-7 ngày
⏱️ Updates sau: Vài giờ đến 2 ngày
```

### **13.4. Theo Dõi Trạng Thái**

1. Vào **Dashboard**
2. Xem **Status**: 
   - 🟡 **In review**: Đang chờ Google duyệt
   - 🔴 **Rejected**: Bị từ chối (xem lý do)
   - 🟢 **Published**: Đã phát hành thành công

---

## 📊 Next Steps Sau Khi Published

### **Monitoring**
1. Theo dõi crash reports trong **Play Console > Vitals**
2. Xem user reviews và respond
3. Monitor ratings (target: 4.0+)

### **Updates**
```powershell
# Khi cần update app:
# 1. Tăng version trong pubspec.yaml
version: 1.2.0+3  # version 1.2.0, build 3

# 2. Build lại AAB
flutter build appbundle --release

# 3. Upload AAB mới lên Production track
# 4. Submit for review
```

### **Marketing**
- Share link: `https://play.google.com/store/apps/details?id=com.thohcm.workerapp`
- Tích hợp deep links
- Tạo pre-registration campaign (optional)

---

## 🆘 Troubleshooting

### **Lỗi thường gặp:**

#### 1. **"App not signed"**
```bash
# Kiểm tra key.properties file exists
ls android/key.properties

# Verify keystore file
ls android/app/thohcm-release-key.jks
```

#### 2. **"Target SDK too low"**
Cần target SDK 34+ (Android 14). Check file `android/app/build.gradle.kts`:
```kotlin
targetSdk = 34  // hoặc cao hơn
```

#### 3. **"Missing screenshots"**
Bắt buộc phải có ít nhất 2 screenshots phone.

#### 4. **"Privacy Policy URL invalid"**
URL phải:
- Bắt đầu với https://
- Trả về nội dung HTML hợp lệ
- Publicly accessible (không cần login)

#### 5. **"Data Safety section incomplete"**
Phải khai báo đầy đủ tất cả dữ liệu thu thập.

---

## 📞 Support

**Nếu gặp vấn đề:**
1. Check [Google Play Console Help](https://support.google.com/googleplay/android-developer)
2. Email Google Play Support từ console
3. Community: [Android Developers](https://developer.android.com/community)

---

## ✅ Summary Checklist

Sử dụng checklist này để theo dõi tiến độ:

```
□ Privacy Policy URL (BƯỚC 1)
□ App permissions declared (BƯỚC 2)
□ Ads declaration (BƯỚC 3)
□ Content rating completed (BƯỚC 4)
□ Target audience set (BƯỚC 5)
□ Data safety filled (BƯỚC 6)
□ Government app: No (BƯỚC 7)
□ Financial features declared (BƯỚC 8)
□ Health: No (BƯỚC 9)
□ App icon uploaded (BƯỚC 10)
□ Feature graphic uploaded (BƯỚC 10)
□ Screenshots uploaded (BƯỚC 10)
□ Short description written (BƯỚC 10)
□ Full description written (BƯỚC 10)
□ App category selected (BƯỚC 11)
□ Contact email provided (BƯỚC 11)
□ AAB built and uploaded (BƯỚC 12)
□ Release notes written (BƯỚC 12)
□ Submitted for review (BƯỚC 13)
```

---

**🎉 Chúc bạn deploy thành công! 🎉**
