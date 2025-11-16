# Screenshots Creation Guide for Play Store

## 📱 Screenshot Requirements

### Technical Specs:
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Formats**: JPG or PNG
- **Phone sizes**: 
  - 16:9 ratio: 1920x1080, 1280x720
  - 18:9 ratio: 2160x1080, 1440x720
- **Tablet sizes**: 1200x800, 1920x1200

### Best Practices:
1. **Show key features** in action
2. **Use device frames** for professional look
3. **Add captions** explaining features
4. **Keep UI clean** and user-friendly
5. **Show real data** (not lorem ipsum)

## 🎯 ThoHCM App Screenshots Strategy

### Screenshot 1: Home/Dashboard
- **Purpose**: Show main app interface
- **Content**: Worker services list, search, location
- **Caption**: "Find skilled workers near you instantly"

### Screenshot 2: Service Booking
- **Purpose**: Show booking process
- **Content**: Service details, pricing, book button
- **Caption**: "Book reliable workers with transparent pricing"

### Screenshot 3: Worker Profile
- **Purpose**: Show worker details and reviews
- **Content**: Worker info, ratings, past work photos
- **Caption**: "Verified workers with real customer reviews"

### Screenshot 4: Chat/Communication
- **Purpose**: Show in-app messaging
- **Content**: Chat interface between user and worker
- **Caption**: "Direct communication with your worker"

### Screenshot 5: Booking Management
- **Purpose**: Show booking status and tracking
- **Content**: Active bookings, status updates, notifications
- **Caption**: "Track your bookings in real-time"

## 🛠️ Screenshot Creation Tools

### Option 1: Android Emulator Screenshots
```powershell
# Run app in emulator
flutter run
# Take screenshots using emulator controls
# Save to: assets/screenshots/
```

### Option 2: Device Frame Generator
- **Website**: https://deviceframes.com/
- **Upload**: Raw screenshots
- **Select**: Device frame (Pixel, Samsung)
- **Download**: Framed screenshots

### Option 3: Figma Template
- **Create**: 1080x1920 frame
- **Add**: Device mockup
- **Insert**: App screenshots
- **Export**: PNG at 2x resolution

## 📁 File Organization
```
assets/
├── icons/
│   ├── app-icon-512.png
│   └── app-icon-sources/
├── screenshots/
│   ├── phone/
│   │   ├── 1-home-dashboard.png
│   │   ├── 2-service-booking.png
│   │   ├── 3-worker-profile.png
│   │   ├── 4-chat-communication.png
│   │   └── 5-booking-management.png
│   └── tablet/
│       └── (same structure for tablets)
└── feature-graphics/
    └── play-store-feature-graphic.png
```

## 📝 Screenshot Captions (Vietnamese)
1. "Tìm thợ giỏi gần bạn một cách nhanh chóng"
2. "Đặt lịch thợ đáng tin cậy với giá cả minh bạch"
3. "Thợ đã được xác minh với đánh giá thật từ khách hàng"
4. "Liên lạc trực tiếp với thợ của bạn"
5. "Theo dõi đơn đặt hàng theo thời gian thực"

## 📝 Screenshot Captions (English)
1. "Find skilled workers near you instantly"
2. "Book reliable workers with transparent pricing"
3. "Verified workers with real customer reviews"
4. "Direct communication with your worker"
5. "Track your bookings in real-time"