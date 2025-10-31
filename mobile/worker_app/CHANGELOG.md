# Changelog

## [1.1.0] - 2025-10-31

### Added
- **Socket.IO Authentication**: Implemented JWT token authentication for Socket.IO connections
  - Automatically sends JWT token during Socket.IO handshake
  - Enables secure real-time features (booking updates, notifications, location tracking)
  - Backward compatible with older backend versions
  - Shows user-friendly notifications if authentication is required

### Security
- Enhanced real-time communication security with JWT authentication
- Protected Socket.IO rooms from unauthorized access
- Added error handling for authentication failures

### Technical Details
- Updated `lib/core/services/socket_service.dart` to read JWT token from SharedPreferences
- Token is automatically included in Socket.IO auth handshake
- Added error event listener for `AUTH_REQUIRED` and `UNAUTHORIZED` codes
- Graceful fallback for legacy mode (without token)

### User Experience
- Real-time booking notifications now work securely
- Worker location tracking authenticated
- Admin dashboard updates protected
- No breaking changes - app works with both old and new backend

---

## [1.0.0] - 2025-10-01

### Initial Release
- Worker authentication and profile management
- Booking management (accept, reject, complete)
- Real-time notifications via Socket.IO
- Wallet and transaction management
- Service management
- Schedule management
- Review and rating system
- Firebase Cloud Messaging integration
