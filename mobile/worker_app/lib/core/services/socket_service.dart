import 'dart:developer';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../env.dart';
import 'notification_service.dart';
import '../../features/notifications/notifications_provider.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  String? _currentUserId;
  NotificationsProvider? _notificationsProvider;

  bool get isConnected => _isConnected;

  void setNotificationsProvider(NotificationsProvider provider) {
    _notificationsProvider = provider;
  }

  Future<void> connect({required String userId}) async {
    if (_socket != null && _isConnected) {
      log('Socket already connected');
      return;
    }

    _currentUserId = userId;

    try {
      _socket = IO.io(
        Env.socketBase,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .build(),
      );

      _socket!.onConnect((_) {
        log('Socket connected successfully');
        _isConnected = true;

        // Join user's room for targeted notifications
        _socket!.emit('join', userId);
        log('Joined room for user: $userId');
      });

      _socket!.onDisconnect((_) {
        log('Socket disconnected');
        _isConnected = false;
      });

      _socket!.onConnectError((error) {
        log('Socket connection error: $error');
        _isConnected = false;
      });

      // Listen for notifications
      _socket!.on('notification', (data) {
        log('Received notification: $data');
        _handleNotification(data);
      });

      // Listen for job assignments (for workers)
      _socket!.on('new_job_assignment', (data) {
        log('Received new job assignment: $data');
        _handleJobAssignment(data);
      });

      // Listen for booking status changes
      _socket!.on('booking_status_change', (data) {
        log('Received booking status change: $data');
        _handleBookingStatusChange(data);
      });

      // Listen for system announcements
      _socket!.on('system_announcement', (data) {
        log('Received system announcement: $data');
        _handleSystemAnnouncement(data);
      });

      _socket!.connect();
    } catch (e) {
      log('Error connecting to socket: $e');
      _isConnected = false;
    }
  }

  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _isConnected = false;
      _currentUserId = null;
      log('Socket disconnected and disposed');
    }
  }

  void _handleNotification(dynamic data) {
    try {
      log('🔔 Processing notification data: $data');
      final notification = data as Map<String, dynamic>;
      final title = notification['title'] as String? ?? 'Thông báo';
      final message = notification['message'] as String? ?? '';
      final type = notification['type'] as String? ?? 'info';

      log(
        '📱 Showing notification: Title=$title, Message=$message, Type=$type',
      );

      NotificationType notificationType = _getNotificationType(type);

      NotificationService().showNotification(
        title: title,
        body: message,
        type: notificationType,
        payload: notification.toString(),
      );

      // Gửi đến NotificationsProvider để add vào danh sách
      if (_notificationsProvider != null) {
        _notificationsProvider!.addNotificationFromSocket(notification);
        log('✅ Notification added to provider');
      }

      log('✅ Notification sent to NotificationService');
    } catch (e) {
      log('❌ Error handling notification: $e');
    }
  }

  void _handleJobAssignment(dynamic data) {
    try {
      final jobData = data as Map<String, dynamic>;
      final title = jobData['title'] as String? ?? 'Có việc mới!';
      final message =
          jobData['message'] as String? ?? 'Bạn có một công việc mới';

      NotificationService().showNotification(
        title: title,
        body: message,
        type: NotificationType.newOrder,
        payload: jobData.toString(),
      );
    } catch (e) {
      log('Error handling job assignment: $e');
    }
  }

  void _handleBookingStatusChange(dynamic data) {
    try {
      final statusData = data as Map<String, dynamic>;
      final title = statusData['title'] as String? ?? 'Cập nhật đơn hàng';
      final message =
          statusData['message'] as String? ?? 'Trạng thái đơn hàng đã thay đổi';

      NotificationService().showNotification(
        title: title,
        body: message,
        type: NotificationType.statusUpdate,
        payload: statusData.toString(),
      );
    } catch (e) {
      log('Error handling booking status change: $e');
    }
  }

  void _handleSystemAnnouncement(dynamic data) {
    try {
      final announcementData = data as Map<String, dynamic>;
      final title =
          announcementData['title'] as String? ?? 'Thông báo hệ thống';
      final message = announcementData['message'] as String? ?? '';
      final level = announcementData['level'] as String? ?? 'info';

      NotificationType notificationType = level == 'error'
          ? NotificationType.error
          : NotificationType.statusUpdate;

      NotificationService().showNotification(
        title: title,
        body: message,
        type: notificationType,
        payload: announcementData.toString(),
      );
    } catch (e) {
      log('Error handling system announcement: $e');
    }
  }

  NotificationType _getNotificationType(String type) {
    switch (type) {
      case 'promotion':
        return NotificationType.loyalty;
      case 'error':
        return NotificationType.error;
      case 'success':
        return NotificationType.success;
      case 'booking':
      case 'job_assignment':
        return NotificationType.newOrder;
      case 'status_change':
        return NotificationType.statusUpdate;
      default:
        return NotificationType.statusUpdate;
    }
  }

  // Send events to server if needed
  void emitEvent(String event, dynamic data) {
    if (_socket != null && _isConnected) {
      _socket!.emit(event, data);
      log('Emitted event: $event with data: $data');
    } else {
      log('Cannot emit event: Socket not connected');
    }
  }

  // Reconnect if needed
  Future<void> reconnect() async {
    if (_currentUserId != null) {
      disconnect();
      await Future.delayed(const Duration(seconds: 2));
      await connect(userId: _currentUserId!);
    }
  }

  // Listen to worker status changes
  static void onWorkerStatusChanged(Function(Map<String, dynamic>) callback) {
    final instance = SocketService();
    if (instance._socket != null) {
      instance._socket!.on('workerStatusChanged', (data) {
        try {
          log('📡 Worker status changed: $data');
          final statusData = data as Map<String, dynamic>;
          callback(statusData);
        } catch (e) {
          log('❌ Error handling worker status change: $e');
        }
      });
    }
  }
}
