# Manual QR Banking System Documentation

## Tổng quan
Hệ thống Manual QR Banking cho phép thợ nạp tiền vào ví thông qua chuyển khoản QR và admin duyệt thủ công. Đây là giải pháp thay thế cho các payment gateway tự động như ZaloPay, VNPay.

## Luồng hoạt động

### 1. Thợ tạo yêu cầu nạp tiền
```
POST /api/wallet/deposit
{
  "amount": 100000,
  "paymentMethod": "manual_qr"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN_1703123456789_ABC123",
  "qrData": "data:image/png;base64,iVBOR...",
  "bankInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountName": "CONG TY THO HCM",
    "transferContent": "THOHCM TXN_1703123456789_ABC123 NGUYEN VAN A"
  },
  "message": "Vui lòng chuyển khoản theo thông tin trên và upload ảnh chuyển khoản"
}
```

### 2. Thợ chuyển khoản và upload ảnh chuyển khoản
```
POST /api/wallet/upload-proof
Content-Type: multipart/form-data

{
  "transactionId": "TXN_1703123456789_ABC123",
  "proofImage": [file upload]
}
```

### 3. Admin xem danh sách yêu cầu chờ duyệt
```
GET /api/wallet/pending-manual-deposits
```

**Response:**
```json
{
  "success": true,
  "pendingDeposits": [
    {
      "_id": "transaction_id",
      "transactionId": "TXN_1703123456789_ABC123",
      "workerId": {
        "_id": "worker_id",
        "name": "Nguyễn Văn A",
        "phone": "0123456789"
      },
      "amount": 100000,
      "proofImage": "proof-worker_id-1703123456789.jpg",
      "bankInfo": {...},
      "createdAt": "2023-12-21T10:30:00.000Z"
    }
  ]
}
```

### 4. Admin duyệt hoặc từ chối

#### Duyệt:
```
POST /api/wallet/approve-manual-deposit/:transactionId
{
  "adminNotes": "Đã xác nhận chuyển khoản",
  "actualAmount": 100000
}
```

#### Từ chối:
```
POST /api/wallet/reject-manual-deposit/:transactionId
{
  "adminNotes": "Không tìm thấy giao dịch chuyển khoản"
}
```

## Cấu trúc Database

### Transaction Schema Updates
```javascript
// Trong models/Wallet.js
{
  paymentMethod: {
    type: String,
    enum: ['vnpay', 'zalopay', 'stripe', 'manual_qr'], // Thêm manual_qr
    required: true
  },
  
  // Thông tin ngân hàng cho QR
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    transferContent: String
  },
  
  // Ảnh chuyển khoản
  proofImage: {
    type: String // Tên file ảnh
  },
  
  // Thông tin duyệt của admin
  adminApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    adminNotes: String,
    actualAmount: Number // Số tiền thực tế nhận được (có thể khác với amount yêu cầu)
  }
}
```

## File Structure

```
backend/
├── controllers/walletController.js      # Các function mới:
│   ├── uploadProofOfPayment()          # Upload ảnh chuyển khoản
│   ├── getPendingManualDeposits()      # Lấy danh sách chờ duyệt
│   ├── approveManualDeposit()          # Duyệt nạp tiền
│   └── rejectManualDeposit()           # Từ chối nạp tiền
├── services/BankingQRService.js        # Service tạo QR
├── routes/walletRoutes.js              # Routes mới với multer
├── storage/proof-of-payment/           # Thư mục lưu ảnh
└── test-manual-qr-banking.js           # Test script
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/wallet/deposit` | Worker | Tạo yêu cầu nạp tiền manual_qr |
| POST | `/api/wallet/upload-proof` | Worker | Upload ảnh chuyển khoản |
| GET | `/api/wallet/pending-manual-deposits` | Admin | Lấy danh sách chờ duyệt |
| POST | `/api/wallet/approve-manual-deposit/:id` | Admin | Duyệt nạp tiền |
| POST | `/api/wallet/reject-manual-deposit/:id` | Admin | Từ chối nạp tiền |

## Security Features

1. **File Upload Validation**: Chỉ cho phép file ảnh, giới hạn 5MB
2. **Auth Middleware**: Kiểm tra quyền worker/admin
3. **Unique Transaction IDs**: Mã giao dịch duy nhất để tracking
4. **Admin Approval**: Yêu cầu admin xác nhận trước khi cộng tiền

## Testing

Chạy test script:
```bash
# 1. Cấu hình token trong test-manual-qr-banking.js
# 2. Chạy test
node test-manual-qr-banking.js
```

Test cases:
- ✅ Tạo yêu cầu nạp tiền manual_qr
- ✅ Upload ảnh chuyển khoản
- ✅ Admin lấy danh sách chờ duyệt
- ✅ Admin duyệt/từ chối

## Mobile App Updates (Cần implement)

### 1. Deposit Screen Updates
- Thêm tùy chọn "Chuyển khoản QR" 
- Hiển thị QR code và thông tin ngân hàng
- Camera để chụp ảnh chuyển khoản
- Upload ảnh và tracking trạng thái

### 2. Transaction Status Tracking
- Hiển thị trạng thái: "Chờ duyệt", "Đã duyệt", "Từ chối"
- Push notification khi admin xử lý
- Chi tiết lý do từ chối (nếu có)

### 3. UI Components Cần Tạo
```
screens/
├── DepositScreen.js           # Thêm manual_qr option
├── QRDepositScreen.js         # Màn hình hiển thị QR và bank info
├── ProofUploadScreen.js       # Upload ảnh chuyển khoản
└── TransactionDetailScreen.js # Chi tiết giao dịch với trạng thái
```

## Admin Dashboard Updates (Cần implement)

### 1. Pending Deposits Management
```javascript
// Component hiển thị danh sách chờ duyệt
<PendingDepositsTable 
  deposits={pendingDeposits}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

### 2. Features Cần Có
- Danh sách giao dịch chờ duyệt
- Xem ảnh chuyển khoản full size
- Form duyệt/từ chối với ghi chú
- Thống kê số lượng giao dịch manual
- Báo cáo doanh thu từ manual deposits

## Configuration

### 1. Bank Account Info
Cập nhật thông tin ngân hàng trong `BankingQRService.js`:
```javascript
const BANK_INFO = {
  bankId: '970436', // Vietcombank
  accountNo: '1234567890',
  template: 'compact2',
  amount: '', // Sẽ set động
  addInfo: '', // Sẽ set động
  accountName: 'CONG TY THO HCM'
};
```

### 2. Upload Directory
Đảm bảo thư mục `backend/storage/proof-of-payment/` có quyền write.

## Deployment Checklist

- [ ] Cấu hình thông tin ngân hàng thực
- [ ] Setup thư mục upload với quyền phù hợp
- [ ] Test upload file trên production
- [ ] Cấu hình backup cho thư mục proof-of-payment
- [ ] Setup notification cho admin khi có deposit mới
- [ ] Tạo admin dashboard components
- [ ] Update mobile app UI
- [ ] Test end-to-end workflow

## Ưu điểm của Manual QR System

1. **Không phụ thuộc Payment Gateway**: Không cần đăng ký ZaloPay, VNPay
2. **Chi phí thấp**: Không mất phí giao dịch từ payment gateway
3. **Kiểm soát tốt**: Admin xác nhận từng giao dịch
4. **Tính minh bạch**: Có ảnh chuyển khoản làm bằng chứng
5. **Dễ troubleshoot**: Dễ dàng xử lý dispute và refund

## Nhược điểm và Limitations

1. **Thủ công**: Cần admin duyệt, không tự động
2. **Thời gian xử lý**: Phụ thuộc vào admin online
3. **Scale**: Khó scale khi có nhiều giao dịch
4. **User experience**: Không smooth như payment gateway tự động

## Kết luận

Manual QR Banking System là giải pháp tốt cho giai đoạn đầu hoặc khi không thể sử dụng payment gateway tự động. Hệ thống đảm bảo tính bảo mật, minh bạch và dễ kiểm soát.