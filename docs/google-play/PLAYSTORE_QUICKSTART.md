# 🚀 Google Play Store - Quick Start Guide

> **⏱️ Estimated Time**: 2-4 hours (excluding review time)  
> **📱 App**: Thợ HCM Worker App  
> **📦 Package**: com.thohcm.workerapp

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

```
✅ Google Play Developer Account ($25 one-time fee)
✅ Flutter installed and working (flutter doctor)
✅ Production keystore created (thohcm-release-key.jks)
✅ Firebase project configured
✅ Privacy Policy URL ready
✅ 2-6 app screenshots captured
```

---

## 🎯 3 Main Steps Overview

### **STEP 1**: Verify Requirements (10 minutes)
### **STEP 2**: Build & Upload AAB (30 minutes)
### **STEP 3**: Complete Play Console Setup (1-2 hours)

---

## 🔍 STEP 1: Verify Requirements

Run the verification script to check if everything is ready:

```powershell
cd d:\Thai\root\ThoHCM
.\scripts\verify-playstore-requirements.ps1
```

**What it checks:**
- ✅ AAB file exists and is valid
- ✅ Keystore and signing config
- ✅ App assets (icon, feature graphic, screenshots)
- ✅ Documentation files
- ✅ Technical requirements (Target SDK, Firebase)

**Expected Output:**
```
📊 VERIFICATION SUMMARY
   Total Checks: 15
   Passed: 13-15
   Warnings: 0-2
   Errors: 0

✅ READY FOR UPLOAD!
```

### Fix Common Issues:

#### Missing Screenshots?
```powershell
# 1. Create folder
mkdir mobile\worker_app\assets\playstore\screenshots

# 2. Run app on emulator/device
cd mobile\worker_app
flutter run

# 3. Capture 4-6 screenshots (1080x1920)
# - Home screen
# - Booking screen
# - Chat screen
# - Dashboard
# - Wallet
# - Reviews
```

#### Missing App Icon or Feature Graphic?
```powershell
# Run asset generator script
.\scripts\create-playstore-assets.ps1
```

---

## 🔨 STEP 2: Build & Upload AAB

### **2.1. Build the App Bundle**

```powershell
cd d:\Thai\root\ThoHCM
.\scripts\build-and-upload-playstore.ps1
```

**This script will:**
1. ✅ Verify Flutter installation
2. ✅ Clean previous builds (optional)
3. ✅ Get dependencies
4. ✅ Run flutter doctor
5. ✅ Check keystore
6. ✅ Build release AAB
7. ✅ Verify output file
8. ✅ Generate SHA-1 fingerprint

**Expected Output:**
```
🎉 Build Complete - Ready for Upload!

📊 Build Info:
   Version Name: 1.1.0
   Build Number: 2
   Package: com.thohcm.workerapp
   AAB Size: ~47 MB

📁 Location:
   d:\Thai\root\ThoHCM\mobile\worker_app\build\app\outputs\bundle\release\app-release.aab
```

### **2.2. Upload to Play Console**

1. **Go to Google Play Console**:  
   https://play.google.com/console

2. **Select your app**: "Thợ HCM"

3. **Navigate to**: Production > Create new release

4. **Upload AAB**:
   - Click "Upload"
   - Select: `build\app\outputs\bundle\release\app-release.aab`
   - Wait for upload (2-5 minutes)

5. **Release Notes** (Vietnamese):
   ```
   Phiên bản 1.1.0 (Build 2)

   Tính năng mới:
   - Hệ thống booking thợ chuyên nghiệp
   - Chat real-time với khách hàng
   - Quản lý lịch làm việc và thu nhập
   - Ví điện tử và rút tiền
   - Đánh giá và phản hồi từ khách hàng
   - Thông báo đẩy real-time

   Cải thiện:
   - Tối ưu hiệu suất ứng dụng
   - Cải thiện giao diện người dùng
   - Sửa các lỗi nhỏ
   ```

6. **Click**: Save (DON'T submit yet!)

---

## ⚙️ STEP 3: Complete Play Console Setup

Now complete the setup in Google Play Console. Follow steps in order:

### **3.1. Chính Sách Quyền Riêng Tư** (5 min)

**Path**: Thiết lập > Chính sách quyền riêng tư

**Action**:
- Enter Privacy Policy URL: `https://thohcm.com/privacy-policy`
- OR use GitHub Pages: `https://yourusername.github.io/ThoHCM/privacy-policy.html`

**Note**: URL must be public and return valid HTML content.

---

### **3.2. Quyền Truy Cập** (10 min)

**Path**: Chính sách ứng dụng > Quyền truy cập

**Declare these permissions**:

| Permission | Purpose | Required? |
|------------|---------|-----------|
| Location | Tìm thợ gần nhất | ❌ Optional |
| Camera | Chụp ảnh công việc | ❌ Optional |
| Storage | Lưu ảnh và cache | ✅ Required |
| Internet | Kết nối API | ✅ Required |
| Notifications | Nhận thông báo booking | ❌ Optional |

---

### **3.3. Quảng Cáo** (1 min)

**Path**: Chính sách ứng dụng > Quảng cáo

**Select**: ❌ "Không, ứng dụng không hiển thị quảng cáo"

---

### **3.4. Xếp Hạng Nội Dung** (15 min)

**Path**: Chính sách ứng dụng > Xếp hạng nội dung

**Click**: "Bắt đầu bảng câu hỏi"

**Answers**:
- Violence: ❌ No
- Sexual content: ❌ No
- Drugs/Alcohol: ❌ No
- Bad language: ❌ None
- Gambling: ❌ No
- User-generated content: ✅ Yes (Reviews)
- User communication: ✅ Yes (Chat)
- Social features: ✅ Yes

**Target Rating**: Teen / PEGI 12

---

### **3.5. Đối Tượng Mục Tiêu** (2 min)

**Path**: Chính sách ứng dụng > Đối tượng mục tiêu

**Select**:
- Age: 18+
- App designed for children: ❌ No

---

### **3.6. An Toàn Dữ Liệu** (20 min)

**Path**: Chính sách ứng dụng > An toàn dữ liệu

**Data Types Collected**:

1. **Personal Info**:
   - Name, phone, address, avatar
   - Purpose: Create profile, booking
   - Shared: No
   - Encrypted: Yes

2. **Location**:
   - Precise location
   - Purpose: Find nearby workers
   - Shared: With selected worker only
   - Can be deleted: Yes

3. **Financial Info**:
   - Payment information
   - Purpose: Process transactions
   - Shared: With payment providers (VNPay, ZaloPay, Stripe)
   - Encrypted: Yes (PCI-DSS)

4. **Photos/Videos**:
   - Work photos, profile pictures
   - Purpose: Document work
   - Can be deleted: Yes

**User Rights**:
- ✅ Users can request data deletion
- ✅ Data is encrypted in transit (HTTPS)
- ✅ Opt-out option for optional data

---

### **3.7-3.9. Quick Declarations** (5 min)

| Section | Answer |
|---------|--------|
| **Ứng dụng chính phủ** | ❌ No |
| **Tính năng tài chính** | ✅ Yes - Payment processing for services |
| **Sức khỏe** | ❌ No |

---

### **3.10. Store Listing Setup** (30 min)

**Path**: Store presence > Main store listing

#### **Basic Info**:
```yaml
App name: "Thợ HCM - Thợ Chuyên Nghiệp"

Short description (80 chars):
  "Ứng dụng đặt thợ sửa chữa tại nhà nhanh chóng, tiện lợi"

Full description:
  Copy from: docs\PLAY_STORE_DESCRIPTIONS.md (Vietnamese version)
```

#### **Graphics**:
1. **App icon** (512x512):
   - Upload: `mobile\worker_app\assets\playstore\app-icon-512x512.png`

2. **Feature graphic** (1024x500):
   - Upload: `mobile\worker_app\assets\playstore\feature-graphic-1024x500.png`

3. **Screenshots** (minimum 2):
   - Upload from: `mobile\worker_app\assets\playstore\screenshots\`
   - Recommended: 4-6 screenshots

#### **Categorization**:
```yaml
App category: Lifestyle
Tags: Home & Garden, Local Services
```

#### **Contact**:
```yaml
Email: support@thohcm.com
Website: https://thohcm.com
Phone: (optional)
```

---

### **3.11. Pricing & Distribution** (5 min)

**Path**: Store presence > Pricing and distribution

**Settings**:
```yaml
Price: Free
Contains ads: No
Contains in-app purchases: Yes

Countries: 
  - Vietnam (primary)
  - Cambodia, Laos, Thailand (optional)

Content rating: Teen / PEGI 12
Target audience: Adults
```

---

## 🚀 FINAL STEP: Submit for Review

### **Pre-Submission Checklist**:

```
✅ Privacy Policy URL entered
✅ All permissions declared
✅ Content rating completed
✅ Data safety filled
✅ App icon uploaded
✅ Feature graphic uploaded
✅ Screenshots uploaded (2+)
✅ Short description written
✅ Full description written
✅ App category selected
✅ Contact email provided
✅ AAB uploaded successfully
✅ Release notes written
✅ Pricing & distribution configured
```

### **Submit**:

1. Go to: **Production > Releases**
2. Click: **Review release**
3. Check for warnings/errors
4. If all OK, click: **Start rollout to Production**
5. Confirm: **Rollout**

---

## ⏱️ Review Timeline

```
📝 Submission: Immediate
🔍 Review: 2-7 days (first submission)
✅ Published: Appears on Play Store within hours after approval
```

### **Track Status**:

**Path**: Dashboard > Publishing overview

**Statuses**:
- 🟡 **In review**: Google is reviewing your app
- 🔴 **Rejected**: Need to fix issues and resubmit
- 🟢 **Published**: Live on Play Store! 🎉

---

## 📱 After Publishing

### **Your App URL**:
```
https://play.google.com/store/apps/details?id=com.thohcm.workerapp
```

### **Next Steps**:
1. ✅ Test download from Play Store
2. ✅ Monitor crash reports (Play Console > Vitals)
3. ✅ Respond to user reviews
4. ✅ Track metrics (installs, ratings, retention)

### **Updates**:
```powershell
# When you need to release update:

# 1. Update version in pubspec.yaml
version: 1.2.0+3  # Increment version and build number

# 2. Build new AAB
.\scripts\build-and-upload-playstore.ps1

# 3. Upload to Play Console > Production
# 4. Submit for review (faster than first time)
```

---

## 🆘 Troubleshooting

### **Issue: AAB Upload Failed**

**Solutions**:
```powershell
# Rebuild AAB
cd mobile\worker_app
flutter clean
flutter pub get
flutter build appbundle --release
```

### **Issue: "App not signed correctly"**

**Check**:
- Keystore file exists: `android\app\thohcm-release-key.jks`
- key.properties configured correctly
- SHA-1 added to Firebase

### **Issue: "Target SDK too low"**

**Fix in**: `android/app/build.gradle.kts`
```kotlin
targetSdk = 34  // Must be 34+ for new apps
```

### **Issue: Screenshots rejected**

**Requirements**:
- Size: 1080 x 1920 (9:16 ratio)
- Format: PNG or JPG
- No excessive text overlay
- Must show actual app UI

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `docs/GOOGLE_PLAY_DEPLOYMENT_STEPS.md` | Detailed step-by-step guide (THIS IS THE MAIN GUIDE) |
| `docs/PLAY_STORE_REQUIREMENTS.md` | Asset and technical requirements |
| `docs/PLAY_STORE_DESCRIPTIONS.md` | Vietnamese/English descriptions |
| `docs/STORE_LISTING_INFO.md` | Complete store listing info |
| `docs/PLAYSTORE_QUICKSTART.md` | This quick start guide |

### **Scripts**:
| Script | Purpose |
|--------|---------|
| `scripts/verify-playstore-requirements.ps1` | Check if ready for upload |
| `scripts/build-and-upload-playstore.ps1` | Build AAB for Play Store |
| `scripts/create-playstore-assets.ps1` | Generate icons and graphics |

---

## 💡 Pro Tips

1. **Test Thoroughly**: Test on multiple devices before submitting
2. **Screenshots Matter**: High-quality screenshots improve conversion rate
3. **Description SEO**: Include keywords naturally in description
4. **Localization**: Add English listing to reach more users
5. **Updates**: Release updates regularly to show active development
6. **Reviews**: Respond to all reviews (builds trust)
7. **Beta Testing**: Use internal/closed testing track first
8. **Backup Keystore**: Keep keystore in safe place - can't update without it!

---

## ✅ Success Criteria

Your app is successfully deployed when:

```
✅ App appears in Play Store search
✅ Users can download and install
✅ No crash reports in first 24h
✅ Rating: 4.0+ stars
✅ No policy violations
```

---

## 📞 Need Help?

**Resources**:
- Google Play Console Help: https://support.google.com/googleplay/android-developer
- Flutter Deployment Docs: https://flutter.dev/docs/deployment/android
- Detailed Guide: `docs/GOOGLE_PLAY_DEPLOYMENT_STEPS.md`

**Common Issues Fixed In**:
- Build errors: Run verification script
- Policy violations: Check Play Console notifications
- Technical issues: Review Flutter doctor output

---

**🎉 Good luck with your deployment! 🎉**

*Estimated total time: 2-4 hours + 2-7 days review time*
