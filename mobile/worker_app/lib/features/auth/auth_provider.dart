import 'package:flutter/foundation.dart';
import 'auth_repository.dart';
import '../../core/services/socket_service.dart';
import '../../core/services/firebase_messaging_service.dart';
import '../notifications/notifications_provider.dart';

class AuthProvider with ChangeNotifier {
  final _repo = AuthRepository();

  Map<String, dynamic>? user;
  String? error;
  String? errorCode;
  Map<String, dynamic>? errorDetails;
  bool loading = false;

  void setNotificationsProvider(NotificationsProvider provider) {
    SocketService().setNotificationsProvider(provider);
  }

  Future<bool> tryRestoreSession() async {
    user = await _repo.getMe();
    if (user != null) {
      // Connect to socket for real-time notifications and update FCM token
      final userId = user!['_id'] ?? user!['id'];
      await SocketService().connect(userId: userId);

      // Update FCM token on server for push notifications
      await FirebaseMessagingService().onUserLogin(userId);
    }
    notifyListeners();
    return user != null;
  }

  Future<bool> login(String phone, String password) async {
    loading = true;
    error = null;
    errorCode = null;
    errorDetails = null;
    notifyListeners();
    try {
      final data = await _repo.login(phone: phone, password: password);
      user = data['user'];

      // Connect to socket for real-time notifications and update FCM token
      if (user != null) {
        final userId = user!['_id'] ?? user!['id'];
        await SocketService().connect(userId: userId);

        // Update FCM token on server for push notifications
        await FirebaseMessagingService().onUserLogin(userId);
      }

      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      if (e is AuthException) {
        error = e.message;
        errorCode = e.code;
        errorDetails = e.details;
      } else {
        error = e.toString();
        errorCode = null;
        errorDetails = null;
      }
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    final userId = user?['_id'] ?? user?['id'];

    // Disconnect socket and clean up FCM subscriptions
    SocketService().disconnect();

    if (userId != null) {
      await FirebaseMessagingService().onUserLogout(userId);
    }

    await _repo.logout();
    user = null;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> payload) async {
    loading = true;
    error = null;
    errorCode = null;
    errorDetails = null;
    notifyListeners();
    try {
      final updated = await _repo.updateMe(payload);
      user = updated;
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerWorker({
    required String name,
    required String phone,
    required String password,
    String? address,
  }) async {
    loading = true;
    error = null;
    errorCode = null;
    errorDetails = null;
    notifyListeners();
    try {
      await _repo.registerWorker(
        name: name,
        phone: phone,
        password: password,
        address: address,
      );
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> uploadAvatar(dynamic imageFile) async {
    loading = true;
    error = null;
    errorCode = null;
    errorDetails = null;
    notifyListeners();
    try {
      final updated = await _repo.uploadAvatar(imageFile);
      user = updated;
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAvatar() async {
    loading = true;
    error = null;
    errorCode = null;
    errorDetails = null;
    notifyListeners();
    try {
      final updated = await _repo.deleteAvatar();
      user = updated;
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }
}
