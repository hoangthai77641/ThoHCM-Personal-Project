import 'dart:async';
import 'booking_model.dart';

/// Global event bus for booking updates
/// Ensures all providers are notified when bookings are updated
class BookingEventBus {
  static BookingEventBus? _instance;

  factory BookingEventBus() {
    return _instance ??= BookingEventBus._internal();
  }

  BookingEventBus._internal();

  final _bookingUpdatedController = StreamController<Booking>.broadcast();
  final _bookingCreatedController = StreamController<Booking>.broadcast();
  final _globalRefreshController = StreamController<bool>.broadcast();

  /// Stream for booking updates (status changes, etc.)
  Stream<Booking> get onBookingUpdated => _bookingUpdatedController.stream;

  /// Stream for new bookings created
  Stream<Booking> get onBookingCreated => _bookingCreatedController.stream;

  /// Stream for global refresh events (when all providers should reload)
  Stream<bool> get onGlobalRefresh => _globalRefreshController.stream;

  /// Emit when a booking is updated
  void emitBookingUpdated(Booking booking) {
    print(
      '📡 BookingEventBus: Booking updated - ID: ${booking.id}, Status: ${booking.status}',
    );
    _bookingUpdatedController.add(booking);
  }

  /// Emit when a new booking is created
  void emitBookingCreated(Booking booking) {
    print(
      '📡 BookingEventBus: New booking created - ID: ${booking.id}, Status: ${booking.status}',
    );
    _bookingCreatedController.add(booking);
  }

  /// Emit global refresh event (all providers should reload their data)
  void emitGlobalRefresh() {
    print('🔄 BookingEventBus: Global refresh requested');
    _globalRefreshController.add(true);
  }

  /// Dispose all stream controllers
  void dispose() {
    _bookingUpdatedController.close();
    _bookingCreatedController.close();
    _globalRefreshController.close();
    _instance = null;
  }
}
