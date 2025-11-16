# API Tạo Tài Khoản Admin

Có 2 cách để tạo tài khoản admin:

## 1. Sử dụng API (Postman/Curl)

### Endpoint: POST /api/users/administrators

**URL Production:** `https://thohcm-application-475603.as.r.appspot.com/api/users/administrators`

#### Headers:
```
Content-Type: application/json
```

#### Body (JSON):
```json
{
  "name": "Super Admin",
  "phone": "0123456789",
  "password": "admin123456",
  "email": "admin@thohcm.com"
}
```

#### Curl Command:
```bash
curl -X POST https://thohcm-application-475603.as.r.appspot.com/api/users/administrators \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "phone": "0123456789", 
    "password": "admin123456",
    "email": "admin@thohcm.com"
  }'
```

#### Postman Request:
1. Tạo mới request
2. Method: `POST`
3. URL: `https://thohcm-application-475603.as.r.appspot.com/api/users/administrators`
4. Headers: 
   - `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "name": "Super Admin",
     "phone": "0123456789",
     "password": "admin123456", 
     "email": "admin@thohcm.com"
   }
   ```

### Response Success (201):
```json
{
  "message": "Admin account created successfully",
  "admin": {
    "_id": "...",
    "name": "Super Admin",
    "phone": "0123456789",
    "email": "admin@thohcm.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Response Error (400):
```json
{
  "message": "Số điện thoại này đã được sử dụng"
}
```

## 2. Sử dụng Script Database

### Chạy script trong terminal:
```bash
cd backend
node scripts/createAdmin.js
```

### Output mẫu:
```
✅ Connected to MongoDB
✅ Admin account created successfully!
📋 Admin Details:
   Name: Super Admin
   Phone: 0123456789
   Email: admin@thohcm.com
   Password: admin123456
   Role: admin
   Status: active

🔐 You can now login to the web interface with these credentials
🔌 Database connection closed
```

## 3. Đăng Nhập Admin

### Login API: POST /api/auth/login

**URL:** `https://thohcm-application-475603.as.r.appspot.com/api/auth/login`

#### Body:
```json
{
  "phone": "0123456789",
  "password": "admin123456"
}
```

#### Response Success:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Super Admin",
    "phone": "0123456789",
    "email": "admin@thohcm.com",
    "role": "admin",
    "status": "active"
  }
}
```

## 4. Test Admin Functions

Sau khi có token admin, bạn có thể test các API admin:

### Get All Administrators
```
GET /api/users/administrators
Authorization: Bearer {token}
```

### Create Worker (Admin Only)
```
POST /api/users/workers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Test Worker",
  "phone": "0987654321", 
  "password": "worker123",
  "address": "123 Test Street",
  "status": "active"
}
```

### Update User Status (Admin Only)
```
PUT /api/users/{userId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "active"
}
```

## Lưu Ý Bảo Mật

1. **Chỉ admin đầu tiên**: API `/administrators` cho phép tạo admin mà không cần auth nếu chưa có admin nào
2. **Admin tiếp theo**: Cần token admin để tạo admin mới
3. **Đổi mật khẩu**: Nên đổi mật khẩu mặc định sau khi tạo
4. **Environment**: Script và API đều sử dụng production database

## Troubleshooting

### Lỗi "Phone already exists":
- Kiểm tra phone đã tồn tại trong database
- Sử dụng phone khác hoặc xóa user cũ

### Lỗi "Database connection":
- Kiểm tra MONGODB_URI
- Kiểm tra network connectivity

### Lỗi "Authentication required":
- Có admin trong database rồi, cần token admin để tạo admin mới
- Sử dụng script database thay vì API