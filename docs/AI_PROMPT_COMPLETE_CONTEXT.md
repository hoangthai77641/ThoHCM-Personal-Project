# 🤖 COMPLETE AI CONTEXT PROMPT - ThoHCM PROJECT

> **Generated**: November 2025  
> **Purpose**: Comprehensive system context for AI assistants working on ThoHCM  
> **Version**: 1.0

---

## 📋 PROJECT OVERVIEW

**ThoHCM** is a platform connecting professional workers (thợ) with customers needing home repair and maintenance services in Vietnam.

### Tech Stack
- **Backend**: Node.js + Express.js + MongoDB (Cloud Run)
- **Web Frontend**: React + Material UI + Vite (Firebase Hosting)
- **Mobile**: Flutter (Android/iOS)
- **Infrastructure**: Google Cloud Platform (Cloud Run, Firebase)
- **Real-time**: Socket.IO for notifications
- **Payment**: VNPay, ZaloPay, Stripe integration

### Repository Structure
```
ThoHCM-Personal-Project/
├── backend/          # Node.js API server
├── web/              # React web application
├── mobile/
│   └── worker_app/   # Flutter mobile app
├── docs/             # All documentation
├── scripts/          # Deployment & build scripts
└── config/           # Configuration files
```

---

## 🎯 SYSTEM ARCHITECTURE

### Backend (Node.js)
**URL**: https://thohcm-backend-181755246333.asia-southeast1.run.app

#### Key Features
- User authentication (JWT)
- Booking management
- Service catalog
- Payment processing (wallet system)
- Real-time notifications (Socket.IO)
- File uploads (Google Cloud Storage)
- Admin dashboard APIs

#### Important Files
```
backend/
├── server.js                    # Entry point
├── models/
│   ├── User.js                  # User schema (customer/worker/admin)
│   ├── Booking.js               # Booking schema
│   ├── Service.js               # Service schema
│   └── Wallet.js                # Wallet transactions
├── controllers/
│   ├── userController.js        # Auth & user management
│   ├── bookingController.js     # Booking operations
│   └── walletController.js      # Payment & wallet
├── routes/
│   └── [module].js              # API routes
├── middleware/
│   ├── auth.js                  # JWT authentication
│   └── upload-gcs.js            # Google Cloud Storage
└── services/
    ├── NotificationService.js   # Socket.IO & FCM
    └── PaymentService.js        # Payment gateway integration
```

#### Environment Variables
```bash
# Critical backend environment variables
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret-key
ALLOWED_ORIGINS=https://frontend-domain.com
GCS_BUCKET_NAME=thohcm-storage
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
```

---

### Web Frontend (React)
**URL**: https://thohcm-frontend.web.app (Firebase Hosting)

#### Architecture
- **React 18** with React Router v6
- **Material UI v7** for components
- **Axios** for API calls with interceptors
- **localStorage** for auth token persistence
- **Socket.IO client** for real-time updates

#### Critical Files
```
web/src/
├── App.jsx                      # Main app component & routing
├── api.js                       # Axios client with auth interceptors
├── pages/
│   ├── Login.jsx                # Authentication
│   ├── Register.jsx             # User registration (customer/worker)
│   ├── Home.jsx                 # Service catalog
│   ├── Booking.jsx              # Booking flow
│   ├── Profile.jsx              # User profile
│   └── AdminDashboard.jsx       # Admin panel
├── components/
│   └── ResponsiveNav.jsx        # Navigation with auth state
└── config/
    └── messages.js              # UI messages & constants
```

#### Known Issues & Fixes Applied
1. **Auth UI not updating after login (FIXED)**
   - Issue: localStorage events don't fire in same tab
   - Fix: Custom 'authChanged' event dispatch + listener
   - Files: `Login.jsx`, `App.jsx`

2. **429 Rate Limit errors (FIXED)**
   - Issue: Multiple rapid `/api/users/me` calls after login
   - Fix: Throttle fetch with 3s guard + handle 429 gracefully
   - Files: `App.jsx`, `api.js`

3. **Request timeout (FIXED)**
   - Issue: Requests hanging on slow networks
   - Fix: 10s axios timeout
   - File: `api.js`

---

### Mobile App (Flutter)
**Package**: com.thohcm.workerapp

#### Features
- Worker account management
- Booking notifications
- Real-time chat
- Schedule management
- Wallet & earnings tracking
- Service reviews

#### Critical Files
```
mobile/worker_app/lib/
├── main.dart                    # App entry point
├── core/
│   ├── api_client.dart          # HTTP client
│   ├── socket_service.dart      # Socket.IO integration
│   └── services/
│       └── token_service.dart   # Secure token storage
├── features/
│   ├── auth/
│   │   ├── auth_repository.dart # Login/Register logic
│   │   └── register_screen.dart # Registration UI
│   ├── home/
│   ├── booking/
│   └── wallet/
└── firebase_options.dart        # Firebase config
```

#### Build & Deploy
```bash
# Android (AAB for Play Store)
cd mobile/worker_app
flutter clean
flutter pub get
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### User Roles
1. **customer**: Regular users booking services
2. **worker**: Service providers (require admin approval)
3. **admin**: Platform administrators

### Registration Flow
#### Web Registration
- **Customer**: Direct registration with `role: 'customer'`
- **Worker**: Can select "Đăng ký làm Thợ" checkbox
  - Sets `role: 'worker'` and `status: 'pending'`
  - Admin must approve before worker can login
  - CCCD (citizen ID) managed by admin, not in registration form

#### Mobile Registration (Worker App)
- Always registers with `role: 'worker'`
- Status defaults to `pending`
- Includes optional `citizenId` field

### Auth Flow
```
1. User registers → POST /api/users/register {name, phone, password, role}
2. Backend creates user with status='pending' (for workers) or 'active' (for customers)
3. User logs in → POST /api/users/login {phone, password}
4. Backend returns {token, user} if status='active'
5. If status='pending', returns 429 with message about account activation
6. Frontend stores token + user in localStorage
7. Frontend dispatches 'authChanged' event for same-tab UI update
8. All API requests include: Authorization: Bearer <token>
```

### Token Management
- **Storage**: localStorage (web), SecureStorage/SharedPreferences (mobile)
- **Expiry**: 7 days
- **Refresh**: Not implemented (user must re-login)
- **Socket.IO**: Pass token in `auth` option for secure connections

---

## 🔥 REAL-TIME NOTIFICATIONS

### Socket.IO Implementation

#### Backend
```javascript
// services/NotificationService.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    });
  } else {
    // Backward compatible: allow connection but log warning
    console.warn('Unauthenticated socket connection');
    next();
  }
});

// Events
- 'join': Join user-specific room
- 'join_admin': Join admin broadcast room
- 'new_booking': New booking notification
- 'booking_update': Status change notification
```

#### Mobile (Flutter)
```dart
// lib/core/socket_service.dart
socket = IO.io(
  apiUrl,
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .setAuth({'token': token})  // JWT authentication
    .build()
);

// Listen for notifications
socket?.on('new_booking', (data) {
  // Show notification
});
```

---

## 💰 PAYMENT SYSTEM

### Wallet Architecture
- Each worker has internal wallet balance
- Transactions tracked in `WalletTransaction` model
- Supports: deposit, withdrawal, booking payment, refund

### Payment Gateways

#### 1. VNPay (Vietnam domestic)
```javascript
// Configuration
VNP_TMN_CODE: Merchant code
VNP_HASH_SECRET: Hash secret
VNP_URL: https://vnpayment.vn/paymentv2/vpcpay.html

// Flow
1. Create payment URL with signature
2. Redirect user to VNPay
3. User completes payment
4. VNPay redirects back with IPN callback
5. Verify signature and update wallet
```

#### 2. ZaloPay
```javascript
// Configuration
ZALO_APP_ID: App ID
ZALO_KEY1, ZALO_KEY2: Security keys
ZALO_ENDPOINT: https://sb-openapi.zalopay.vn/v2/create

// Similar flow with callback verification
```

#### 3. Stripe (International)
```javascript
// Configuration
STRIPE_SECRET_KEY: sk_live_...
STRIPE_WEBHOOK_SECRET: whsec_...

// Webhook events
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
```

### Production Setup Required
1. Register merchant accounts (VNPay: 3-5 days, ZaloPay: 5-7 days)
2. Complete KYC verification
3. Update production credentials in environment variables
4. Test payment flow in sandbox mode first

---

## 📱 GOOGLE PLAY STORE DEPLOYMENT

### Prerequisites
```bash
# 1. Google Play Developer Account ($25 one-time fee)
# 2. Production keystore (thohcm-release-key.jks)
# 3. App configured with signing
```

### Build Process
```bash
cd mobile/worker_app

# Update version in pubspec.yaml
version: 1.2.0+3  # 1.2.0 = version name, 3 = build number

# Build AAB
flutter clean
flutter pub get
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

### Play Console Checklist
- [ ] Privacy Policy URL (required)
- [ ] Content Rating questionnaire
- [ ] Data Safety declarations
- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Screenshots (2-8, size 1080x1920)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] App category (Lifestyle)
- [ ] Contact email
- [ ] AAB uploaded
- [ ] Release notes

### Review Timeline
- First submission: 2-7 days
- Updates: Few hours to 2 days

---

## 🚀 DEPLOYMENT GUIDE

### Backend (Cloud Run)
```bash
# Option 1: GitHub Actions (automatic on push to main)
git push origin main

# Option 2: Manual PowerShell script
.\scripts\deploy-cloudrun.ps1

# Option 3: Manual gcloud
gcloud builds submit --config=cloudbuild.yaml
```

**Environment Setup**:
```bash
gcloud run services update thohcm-backend --region=asia-southeast1 \
  --set-env-vars MONGODB_URI="..." \
  --set-env-vars JWT_SECRET="..." \
  --set-env-vars ALLOWED_ORIGINS="https://thohcm-frontend.web.app"
```

### Frontend (Firebase Hosting)
```bash
# Build production
cd web
npm run build

# Deploy
firebase deploy --only hosting

# Or use GitHub Actions (automatic)
```

**Configure API URL**:
```javascript
// web/src/api.js
const API_URL = 'https://thohcm-backend-181755246333.asia-southeast1.run.app'
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### 1. Web Auth Issues
**Problem**: UI doesn't update after login, or freezes on reload (especially Safari/iOS)

**Root Cause**: 
- localStorage events don't fire in same tab
- Multiple concurrent `/api/users/me` calls trigger rate limiting (429)

**Solution** (ALREADY APPLIED):
```javascript
// Login.jsx - Dispatch custom event
localStorage.setItem('token', res.data.token)
localStorage.setItem('user', JSON.stringify(res.data.user))
window.dispatchEvent(new Event('authChanged'))  // ← This
navigate('/')

// App.jsx - Listen for custom event + throttle fetch
const handleAuthChanged = () => {
  const updatedUser = JSON.parse(localStorage.getItem('user') || 'null')
  setUser(updatedUser)
  // Throttled profile fetch with 3s guard
}
window.addEventListener('authChanged', handleAuthChanged)

// api.js - Add timeout
const client = axios.create({
  baseURL: API_URL,
  timeout: 10000  // 10s timeout
})
```

### 2. 429 Rate Limit Errors
**Problem**: Too many requests error after login

**Solution** (ALREADY APPLIED):
- Throttle profile fetch (3s minimum interval)
- Handle 429 with Retry-After header
- Don't block UI on failed requests

### 3. Socket.IO Connection Issues
**Problem**: Mobile app can't connect to real-time notifications

**Solution**:
```dart
// Mobile: Include JWT token in Socket.IO auth
socket = IO.io(apiUrl, IO.OptionBuilder()
  .setAuth({'token': token})  // ← Add this
  .build()
);
```

### 4. Payment Webhook Failures
**Problem**: VNPay/ZaloPay IPN not received

**Checklist**:
- Verify webhook URL is publicly accessible
- Check signature verification logic
- Ensure POST handler accepts `application/x-www-form-urlencoded`
- Log all incoming webhooks for debugging

### 5. Google Play Upload Errors
**Problem**: "App not signed" or "Target SDK too low"

**Solutions**:
```gradle
// android/app/build.gradle.kts
targetSdk = 34  // Android 14+

// Verify signing config
signingConfigs {
    release {
        storeFile file('../thohcm-release-key.jks')
        // ...
    }
}
```

---

## 📊 MONITORING & LOGGING

### Backend Logs
```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=thohcm-backend" --limit 50

# Filter by severity
gcloud logging read "severity>=ERROR" --limit 20
```

### Frontend Monitoring
- Use browser DevTools Console
- Network tab for API call inspection
- Check localStorage for token/user data

### Mobile Testing
```bash
# Android
flutter run --release
adb logcat | grep -i flutter

# iOS (requires macOS)
flutter run --release
```

---

## 🔒 SECURITY BEST PRACTICES

### Current Security Implementations
1. **JWT Authentication**: 7-day expiry tokens
2. **Password Hashing**: bcrypt with salt rounds=10
3. **HTTPS Only**: All communications encrypted
4. **CORS Configuration**: Strict origin whitelist
5. **Rate Limiting**: Implemented for auth endpoints
6. **Input Validation**: Server-side validation for all inputs
7. **File Upload Security**: Type checking + size limits
8. **SQL Injection Prevention**: MongoDB parameterized queries
9. **XSS Protection**: React escapes by default
10. **Socket.IO Auth**: JWT token verification

### Environment Security
- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Rotate JWT secrets periodically
- Keep dependencies updated (`npm audit`)

---

## 📝 CODE STANDARDS

### Backend (JavaScript)
```javascript
// Use async/await (not callbacks)
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(data);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Error handling
- Use try/catch blocks
- Return appropriate HTTP status codes
- Send JSON error responses
```

### Frontend (React)
```javascript
// Use functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>...</div>;
}

// Material UI sx prop for styling
<Box sx={{ p: 2, bgcolor: 'primary.main' }}>
```

### Mobile (Dart/Flutter)
```dart
// Use null safety
Future<ApiResponse<User>> getUser() async {
  try {
    final res = await _client.get('/api/users/me');
    return ApiResponse.success(User.fromJson(res.data));
  } catch (e) {
    return ApiResponse.error(e.toString());
  }
}

// State management with Provider
ChangeNotifierProvider(
  create: (_) => AuthProvider(),
  child: MyApp(),
)
```

---

## 🎓 LEARNING RESOURCES

### For New Developers
1. **Backend**: Express.js docs, MongoDB guides
2. **Frontend**: React docs, Material UI components
3. **Mobile**: Flutter cookbook, Dart language tour
4. **Cloud**: GCP documentation, Firebase guides

### Project-Specific Knowledge
- Read `docs/README.md` for documentation index
- Check `backend/README.md` for API documentation
- Review `mobile/worker_app/README.md` for Flutter setup
- Study existing controllers/components before adding new features

---

## 🆘 GETTING HELP

### Internal Documentation
- `docs/` folder contains all guides
- Check GitHub issues for known problems
- Review recent commits for context

### External Resources
- Stack Overflow for technical issues
- GitHub Discussions for feature requests
- Google Cloud Support for infrastructure

---

## ✅ QUICK REFERENCE COMMANDS

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd web
npm install
npm run dev

# Mobile
cd mobile/worker_app
flutter pub get
flutter run
```

### Production Deploy
```bash
# Backend (Cloud Run)
.\scripts\deploy-cloudrun.ps1

# Frontend (Firebase)
cd web
npm run build
firebase deploy --only hosting

# Mobile (Play Store)
cd mobile/worker_app
flutter build appbundle --release
# Upload AAB to Play Console
```

### Testing
```bash
# Backend API test
curl -X POST https://api-url/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0123456789","password":"Test123"}'

# Frontend local
npm run dev
# Open http://localhost:5173

# Mobile
flutter test
flutter run --release
```

---

## 📌 CRITICAL NOTES FOR AI ASSISTANTS

When helping with this project:

1. **Always verify file paths** before editing
2. **Check current implementation** before suggesting changes
3. **Consider backward compatibility** (mobile apps in production)
4. **Test locally before deploying** to production
5. **Update documentation** when adding features
6. **Follow existing code patterns** in the project
7. **Ask for clarification** if requirements are unclear
8. **Provide complete solutions** (don't use placeholders like `...existing code...`)
9. **Include error handling** in all code samples
10. **Consider mobile/web differences** when implementing features

### When Making Changes
- Read related files for context
- Check for similar implementations
- Update tests if applicable
- Document breaking changes
- Commit with clear messages

### When Debugging
- Check logs first (backend, frontend, mobile)
- Verify environment variables
- Test API endpoints independently
- Use browser DevTools Network tab
- Check for CORS issues

---

**End of Complete AI Context**

This document contains comprehensive information about ThoHCM project architecture, implementation details, deployment procedures, and common issues. Use this as reference when assisting with development, debugging, or deployment tasks.

**Last Updated**: November 2025  
**Maintained by**: Development Team  
**Status**: Production Ready ✅
