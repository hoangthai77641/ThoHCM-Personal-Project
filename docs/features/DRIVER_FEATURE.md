# Tính Năng Tài Xế và Dịch Vụ Vận Chuyển

## Tổng Quan
Đã thêm mới role **Tài Xế (Driver)** và category **Dịch Vụ Vận Chuyển** vào hệ thống Thợ HCM.

## Các Thay Đổi Backend

### 1. User Model (`backend/models/User.js`)
- **Thêm role mới**: `'driver'` vào enum roles
- **Cập nhật indexes**: CCCD unique cho cả `worker` và `driver`
- **Quyền tương đương**: Driver có các quyền và tính năng tương tự Worker

### 2. Service Model (`backend/models/Service.js`)
- **Category mới**: `'Dịch Vụ Vận Chuyển'`
- **Thông tin xe (vehicleSpecs)**:
  ```javascript
  vehicleSpecs: {
    loadCapacity: Number,        // Tải trọng (kg)
    truckBedDimensions: {
      length: Number,            // Chiều dài thùng xe (m)
      width: Number,             // Chiều rộng thùng xe (m)
      height: Number             // Chiều cao thùng xe (m)
    }
  }
  ```

### 3. Service Controller (`backend/controllers/serviceController.js`)
- **Validation**: Bắt buộc driver phải nhập tải trọng và kích thước thùng xe khi tạo dịch vụ vận chuyển
- **Create Service**: Hỗ trợ vehicleSpecs cho category 'Dịch Vụ Vận Chuyển'
- **Update Service**: Cho phép cập nhật vehicleSpecs
- **Get Categories**: Bao gồm 'Dịch Vụ Vận Chuyển' trong danh sách

### 4. Service Routes (`backend/routes/serviceRoutes.js`)
- Cho phép driver `POST`, `PUT`, `DELETE` services
- Auth middleware: `auth(['worker','driver','admin'])`

### 5. User Controller (`backend/controllers/userController.js`)
- **Register**: Hỗ trợ đăng ký role 'driver'
- **Driver Management Functions**:
  - `adminCreateDriver`: Admin tạo tài khoản driver
  - `adminUpdateDriver`: Admin cập nhật thông tin driver
  - `adminDeleteDriver`: Admin xóa driver (và tất cả dữ liệu liên quan)
- **Toggle Online**: Driver có thể bật/tắt trạng thái online

### 6. User Routes (`backend/routes/userRoutes.js`)
- **Driver CRUD**:
  - `POST /api/users/drivers` - Admin tạo driver
  - `PUT /api/users/drivers/:id` - Admin cập nhật driver
  - `DELETE /api/users/drivers/:id` - Admin xóa driver
- **Driver Approval**:
  - `GET /api/users/drivers/pending` - Danh sách driver chờ duyệt
  - `PUT /api/users/drivers/:id/approve` - Duyệt driver
  - `PUT /api/users/drivers/:id/suspend` - Tạm ngưng driver
- **Cập nhật permissions**: Driver có quyền truy cập các routes như worker

### 7. Wallet Routes (`backend/routes/walletRoutes.js`)
- Driver có thể sử dụng đầy đủ chức năng ví:
  - Xem số dư
  - Nạp tiền
  - Xem lịch sử giao dịch
  - Upload proof of payment

### 8. Booking Routes (`backend/routes/bookingRoutes.js`)
- Driver có thể:
  - Xem bookings của mình
  - Cập nhật trạng thái booking
  - Xem thống kê

## API Endpoints Mới

### Driver Management (Admin Only)

#### 1. Tạo Driver
```http
POST /api/users/drivers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "password": "password123",
  "address": "123 Đường ABC, Q.1, TP.HCM",
  "citizenId": "012345678901",
  "status": "pending"
}
```

#### 2. Cập nhật Driver
```http
PUT /api/users/drivers/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "status": "active"
}
```

#### 3. Xóa Driver
```http
DELETE /api/users/drivers/:id
Authorization: Bearer <admin_token>
```

#### 4. Danh sách Driver chờ duyệt
```http
GET /api/users/drivers/pending
Authorization: Bearer <admin_token>
```

#### 5. Duyệt Driver
```http
PUT /api/users/drivers/:id/approve
Authorization: Bearer <admin_token>
```

#### 6. Tạm ngưng Driver
```http
PUT /api/users/drivers/:id/suspend
Authorization: Bearer <admin_token>
```

### Service với Vehicle Specs (Driver)

#### Tạo Dịch Vụ Vận Chuyển
```http
POST /api/services
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "name": "Dịch vụ vận chuyển hàng hóa",
  "description": "Xe tải 1 tấn, vận chuyển hàng hóa nội thành",
  "basePrice": 200000,
  "category": "Dịch Vụ Vận Chuyển",
  "vehicleSpecs": {
    "loadCapacity": 1000,
    "truckBedDimensions": {
      "length": 2.5,
      "width": 1.6,
      "height": 1.8
    }
  }
}
```

## Validation Rules

### Driver Registration
- Name: Bắt buộc
- Phone: Bắt buộc, unique cho mỗi role
- Password: Tối thiểu 8 ký tự
- Status: Mặc định `'pending'`, cần admin duyệt
- CitizenId: Tùy chọn lúc đăng ký, unique cho worker/driver

### Dịch Vụ Vận Chuyển
Khi driver tạo dịch vụ với category = 'Dịch Vụ Vận Chuyển':
- **Bắt buộc**: `vehicleSpecs.loadCapacity` (Tải trọng)
- **Bắt buộc**: `vehicleSpecs.truckBedDimensions.length` (Chiều dài)
- **Bắt buộc**: `vehicleSpecs.truckBedDimensions.width` (Chiều rộng)
- **Bắt buộc**: `vehicleSpecs.truckBedDimensions.height` (Chiều cao)

## User Flow

### Đăng ký Driver
1. User đăng ký với `role: 'driver'`
2. Status mặc định: `'pending'`
3. Admin xem danh sách pending: `GET /api/users/drivers/pending`
4. Admin duyệt: `PUT /api/users/drivers/:id/approve`
5. Driver login và tạo dịch vụ

### Tạo Dịch Vụ Vận Chuyển
1. Driver đăng nhập
2. Tạo service với category 'Dịch Vụ Vận Chuyển'
3. **Bắt buộc** nhập:
   - Tải trọng xe (kg)
   - Kích thước thùng xe (dài x rộng x cao) tính bằng mét
4. Upload ảnh xe (tùy chọn)
5. Hệ thống validate và lưu service

### Customer Booking
1. Customer xem danh sách dịch vụ vận chuyển
2. Chọn driver phù hợp dựa trên:
   - Tải trọng
   - Kích thước thùng xe
   - Giá cả
   - Rating
3. Đặt booking như bình thường

## Database Indexes

### User Collection
```javascript
// Phone + Role unique
{ phone: 1, role: 1 } // unique

// CitizenId unique cho worker/driver
{ citizenId: 1 } // unique, partialFilterExpression: role in ['worker', 'driver']
```

## Migration Notes

### Dữ liệu Cũ
- Các services cũ không bị ảnh hưởng
- Các workers hiện tại hoạt động bình thường
- Không cần migration script

### Testing
1. Đăng ký driver mới
2. Admin approve driver
3. Driver tạo dịch vụ vận chuyển với vehicleSpecs
4. Customer xem và đặt dịch vụ vận chuyển
5. Driver nhận và xử lý booking

## Categories Hiện Tại
1. Điện Lạnh
2. Máy Giặt
3. Điện Gia Dụng
4. Hệ Thống Điện
5. Sửa Xe Đạp
6. Sửa Xe Máy
7. Sửa Xe Oto
8. Sửa Xe Điện
9. **Dịch Vụ Vận Chuyển** ⭐ MỚI

## Tương Thích

### Frontend Web
- Cần thêm form cho vehicle specs trong service creation
- Hiển thị thông tin xe trong service detail
- Filter theo tải trọng và kích thước

### Mobile App
- Driver app có thể dùng chung với worker app
- Thêm input fields cho vehicle specs
- Hiển thị category icon cho vận chuyển

## Security Notes
- Driver và Worker có quyền tương đương
- CCCD phải unique cho cả worker và driver
- Admin approval bắt buộc cho driver mới
- Avatar của driver chỉ admin có thể cập nhật

## Troubleshooting

### Lỗi: "Tải trọng xe là bắt buộc cho dịch vụ vận chuyển"
- Đảm bảo gửi `vehicleSpecs.loadCapacity` trong request

### Lỗi: "Kích thước thùng xe là bắt buộc"
- Đảm bảo gửi đầy đủ: `length`, `width`, `height`

### Lỗi: "CCCD đã được đăng ký"
- CCCD phải unique cho worker và driver
- Kiểm tra database: `db.users.find({citizenId: "xxx"})`

## Future Enhancements
- [ ] Thêm loại xe (pickup, truck, van)
- [ ] Tính phí dựa trên khoảng cách
- [ ] GPS tracking cho delivery
- [ ] Multiple stops support
- [ ] Package tracking với QR code
- [ ] Proof of delivery (POD) với signature

---
**Ngày cập nhật**: 2025-11-04
**Version**: 1.0.0
**Tác giả**: Cascade AI Assistant
