# Test In-App Update

## 1. Test Backend API

```bash
# Start backend
cd backend
npm run start

# Test check version API
curl "http://localhost:3000/api/app-version/check?appType=worker&currentVersion=1.1.4"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "currentVersion": "1.1.4",
    "latestVersion": "1.1.4",
    "needsUpdate": false,
    "forceUpdate": false,
    ...
  }
}
```

## 2. Simulate có update mới

Edit `backend/controllers/appVersionController.js`:

```javascript
const APP_VERSIONS = {
  worker: {
    currentVersion: '1.1.4',
    latestVersion: '1.2.0',      // ← Đổi thành 1.2.0
    minRequiredVersion: '1.1.0',
    forceUpdate: false,          // ← Set true để test force update
    updateMessage: 'Cải thiện giao diện nạp ví!',
    features: [
      'Chỉ còn phương thức QR Banking',
      'Upload ảnh tự động quay về ví',
      'Cải thiện UI dialog'
    ],
  }
}
```

Restart backend:
```bash
pm2 restart backend
# hoặc Ctrl+C và npm run start lại
```

## 3. Test trên emulator/device

```bash
cd mobile/worker_app
flutter run
```

Khi app khởi động, sẽ thấy dialog update xuất hiện!

## 4. Test các scenarios

### A. Normal Update (Optional)
```javascript
forceUpdate: false
```
- Dialog có 2 nút: "Để sau" và "Cập nhật ngay"
- Có thể đóng dialog

### B. Force Update (Required)
```javascript
forceUpdate: true
```
- Chỉ có 1 nút: "Cập nhật ngay"
- KHÔNG thể đóng dialog
- Hiển thị warning box màu cam

### C. Old version bị chặn
```javascript
minRequiredVersion: '1.2.0'  // Chặn tất cả < 1.2.0
```
App version 1.1.4 sẽ bị force update

## 5. Test thủ công trong app

Thêm button test trong Settings hoặc Profile:

```dart
ElevatedButton(
  onPressed: () => AppUpdateService.checkForUpdateFromBackend(context),
  child: Text('Kiểm tra cập nhật'),
)
```

## 6. Verify

✅ Dialog hiển thị đúng version
✅ Features list hiển thị đầy đủ
✅ Nút "Cập nhật ngay" hoạt động
✅ Force update không cho đóng dialog
✅ Backend API trả về đúng data
