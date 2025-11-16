# 📱 Hướng dẫn Cài đặt Mobile App ThoHCM Worker

## 🎯 Tình trạng hiện tại

**❌ Chưa thể cài đặt tự động** - App chưa được publish lên Google Play Store!

Hiện tại mobile app chỉ có thể chạy thông qua:
- ✅ Android Studio Emulator 
- ✅ Điện thoại thật khi kết nối với máy tính (qua USB debugging)
- ✅ Sideload APK file (cài đặt thủ công)

## 🔧 Các cách cài đặt hiện có

### 1. **Sideload APK (Khuyên dùng tạm thời)**

#### Bước 1: Build APK Release
```powershell
cd "D:\Thai\root\ThoHCM\mobile\worker_app"
flutter build apk --release
```

#### Bước 2: Copy APK file
- File APK sẽ được tạo tại: `build/app/outputs/flutter-apk/app-release.apk`
- Kích thước: ~70MB 
- Gửi file này cho users qua email/drive/USB

#### Bước 3: Cài đặt trên điện thoại
1. **Enable Unknown Sources**:
   - Settings > Security > Install unknown apps
   - Allow installation from file manager

2. **Install APK**:
   - Copy APK file vào điện thoại
   - Tap vào file APK
   - Tap "Install" và chờ hoàn tất

3. **Grant Permissions**:
   - Camera (chụp ảnh dịch vụ)
   - Storage (lưu trữ ảnh)
   - Location (định vị)
   - Notifications (thông báo real-time)

#### ⚠️ Lưu ý Sideload APK:
- **Security Warning**: Android sẽ warning về "unknown source"
- **No Auto Updates**: Phải manually update bằng APK mới
- **Limited Users**: Chỉ phù hợp cho testing/beta users
- **Google Play Protect**: Có thể block app không signed

### 2. **USB Debugging (Development)**

#### Cho Developers/Testers:
```powershell
# Kết nối điện thoại qua USB
adb devices

# Run app trực tiếp
cd "D:\Thai\root\ThoHCM\mobile\worker_app"
flutter run --release
```

#### Yêu cầu:
- Enable Developer Options
- Enable USB Debugging
- Kết nối với máy tính có Flutter SDK

### 3. **WiFi Debugging (Advanced)**

```powershell
# Pair device over WiFi
adb pair <ip>:<port>

# Connect and run
.\tools\wifi_debug.ps1 -Device <ip>:<port>
```

## 🏪 Google Play Store Deployment (Recommended)

### Tại sao cần Google Play Store?

✅ **User Benefits**:
- **Easy Install**: Chỉ cần search "ThoHCM Worker" và install
- **Auto Updates**: Tự động update khi có version mới
- **Security**: Google verified, không có warning
- **Backup**: Auto backup app data qua Google
- **Reviews**: Users có thể đánh giá và feedback

✅ **Business Benefits**:
- **Professional**: Tăng độ tin cậy thương hiệu
- **Analytics**: Detailed app usage analytics
- **Crash Reports**: Automatic crash reporting
- **A/B Testing**: Test different app versions
- **Monetization**: Có thể add in-app purchases sau

### Chi phí Google Play Store:

```
💰 One-time Google Play Developer Account: $25 USD (~600,000 VND)
📅 No yearly fees (chỉ trả 1 lần)
🎯 Unlimited apps và updates
```

### Deployment Process:

#### Phase 1: Preparation ✅ (COMPLETED)
- [x] Production keystore created (`thohcm-release-key.jks`)
- [x] App Bundle built (`app-release.aab` - 47MB)
- [x] Firebase integration configured
- [x] App icons và assets prepared

#### Phase 2: Google Play Console Setup (TODO)
- [ ] Create Google Play Developer Account ($25)
- [ ] Create new app in Play Console
- [ ] Upload App Bundle (.aab file)
- [ ] Configure store listing (screenshots, description)
- [ ] Set up content rating và privacy policy
- [ ] Submit for review (1-3 days)

#### Phase 3: Go Live
- [ ] App approved và published
- [ ] Users có thể download từ Play Store
- [ ] Monitor reviews và crash reports

## 🚀 Deployment Timeline

### **Immediate (1-2 days)**:
```bash
# Build release APK for sideload testing
flutter build apk --release
# Distribute to beta testers
```

### **Short-term (1 week)**:
```bash
# Setup Google Play Developer Account
# Create Play Console app
# Upload App Bundle
# Submit for review
```

### **Go-live (1-2 weeks)**:
```bash
# App approved và live on Play Store  
# Users download from "ThoHCM Worker" search
# Monitor và optimize based on feedback
```

## 🔄 Current Workaround

Trong khi chờ Google Play Store deployment:

### **Cho Beta Testers**:
1. Build APK release version
2. Share qua Google Drive/Email  
3. Guide users cách enable "Unknown Sources"
4. Collect feedback qua TestFlight-style process

### **Cho Production Users**:
1. **Recommend**: Tập trung finish Google Play Store setup
2. **Alternative**: Distribute APK với clear instructions và disclaimers
3. **Support**: Tạo video tutorial cách cài APK an toàn

## 📋 Next Actions

### Immediate Priority:
1. **Build Release APK** cho beta testing
   ```bash
   flutter build apk --release --dart-define=API_BASE=https://thohcm-application-475603.as.r.appspot.com
   ```

2. **Test APK** trên điện thoại thật của chính bạn

3. **Create Beta Testing Group** với 5-10 users

### Week 1 Priority:
1. **Setup Google Play Developer Account** ($25)
2. **Create Play Console App** với proper metadata
3. **Upload App Bundle** và submit cho review

### Week 2+ Priority:
1. **Monitor Reviews** và crash reports
2. **Plan Updates** based on user feedback
3. **Scale Marketing** khi app đã stable trên Play Store

## 🎯 Conclusion

**Current State**: App chỉ có thể install qua sideload APK  
**Recommended Path**: Google Play Store deployment trong 1-2 tuần  
**User Experience**: Sẽ dramatically improve khi có trên Play Store  

**Investment**: $25 USD một lần cho unlimited professional distribution! 🚀

---
*Last Updated: October 22, 2025*  
*Status: Ready for Google Play Store submission*