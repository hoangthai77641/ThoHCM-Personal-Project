import 'package:flutter/foundation.dart';
import 'worker_stats_repository.dart';
import '../../core/socket_service.dart';
import '../bookings/booking_event_bus.dart';

class WorkerStatsProvider extends ChangeNotifier {
  final _repo = WorkerStatsRepository();
  final _socket = SocketService();
  WorkerStats? stats;
  bool loading = false;
  String? error;
  String selectedTimeRange = 'today'; // 'today', 'week', 'month', 'all'

  Future<void> load() async {
    try {
      print('📊 WorkerStatsProvider: Loading stats for all ranges');
      loading = true;
      error = null;
      notifyListeners();
      // Load stats without timeRange parameter to get all data (today, month, total)
      stats = await _repo.fetch();
      print(
        '📊 WorkerStatsProvider: Stats loaded successfully - Today: ${stats?.incomeToday}, Month: ${stats?.incomeMonth}, Total: ${stats?.incomeTotal}',
      );
    } catch (e) {
      print('📊 WorkerStatsProvider: Error loading stats: $e');
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setTimeRange(String range) {
    if (selectedTimeRange != range) {
      selectedTimeRange = range;
      load();
    }
  }

  void initSocket() {
    print('📊 WorkerStatsProvider: Initializing socket listener');
    _socket.connect(
      onUpdated: (booking) {
        print(
          '📊 WorkerStatsProvider: Received booking update: ${booking['status']}',
        );
        // Refresh stats when booking status changes to 'done'
        if (booking['status'] == 'done') {
          print(
            '📊 WorkerStatsProvider: Booking completed, refreshing stats...',
          );
          load();
        }
      },
    );

    // Also listen to global booking event bus
    BookingEventBus().onBookingUpdated.listen((booking) {
      print(
        '📊 WorkerStatsProvider: Received global booking event: ${booking.status}',
      );
      if (booking.status == 'done') {
        print(
          '📊 WorkerStatsProvider: Booking completed via event bus, refreshing stats...',
        );
        load();
      }
    });
  }

  @override
  void dispose() {
    _socket.disconnect();
    super.dispose();
  }
}
