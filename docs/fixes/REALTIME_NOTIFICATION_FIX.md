# 🔧 Fix Real-time Notifications - ThoHCM Worker App

## ❌ **Vấn đề đã phát hiện:**

### **1. Socket URL Mismatch:**
- **Web**: `https://thohcm-application-475603.as.r.appspot.com` (App Engine)
- **Mobile**: `https://thohcm-backend-181755246333.asia-southeast1.run.app` (Cloud Run)
- **Result**: Hai clients kết nối hai servers khác nhau → không sync được!

### **2. Event Name Inconsistency:**
- **Backend emits**: `bookingCreated`
- **Mobile listens**: `bookingCreated` ✅
- **Web listens**: `notification`, `worker_assigned` ❌ 

### **3. Room Joining Logic:**
- Mobile: `socket.emit('join', workerId)`
- Web: `socket.emit('join', userId)` và `socket.emit('join_admin', userId)`
- Backend: Phải handle both patterns correctly

## 🎯 **Fix Plan - 3 Steps:**

### **Step 1: Unify Socket URLs ⚡**

#### **Fix Mobile App Socket URL:**
```dart
// mobile/worker_app/lib/core/local_overrides.dart
const String? kLanSocketBase =
    'https://thohcm-application-475603.as.r.appspot.com'; // SAME AS WEB
```

#### **Fix Web App Socket URL (backup):**
```javascript
// web/src/components/NotificationSystem.jsx
const newSocket = io('https://thohcm-application-475603.as.r.appspot.com', {
  withCredentials: true,
  transports: ['websocket', 'polling'] // Fallback support
});
```

### **Step 2: Standardize Event Names 📡**

#### **Backend: Add consistent notification events**
```javascript
// backend/controllers/bookingController.js - Line ~130
io.to(String(booking.worker)).emit('bookingCreated', populated);

// ADD THESE LINES:
io.to(String(booking.worker)).emit('notification', {
  type: 'new_booking',
  title: 'Đơn hàng mới!',
  message: `Khách hàng ${populated.customer.name} vừa đặt lịch`,
  data: populated,
  timestamp: new Date()
});

// Also emit to admin rooms
io.to('admin_room').emit('notification', {
  type: 'booking_created',
  title: 'Đơn hàng mới trong hệ thống',
  message: `${populated.customer.name} đặt ${populated.service.name}`,
  data: populated,
  timestamp: new Date()
});
```

### **Step 3: Fix Room Management 🏠**

#### **Backend: Ensure proper room joining**
```javascript
// backend/server.js - Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    socket.emit('joined', { room: userId.toString() });
    console.log(`User ${userId} joined room: ${userId}`);
  });
  
  socket.on('join_admin', (adminId) => {
    socket.join('admin_room');
    socket.emit('joined_admin', { room: 'admin_room' });
    console.log(`Admin ${adminId} joined admin room`);
  });
});
```

## 🚀 **Implementation Steps:**

### **Immediate Fix (5 minutes):**

#### **1. Fix Mobile Socket URL:**
```bash
# Edit mobile app socket configuration
```

#### **2. Test Socket Connection:**
```bash
# Verify both web and mobile connect to same server
```

#### **3. Add debug logging:**
```javascript
// Add console.log to track socket events
```

### **Complete Fix (30 minutes):**

#### **1. Backend Event Standardization:**
- Add consistent notification events
- Ensure proper room management
- Add comprehensive logging

#### **2. Mobile App Updates:**
- Listen for both `bookingCreated` AND `notification`
- Handle different notification types
- Add connection status indicators

#### **3. Web App Updates:**
- Listen for `bookingCreated` events
- Standardize notification handling
- Add real-time indicators

## 🧪 **Testing Protocol:**

### **Test 1: Same Server Connection**
```bash
# 1. Open Web app → Check console: "Connected to: App Engine URL"
# 2. Open Mobile app → Check log: "Socket connected to: App Engine URL"  
# 3. Both should show SAME URL
```

### **Test 2: Real-time Flow**
```bash
# 1. Web: Customer đặt lịch
# 2. Backend: Emit bookingCreated + notification
# 3. Mobile: Should receive BOTH events
# 4. Mobile: Show notification + update pending orders
# 5. No manual refresh needed!
```

### **Test 3: Bi-directional Sync**
```bash
# 1. Mobile: Worker confirms order
# 2. Web: Customer should see status update immediately
# 3. Admin panel: Should see all updates real-time
```

## 📊 **Expected Results:**

### **Before Fix:**
```
Web Customer đặt lịch → ❌ Mobile không nhận notification
Mobile phải manual reload → 😤 Poor UX
```

### **After Fix:**
```
Web Customer đặt lịch → ✅ Mobile nhận ngay notification
Mobile tự động show đơn mới → 🎉 Perfect UX
Real-time sync hoàn hảo → ⚡ Professional experience
```

## 🔧 **File Changes Required:**

### **Mobile App:**
- `lib/core/local_overrides.dart` - Fix socket URL
- `lib/core/services/socket_service.dart` - Add notification event handling
- `lib/features/receive_orders/enhanced_orders_provider.dart` - Handle multiple events

### **Backend:**
- `controllers/bookingController.js` - Add notification events
- `server.js` - Improve room management
- Add logging for debugging

### **Web App:**
- `src/components/NotificationSystem.jsx` - Listen for bookingCreated
- Add connection status indicators

## ⚡ **Quick Debug Commands:**

### **Check Socket Connections:**
```bash
# Mobile app log:
# Look for: "🔗 Connecting to socket URL: https://..."
# Should be App Engine URL, not Cloud Run

# Web browser console:
# Should see: "Connected to notification service"
```

### **Test Event Flow:**
```javascript
// Add to backend bookingController.js line 130:
console.log('🚀 EMITTING bookingCreated to worker:', booking.worker);
console.log('📡 Socket rooms:', io.sockets.adapter.rooms);

// Mobile should log:
// "📱 Received bookingCreated event"

// Web should log:
// "🌐 Received notification event"
```

## 🎯 **Success Metrics:**

- ✅ **Mobile receives notifications within 1 second** of web booking
- ✅ **No manual refresh needed** to see new orders  
- ✅ **Bi-directional real-time sync** between all clients
- ✅ **Connection status indicators** show healthy connections
- ✅ **Event logs** confirm proper event flow

## 🚨 **Critical Fix Priority:**

**HIGH PRIORITY**: Socket URL unification - This is the root cause!
**MEDIUM PRIORITY**: Event name standardization  
**LOW PRIORITY**: Enhanced logging and debugging

---
*Issue: Real-time notifications not working*  
*Root Cause: Web and Mobile connect to different backend servers*  
*Fix: Unify socket URLs to use same App Engine endpoint*  
*Timeline: 5-30 minutes depending on scope*