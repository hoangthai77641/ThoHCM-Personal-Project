import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

enum NotificationType { newOrder, statusUpdate, loyalty, success, error }

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create high-priority notification channel for new orders
    final AndroidNotificationChannel newOrdersChannel = AndroidNotificationChannel(
      'new_orders_channel',
      'Đơn hàng mới',
      description: 'Thông báo khi có đơn hàng mới',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
      vibrationPattern: Int64List.fromList([0, 1000, 500, 1000]),
      enableLights: true,
      ledColor: const Color(0xFF0ea5e9),
      showBadge: true,
    );

    // Register the channel with the system
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(newOrdersChannel);

    debugPrint('✅ High-priority notification channel created: new_orders_channel');

    _initialized = true;
  }

  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
    // TODO: Handle notification tap navigation
  }

  // Enhanced notification method with types
  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
    NotificationType? type,
  }) async {
    if (!_initialized) await initialize();

    // Choose notification importance based on type
    Importance importance = Importance.defaultImportance;
    Priority priority = Priority.defaultPriority;
    bool enableVibration = false;

    switch (type) {
      case NotificationType.newOrder:
        importance = Importance.high;
        priority = Priority.high;
        enableVibration = true;
        break;
      case NotificationType.error:
        importance = Importance.max;
        priority = Priority.max;
        enableVibration = true;
        break;
      case NotificationType.loyalty:
        importance = Importance.high;
        priority = Priority.high;
        break;
      default:
        break;
    }

    final androidDetails = AndroidNotificationDetails(
      'worker_orders_channel',
      'Worker Orders',
      channelDescription: 'Notifications for worker order management',
      importance: importance,
      priority: priority,
      showWhen: true,
      enableVibration: enableVibration,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Generate unique notification ID
    final notificationId = DateTime.now().millisecondsSinceEpoch ~/ 1000;

    debugPrint(
      '📱 Showing local notification: ID=$notificationId, Title=$title, Body=$body',
    );

    await _notifications.show(
      notificationId,
      title,
      body,
      details,
      payload: payload,
    );

    debugPrint('✅ Local notification displayed successfully');
  }

  Future<void> showNewOrderNotification({
    required String customerName,
    required String serviceName,
    required String orderId,
  }) async {
    if (!_initialized) await initialize();

    // Create high-priority notification with sound and vibration
    final androidDetails = AndroidNotificationDetails(
      'new_orders_channel',
      'Đơn hàng mới',
      channelDescription: 'Thông báo khi có đơn hàng mới',
      importance: Importance.max,
      priority: Priority.max,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xFF0ea5e9),
      playSound: true,
      enableVibration: true,
      vibrationPattern: Int64List.fromList([0, 1000, 500, 1000]), // Strong vibration pattern
      enableLights: true,
      ledColor: const Color(0xFF0ea5e9),
      ledOnMs: 1000,
      ledOffMs: 500,
      ticker: 'Đơn hàng mới từ $customerName',
      fullScreenIntent: true, // Show as heads-up notification
      category: AndroidNotificationCategory.call, // High priority category
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'default',
      interruptionLevel: InterruptionLevel.timeSensitive,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final notificationId = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    
    debugPrint(
      '📱 Showing NEW ORDER notification: ID=$notificationId, Customer=$customerName, Service=$serviceName',
    );

    await _notifications.show(
      notificationId,
      '🔔 Đơn hàng mới!',
      'Khách hàng $customerName vừa đặt lịch $serviceName',
      details,
      payload: orderId,
    );

    debugPrint('✅ New order notification displayed successfully');
  }

  Future<void> showOrderStatusNotification({
    required String title,
    required String message,
    required String orderId,
  }) async {
    if (!_initialized) await initialize();

    const androidDetails = AndroidNotificationDetails(
      'order_updates',
      'Cập nhật đơn hàng',
      channelDescription: 'Thông báo khi có cập nhật đơn hàng',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: false,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      message,
      details,
      payload: orderId,
    );
  }

  Future<void> requestPermissions() async {
    if (!_initialized) await initialize();

    await _notifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.requestNotificationsPermission();
  }
}
