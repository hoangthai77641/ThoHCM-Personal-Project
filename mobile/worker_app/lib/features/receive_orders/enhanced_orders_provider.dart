import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../bookings/bookings_repository.dart';
import '../bookings/booking_model.dart';
import '../../core/socket_service.dart';
import '../../core/services/notification_service.dart';
import '../../core/app_strings.dart';

class EnhancedOrdersProvider with ChangeNotifier {
  final _repo = BookingsRepository();
  final _socket = SocketService();
  final _notificationService = NotificationService();

  List<Booking> _pendingOrders = [];
  List<Booking> _activeOrders = [];
  List<Booking> _completedOrders = [];

  bool _loading = false;
  String? _error;
  String? _lastNotification;

  // Getters
  List<Booking> get pendingOrders => _pendingOrders;
  List<Booking> get activeOrders => _activeOrders;
  List<Booking> get completedOrders => _completedOrders;

  bool get loading => _loading;
  String? get error => _error;
  String? get lastNotification => _lastNotification;

  int get pendingCount => _pendingOrders.length;
  int get activeCount => _activeOrders.length;
  int get completedCount => _completedOrders.length;
  int get totalCount => pendingCount + activeCount + completedCount;

  EnhancedOrdersProvider() {
    loadAllOrders();
    _initSocket();
    _initNotificationService();
  }

  void _initNotificationService() async {
    await _notificationService.initialize();
  }

  void _initSocket() {
    _socket.connect(
      onCreated: (bookingData) {
        final booking = Booking.fromJson(bookingData);
        if (booking.status == 'pending') {
          _pendingOrders.insert(0, booking);

          // Enhanced notification with customer info
          _showEnhancedNotification(
            'Đơn hàng mới!',
            'Khách hàng ${booking.customer?['name'] ?? 'N/A'} vừa đặt lịch ${booking.service?['name'] ?? 'dịch vụ'}',
            booking,
            NotificationType.newOrder,
          );

          _lastNotification =
              'Nhận đơn hàng mới từ ${booking.customer?['name'] ?? 'khách hàng'}';
          notifyListeners();
        }
      },
      onUpdated: (bookingData) {
        final booking = Booking.fromJson(bookingData);
        _updateBookingInLists(booking);

        // Show status update notification
        String statusText = _getStatusText(booking.status);
        _showEnhancedNotification(
          'Cập nhật đơn hàng',
          'Đơn hàng #${booking.id.substring(0, 8)} đã chuyển sang: $statusText',
          booking,
          NotificationType.statusUpdate,
        );

        _lastNotification = 'Đơn hàng cập nhật: $statusText';
        notifyListeners();
      },
    );

    // Listen for loyalty updates using the socket service callback mechanism
    _socket.connect(
      onCreated: (bookingData) {
        final booking = Booking.fromJson(bookingData);
        if (booking.status == 'pending') {
          _pendingOrders.insert(0, booking);

          // Enhanced notification with customer info
          _showEnhancedNotification(
            'Đơn hàng mới!',
            'Khách hàng ${booking.customer?['name'] ?? 'N/A'} vừa đặt lịch ${booking.service?['name'] ?? 'dịch vụ'}',
            booking,
            NotificationType.newOrder,
          );

          _lastNotification =
              'Nhận đơn hàng mới từ ${booking.customer?['name'] ?? 'khách hàng'}';
          notifyListeners();
        }
      },
      onUpdated: (bookingData) {
        final booking = Booking.fromJson(bookingData);
        _updateBookingInLists(booking);

        // Show status update notification
        String statusText = _getStatusText(booking.status);
        _showEnhancedNotification(
          'Cập nhật đơn hàng',
          'Đơn hàng #${booking.id.substring(0, 8)} đã chuyển sang: $statusText',
          booking,
          NotificationType.statusUpdate,
        );

        _lastNotification = 'Đơn hàng cập nhật: $statusText';
        notifyListeners();
      },
      onLoyalty: (data) {
        if (data['newVip'] == true) {
          _showEnhancedNotification(
            '🎉 Khách hàng VIP mới!',
            'Khách hàng vừa trở thành VIP sau ${data['usageCount']} lần sử dụng dịch vụ',
            null,
            NotificationType.loyalty,
          );
          _lastNotification = 'Khách hàng mới trở thành VIP!';
          notifyListeners();
        }
      },
    );
  }

  void _updateBookingInLists(Booking booking) {
    // Remove from all lists first
    _pendingOrders.removeWhere((order) => order.id == booking.id);
    _activeOrders.removeWhere((order) => order.id == booking.id);
    _completedOrders.removeWhere((order) => order.id == booking.id);

    // Add to appropriate list
    switch (booking.status) {
      case 'pending':
        _pendingOrders.insert(0, booking);
        break;
      case 'confirmed':
        _activeOrders.insert(0, booking);
        break;
      case 'done':
        _completedOrders.insert(0, booking);
        break;
      case 'cancelled':
        // Don't add cancelled orders to any active list
        break;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'pending':
        return AppStrings.statusLabels['pending'];
      case 'confirmed':
        return AppStrings.statusLabels['confirmed'];
      case 'done':
        return AppStrings.statusLabels['done'];
      case 'cancelled':
        return AppStrings.statusLabels['cancelled'];
      default:
        return status;
    }
  }

  void _showEnhancedNotification(
    String title,
    String body,
    Booking? booking,
    NotificationType type,
  ) {
    _notificationService.showNotification(
      title: title,
      body: body,
      payload: booking?.id,
      type: type,
    );
  }

  Future<void> loadAllOrders() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      // Load all orders in parallel
      final results = await Future.wait([
        _repo.listMine(status: 'pending'),
        _repo.listMine(status: 'confirmed'),
        _repo.listMine(status: 'done'),
      ]);

      _pendingOrders = results[0];
      _activeOrders = results[1];
      _completedOrders = results[2];

      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    try {
      final updatedBooking = await _repo.updateStatus(orderId, newStatus);
      _updateBookingInLists(updatedBooking);

      // Show success notification
      String statusText = _getStatusText(newStatus);
      _showEnhancedNotification(
        'Cập nhật thành công',
        'Đã chuyển đơn hàng sang: $statusText',
        updatedBooking,
        NotificationType.success,
      );

      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _showEnhancedNotification(
        'Lỗi cập nhật',
        'Không thể cập nhật trạng thái đơn hàng: ${e.toString()}',
        null,
        NotificationType.error,
      );
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearLastNotification() {
    _lastNotification = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _socket.disconnect();
    super.dispose();
  }
}
