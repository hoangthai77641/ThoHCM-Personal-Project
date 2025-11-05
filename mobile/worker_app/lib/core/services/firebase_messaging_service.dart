import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../api_client.dart';
import 'notification_service.dart';
import '../../features/bookings/booking_event_bus.dart';

// Background message handler - must be a top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('🔥 Background Firebase message received: ${message.messageId}');
  debugPrint('Background message data: ${message.data}');

  // Show local notification for background messages
  if (message.notification != null) {
    await NotificationService().showNotification(
      title: message.notification?.title ?? 'Thông báo mới',
      body: message.notification?.body ?? 'Bạn có thông báo mới',
      payload: message.data.toString(),
      type: NotificationType.newOrder,
    );
  }
}

class FirebaseMessagingService {
  static final FirebaseMessagingService _instance =
      FirebaseMessagingService._internal();
  factory FirebaseMessagingService() => _instance;
  FirebaseMessagingService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final ApiClient _apiClient = ApiClient();
  String? _fcmToken;
  bool _initialized = false;

  String? get fcmToken => _fcmToken;

  Future<void> initialize() async {
    if (_initialized) return;

    debugPrint('🔥 Initializing Firebase Messaging Service...');

    try {
      // Request permission for notifications
      NotificationSettings settings = await _firebaseMessaging
          .requestPermission(
            alert: true,
            badge: true,
            sound: true,
            carPlay: false,
            criticalAlert: false,
            provisional: false,
          );

      debugPrint('🔥 FCM Permission status: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('✅ FCM notifications permissions granted');

        // Get the FCM token
        await _getFCMToken();

        // Setup message handlers
        await _setupMessageHandlers();

        // Setup token refresh listener
        _setupTokenRefreshListener();

        _initialized = true;
        debugPrint('✅ Firebase Messaging Service initialized successfully');
      } else {
        debugPrint('❌ FCM notifications permissions denied');
      }
    } catch (e) {
      debugPrint('❌ Error initializing Firebase Messaging: $e');
    }
  }

  Future<void> _getFCMToken() async {
    try {
      _fcmToken = await _firebaseMessaging.getToken();
      debugPrint('🔥 FCM Token: $_fcmToken');

      if (_fcmToken != null) {
        // Store token locally for later use
        await _storeFCMTokenLocally(_fcmToken!);
      }
    } catch (e) {
      debugPrint('❌ Error getting FCM token: $e');
    }
  }

  Future<void> _storeFCMTokenLocally(String token) async {
    // Store in shared preferences or secure storage if needed
    debugPrint('💾 Storing FCM token locally: ${token.substring(0, 20)}...');
  }

  Future<void> updateFCMTokenOnServer(String userId) async {
    if (_fcmToken == null) {
      debugPrint('❌ No FCM token available to update on server');
      return;
    }

    try {
      debugPrint('🔄 Updating FCM token on server for user: $userId');

      final response = await _apiClient.put('/api/users/fcm-token', {
        'fcmToken': _fcmToken,
      });

      debugPrint('✅ FCM token updated on server successfully: $response');
    } catch (e) {
      debugPrint('❌ Error updating FCM token on server: $e');
    }
  }

  Future<void> _setupMessageHandlers() async {
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint(
        '🔥 Foreground Firebase message received: ${message.messageId}',
      );
      debugPrint('Foreground message data: ${message.data}');
      debugPrint(
        'Foreground message notification: ${message.notification?.title}',
      );

      // Handle different types of messages
      _handleForegroundMessage(message);
    });

    // Handle when user taps notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('🔥 User tapped notification: ${message.messageId}');
      debugPrint('Notification tap data: ${message.data}');

      // Handle navigation based on message data
      _handleNotificationTap(message);
    });

    // Check if app was opened from a notification when app was terminated
    RemoteMessage? initialMessage = await _firebaseMessaging
        .getInitialMessage();
    if (initialMessage != null) {
      debugPrint(
        '🔥 App opened from terminated state via notification: ${initialMessage.messageId}',
      );
      _handleNotificationTap(initialMessage);
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final messageType = message.data['type'];

    switch (messageType) {
      case 'new_order':
        _handleNewOrderNotification(message);
        break;
      case 'order_update':
        _handleOrderUpdateNotification(message);
        break;
      case 'booking_cancelled':
        _handleBookingCancelledNotification(message);
        break;
      case 'system_announcement':
        _handleSystemNotification(message);
        break;
      default:
        _handleGenericNotification(message);
    }
  }

  void _handleNewOrderNotification(RemoteMessage message) {
    debugPrint('📦 New order notification received');

    // Show local notification with enhanced styling for new orders
    NotificationService().showNewOrderNotification(
      customerName: message.data['customerName'] ?? 'Khách hàng',
      serviceName: message.data['serviceName'] ?? 'Dịch vụ',
      orderId: message.data['orderId'] ?? '',
    );

    // Trigger app-wide state updates so lists refresh immediately
    try {
      BookingEventBus().emitGlobalRefresh();
      debugPrint('🔄 Triggered global refresh via BookingEventBus');
    } catch (e) {
      debugPrint('⚠️ Error triggering global refresh: $e');
    }
  }

  void _handleOrderUpdateNotification(RemoteMessage message) {
    debugPrint('📋 Order update notification received');

    NotificationService().showOrderStatusNotification(
      title: message.notification?.title ?? 'Cập nhật đơn hàng',
      message: message.notification?.body ?? 'Đơn hàng của bạn có cập nhật mới',
      orderId: message.data['orderId'] ?? '',
    );
  }

  void _handleBookingCancelledNotification(RemoteMessage message) {
    debugPrint('❌ Booking cancelled notification received');

    // Show local notification for cancelled booking
    NotificationService().showNotification(
      title: message.notification?.title ?? 'Đơn hàng bị hủy',
      body: message.notification?.body ?? 'Khách hàng đã hủy đơn hàng',
      payload: message.data.toString(),
      type: NotificationType.error,
    );

    // Trigger app-wide state updates so booking lists refresh immediately
    try {
      BookingEventBus().emitGlobalRefresh();
      debugPrint('🔄 Triggered global refresh for cancelled booking');
    } catch (e) {
      debugPrint('⚠️ Error triggering global refresh: $e');
    }
  }

  void _handleSystemNotification(RemoteMessage message) {
    debugPrint('📢 System notification received');

    NotificationService().showNotification(
      title: message.notification?.title ?? 'Thông báo hệ thống',
      body: message.notification?.body ?? 'Bạn có thông báo mới từ hệ thống',
      payload: message.data.toString(),
      type: NotificationType.success,
    );
  }

  void _handleGenericNotification(RemoteMessage message) {
    debugPrint('📝 Generic notification received');

    if (message.notification != null) {
      NotificationService().showNotification(
        title: message.notification!.title ?? 'Thông báo',
        body: message.notification!.body ?? 'Bạn có thông báo mới',
        payload: message.data.toString(),
      );
    }
  }

  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('👆 User tapped notification, handling navigation...');

    final messageType = message.data['type'];
    final orderId = message.data['orderId'];
    final bookingId = message.data['bookingId'];

    switch (messageType) {
      case 'new_order':
      case 'order_update':
        if (orderId != null) {
          // Navigate to specific order details
          debugPrint('🔀 Navigating to order: $orderId');
          // TODO: Implement navigation to order details page
        }
        break;
      case 'booking_cancelled':
        if (bookingId != null) {
          // Navigate to bookings screen to see updated list
          debugPrint('🔀 Navigating to bookings list (cancelled: $bookingId)');
          // Trigger refresh of booking list
          BookingEventBus().emitGlobalRefresh();
        }
        break;
      default:
        debugPrint('🔀 Navigating to main app');
      // Navigate to main screen or notifications page
    }
  }

  void _setupTokenRefreshListener() {
    _firebaseMessaging.onTokenRefresh.listen((String newToken) {
      debugPrint('🔄 FCM Token refreshed: ${newToken.substring(0, 20)}...');
      _fcmToken = newToken;
      // TODO: Update token on server when user is logged in
    });
  }

  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      debugPrint('✅ Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('❌ Error subscribing to topic $topic: $e');
    }
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      debugPrint('✅ Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('❌ Error unsubscribing from topic $topic: $e');
    }
  }

  // Method to be called when user logs in
  Future<void> onUserLogin(String userId) async {
    debugPrint('👤 User logged in, updating FCM token on server...');
    await updateFCMTokenOnServer(userId);

    // Subscribe to user-specific topics if needed
    await subscribeToTopic('user_$userId');
    await subscribeToTopic('workers'); // All workers topic
  }

  // Method to be called when user logs out
  Future<void> onUserLogout(String userId) async {
    debugPrint('👤 User logged out, cleaning up FCM subscriptions...');

    // Unsubscribe from user-specific topics
    await unsubscribeFromTopic('user_$userId');
    await unsubscribeFromTopic('workers');
  }
}
