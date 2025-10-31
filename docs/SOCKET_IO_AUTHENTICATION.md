# Socket.IO Authentication Implementation

## Overview
Socket.IO authentication has been implemented with **backward compatibility** to ensure existing mobile apps continue working while transitioning to secure connections.

## Current Status (Backward Compatible Mode)

### ✅ What Works Now
- ✅ Existing mobile apps can still connect (without token)
- ✅ New mobile apps can connect with JWT token
- ✅ All connections are logged for monitoring
- ✅ Unauthenticated connections receive warnings but still work
- ✅ Authenticated connections get full access

### ⚠️ Security Improvements
- ✅ JWT token verification for authenticated connections
- ✅ User can only join their own room (unless admin)
- ✅ Admin room requires admin role
- ✅ All unauthorized attempts are logged
- ✅ Detailed security logging for monitoring

## For Mobile App Developers

### How to Update Mobile App (Flutter)

**Before (Current - Insecure):**
```dart
// lib/core/socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket? socket;
  
  void connect() {
    socket = IO.io('https://thohcm-backend-181755246333.asia-southeast1.run.app', 
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .build()
    );
    
    socket?.connect();
  }
}
```

**After (Secure):**
```dart
// lib/core/socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';

class SocketService {
  IO.Socket? socket;
  
  Future<void> connect() async {
    // Get JWT token from storage
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    if (token == null) {
      print('[Socket.IO] No token found, cannot connect securely');
      return;
    }
    
    socket = IO.io(
      'https://thohcm-backend-181755246333.asia-southeast1.run.app',
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})  // ← Add JWT token here
        .build()
    );
    
    // Handle authentication errors
    socket?.on('error', (data) {
      if (data['code'] == 'AUTH_REQUIRED') {
        print('[Socket.IO] Authentication required: ${data['message']}');
        // Show dialog to user: "Please update your app"
      }
    });
    
    socket?.connect();
  }
  
  void joinRoom(String userId) {
    socket?.emit('join', userId);
  }
  
  void joinAdminRoom(String userId) {
    socket?.emit('join_admin', userId);
  }
}
```

### Testing the Update

**1. Test with Token:**
```dart
// In your login success handler
final prefs = await SharedPreferences.getInstance();
await prefs.setString('token', loginResponse.token);

// Connect Socket.IO
await SocketService().connect();

// You should see in backend logs:
// [Socket.IO Security] Authenticated connection: { socketId: ..., userId: ..., role: ... }
```

**2. Test without Token (should still work but with warnings):**
```dart
// Clear token
final prefs = await SharedPreferences.getInstance();
await prefs.remove('token');

// Connect Socket.IO
await SocketService().connect();

// You should see in backend logs:
// [Socket.IO Security] Unauthenticated connection from ...
```

## Backend Implementation Details

### Authentication Middleware
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    // Backward compatible: Allow but log
    socket.isAuthenticated = false;
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      socket.isAuthenticated = false;
      return next();
    }
    
    socket.isAuthenticated = true;
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  });
});
```

### Event Handlers with Security

**Join Room (Protected):**
```javascript
socket.on('join', (room) => {
  if (!socket.isAuthenticated) {
    socket.emit('error', { 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }
  
  // Users can only join their own room
  if (room !== socket.userId && socket.userRole !== 'admin') {
    socket.emit('error', { 
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
    return;
  }
  
  socket.join(room);
});
```

**Join Admin Room (Admin Only):**
```javascript
socket.on('join_admin', (userId) => {
  if (!socket.isAuthenticated) {
    socket.emit('error', { code: 'AUTH_REQUIRED' });
    return;
  }
  
  if (socket.userRole !== 'admin') {
    socket.emit('error', { code: 'FORBIDDEN' });
    return;
  }
  
  socket.join('admin_room');
});
```

## Migration Timeline

### Phase 1: Backward Compatible (Current - 2 weeks)
- ✅ Both authenticated and unauthenticated connections allowed
- ✅ Unauthenticated connections logged with warnings
- ✅ Authenticated connections get full access
- ✅ Mobile app can be updated gradually

**Action Required:**
- [ ] Update mobile app to send JWT token
- [ ] Test with new mobile app version
- [ ] Deploy new mobile app to Play Store
- [ ] Monitor logs for unauthenticated connections

### Phase 2: Strict Mode (After 2 weeks)
- 🔒 Only authenticated connections allowed
- 🔒 Unauthenticated connections rejected
- 🔒 Remove backward compatibility code

**Code to Remove (after 2 weeks):**
```javascript
// In io.use() middleware, change:
if (!token) {
  // Remove this backward compatible block
  socket.isAuthenticated = false;
  return next();
}

// To:
if (!token) {
  return next(new Error('Authentication required'));
}
```

## Monitoring & Logs

### What to Monitor

**1. Unauthenticated Connections:**
```
[Socket.IO Security] Unauthenticated connection from abc123
[Socket.IO Security] Client IP: 192.168.1.100
[Socket.IO Security] User-Agent: Dart/2.19 (dart:io)
```

**2. Authenticated Connections:**
```
[Socket.IO Security] Authenticated connection: {
  socketId: 'xyz789',
  userId: '507f1f77bcf86cd799439011',
  role: 'worker'
}
```

**3. Unauthorized Access Attempts:**
```
[Socket.IO Security] Unauthenticated user tried to join room: 507f1f77bcf86cd799439011
[Socket.IO Security] User 507f1f77bcf86cd799439011 tried to join unauthorized room: 507f1f77bcf86cd799439012
[Socket.IO Security] Non-admin user 507f1f77bcf86cd799439011 tried to join admin room
```

### Metrics to Track

```bash
# Count unauthenticated connections (should decrease over time)
grep "Unauthenticated connection" logs.txt | wc -l

# Count authenticated connections (should increase over time)
grep "Authenticated connection" logs.txt | wc -l

# Count unauthorized attempts (should be low)
grep "tried to join" logs.txt | wc -l
```

## Security Benefits

### Before (Insecure)
- ❌ Anyone could connect to Socket.IO
- ❌ Anyone could join any room
- ❌ Anyone could listen to all real-time events
- ❌ No audit trail
- ❌ Privacy violations

### After (Secure)
- ✅ Only authenticated users can join rooms
- ✅ Users can only join their own room
- ✅ Admin room requires admin role
- ✅ All attempts logged
- ✅ JWT token verification
- ✅ Backward compatible during transition

## Testing Checklist

### Backend Testing
- [x] Unauthenticated connection allowed (backward compatible)
- [x] Authenticated connection with valid token works
- [x] Invalid token handled gracefully
- [x] User can join own room
- [x] User cannot join other user's room
- [x] Admin can join any room
- [x] Admin can join admin room
- [x] Non-admin cannot join admin room
- [x] All security events logged

### Mobile App Testing
- [ ] App connects without token (legacy mode)
- [ ] App connects with token (secure mode)
- [ ] App receives error events
- [ ] App handles AUTH_REQUIRED error
- [ ] App handles UNAUTHORIZED error
- [ ] Real-time updates work correctly
- [ ] Notifications received properly

## Rollback Plan

If issues occur, rollback is simple:

```javascript
// Comment out the authentication middleware
/*
io.use((socket, next) => {
  // ... authentication code ...
});
*/

// Keep only the basic connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // ... event handlers ...
});
```

Then redeploy backend.

## Support

### For Mobile App Developers
- Update Socket.IO connection to include JWT token
- Test thoroughly before deploying
- Monitor error events from Socket.IO
- Contact backend team if issues occur

### For Backend Team
- Monitor logs for security events
- Track authentication rate (should increase over time)
- After 2 weeks, remove backward compatibility
- Update this document with strict mode implementation

---

**Last Updated**: October 31, 2025
**Status**: Phase 1 - Backward Compatible Mode
**Next Review**: November 14, 2025 (2 weeks)
