# Play Store Assets

## 📁 Cấu trúc thư mục

```
playstore/
├── app-icon-512x512.png          # Icon ứng dụng (REQUIRED)
├── feature-graphic-1024x500.png  # Banner chính (REQUIRED)
└── screenshots/                   # Screenshots (REQUIRED - tối thiểu 2)
    ├── 01-home.png               # Màn hình Home
    ├── 02-booking.png            # Màn hình Booking
    ├── 03-chat.png               # Màn hình Chat
    ├── 04-dashboard.png          # Màn hình Dashboard
    ├── 05-wallet.png             # Màn hình Wallet
    └── 06-reviews.png            # Màn hình Reviews
```

## 🎨 Yêu cầu kỹ thuật

### App Icon (512x512)
- **Kích thước**: 512 x 512 pixels
- **Format**: PNG (32-bit)
- **Không alpha/transparency**: Phải có background
- **Max size**: 1MB
- **Nội dung**: Logo ThoHCM với background

### Feature Graphic (1024x500)
- **Kích thước**: 1024 x 500 pixels
- **Format**: PNG hoặc JPG
- **Max size**: 1MB
- **Nội dung**: Banner quảng cáo app với:
  - Logo app
  - Text: "Thợ HCM - Thợ Chuyên Nghiệp"
  - Slogan: "Kết nối thợ giỏi - Tận tâm phục vụ"
  - Hình ảnh minh họa thợ đang làm việc

### Screenshots (1080x1920)
- **Kích thước**: 1080 x 1920 pixels (tỷ lệ 9:16)
- **Format**: PNG hoặc JPG
- **Max size**: 8MB mỗi file
- **Số lượng**: Tối thiểu 2, khuyến nghị 4-6
- **Nội dung**: Phải là UI thật của app, không mock

## 📸 Cách chụp Screenshots

### Option 1: Sử dụng Emulator
```bash
# 1. Chạy app trên emulator
cd d:\Thai\root\ThoHCM\mobile\worker_app
flutter run

# 2. Trong Android Studio:
# - Mở Device Manager
# - Click vào Camera icon để chụp
# - Hoặc nhấn Ctrl + S
```

### Option 2: Sử dụng thiết bị thật
```bash
# 1. Chạy app trên thiết bị
flutter run -d <device-id>

# 2. Chụp màn hình:
# - Android: Power + Volume Down
# - File sẽ lưu trong DCIM/Screenshots
```

### Option 3: Sử dụng tool
```bash
# Sử dụng ADB để chụp từ máy tính
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## 🎯 Screenshots cần có

### 1. Home Screen (01-home.png)
- Hiển thị danh sách booking
- Tab navigation
- User info

### 2. Booking Detail (02-booking.png)
- Chi tiết công việc
- Customer info
- Map location
- Chat button

### 3. Chat Screen (03-chat.png)
- Conversation với khách hàng
- Send message
- Image sharing

### 4. Dashboard (04-dashboard.png)
- Statistics charts
- Earnings
- Bookings overview

### 5. Wallet (05-wallet.png)
- Balance
- Transaction history
- Withdraw button

### 6. Reviews (06-reviews.png)
- Customer reviews
- Ratings
- Service quality

## 🛠️ Tools để tạo assets

### App Icon & Feature Graphic

#### Option 1: Canva (Khuyến nghị)
1. Truy cập: https://www.canva.com
2. Tạo custom size:
   - Icon: 512x512
   - Feature: 1024x500
3. Sử dụng template hoặc thiết kế từ đầu
4. Export PNG

#### Option 2: Figma
1. Tạo frame với kích thước phù hợp
2. Thiết kế
3. Export as PNG

#### Option 3: Adobe Express
1. Tạo thiết kế mới
2. Chọn custom size
3. Export

### Resize Screenshots

Nếu screenshots không đúng kích thước:

```bash
# Sử dụng ImageMagick
convert input.png -resize 1080x1920 output.png

# Hoặc online tool:
# https://www.iloveimg.com/resize-image
```

## ✅ Checklist trước khi upload

```
□ app-icon-512x512.png (512x512, PNG, < 1MB)
□ feature-graphic-1024x500.png (1024x500, PNG/JPG, < 1MB)
□ 01-home.png (1080x1920, PNG/JPG)
□ 02-booking.png (1080x1920, PNG/JPG)
□ 03-chat.png (1080x1920, PNG/JPG)
□ 04-dashboard.png (1080x1920, PNG/JPG)
□ 05-wallet.png (1080x1920, PNG/JPG) [Optional]
□ 06-reviews.png (1080x1920, PNG/JPG) [Optional]
```

## 📝 Notes

- **Không có text overlay quá nhiều**: Google có thể reject
- **UI phải rõ ràng**: Không blur, không pixelated
- **Đúng kích thước**: Sai kích thước sẽ bị reject
- **Thể hiện tính năng chính**: Mỗi screenshot nên show một tính năng quan trọng
- **Consistent branding**: Giữ màu sắc và style nhất quán

## 🎨 Design Guidelines

### Colors (ThoHCM Branding)
- Primary: #2196F3 (Blue)
- Secondary: #FF9800 (Orange)
- Background: #FFFFFF (White)
- Text: #333333 (Dark Gray)

### Typography
- Font: Roboto (Android default)
- Headings: Bold
- Body: Regular

## 🔗 Resources

- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Material Design Icons](https://material.io/resources/icons/)
- [Canva Templates](https://www.canva.com/templates/)
