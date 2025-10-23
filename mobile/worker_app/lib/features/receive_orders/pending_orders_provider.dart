import 'package:flutter/foundation.dart';
import 'dart:async';
import '../bookings/bookings_repository.dart';
import '../bookings/booking_model.dart';
import '../bookings/booking_event_bus.dart';
import '../../core/socket_service.dart';

class PendingOrdersProvider with ChangeNotifier {
  final _repo = BookingsRepository();
  final _socket = SocketService();
  final _eventBus = BookingEventBus();
  StreamSubscription<Booking>? _bookingUpdatedSubscription;
  StreamSubscription<bool>? _globalRefreshSubscription;

  List<Booking> _orders = [];
  bool _loading = false;
  String? _error;

  List<Booking> get orders => _orders;
  bool get loading => _loading;
  String? get error => _error;
  int get count => _orders.length;

  PendingOrdersProvider() {
    // Auto-load pending orders when provider is created
    loadPendingOrders();
    // Setup socket connection for real-time updates
    _initSocket();
    // Listen to global booking events
    _listenToBookingEvents();
  }

  void _listenToBookingEvents() {
    // Listen to global booking updates from event bus
    _bookingUpdatedSubscription = _eventBus.onBookingUpdated.listen((booking) {
      print(
        '📱 PendingOrdersProvider: Received booking update via event bus - ID: ${booking.id}, Status: ${booking.status}',
      );
      if (booking.status != 'pending') {
        removeOrder(booking.id);
      }
    });

    // Listen to global refresh events
    _globalRefreshSubscription = _eventBus.onGlobalRefresh.listen((_) {
      print(
        '🔄 PendingOrdersProvider: Received global refresh request, reloading...',
      );
      loadPendingOrders(); // Reload pending orders
    });
  }

  void _initSocket() {
    // Register listeners on the shared SocketService singleton
    _socket.addBookingCreatedListener(_onSocketBookingCreated);
    _socket.addBookingUpdatedListener(_onSocketBookingUpdated);
  }

  void _onSocketBookingCreated(Map<String, dynamic> bookingData) {
    final booking = Booking.fromJson(bookingData);
    if (booking.status == 'pending') {
      _orders.insert(0, booking);
      notifyListeners();
    }
  }

  void _onSocketBookingUpdated(Map<String, dynamic> bookingData) {
    final booking = Booking.fromJson(bookingData);
    if (booking.status != 'pending') {
      removeOrder(booking.id);
    }
  }

  Future<void> loadPendingOrders() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _orders = await _repo.listMine(status: 'pending');
      _loading = false;
      notifyListeners();
    } catch (e) {
      print('❌ Error loading pending orders: $e');
      _error = e.toString();
      _loading = false;
      notifyListeners();

      // If authentication error (401), handle token expiration
      if (e.toString().contains('401') ||
          e.toString().contains('Unauthorized') ||
          e.toString().contains('Token expired') ||
          e.toString().contains('Invalid token')) {
        print('🔐 Authentication error detected, need to re-login');
        // You can emit an event or use a global error handler here
        // For now, just set a specific error message
        _error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        notifyListeners();
      }
    }
  }

  void removeOrder(String orderId) {
    _orders.removeWhere((order) => order.id == orderId);
    notifyListeners();
  }

  @override
  void dispose() {
    // Remove listeners but do not disconnect shared socket (used by other providers)
    _socket.removeBookingCreatedListener(_onSocketBookingCreated);
    _socket.removeBookingUpdatedListener(_onSocketBookingUpdated);
    _bookingUpdatedSubscription?.cancel();
    _globalRefreshSubscription?.cancel();
    super.dispose();
  }
}
