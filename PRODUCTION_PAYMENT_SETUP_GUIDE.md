# HƯỚNG DẪN SETUP PRODUCTION PAYMENT GATEWAY ACCOUNTS

## 🏦 1. VNPAY (Cổng thanh toán Việt Nam)

### Bước 1: Đăng ký tài khoản VNPay Merchant
```
🌐 Website: https://vnpay.vn/
📧 Email liên hệ: cskh@vnpay.vn
📞 Hotline: 1900 555 577
```

### Bước 2: Chuẩn bị giấy tờ
**Doanh nghiệp:**
- Giấy phép kinh doanh
- Giấy phép website thương mại điện tử (nếu có)
- Chứng minh nhân dân/CCCD người đại diện
- Tài khoản ngân hàng doanh nghiệp

**Cá nhân:**
- CCCD/CMND
- Tài khoản ngân hàng cá nhân
- Giấy tờ chứng minh hoạt động kinh doanh

### Bước 3: Quy trình đăng ký
1. **Nộp hồ sơ online** tại website VNPay
2. **Chờ duyệt** (3-5 ngày làm việc)
3. **Ký hợp đồng** điện tử hoặc tại văn phòng
4. **Nhận thông tin tích hợp:**
   ```
   VNP_TMN_CODE: Mã website của bạn
   VNP_HASH_SECRET: Khóa bí mật
   VNP_URL: https://vnpayment.vn/paymentv2/vpcpay.html
   VNP_API: https://vnpayment.vn/merchant_webapi/api/transaction
   ```

### Bước 4: Phí và điều kiện
- **Phí setup:** Miễn phí
- **Phí giao dịch:** 1.5% - 3% tùy loại thẻ
- **Phí rút tiền:** 2,200đ/lần
- **Tần suất thanh toán:** T+1 (chuyển tiền sau 1 ngày)

---

## 💳 2. STRIPE (International Payment)

### Bước 1: Tạo tài khoản Stripe
```
🌐 Website: https://stripe.com/
📧 Hỗ trợ: support@stripe.com
```

### Bước 2: Verify tài khoản
**Thông tin cần thiết:**
- Thông tin cá nhân/doanh nghiệp
- Địa chỉ kinh doanh tại Việt Nam
- Tài khoản ngân hàng Việt Nam (hỗ trợ VND)
- Tax ID (Mã số thuế)

### Bước 3: Activate account
1. **Complete profile** với đầy đủ thông tin
2. **Bank account verification** 
3. **Identity verification** (upload documents)
4. **Business verification** (nếu là doanh nghiệp)

### Bước 4: Lấy API Keys
```bash
# Sau khi account được approve:
# Dashboard > Developers > API Keys

# Production Keys:
STRIPE_SECRET_KEY=sk_live_xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx...

# Webhook endpoint:
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

### Bước 5: Setup Webhooks
```
Webhook URL: https://your-domain.com/api/wallet/stripe-webhook
Events to listen:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
```

### Phí Stripe cho Việt Nam
- **Domestic cards:** 3.4% + 2,500đ
- **International cards:** 3.9% + 2,500đ  
- **Payout:** 25,000đ/lần
- **Tần suất:** T+7 (7 ngày)

---

## 🏪 3. ZALOPAY (Ví điện tử)

### Bước 1: Đăng ký ZaloPay Merchant
```
🌐 Website: https://merchant.zalopay.vn/
📧 Email: merchant@zalopay.vn
📞 Hotline: 1900 561 909
```

### Bước 2: Hồ sơ đăng ký
- Giấy phép kinh doanh
- Hợp đồng thuê mặt bằng
- Chứng minh nhân dân người đại diện
- Website/app demo

### Bước 3: Tích hợp
```bash
# Sau khi được duyệt:
ZALOPAY_APP_ID=xxxxx
ZALOPAY_KEY1=xxxxx  
ZALOPAY_KEY2=xxxxx
ZALOPAY_ENDPOINT=https://openapi.zalopay.vn/v2/create
```

---

## 🔧 4. CẬP NHẬT HỆ THỐNG

### Bước 1: Cập nhật Environment Variables
```bash
# backend/.env
NODE_ENV=production

# VNPay Production
VNP_TMN_CODE=YOUR_REAL_MERCHANT_CODE
VNP_HASH_SECRET=YOUR_REAL_HASH_SECRET  
VNP_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=https://your-domain.com/api/wallet/vnpay-return

# Stripe Production  
STRIPE_SECRET_KEY=sk_live_xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# ZaloPay Production
ZALOPAY_APP_ID=xxxxx
ZALOPAY_KEY1=xxxxx
ZALOPAY_KEY2=xxxxx

# Your domain
CLIENT_URL=https://your-production-domain.com
SERVER_URL=https://your-backend-domain.com
```

### Bước 2: Update Webhook URLs
```bash
# Đảm bảo các URLs này public accessible:
https://your-backend-domain.com/api/wallet/vnpay-return
https://your-backend-domain.com/api/wallet/vnpay-ipn  
https://your-backend-domain.com/api/wallet/stripe-webhook
https://your-backend-domain.com/api/wallet/zalopay-callback
```

### Bước 3: Test Production Environment
```bash
# 1. Test với số tiền nhỏ (1,000đ)
# 2. Verify webhook delivery  
# 3. Check transaction trong database
# 4. Confirm wallet balance update
```

---

## ⚠️ 5. CHECKLIST TRƯỚC KHI GO-LIVE

### Security Checklist
- [ ] HTTPS enabled cho tất cả endpoints
- [ ] Webhook signature verification
- [ ] Rate limiting enabled
- [ ] Input validation tất cả fields
- [ ] Error handling không expose sensitive info

### Business Checklist  
- [ ] Platform fee percentage configured
- [ ] Min/max topup amounts set correctly
- [ ] Bank account info updated
- [ ] Terms of service updated
- [ ] Privacy policy includes payment info

### Technical Checklist
- [ ] Database indexes created
- [ ] Backup strategy implemented  
- [ ] Monitoring/alerting setup
- [ ] Load testing completed
- [ ] Error tracking (Sentry/Bugsnag)

---

## 📊 6. MONITORING & MAINTENANCE

### Key Metrics to Monitor
```javascript
// Payment success rate
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM transactions 
WHERE created_at >= NOW() - INTERVAL 24 HOUR;

// Average processing time  
// Failed transaction alerts
// Webhook delivery failures
// Negative balance wallets
```

### Monthly Tasks
- [ ] Reconcile payment gateway settlements
- [ ] Review transaction fees
- [ ] Update payment method availability
- [ ] Security audit
- [ ] Performance optimization

---

## 💰 7. CHI PHÍ DỰ KIẾN HÀNG THÁNG

### Setup Costs (One-time)
- VNPay: **Miễn phí**
- Stripe: **Miễn phí** 
- ZaloPay: **Miễn phí**
- SSL Certificate: **$50-100/năm**

### Monthly Operating Costs
- Transaction fees: **1.5-3.9%** per transaction
- Payout fees: **2,200đ-25,000đ** per payout
- Server costs: **$20-100/tháng** (depending on volume)
- Monitoring tools: **$20-50/tháng**

### Break-even Analysis
```
Với 1000 giao dịch/tháng × 100,000đ avg:
- Total GMV: 100M VNĐ  
- Transaction fees (~2.5%): 2.5M VNĐ
- Your platform fee (20%): 20M VNĐ
- Net revenue: 17.5M VNĐ/tháng
```

---

## 🚀 8. TIMELINE DỰ KIẾN

### Week 1: Setup Accounts
- [ ] Đăng ký VNPay (3-5 days approval)
- [ ] Setup Stripe (1-2 days approval)  
- [ ] Đăng ký ZaloPay (5-7 days approval)

### Week 2: Integration & Testing
- [ ] Update environment variables
- [ ] Setup webhooks
- [ ] Staging environment testing
- [ ] Security audit

### Week 3: Production Deployment  
- [ ] Deploy to production
- [ ] Live testing với small amounts
- [ ] Monitor for 24h
- [ ] Full launch

**Total timeline: 2-3 tuần**

---

*💡 Tip: Bắt đầu với VNPay vì dễ duyệt nhất cho thị trường Việt Nam, sau đó mới setup Stripe cho international expansion.*

*📞 Nếu cần hỗ trợ setup, có thể liên hệ trực tiếp với sales team của từng payment gateway để được tư vấn chi tiết.*