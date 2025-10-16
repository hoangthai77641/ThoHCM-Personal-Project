import 'package:flutter/foundation.dart';
import '../notifications/notifications_screen.dart';
import '../../core/services/notification_api_service.dart';

class NotificationsProvider extends ChangeNotifier {
  final NotificationApiService _apiService = NotificationApiService();
  List<NotificationItem> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _error;

  List<NotificationItem> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void addNotification(NotificationItem notification) {
    _notifications.insert(0, notification);
    if (!notification.isRead) {
      _unreadCount++;
    }
    notifyListeners();
  }

  void addNotificationFromSocket(Map<String, dynamic> data) {
    final notification = NotificationItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: data['title'] ?? 'Thông báo',
      message: data['message'] ?? '',
      type: data['type'] ?? 'info',
      timestamp: data['timestamp'] != null
          ? DateTime.parse(data['timestamp'])
          : DateTime.now(),
      isRead: false,
      data: data['data'],
    );

    addNotification(notification);
  }

  /// Load notifications from API
  Future<void> loadNotifications({bool refresh = false}) async {
    if (_isLoading && !refresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _notifications = await _apiService.fetchNotifications();
      _unreadCount = _notifications.where((n) => !n.isRead).length;
      _error = null;
    } catch (e) {
      _error = e.toString();
      print('Error loading notifications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    // Update UI immediately for better UX
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1 && !_notifications[index].isRead) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      _unreadCount--;
      notifyListeners();
    }

    // Sync with API
    try {
      await _apiService.markAsRead(notificationId);
    } catch (e) {
      // Revert if API call fails
      if (index != -1) {
        _notifications[index] = _notifications[index].copyWith(isRead: false);
        _unreadCount++;
        notifyListeners();
      }
      print('Error marking notification as read: $e');
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    // Store original states for potential revert
    final originalStates = _notifications.map((n) => n.isRead).toList();
    final originalUnreadCount = _unreadCount;

    // Update UI immediately
    bool hasChanges = false;
    for (int i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].isRead) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      _unreadCount = 0;
      notifyListeners();
    }

    // Sync with API
    try {
      await _apiService.markAllAsRead();
    } catch (e) {
      // Revert if API call fails
      for (int i = 0; i < _notifications.length; i++) {
        _notifications[i] = _notifications[i].copyWith(
          isRead: originalStates[i],
        );
      }
      _unreadCount = originalUnreadCount;
      notifyListeners();
      print('Error marking all notifications as read: $e');
    }
  }

  void clearAll() {
    _notifications.clear();
    _unreadCount = 0;
    notifyListeners();
  }

  /// Initialize notifications - load from cache first, then from API
  Future<void> initialize() async {
    try {
      // Load cached notifications immediately for better UX
      final cachedNotifications = await _apiService.getCachedNotifications();
      if (cachedNotifications.isNotEmpty) {
        _notifications = cachedNotifications;
        _unreadCount = cachedNotifications.where((n) => !n.isRead).length;
        notifyListeners();
      }

      // Then load from API to get latest data
      await loadNotifications();
    } catch (e) {
      print('Error initializing notifications: $e');
      // If everything fails, load sample data
      _loadSampleData();
    }
  }

  /// Load sample data as fallback
  void _loadSampleData() {
    _notifications = [
      NotificationItem(
        id: '1',
        title: 'Chào mừng!',
        message: 'Chào mừng bạn đến với ứng dụng Thợ HCM',
        type: 'system',
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        isRead: false,
      ),
    ];
    _unreadCount = 1;
    notifyListeners();
  }

  /// Refresh notifications from API
  Future<void> refresh() async {
    await loadNotifications(refresh: true);
  }
}
