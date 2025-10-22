# Google Play Console Upload Guide

## 🎯 Complete Checklist for Play Store Submission

### ✅ Assets Status:
- [x] App Icon (512x512): app-icon-512.png ✅
- [x] Feature Graphic (1024x500): Screenshot 2025-10-21 235315.png ✅
- [ ] Screenshots: Need 2+ phone screenshots
- [x] App Bundle: app-release.aab (47.4MB) ✅
- [x] Production Keystore: thohcm-release-key.jks ✅

## 🔐 Account Setup

### Step 1: Google Play Console Account
1. **Go to**: https://play.google.com/console
2. **Sign in** with Google account
3. **Pay $25** one-time registration fee
4. **Complete** identity verification
5. **Set up** tax and banking information

### Step 2: Create New App
1. **Click** "Create app"
2. **App details**:
   - App name: `ThoHCM Worker`
   - Default language: `Vietnamese (Vietnam)`
   - App or game: `App`
   - Free or paid: `Free`
3. **Declarations**:
   - [x] App complies with Google Play policies
   - [x] App complies with US export laws
4. **Click** "Create app"

## 📱 App Bundle Upload

### Step 3: Upload AAB File
1. **Go to**: Release > Production > Create new release
2. **Upload** app bundle: `app-release.aab` (47.4MB)
3. **Release name**: `1.0.0 (1)` 
4. **Release notes**:
```
Vietnamese:
- Phiên bản đầu tiên của ThoHCM Worker App
- Tìm và đặt lịch thợ skilled workers
- Hệ thống đánh giá và reviews
- Nhắn tin trực tiếp với thợ
- Quản lý đơn hàng real-time

English:
- Initial release of ThoHCM Worker App
- Find and book skilled workers
- Rating and review system
- Direct messaging with workers
- Real-time booking management
```

## 🎨 Store Listing Assets

### Step 4: Main Store Listing
Navigate to: **Main store listing**

#### App Icon
- **Size**: 512 x 512 pixels
- **File**: Upload `app-icon-512.png`
- **Requirements**: PNG, no transparency

#### Feature Graphic
- **Size**: 1024 x 500 pixels  
- **File**: Upload feature graphic
- **Requirements**: JPG or PNG

#### Screenshots
- **Phone screenshots**: Minimum 2, maximum 8
- **Size**: 16:9 or 18:9 aspect ratio
- **Action needed**: Take app screenshots first!

### Step 5: App Details
#### Short Description (80 characters max)
```
Vietnamese: Ứng dụng đặt thợ sửa chữa tại nhà nhanh chóng, tiện lợi
English: Quick & reliable home repair worker booking app
```

#### Full Description (4000 characters max)
```
Vietnamese:
ThoHCM - Ứng dụng đặt thợ chuyên nghiệp tại TP.HCM

🔧 DỊCH VỤ CHÍNH:
• Thợ điện, nước, điều hòa
• Sửa chữa đồ gia dụng
• Vệ sinh nhà cửa  
• Sơn nước, xây dựng nhỏ

⭐ ĐẶC ĐIỂM NỔi BẬT:
• Thợ đã được xác minh và đánh giá
• Giá cả minh bạch, không phát sinh
• Đặt lịch nhanh chóng, linh hoạt
• Hỗ trợ 24/7 qua chat trực tiếp
• Thanh toán an toàn, nhiều hình thức

📱 CÁCH SỬ DỤNG:
1. Chọn dịch vụ cần thiết
2. Xem profile và đánh giá thợ
3. Đặt lịch phù hợp
4. Thợ đến tận nơi thực hiện
5. Đánh giá và thanh toán

🏆 TẠI SAO CHỌN THOHCM:
• Mạng lưới thợ rộng khắp TP.HCM
• Cam kết chất lượng dịch vụ
• Bảo hành công việc đã thực hiện
• Giải quyết khiếu nại nhanh chóng

Tải ngay để trải nghiệm dịch vụ thợ chuyên nghiệp!

English:
ThoHCM - Professional Worker Booking App in Ho Chi Minh City

🔧 MAIN SERVICES:
• Electrical, plumbing, AC repair
• Home appliance fixes
• House cleaning services
• Painting, minor construction

⭐ KEY FEATURES:
• Verified and rated workers
• Transparent pricing, no hidden fees
• Quick and flexible booking
• 24/7 chat support
• Secure multiple payment options

📱 HOW IT WORKS:
1. Select needed service
2. View worker profiles and ratings
3. Schedule convenient appointment
4. Worker comes to your location
5. Rate and pay securely

🏆 WHY CHOOSE THOHCM:
• Wide network across Ho Chi Minh City
• Quality service guarantee
• Work warranty provided
• Fast complaint resolution

Download now for professional worker services!
```

## 🔒 App Content & Compliance

### Step 6: Content Rating
1. **Go to**: Policy > App content > Content rating
2. **Start questionnaire**
3. **Category**: Utility (likely for worker booking app)
4. **Answer questions** about:
   - Violence content: No
   - Sexual content: No  
   - Profanity: No
   - Controlled substances: No
   - Gambling: No
   - Social features: Yes (chat, reviews)

### Step 7: Target Audience & Content
1. **Target age**: 18+ (work services)
2. **Appeals process**: Provide contact email
3. **Ads**: Yes/No (depending on your monetization)

### Step 8: Privacy Policy
**REQUIRED**: Must provide publicly accessible URL
- **Create**: Privacy policy webpage
- **URL example**: `https://thohcm.com/privacy-policy`
- **Content**: Use template from previous docs

### Step 9: Data Safety
Fill out data collection practices:
- **Personal info**: Name, email, phone (for booking)
- **Location**: Approximate (for finding nearby workers)  
- **Usage data**: App activity (for improvements)
- **Security**: Data encrypted in transit and at rest

## 🚀 Final Steps

### Step 10: Release Review
1. **Complete all sections** (green checkmarks)
2. **Review release**: Check all information
3. **Start rollout to production**
4. **Submit for review**

### Step 11: Review Process
- **Timeline**: 2-3 days for new apps
- **Status tracking**: Check in Play Console
- **Response**: Via email notification

## ⚠️ Common Issues & Solutions

### Asset Issues:
- **Icon transparency**: Use solid background
- **Screenshot quality**: Use high-resolution images
- **Feature graphic text**: Keep readable on mobile

### Policy Issues:
- **Privacy policy**: Must be accessible and complete
- **Content rating**: Answer accurately
- **Target audience**: Match your actual users

### Technical Issues:
- **AAB file**: Must be signed with production keystore
- **Version codes**: Increment for each upload
- **Permissions**: Justify all requested permissions

## 📞 Support Contacts
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Developer Community**: https://www.reddit.com/r/androiddev
- **Email**: android-developer-support@google.com