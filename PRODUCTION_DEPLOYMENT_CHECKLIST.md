# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## 📋 PRE-DEPLOYMENT (1-2 tuần trước)

### Payment Gateway Setup
- [ ] **VNPay Account**
  - [ ] Đăng ký tài khoản merchant VNPay
  - [ ] Nộp đầy đủ giấy tờ theo yêu cầu
  - [ ] Chờ approval (3-5 ngày)
  - [ ] Nhận VNP_TMN_CODE và VNP_HASH_SECRET
  - [ ] Test integration trên sandbox

- [ ] **Stripe Account** 
  - [ ] Tạo tài khoản Stripe business
  - [ ] Complete identity verification
  - [ ] Add bank account (VN bank supported)
  - [ ] Activate live mode
  - [ ] Generate live API keys
  - [ ] Setup webhook endpoints

- [ ] **ZaloPay Account**
  - [ ] Đăng ký ZaloPay merchant
  - [ ] Provide business documents
  - [ ] Wait for approval (5-7 ngày)
  - [ ] Receive integration credentials
  - [ ] Test callback integration

### Infrastructure Setup
- [ ] **Domain & SSL**
  - [ ] Register production domain
  - [ ] Setup SSL certificate (Let's Encrypt/Cloudflare)
  - [ ] Configure DNS records
  - [ ] Test HTTPS accessibility

- [ ] **Server Setup**
  - [ ] Provision production servers (Cloud Run/EC2/VPS)
  - [ ] Setup load balancer (if needed)
  - [ ] Configure firewall rules
  - [ ] Setup monitoring (CloudWatch/DataDog)
  - [ ] Configure backup strategy

- [ ] **Database**
  - [ ] Setup production MongoDB cluster
  - [ ] Create database indexes (see script)
  - [ ] Setup automated backups
  - [ ] Test connection from server
  - [ ] Import initial/seed data

## 🔧 DEPLOYMENT WEEK

### Day 1-2: Environment Setup
- [ ] **Backend Configuration**
  - [ ] Copy `.env.production.template` to `.env`
  - [ ] Fill in all production values
  - [ ] Test environment variable loading
  - [ ] Verify no sandbox/test keys remain

- [ ] **Security Configuration**
  - [ ] Generate strong JWT secrets
  - [ ] Configure CORS properly
  - [ ] Setup rate limiting
  - [ ] Enable security headers
  - [ ] Test webhook signature verification

### Day 3-4: Application Deployment
- [ ] **Backend Deployment**
  ```bash
  # Run deployment commands:
  cd backend
  npm install --production
  npm run build
  pm2 start ecosystem.config.js --env production
  ```

- [ ] **Mobile App**
  ```bash  
  # Build release APK/AAB
  cd mobile/worker_app
  flutter build apk --release
  flutter build appbundle --release
  ```

- [ ] **Web Frontend**
  ```bash
  # Build and deploy web
  cd web  
  npm run build
  # Deploy to CDN/web server
  ```

### Day 5: Payment Integration Testing
- [ ] **VNPay Testing**
  - [ ] Test small amount deposit (1,000đ)
  - [ ] Verify webhook delivery
  - [ ] Check wallet balance update
  - [ ] Test return URL handling
  - [ ] Verify transaction in database

- [ ] **Stripe Testing**
  - [ ] Test card payment flow
  - [ ] Verify webhook processing
  - [ ] Check successful payment handling
  - [ ] Test failed payment scenarios
  - [ ] Verify currency handling (VND)

- [ ] **ZaloPay Testing**
  - [ ] Test ZaloPay wallet payment
  - [ ] Verify callback processing
  - [ ] Check transaction completion
  - [ ] Test error scenarios

### Day 6-7: Integration Testing
- [ ] **End-to-End Flows**
  - [ ] Worker registration → wallet creation
  - [ ] Service creation → booking → fee deduction
  - [ ] Deposit → balance update → transaction history
  - [ ] Negative balance → service hiding
  - [ ] Admin functions → statistics → manual operations

- [ ] **Load Testing**
  - [ ] Test concurrent deposits
  - [ ] Verify webhook processing under load
  - [ ] Check database performance
  - [ ] Monitor memory/CPU usage
  - [ ] Test rate limiting

## 📊 GO-LIVE DAY

### Pre-Launch (Morning)
- [ ] **Final Checks**
  - [ ] Verify all services running
  - [ ] Check payment gateway status
  - [ ] Test critical user flows
  - [ ] Verify monitoring alerts work
  - [ ] Prepare rollback plan

- [ ] **Monitoring Setup**
  - [ ] Setup real-time dashboards
  - [ ] Configure alert notifications
  - [ ] Monitor error rates
  - [ ] Track payment success rates
  - [ ] Watch server resources

### Launch (Afternoon)
- [ ] **Soft Launch**
  - [ ] Enable for limited users (beta testers)
  - [ ] Monitor for 2-4 hours
  - [ ] Check payment flows
  - [ ] Verify no critical errors

- [ ] **Full Launch**
  - [ ] Release to all users
  - [ ] Announce via app/website
  - [ ] Monitor intensively for first 24h
  - [ ] Be ready for immediate fixes

## 🔍 POST-LAUNCH (First Week)

### Daily Monitoring
- [ ] **Payment Metrics**
  - [ ] Track success/failure rates
  - [ ] Monitor transaction volumes
  - [ ] Check settlement accuracy
  - [ ] Verify fee calculations

- [ ] **System Health**
  - [ ] Monitor server performance  
  - [ ] Check error logs
  - [ ] Verify webhook deliveries
  - [ ] Track user feedback

### Weekly Reviews
- [ ] **Financial Reconciliation**
  - [ ] Compare internal records with payment gateways
  - [ ] Verify settlement amounts
  - [ ] Check fee calculations
  - [ ] Audit wallet balances

- [ ] **Performance Analysis**
  - [ ] Review payment conversion rates
  - [ ] Analyze user behavior
  - [ ] Identify optimization opportunities
  - [ ] Plan improvements

## 🚨 EMERGENCY PROCEDURES

### Payment Gateway Down
```bash
# Temporary disable affected payment method
# Redirect users to alternative methods
# Notify users via app notification
# Contact payment gateway support
```

### High Error Rate
```bash
# Check logs: tail -f /var/log/app.log
# Monitor dashboards for patterns
# Rollback if necessary: pm2 reload all --env staging
# Fix issues and redeploy
```

### Database Issues
```bash
# Check connection: mongosh [connection_string]
# Monitor replication lag
# Switch to backup if needed
# Contact MongoDB support
```

## 📞 SUPPORT CONTACTS

### Payment Gateways
- **VNPay**: cskh@vnpay.vn / 1900 555 577
- **Stripe**: support@stripe.com / Dashboard chat
- **ZaloPay**: merchant@zalopay.vn / 1900 561 909

### Infrastructure
- **MongoDB Atlas**: Support portal
- **Google Cloud**: Support console
- **Cloudflare**: Support dashboard

### Internal Team
- **Technical Lead**: [Your contact]
- **DevOps**: [Your contact]  
- **Business**: [Your contact]

## ✅ SUCCESS CRITERIA

### Technical Metrics
- [ ] Payment success rate > 95%
- [ ] Webhook processing < 5 seconds
- [ ] API response time < 500ms
- [ ] System uptime > 99.9%
- [ ] Zero data loss incidents

### Business Metrics  
- [ ] User registration rate maintained
- [ ] Payment conversion rate > 80%
- [ ] Customer support tickets < 5/day
- [ ] Revenue tracking accurate
- [ ] Fee collection working properly

---

**🎉 Congratulations on your production launch!**

*Keep this checklist and update it based on your experience for future deployments.*