# Hướng dẫn Test Mobile App Worker với Android Studio Emulator

## 🎯 Mục tiêu
Test toàn bộ chức năng của mobile app worker bằng Android Studio Emulator, kết nối với backend production.

## 📋 Prerequisites

### 1. Android Studio Setup
- ✅ Android Studio installed
- ✅ Android SDK configured
- ✅ Android Emulator created (API level 30+)

### 2. Flutter Setup
- ✅ Flutter SDK installed
- ✅ Flutter PATH configured
- ✅ Android toolchain for Flutter

## 🚀 Quick Start

### Bước 1: Start Android Emulator
```bash
# Trong Android Studio
# Tools > AVD Manager > Start Emulator
# Hoặc command line:
emulator -avd Pixel_7_API_30
```

### Bước 2: Run Worker App
```powershell
# Option A: PowerShell script
.\run-worker-app.ps1

# Option B: Manual commands
cd mobile\worker_app
flutter pub get
flutter run --debug
```

### Bước 3: Backend Configuration
```
✅ API Base URL: https://thohcm-application-475603.as.r.appspot.com
✅ WebSocket URL: https://thohcm-application-475603.as.r.appspot.com
✅ Authentication: JWT Token
✅ File Upload: Google Cloud Storage (nếu đã migrate)
```

## 🧪 Test Scenarios

### 1. Worker Registration (Đăng ký thợ)
```
📱 Test Steps:
1. Mở app > "Đăng ký"
2. Điền thông tin:
   - Tên: "Nguyễn Văn B"
   - SĐT: "0987654321" 
   - Mật khẩu: "Worker123"
   - CCCD: "079123456789"
   - Địa chỉ: "123 Lê Lợi, Q1, HCM"
3. Nhấn "Đăng ký"

✅ Expected: Đăng ký thành công, chờ admin kích hoạt
❌ If fail: Check API logs, network connection
```

### 2. Worker Login (Đăng nhập thợ)
```
📱 Test Steps:
1. Sử dụng account đã được admin kích hoạt
   - SĐT: "0909123457" (hoặc account khác)
   - Mật khẩu: "Worker123"
2. Nhấn "Đăng nhập"

✅ Expected: Vào dashboard, nhận được notifications
❌ If fail: Account chưa được kích hoạt bởi admin
```

### 3. Service Management (Quản lý dịch vụ)
```
📱 Test Steps:
1. Dashboard > "Dịch vụ của tôi"
2. Nhấn "+" để tạo dịch vụ mới
3. Điền thông tin:
   - Tên: "Sửa điều hòa"
   - Mô tả: "Sửa chữa, bảo dưỡng điều hòa"
   - Giá: "200000"
   - Thời gian: "60" phút
4. Upload ảnh (nếu có)
5. Lưu dịch vụ

✅ Expected: Dịch vụ được tạo, hiển thị trong danh sách
❌ If fail: Check file upload permissions, API errors
```

### 4. Booking Management (Quản lý đơn hàng)
```
📱 Test Steps:
1. Dashboard > "Đơn hàng"
2. Xem danh sách đơn hàng được assign
3. Nhấn vào 1 đơn hàng:
   - Xem chi tiết khách hàng
   - Xem địa chỉ, thời gian
   - Cập nhật trạng thái: "Đang thực hiện" > "Hoàn thành"
4. Test real-time updates

✅ Expected: 
- Nhận thông báo đơn hàng mới (nếu có)
- Cập nhật trạng thái thành công
- WebSocket notifications hoạt động
❌ If fail: Check WebSocket connection, permissions
```

### 5. Profile Management (Quản lý hồ sơ)
```
📱 Test Steps:
1. Dashboard > "Hồ sơ"
2. Xem thông tin cá nhân
3. Update thông tin (chỉ những field được phép)
4. Upload avatar (nếu admin cho phép)

✅ Expected: Thông tin được update, avatar hiển thị
❌ If fail: Worker không được phép update một số field
```

### 6. Real-time Notifications
```
📱 Test Steps:
1. Tạo booking từ web app (bằng customer account)
2. Assign thợ trong admin panel
3. Check mobile app nhận notification

✅ Expected: 
- Push notification appear
- In-app notification badge
- Sound/vibration alert
❌ If fail: Check notification permissions, WebSocket
```

### 7. Offline/Online Mode
```
📱 Test Steps:
1. Turn off WiFi/Mobile data
2. Test app functionality
3. Turn on network again
4. Check reconnection

✅ Expected: 
- Graceful offline handling
- Auto-reconnect when network returns
- Queued actions sync when online
❌ If fail: Check error handling, retry logic
```

## 🔧 Debugging

### Common Issues:

1. **Network Connection Error**
```
❌ Error: "Connection refused"
🔧 Fix: Check if backend is running, correct URL
```

2. **Authentication Failed**
```
❌ Error: "Unauthorized"
🔧 Fix: Check token storage, login again
```

3. **WebSocket Connection Failed**
```
❌ Error: WebSocket timeout
🔧 Fix: Check App Engine vs Cloud Run, CORS settings
```

4. **File Upload Failed**
```
❌ Error: "Upload error"
🔧 Fix: Check GCS permissions, file size limits
```

### Debug Commands:
```bash
# Check Flutter doctor
flutter doctor

# Run with verbose logging
flutter run --debug --verbose

# Check device logs
adb logcat | grep -i flutter

# Check network requests
# Use app with Charles Proxy or similar
```

## 📊 Performance Testing

### Key Metrics:
- App startup time: < 3 seconds
- API response time: < 2 seconds  
- Image loading: < 5 seconds
- Real-time notification latency: < 1 second
- Memory usage: < 150MB
- Battery usage: Optimized for background

## 🎯 Success Criteria

✅ **All features working**:
- Registration/Login ✓
- Service CRUD operations ✓  
- Booking management ✓
- Real-time notifications ✓
- Profile management ✓
- File uploads ✓

✅ **Performance acceptable**:
- No crashes or ANRs
- Smooth scrolling and navigation
- Fast API responses
- Real-time updates working

✅ **Production ready**:
- Proper error handling
- Offline capability
- Security (HTTPS, token auth)
- User experience optimized

## 📝 Test Report Template

```
## Mobile App Worker Test Report
Date: [DATE]
Tester: [NAME]
Device: [EMULATOR_INFO]
Backend: https://thohcm-application-475603.as.r.appspot.com

### Test Results:
- [ ] Registration: PASS/FAIL
- [ ] Login: PASS/FAIL  
- [ ] Service Management: PASS/FAIL
- [ ] Booking Management: PASS/FAIL
- [ ] Notifications: PASS/FAIL
- [ ] Profile Management: PASS/FAIL
- [ ] Performance: PASS/FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

## 🔗 Useful Links
- Backend API: https://thohcm-application-475603.as.r.appspot.com
- Admin Panel: https://thohcm-frontend.web.app (for creating test data)
- GitHub Actions: https://github.com/hoangthai77641/ThoHCM-Personal-Project/actions