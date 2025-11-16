# Backend Test Scripts

Thư mục này chứa các script test và utility cho backend.

## 📁 Test Files

### Banking & Payment Tests
- **test-real-banking.js** - Test QR Banking với thông tin ngân hàng thật
- **test-qr-banking.js** - Test QR Banking service với dữ liệu test
- **test-manual-qr-banking.js** - Test Manual QR Banking workflow (local)
- **test-production-manual-qr.js** - Test Manual QR Banking trên production

### Deployment & Monitoring
- **check-production-deployment.js** - Kiểm tra deployment production
- **update-banking-info.js** - Script cập nhật thông tin ngân hàng vào database

## 🚀 Cách Sử Dụng

### Test QR Banking (Local)
```bash
cd backend
node tests/test-qr-banking.js
```

### Test với thông tin ngân hàng thật
```bash
node tests/test-real-banking.js
```

### Test Manual QR Banking Flow
1. Cập nhật token trong `test-manual-qr-banking.js`
2. Chạy test:
```bash
node tests/test-manual-qr-banking.js
```

### Kiểm tra Production Deployment
```bash
node tests/check-production-deployment.js
```

### Cập nhật Banking Info
```bash
node tests/update-banking-info.js
```

## ⚠️ Lưu Ý

- **Không commit thông tin nhạy cảm** (tokens, passwords, account numbers thật)
- Test scripts chứa thông tin cá nhân nên được gitignore hoặc sanitize
- Luôn test trên local/staging trước khi chạy trên production
- Các file test này chỉ dùng cho development, không deploy lên production

## 🔧 Configuration

Các test scripts cần cấu hình:
- **BASE_URL** hoặc **PRODUCTION_URL** - API endpoint
- **Worker/Admin Tokens** - JWT tokens để authenticate
- **Test credentials** - Thông tin đăng nhập test

## 📝 Best Practices

1. **Tách môi trường**: Sử dụng environment variables cho URLs và credentials
2. **Mock data**: Test với dữ liệu giả, không dùng dữ liệu thật
3. **Cleanup**: Xóa test data sau khi test xong
4. **Documentation**: Ghi chú rõ mục đích và cách dùng của mỗi test script
