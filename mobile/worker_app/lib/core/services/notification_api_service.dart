import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../api_client.dart';
import '../../features/notifications/notifications_screen.dart';

class NotificationApiService {
  static final NotificationApiService _instance =
      NotificationApiService._internal();
  factory NotificationApiService() => _instance;
  NotificationApiService._internal();

  final ApiClient _apiClient = ApiClient();
  static const String _notificationsKey = 'cached_notifications';
  static const String _unreadCountKey = 'unread_notifications_count';

  /// Fetch notifications from API
  Future<List<NotificationItem>> fetchNotifications({
    int page = 1,
    int limit = 20,
    bool unreadOnly = false,
  }) async {
    try {
      String path = '/api/notifications/user?page=$page&limit=$limit';
      if (unreadOnly) path += '&unreadOnly=true';

      final response = await _apiClient.get(path);

      if (response['success'] == true) {
        final dynamic notificationsData = response['data'] ?? response['notifications'] ?? [];
        
        List<dynamic> notificationsList;
        if (notificationsData is List) {
          notificationsList = notificationsData;
        } else if (notificationsData is Map && notificationsData['notifications'] is List) {
          notificationsList = notificationsData['notifications'];
        } else {
          throw Exception('Invalid notifications data format: ${notificationsData.runtimeType}');
        }

        final notifications = notificationsList
            .map(
              (json) => NotificationItem(
                id: json['_id'] ?? json['id'] ?? '',
                title: json['title'] ?? '',
                message: json['message'] ?? '',
                type: json['type'] ?? 'info',
                timestamp:
                    DateTime.tryParse(
                      json['createdAt'] ?? json['timestamp'] ?? '',
                    ) ??
                    DateTime.now(),
                isRead: json['isRead'] ?? false,
                data: json['data'],
              ),
            )
            .toList();

        // Cache notifications
        await _cacheNotifications(notifications);

        return notifications;
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch notifications');
      }
    } catch (e) {
      print('Error fetching notifications: $e');
      // Return cached notifications if API fails
      return await _getCachedNotifications();
    }
  }

  /// Mark notification as read
  Future<bool> markAsRead(String notificationId) async {
    try {
      final response = await _apiClient.put(
        '/api/notifications/$notificationId/read',
        {},
      );

      if (response['success'] == true) {
        // Update cached notification
        await _updateCachedNotificationStatus(notificationId, true);
        return true;
      } else {
        throw Exception(
          response['message'] ?? 'Failed to mark notification as read',
        );
      }
    } catch (e) {
      print('Error marking notification as read: $e');
      // Still update cache locally
      await _updateCachedNotificationStatus(notificationId, true);
      return false; // API failed but cache updated
    }
  }

  /// Mark all notifications as read
  Future<bool> markAllAsRead() async {
    try {
      final response = await _apiClient.put(
        '/api/notifications/user/read-all',
        {},
      );

      if (response['success'] == true) {
        // Update all cached notifications
        await _markAllCachedAsRead();
        return true;
      } else {
        throw Exception(
          response['message'] ?? 'Failed to mark all notifications as read',
        );
      }
    } catch (e) {
      print('Error marking all notifications as read: $e');
      // Still update cache locally
      await _markAllCachedAsRead();
      return false; // API failed but cache updated
    }
  }

  /// Get unread notifications count
  Future<int> getUnreadCount() async {
    try {
      final response = await _apiClient.get(
        '/api/notifications/user?unreadOnly=true&limit=1',
      );

      if (response['success'] == true) {
        final int count = response['pagination']?['total'] ?? 0;
        await _cacheUnreadCount(count);
        return count;
      } else {
        throw Exception(response['message'] ?? 'Failed to get unread count');
      }
    } catch (e) {
      print('Error getting unread count: $e');
      // Return cached count
      return await _getCachedUnreadCount();
    }
  }

  /// Cache notifications locally
  Future<void> _cacheNotifications(List<NotificationItem> notifications) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final notificationsJson = notifications
          .map(
            (n) => {
              'id': n.id,
              'title': n.title,
              'message': n.message,
              'type': n.type,
              'timestamp': n.timestamp.toIso8601String(),
              'isRead': n.isRead,
              'data': n.data,
            },
          )
          .toList();

      await prefs.setString(_notificationsKey, jsonEncode(notificationsJson));
    } catch (e) {
      print('Error caching notifications: $e');
    }
  }

  /// Get cached notifications (public method)
  Future<List<NotificationItem>> getCachedNotifications() async {
    return await _getCachedNotifications();
  }

  /// Get cached notifications (private method)
  Future<List<NotificationItem>> _getCachedNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final notificationsJson = prefs.getString(_notificationsKey);

      if (notificationsJson != null) {
        final List<dynamic> notificationsList = jsonDecode(notificationsJson);

        return notificationsList
            .map(
              (json) => NotificationItem(
                id: json['id'] ?? '',
                title: json['title'] ?? '',
                message: json['message'] ?? '',
                type: json['type'] ?? 'info',
                timestamp:
                    DateTime.tryParse(json['timestamp'] ?? '') ??
                    DateTime.now(),
                isRead: json['isRead'] ?? false,
                data: json['data'],
              ),
            )
            .toList();
      }

      return [];
    } catch (e) {
      print('Error loading cached notifications: $e');
      return [];
    }
  }

  /// Update cached notification status
  Future<void> _updateCachedNotificationStatus(
    String notificationId,
    bool isRead,
  ) async {
    try {
      final notifications = await _getCachedNotifications();
      final updatedNotifications = notifications.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: isRead);
        }
        return n;
      }).toList();

      await _cacheNotifications(updatedNotifications);

      // Update unread count
      final unreadCount = updatedNotifications.where((n) => !n.isRead).length;
      await _cacheUnreadCount(unreadCount);
    } catch (e) {
      print('Error updating cached notification status: $e');
    }
  }

  /// Mark all cached notifications as read
  Future<void> _markAllCachedAsRead() async {
    try {
      final notifications = await _getCachedNotifications();
      final updatedNotifications = notifications
          .map((n) => n.copyWith(isRead: true))
          .toList();

      await _cacheNotifications(updatedNotifications);
      await _cacheUnreadCount(0);
    } catch (e) {
      print('Error marking all cached notifications as read: $e');
    }
  }

  /// Cache unread count
  Future<void> _cacheUnreadCount(int count) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_unreadCountKey, count);
    } catch (e) {
      print('Error caching unread count: $e');
    }
  }

  /// Get cached unread count
  Future<int> _getCachedUnreadCount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getInt(_unreadCountKey) ?? 0;
    } catch (e) {
      print('Error loading cached unread count: $e');
      return 0;
    }
  }

  /// Clear all cached data
  Future<void> clearCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_notificationsKey);
      await prefs.remove(_unreadCountKey);
    } catch (e) {
      print('Error clearing notification cache: $e');
    }
  }
}
