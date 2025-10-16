import 'package:flutter/foundation.dart';
import 'dart:async';
import '../../core/socket_service.dart';
import 'bookings_repository.dart';
import 'booking_model.dart';
import 'booking_event_bus.dart';

class BookingsProvider with ChangeNotifier {
  final _repo = BookingsRepository();
  final _socket = SocketService();
  final _eventBus = BookingEventBus();
  StreamSubscription<Booking>? _bookingUpdatedSubscription;
  StreamSubscription<bool>? _globalRefreshSubscription;

  List<Booking> items = [];
  bool loading = false;
  String? error;
  List<String>? _activeStatuses;

  List<String>? get activeStatuses => _activeStatuses;

  BookingsProvider() {
    _listenToBookingEvents();
  }

  bool _statusMatchesFilters(String status) {
    if (_activeStatuses == null || _activeStatuses!.isEmpty) return true;
    final lowerStatus = status.toLowerCase();
    return _activeStatuses!.any((s) => s.toLowerCase() == lowerStatus);
  }

  void _applyFiltersToUpdatedBooking(Booking updated) {
    final idx = items.indexWhere((e) => e.id == updated.id);
    final matches = _statusMatchesFilters(updated.status);
    if (idx >= 0) {
      if (matches) {
        items[idx] = updated;
      } else {
        items.removeAt(idx);
      }
    } else if (matches) {
      items = [updated, ...items];
    }
    notifyListeners();
  }

  Future<void> load({String? status, List<String>? statuses}) async {
    loading = true;
    error = null;
    if (statuses != null && statuses.isNotEmpty) {
      _activeStatuses = statuses;
    } else if (status != null) {
      _activeStatuses = [status];
    } else {
      _activeStatuses = null;
    }
    notifyListeners();
    try {
      if (statuses != null && statuses.isNotEmpty) {
        // Load multiple statuses
        List<Booking> allItems = [];
        for (String s in statuses) {
          final statusItems = await _repo.listMine(status: s);
          allItems.addAll(statusItems);
        }
        // Sort by date descending
        allItems.sort((a, b) => b.date.compareTo(a.date));
        items = allItems;
      } else {
        items = await _repo.listMine(status: status);
      }
      loading = false;
      notifyListeners();
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
    }
  }

  Future<void> loadPendingOrders() async {
    await load(status: 'pending');
  }

  void _listenToBookingEvents() {
    // Listen to global booking updates from event bus
    _bookingUpdatedSubscription = _eventBus.onBookingUpdated.listen((booking) {
      print(
        '📱 BookingsProvider: Received booking update via event bus - ID: ${booking.id}, Status: ${booking.status}',
      );
      _applyFiltersToUpdatedBooking(booking);
    });

    // Listen to global refresh events
    _globalRefreshSubscription = _eventBus.onGlobalRefresh.listen((_) {
      print(
        '🔄 BookingsProvider: Received global refresh request, reloading with active filters...',
      );
      if (_activeStatuses != null && _activeStatuses!.isNotEmpty) {
        load(statuses: _activeStatuses);
      } else {
        load();
      }
    });
  }

  void initSocket() {
    _socket.connect(
      onCreated: (json) {
        final b = Booking.fromJson(json);
        if (_statusMatchesFilters(b.status)) {
          items = [b, ...items];
          notifyListeners();
        }
        // Emit to event bus for other providers
        _eventBus.emitBookingCreated(b);
      },
      onUpdated: (json) {
        final b = Booking.fromJson(json);
        // Emit to event bus first so ALL providers get notified
        _eventBus.emitBookingUpdated(b);
      },
    );
  }

  Future<Booking> updateStatus(String id, String status) async {
    final updated = await _repo.updateStatus(id, status);
    // Emit to event bus so ALL providers get updated
    _eventBus.emitBookingUpdated(updated);

    // If status changed to 'done', trigger global refresh for all providers
    if (status == 'done') {
      print('🔄 Status changed to "done", triggering global refresh...');
      _eventBus.emitGlobalRefresh(); // This will refresh ALL providers
    }

    onStatusChanged?.call();
    return updated;
  }

  Future<Booking> cancelBooking(String id) async {
    final updated = await _repo.cancelBooking(id);
    // Emit to event bus so ALL providers get updated
    _eventBus.emitBookingUpdated(updated);
    onStatusChanged?.call();
    return updated;
  }

  // Callback to refresh active orders count when status changes
  void Function()? onStatusChanged;

  @override
  void dispose() {
    _bookingUpdatedSubscription?.cancel();
    _globalRefreshSubscription?.cancel();
    super.dispose();
  }
}
