import 'package:shared_preferences/shared_preferences.dart';
import 'services/socket_service.dart' as impl;

typedef BookingListener = void Function(Map<String, dynamic> bookingJson);

/// Legacy facade kept for compatibility with existing imports.
/// Delegates to the singleton implementation in lib/core/services/socket_service.dart
class SocketService {
  final impl.SocketService _impl = impl.SocketService();

  /// Connects socket; if [userId] is not provided, read from SharedPreferences.
  Future<void> connect({String? userId, BookingListener? onCreated, BookingListener? onUpdated, BookingListener? onLoyalty}) async {
    String? uid = userId;
    if (uid == null) {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('me');
      if (userStr != null) {
        final match = RegExp(r'"_id"\s*:\s*"([^"]+)"').firstMatch(userStr);
        uid = match?.group(1);
      }
    }

    // Register listeners if provided
    if (onCreated != null) _impl.addBookingCreatedListener(onCreated);
    if (onUpdated != null) _impl.addBookingUpdatedListener(onUpdated);

    if (uid != null) {
      await _impl.connect(userId: uid);
    }
  }

  void disconnect() => _impl.disconnect();

  bool get isConnected => _impl.isConnected;

  void reconnect() => _impl.reconnect();

  // Listener management
  void addBookingCreatedListener(void Function(Map<String, dynamic>) cb) => _impl.addBookingCreatedListener(cb);
  void removeBookingCreatedListener(void Function(Map<String, dynamic>) cb) => _impl.removeBookingCreatedListener(cb);

  void addBookingUpdatedListener(void Function(Map<String, dynamic>) cb) => _impl.addBookingUpdatedListener(cb);
  void removeBookingUpdatedListener(void Function(Map<String, dynamic>) cb) => _impl.removeBookingUpdatedListener(cb);

  // Keep old onNewOrderCallback behavior
  set onNewOrderCallback(Function()? cb) => impl.SocketService.onNewOrderCallback = cb;
}
