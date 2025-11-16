# Customer App Setup Guide

## Tổng Quan

Đã tạo thành công Customer App với cấu trúc shared package để tái sử dụng code giữa Worker App và Customer App.

## Cấu Trúc Project

```
mobile/
├── packages/
│   └── tho_hcm_shared/          # Shared package
│       ├── lib/
│       │   ├── src/
│       │   │   ├── core/        # API, Theme, Constants
│       │   │   ├── models/      # User, Service, Booking, Review
│       │   │   ├── repositories/# Auth Repository
│       │   │   ├── providers/   # Auth, Socket Providers
│       │   │   ├── services/    # (placeholder)
│       │   │   ├── utils/       # Validators, Formatters
│       │   │   └── widgets/     # Reusable widgets
│       │   └── tho_hcm_shared.dart
│       └── pubspec.yaml
│
├── customer_app/                 # NEW - Customer App
│   ├── lib/
│   │   ├── features/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── home/            # Home screen
│   │   │   ├── services/        # Browse services
│   │   │   ├── bookings/        # My bookings
│   │   │   └── profile/         # User profile
│   │   ├── firebase_options.dart
│   │   └── main.dart
│   ├── pubspec.yaml
│   └── README.md
│
└── worker_app/                   # Existing Worker App
    └── ...
```

## Bước 1: Setup Backend API URL

### Option A: Development (Local/LAN)
Chỉnh sửa `mobile/packages/tho_hcm_shared/lib/src/core/local_overrides.dart`:

```dart
// For physical device testing
const String? kLanApiBase = 'http://192.168.1.XXX:5000';  // Your computer's IP

// For Android emulator
const String? kLanApiBase = 'http://10.0.2.2:5000';

// For iOS simulator
const String? kLanApiBase = 'http://127.0.0.1:5000';
```

### Option B: Production
```dart
const String? kLanApiBase = 'https://thohcm-backend-181755246333.asia-southeast1.run.app';
```

## Bước 2: Setup Firebase

### 2.1 Tạo Firebase Project (nếu chưa có)
1. Truy cập https://console.firebase.google.com
2. Tạo project mới hoặc sử dụng existing project
3. Enable Firebase Cloud Messaging

### 2.2 Add Android App
```bash
cd mobile/customer_app
flutterfire configure --project=your-project-id
```

Hoặc manual setup:
1. Download `google-services.json` từ Firebase Console
2. Đặt vào `customer_app/android/app/`

### 2.3 Update firebase_options.dart
File đã được tạo tại `customer_app/lib/firebase_options.dart`
Chạy lệnh trên sẽ tự động update file này.

## Bước 3: Install Dependencies

```bash
# Install shared package dependencies
cd mobile/packages/tho_hcm_shared
flutter pub get

# Install customer app dependencies
cd ../../customer_app
flutter pub get
```

## Bước 4: Run App

### Android Emulator
```bash
cd mobile/customer_app
flutter run
```

### Physical Device
```bash
flutter run --release
# hoặc
flutter run --profile
```

### Specific Device
```bash
flutter devices                    # List devices
flutter run -d <device-id>        # Run on specific device
```

## Bước 5: Build APK

### Debug APK (for testing)
```bash
flutter build apk --debug
# Output: build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### App Bundle (for Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

## Features Đã Triển Khai

### ✅ Authentication
- Login với phone + password
- Register khách hàng mới
- Role tự động set là 'customer'
- Session persistence

### ✅ Home Screen
- Welcome card với user info
- Service categories
- Featured services grid
- VIP badge display

### ✅ Services
- Browse all services
- Grid layout với images
- Price display (có promo nếu có)
- Rating display

### ✅ Bookings
- View my bookings
- Tab view: Pending, Confirmed, Completed, Cancelled
- Cancel pending bookings
- Booking status badges

### ✅ Profile
- User info display
- VIP status
- Logout functionality

## Các Features Cần Develop Tiếp

### 🚧 Priority 1 (Core)
1. **Service Detail Screen**
   - Full service info
   - Worker profile
   - Gallery (images/videos)
   - Reviews
   - Book service form

2. **Booking Flow**
   - Date/time picker
   - Address selection
   - Price calculation
   - Confirmation screen

3. **Booking Detail Screen**
   - Full booking info
   - Worker contact
   - Status tracking
   - Cancel/Review options

### 🚧 Priority 2 (Enhanced)
4. **Search & Filter**
   - Search services by name
   - Filter by category
   - Filter by price range
   - Sort options

5. **Real-time Updates**
   - Socket.IO integration
   - Booking status updates
   - Push notifications

6. **Reviews System**
   - Rate booking after completion
   - View service reviews
   - Review history

### 🚧 Priority 3 (Nice to Have)
7. **Favorites**
   - Save favorite services
   - Save favorite workers

8. **Map Integration**
   - Show worker location
   - Select address on map

9. **Payment**
   - Payment methods
   - Payment history

10. **Notifications**
    - Notification list
    - Mark as read
    - Notification settings

## API Endpoints Reference

### Authentication
- `POST /api/users/login` - Login (role: 'customer')
- `POST /api/users/register` - Register (role: 'customer')
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-avatar` - Upload avatar

### Services
- `GET /api/services?isActive=true` - List active services
- `GET /api/services?category=Điện%20Lạnh` - Filter by category
- `GET /api/services/:id` - Service detail

### Bookings
- `GET /api/bookings` - My bookings (auto filter by customer)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Booking detail
- `PATCH /api/bookings/:id/status` - Update status (cancel)

### Reviews (TODO)
- `POST /api/reviews` - Create review
- `GET /api/reviews?service=:id` - Service reviews
- `GET /api/reviews?worker=:id` - Worker reviews

## Troubleshooting

### 1. Gradle Build Failed
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### 2. Firebase Error
```bash
# Re-configure Firebase
flutterfire configure
```

### 3. Import Errors
```bash
# Clean and rebuild
flutter clean
flutter pub get
cd ../packages/tho_hcm_shared
flutter pub get
cd ../../customer_app
flutter pub get
```

### 4. API Connection Error
- Check `local_overrides.dart` có đúng URL không
- Check backend đang chạy
- Check firewall/network
- Test API endpoint bằng Postman/curl

## Testing Accounts

Tạo test accounts qua Register screen hoặc backend:

```javascript
// Customer test account
{
  "name": "Khách Test",
  "phone": "0901234567",
  "password": "123456",
  "role": "customer",
  "address": "123 Test Street, Q1, HCM"
}
```

## Next Steps

1. **Ngay lập tức:**
   - Test login/register flow
   - Test service browsing
   - Test booking creation

2. **Tuần tới:**
   - Implement Service Detail Screen
   - Complete Booking Flow
   - Add real-time notifications

3. **Tương lai:**
   - Add map integration
   - Payment integration
   - Advanced search/filter

## Code Style & Best Practices

### Đã Áp Dụng
- Material 3 design
- Provider state management
- Shared package pattern
- Consistent error handling
- Vietnamese localization
- Reusable widgets

### Guidelines
- Luôn validate input với `Validators`
- Format output với `Formatters`
- Sử dụng `LoadingButton` cho async actions
- Sử dụng `CustomTextField` cho form inputs
- Check `mounted` trước khi `setState` sau async

## Support

- Backend API docs: Check `backend/README.md`
- Shared package: Check `packages/tho_hcm_shared/README.md`
- Worker app reference: Check `worker_app/` cho examples
