import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/widgets.dart';
import 'bookings_provider.dart';
import 'booking_model.dart';
import 'extend_work_time_dialog.dart';
import '../receive_orders/active_orders_provider.dart';
import '../home/worker_stats_provider.dart';
import '../../core/app_strings.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentTabIndex = 0;
  final Set<String> _expandedBookingIds = {};
  bool _isRefreshing = false;

  final List<List<String>> _statusFilters = [
    ['confirmed'], // Đang làm - chỉ những đơn đã được confirm
    ['done'], // Hoàn thành
    ['cancelled'], // Đã hủy
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);

    // Defer provider interactions to next frame to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prov = context.read<BookingsProvider>();
      prov.load(statuses: _statusFilters[0]); // Load "đang làm" first
      prov.initSocket();
      // Also refresh active orders count to ensure navigation badge is correct
      context.read<ActiveOrdersProvider>().refresh();
    });
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    if (_currentTabIndex != _tabController.index) {
      print('📋 Tab changed from $_currentTabIndex to ${_tabController.index}');
      setState(() {
        _currentTabIndex = _tabController.index;
      });
      final prov = context.read<BookingsProvider>();
      print(
        '📋 Loading tab ${_tabController.index} with filter: ${_statusFilters[_currentTabIndex]}',
      );
      prov.load(statuses: _statusFilters[_currentTabIndex]);
    }
  }

  Future<void> _refreshCurrentTab() async {
    if (_isRefreshing) return;
    setState(() {
      _isRefreshing = true;
    });

    final bookingsProv = context.read<BookingsProvider>();
    try {
      // Chờ một chút để tránh conflict với global refresh events
      await Future.delayed(const Duration(milliseconds: 100));
      await bookingsProv.load(statuses: _statusFilters[_currentTabIndex]);
      await context.read<ActiveOrdersProvider>().refresh();
    } finally {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<BookingsProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text('Đơn hàng'),
        actions: [
          IconButton(
            onPressed: _isRefreshing ? null : _refreshCurrentTab,
            icon: _isRefreshing
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Tải lại',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: false,
          labelPadding: const EdgeInsets.symmetric(
            horizontal: 16.0,
            vertical: 0.0,
          ),
          indicatorPadding: EdgeInsets.zero,
          indicatorWeight: 2,
          tabs: [
            const Tab(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.work_outline, size: 20),
                  SizedBox(height: 2),
                  Text(
                    'Đang làm',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            Tab(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_outline, size: 20),
                  SizedBox(height: 2),
                  Text(
                    AppStrings.statusLabels['done'] ?? 'Hoàn thành',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            Tab(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.cancel_outlined, size: 20),
                  SizedBox(height: 2),
                  Text(
                    AppStrings.statusLabels['cancelled'] ?? 'Đã hủy',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
          indicatorColor: Colors.blue,
          labelColor: Colors.blue,
          unselectedLabelColor: Colors.grey,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBookingsList(prov), // Đang làm
          _buildBookingsList(prov), // Hoàn thành
          _buildBookingsList(prov), // Đã hủy
        ],
      ),
    );
  }

  Widget _buildBookingsList(BookingsProvider prov) {
    if (prov.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (prov.items.isEmpty) {
      return const Center(
        child: Text(
          'Không tìm thấy đơn hàng nào',
          style: TextStyle(fontSize: 16),
        ),
      );
    }

    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return ListView.builder(
      padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPadding + 96),
      itemCount: prov.items.length,
      itemBuilder: (ctx, i) {
        final b = prov.items[i];
        final customerPhone = b.customer?['phone'] ?? '';
        final customerAddr = b.customer?['address'] ?? '';

        final bookingData = {
          'service': b.service,
          'customer': b.customer,
          'date': b.date.toIso8601String(),
          'address': customerAddr,
          'status': b.status,
          'note': b.note ?? '',
          'finalPrice': b.finalPrice,
        };

        final isExpanded = _expandedBookingIds.contains(b.id);

        return BookingCard(
          booking: bookingData,
          expanded: isExpanded,
          onToggle: () {
            setState(() {
              if (isExpanded) {
                _expandedBookingIds.remove(b.id);
              } else {
                _expandedBookingIds.add(b.id);
              }
            });
          },
          onLongPress: () => _showBookingDetails(context, b),
          trailing: PopupMenuButton<String>(
            onSelected: (s) async {
              if (s == '__details__') {
                _showBookingDetails(context, b);
                return;
              }
              if (s.startsWith('__copy_')) {
                // Handle copy actions
                return;
              }
              if (s == '__extend_time__') {
                _showExtendTimeDialog(context, b);
                return;
              }
              // Update booking status
              final activeOrders = context.read<ActiveOrdersProvider>();
              final updated = await prov.updateStatus(b.id, s);
              if (!mounted) return;
              if (updated.status == 'confirmed') {
                activeOrders.addOrder(updated);
              } else {
                activeOrders.removeOrder(updated.id);
              }

              // Refresh stats when booking is completed
              if (updated.status == 'done') {
                final statsProvider = context.read<WorkerStatsProvider>();
                statsProvider.load();

                // Auto switch to "Hoàn thành" tab (index 1)
                setState(() {
                  _currentTabIndex = 1;
                });
                _tabController.animateTo(1);

                // Wait for tab animation to complete, then force reload "Hoàn thành" tab
                Future.delayed(const Duration(milliseconds: 500), () async {
                  if (mounted) {
                    final bookingsProvider = context.read<BookingsProvider>();
                    print(
                      '🔄 Force reloading completed bookings after tab switch...',
                    );
                    await bookingsProvider.load(
                      statuses: _statusFilters[1],
                    ); // Load "done" status
                  }
                });

                // Show success message after a frame to ensure tab switch completes
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Đã hoàn thành đơn hàng thành công!'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 2),
                      ),
                    );
                  }
                });
              }
            },
            itemBuilder: (_) => [
              PopupMenuItem(
                value: '__details__',
                child: Text('Xem chi tiết'),
              ),
              // Hiển thị action phù hợp với trạng thái cụ thể của booking
              if (b.status == 'pending') // Chờ xác nhận
              ...[
                const PopupMenuItem(
                  value: 'confirmed',
                  child: Text('Xác nhận'),
                ),
                PopupMenuItem(value: 'cancelled', child: Text(AppStrings.cancel)),
              ] else if (b.status == 'confirmed') // Đã xác nhận
              ...[
                PopupMenuItem(value: 'done', child: Text(AppStrings.statusLabels['done'] ?? 'Hoàn thành')),
                const PopupMenuItem(
                  value: '__extend_time__',
                  child: Text('Gia hạn thời gian'),
                ),
                PopupMenuItem(value: 'cancelled', child: Text(AppStrings.cancel)),
              ],
              // Không có action cho booking đã done hoặc cancelled
              if (customerPhone.isNotEmpty)
                PopupMenuItem(
                  value: '__copy_phone__',
                  onTap: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    await Clipboard.setData(ClipboardData(text: customerPhone));
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text('Đã sao chép số điện thoại'),
                      ),
                    );
                  },
                  child: const Text('Sao chép SĐT'),
                ),
              if (customerAddr.isNotEmpty)
                PopupMenuItem(
                  value: '__copy_addr__',
                  onTap: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    await Clipboard.setData(ClipboardData(text: customerAddr));
                    messenger.showSnackBar(
                      const SnackBar(content: Text('Đã sao chép địa chỉ')),
                    );
                  },
                  child: const Text('Sao chép địa chỉ'),
                ),
            ],
          ),
        );
      },
    );
  }

  void _showBookingDetails(BuildContext context, Booking booking) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(booking.service?['name'] ?? 'Chi tiết đơn hàng'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('Khách hàng', booking.customer?['name'] ?? ''),
              _buildDetailRow('Điện thoại', booking.customer?['phone'] ?? ''),
              _buildDetailRow('Địa chỉ', booking.customer?['address'] ?? ''),
              _buildDetailRow('Ngày giờ', _formatDateTime(booking.date)),
              _buildDetailRow('Trạng thái', _getStatusText(booking.status)),
              if (booking.finalPrice != null)
                _buildDetailRow(
                  'Giá',
                  '${_formatPrice(booking.finalPrice!)} ₫',
                ),
              if (booking.note?.isNotEmpty == true)
                _buildDetailRow('Ghi chú', booking.note!),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(AppStrings.close),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  void _showExtendTimeDialog(BuildContext context, Booking booking) {
    // Tính thời gian kết thúc hiện tại (preferredTime + 1 giờ + additionalHours)
    final currentEndTime = booking.date.add(
      Duration(hours: 1 + booking.additionalHours),
    );

    showDialog(
      context: context,
      builder: (dialogContext) => ExtendWorkTimeDialog(
        bookingId: booking.id,
        currentEndTime: currentEndTime,
      ),
    ).then((result) {
      if (result == true && mounted) {
        // Refresh bookings sau khi gia hạn thành công
        final prov = this.context.read<BookingsProvider>();
        prov.load(statuses: _statusFilters[_currentTabIndex]);
      }
    });
  }

  String _formatDateTime(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} '
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return AppStrings.statusLabels['pending'] ?? 'Đang chờ';
      case 'confirmed':
        return AppStrings.statusLabels['confirmed'] ?? 'Đã xác nhận';
      case 'done':
        return AppStrings.statusLabels['done'] ?? 'Hoàn thành';
      case 'cancelled':
        return AppStrings.statusLabels['cancelled'] ?? 'Đã hủy';
      default:
        return status;
    }
  }

  String _formatPrice(num price) {
    return price.toInt().toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }
}
