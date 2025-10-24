import 'package:flutter/foundation.dart';
import 'dart:async';
import '../bookings/bookings_repository.dart';
import '../bookings/booking_model.dart';
import '../bookings/booking_event_bus.dart';
import '../../core/socket_service.dart';

class ActiveOrdersProvider with ChangeNotifier {
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

  ActiveOrdersProvider() {
    // Auto-load confirmed orders when provider is created
    loadActiveOrders();
    // Setup socket connection for real-time updates
    _initSocket();
    // Listen to global booking events
    _listenToBookingEvents();
  }

  void _listenToBookingEvents() {
    // Listen to global booking updates from event bus
    _bookingUpdatedSubscription = _eventBus.onBookingUpdated.listen((booking) {
      print(
        '📱 ActiveOrdersProvider: Received booking update via event bus - ID: ${booking.id}, Status: ${booking.status}',
      );
      if (booking.status == 'confirmed') {
        // Add to active orders if not already present
        final existingIndex = _orders.indexWhere(
          (order) => order.id == booking.id,
        );
        if (existingIndex == -1) {
          _orders.insert(0, booking);
          notifyListeners();
        }
      } else {
        // Remove from active orders if status changed away from confirmed
        removeOrder(booking.id);
      }
    });

    // Listen to global refresh events
    _globalRefreshSubscription = _eventBus.onGlobalRefresh.listen((_) {
      print(
        '🔄 ActiveOrdersProvider: Received global refresh request, reloading...',
      );
      loadActiveOrders(); // Reload active orders
    });
  }

  void _initSocket() {
    _socket.addBookingUpdatedListener(_onSocketBookingUpdated);
  }

  void _onSocketBookingUpdated(Map<String, dynamic> bookingData) {
    final booking = Booking.fromJson(bookingData);
    if (booking.status == 'confirmed') {
      final existingIndex = _orders.indexWhere(
        (order) => order.id == booking.id,
      );
      if (existingIndex == -1) {
        _orders.insert(0, booking);
        notifyListeners();
      }
    } else {
      removeOrder(booking.id);
    }
  }

  Future<void> loadActiveOrders() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      // Load both confirmed (working on) orders
      _orders = await _repo.listMine(status: 'confirmed');
      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  // Manual refresh method to force reload active orders
  Future<void> refresh() async {
    await loadActiveOrders();
  }

  void addOrder(Booking booking) {
    if (booking.status == 'confirmed') {
      _orders.removeWhere((order) => order.id == booking.id);
      _orders.insert(0, booking);
      notifyListeners();
    }
  }

  void removeOrder(String orderId) {
    _orders.removeWhere((order) => order.id == orderId);
    notifyListeners();
  }

  @override
  void dispose() {
    _socket.removeBookingUpdatedListener(_onSocketBookingUpdated);
    _bookingUpdatedSubscription?.cancel();
    _globalRefreshSubscription?.cancel();
    super.dispose();
  }
}
