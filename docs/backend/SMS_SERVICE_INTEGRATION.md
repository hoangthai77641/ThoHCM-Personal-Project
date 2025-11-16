# 📱 SMS Service Integration Guide

Hướng dẫn tích hợp dịch vụ SMS cho tính năng OTP trong dự án Thợ HCM.

## 📋 Tổng Quan

SMSService hỗ trợ 3 modes:
1. **Mock** (Development) - Log OTP ra console, không gửi SMS thật
2. **eSMS.vn** (Khuyến nghị cho VN) - Dịch vụ SMS Việt Nam
3. **Twilio** (International) - Dịch vụ SMS quốc tế

## 🚀 Quick Start

### 1. Development Mode (Mock)

Mặc định trong development, OTP sẽ được log ra console:

```bash
# .env
SMS_PROVIDER=mock
SMS_TEST_PHONES=0123456789,0987654321,0999999999
```

### 2. Production với eSMS.vn (Khuyến nghị)

#### Bước 1: Đăng ký tài khoản

1. Truy cập: https://esms.vn
2. Đăng ký tài khoản
3. Nạp tiền (~100,000đ để test)
4. Lấy API Key và Secret Key

#### Bước 2: Cấu hình

```bash
# .env
SMS_PROVIDER=esms
ESMS_API_KEY=your_api_key_here
ESMS_SECRET_KEY=your_secret_key_here
ESMS_BRAND_NAME=ThoHCM
```

#### Bước 3: Test

```bash
# Test script
node -e "
const { getSMSService } = require('./backend/services/SMSService');
const sms = getSMSService();
sms.sendOTP('0987654321', '123456').then(console.log);
"
```

### 3. Production với Twilio (International)

#### Option A: Twilio Verify API (Recommended)

```bash
# .env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SID=VAxxxxxxxxxxxx
```

#### Option B: Twilio SMS API

```bash
# .env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

## 💰 Giá Cả

### eSMS.vn
- **Giá**: 350-450đ/SMS
- **Brandname**: Hỗ trợ (hiển thị "ThoHCM" thay vì số điện thoại)
- **Tỷ lệ gửi**: ~98%
- **Tốc độ**: 1-3 giây
- **Best for**: Việt Nam

### Twilio
- **Giá**: ~$0.045/SMS (~1,000đ/SMS cho VN)
- **Tỷ lệ gửi**: 99%+
- **Tốc độ**: <1 giây
- **Best for**: International, cao cấp

### So Sánh

| Feature | eSMS.vn | Twilio |
|---------|---------|--------|
| Giá/SMS | 350-450đ | ~1,000đ |
| Brandname | ✅ | ✅ ($) |
| Verify API | ❌ | ✅ |
| Support VN | ✅ | ✅ |
| Docs tiếng Việt | ✅ | ❌ |
| International | ❌ | ✅ |

**Khuyến nghị**: Dùng eSMS.vn cho production tại VN

## 🔧 Usage Examples

### Basic: Send OTP

```javascript
const { getSMSService } = require('../services/SMSService');

async function sendOTP() {
  const smsService = getSMSService();
  const result = await smsService.sendOTP('0987654321', '123456');
  
  if (result.success) {
    console.log('Sent!', result.messageId);
  } else {
    console.error('Failed:', result.error);
  }
}
```

### In Controller: Forgot Password

```javascript
exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;
  const { getSMSService } = require('../services/SMSService');
  const bcrypt = require('bcryptjs');
  
  const user = await User.findOne({ phone });
  if (!user) {
    return res.json({ message: 'OTP sent if phone exists' });
  }

  // Generate OTP
  const smsService = getSMSService();
  let otp;
  
  if (smsService.isTestPhone(phone)) {
    otp = '123456'; // Test phones
  } else {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Hash and save
  user.resetOTP = await bcrypt.hash(otp, 10);
  user.resetOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();
  
  // Send SMS
  await smsService.sendOTP(phone, otp);
  
  res.json({ message: 'OTP đã được gửi' });
};
```

### Check Test Phone

```javascript
const smsService = getSMSService();

// Test phones always receive OTP: 123456
if (smsService.isTestPhone('0123456789')) {
  otp = '123456';
}
```

## 🔐 Security Best Practices

### 1. Hash OTP trước khi lưu DB

```javascript
const bcrypt = require('bcryptjs');

// ✅ ĐÚNG
const hashedOTP = await bcrypt.hash(otp, 10);
user.resetOTP = hashedOTP;

// ❌ SAI
user.resetOTP = otp; // Plain text - nguy hiểm!
```

### 2. Không trả về OTP trong response

```javascript
// ❌ SAI
res.json({ otp: otp, message: 'OTP sent' });

// ✅ ĐÚNG
res.json({ message: 'OTP đã được gửi' });

// ✅ OK cho development
if (process.env.NODE_ENV === 'development') {
  res.json({ message: 'OTP sent', otp }); // Only in dev
}
```

### 3. Set OTP expiry

```javascript
// 5 phút
user.resetOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
```

### 4. Rate Limiting

```javascript
// routes/userRoutes.js
const { authLimiter } = require('../middleware/security');

router.post('/forgot-password', authLimiter, userController.forgotPassword);
// Limit: 5 requests per 15 minutes per IP
```

### 5. Test Phones

```bash
# .env
SMS_TEST_PHONES=0123456789,0987654321,0999999999
```

Test phones luôn nhận OTP: `123456` và không tính phí SMS.

## 🧪 Testing

### Test trong Development

```javascript
// SMS_PROVIDER=mock trong .env
const { getSMSService } = require('./services/SMSService');
const sms = getSMSService();

// OTP sẽ được log ra console
await sms.sendOTP('0987654321', '123456');

// Output:
// ============================================================
// [SMS Service] MOCK MODE - SMS NOT ACTUALLY SENT
// ============================================================
// 📱 To: 0987654321
// 🔑 OTP: 123456
// 💬 Message: Ma OTP cua ban la: 123456...
// ============================================================
```

### Test với eSMS Sandbox

```bash
# .env production
SMS_PROVIDER=esms
NODE_ENV=development  # Sử dụng sandbox mode
```

### Test với số thật (cẩn thận)

```bash
SMS_PROVIDER=esms
NODE_ENV=production
```

## 📊 Monitoring & Logs

### Log Format

```javascript
// Success
[SMS Service] eSMS sent successfully to 0987654321
[SMS Service] Twilio SMS sent to 0987654321

// Error
[SMS Service] eSMS error: Insufficient balance
[SMS Service] Twilio error: Invalid phone number
```

### Monitor SMS Usage

#### eSMS.vn
- Dashboard: https://esms.vn/Dashboard
- Xem: Số dư, lịch sử gửi, tỷ lệ thành công

#### Twilio
- Console: https://console.twilio.com
- Metrics: Message logs, delivery status

## 🚨 Troubleshooting

### Issue 1: SMS không được gửi (Mock mode)

**Nguyên nhân**: `SMS_PROVIDER=mock` hoặc không set

**Giải pháp**:
```bash
SMS_PROVIDER=esms  # hoặc twilio
```

### Issue 2: eSMS error "Invalid API Key"

**Giải pháp**:
- Kiểm tra ESMS_API_KEY và ESMS_SECRET_KEY
- Đảm bảo không có khoảng trắng thừa
- Copy lại từ dashboard eSMS

### Issue 3: Phone number format error

**Nguyên nhân**: Format số điện thoại không đúng

**Giải pháp**:
```javascript
// SMSService tự động normalize:
// +84987654321 → 0987654321
// 84987654321 → 0987654321
// 0987654321 → 0987654321 ✓
```

### Issue 4: OTP không đến (production)

**Checklist**:
1. ✅ Kiểm tra balance trên eSMS/Twilio
2. ✅ Số điện thoại hợp lệ?
3. ✅ Kiểm tra logs: `[SMS Service]`
4. ✅ Provider có đang hoạt động? (status page)
5. ✅ Test với số test trước

### Issue 5: "Twilio not properly configured"

**Giải pháp**:
```bash
# Cần 1 trong 2:
TWILIO_VERIFY_SID=VAxxxx  # Verify API
# HOẶC
TWILIO_FROM_NUMBER=+1234567890  # SMS API
```

## 📈 Migration từ Mock → Production

### Checklist Deployment

- [ ] Đăng ký eSMS.vn hoặc Twilio
- [ ] Nạp tiền (~100,000đ để bắt đầu)
- [ ] Set credentials trong production `.env`
- [ ] Test với số test trước
- [ ] Test với 1-2 số thật
- [ ] Monitor logs trong 1 ngày đầu
- [ ] Setup billing alerts

### Production .env

```bash
NODE_ENV=production
SMS_PROVIDER=esms

# eSMS credentials
ESMS_API_KEY=your_real_api_key
ESMS_SECRET_KEY=your_real_secret_key
ESMS_BRAND_NAME=ThoHCM

# Test phones (vẫn giữ cho admin test)
SMS_TEST_PHONES=0123456789
```

### Deploy Steps

```bash
# 1. Update .env trên server
vim /path/to/backend/.env

# 2. Restart backend
pm2 restart thohcm-backend

# 3. Test ngay
curl -X POST http://api.thohcm.com/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"phone":"0123456789"}'

# 4. Check logs
pm2 logs thohcm-backend | grep "SMS Service"
```

## 🔗 Links

### eSMS.vn
- Website: https://esms.vn
- Docs: https://esms.vn/blog/esms-api
- Dashboard: https://esms.vn/Dashboard
- Support: https://esms.vn/Contact

### Twilio
- Website: https://www.twilio.com
- Docs: https://www.twilio.com/docs
- Console: https://console.twilio.com
- Status: https://status.twilio.com

## 💡 Tips

1. **Bắt đầu với Mock** - Test logic trước
2. **Dùng Test Phones** - Không tốn phí SMS
3. **Monitor Usage** - Tránh hết tiền đột ngột
4. **Sandbox Mode** - eSMS có sandbox cho dev
5. **Brandname** - Tăng trust, giảm spam report
6. **Rate Limiting** - Ngăn abuse
7. **Logs** - Luôn log result để debug

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `[SMS Service]`
2. Xem file: `services/SMSService.example.js`
3. Test với Mock mode trước
4. Verify credentials trong .env
5. Check provider status page

Good luck! 🚀
