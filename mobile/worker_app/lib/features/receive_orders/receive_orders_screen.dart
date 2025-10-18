import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../bookings/bookings_provider.dart';
import '../bookings/booking_model.dart';
import 'active_orders_provider.dart';
import 'pending_orders_provider.dart';
import '../../core/widgets/work_mode_toggle.dart';

class ReceiveOrdersScreen extends StatefulWidget {
  const ReceiveOrdersScreen({super.key});

  @override
  State<ReceiveOrdersScreen> createState() => _ReceiveOrdersScreenState();
}

class _ReceiveOrdersScreenState extends State<ReceiveOrdersScreen> {
  final Set<String> _expandedOrderIds = {};
  final Set<String> _processingOrderIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Load only pending orders (orders waiting for worker confirmation)
      context.read<PendingOrdersProvider>().loadPendingOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<PendingOrdersProvider>();
    final bookingsProv = context.watch<BookingsProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhận đơn'),
        actions: [
          const WorkModeToggleButton(),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => prov.loadPendingOrders(),
          ),
        ],
      ),
      body: prov.loading
          ? const Center(child: CircularProgressIndicator())
          : prov.error != null
          ? _buildErrorState(prov.error!)
          : prov.orders.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              itemCount: prov.orders.length,
              itemBuilder: (ctx, i) {
                final booking = prov.orders[i];
                return _buildOrderCard(booking, bookingsProv);
              },
            ),
    );
  }

  Widget _buildErrorState(String error) {
    final isAuthError =
        error.contains('Phiên đăng nhập đã hết hạn') ||
        error.contains('401') ||
        error.contains('Unauthorized');

    return Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isAuthError ? Icons.lock_outline : Icons.error_outline,
              size: 64,
              color: isAuthError ? Colors.orange : Colors.red,
            ),
            SizedBox(height: 16),
            Text(
              isAuthError ? 'Phiên đăng nhập hết hạn' : 'An error occurred',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: const TextStyle(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                if (isAuthError) {
                  // Navigate to login screen
                  Navigator.of(context).pushReplacementNamed('/auth');
                } else {
                  // Retry loading
                  context.read<PendingOrdersProvider>().loadPendingOrders();
                }
              },
              child: Text(isAuthError ? 'Đăng nhập lại' : 'Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'Không có đơn hàng mới',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          Text(
            'Các đơn hàng mới sẽ xuất hiện ở đây',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  void _toggleOrderDetails(String orderId) {
    setState(() {
      if (_expandedOrderIds.contains(orderId)) {
        _expandedOrderIds.remove(orderId);
      } else {
        _expandedOrderIds.add(orderId);
      }
    });
  }

  Widget _buildOrderCard(Booking booking, BookingsProvider prov) {
    final customerName = booking.customer?['name'] ?? 'Khách hàng';
    final customerPhone = booking.customer?['phone'] ?? '';
    final customerAddress = booking.customer?['address'] ?? '';
    final serviceName = booking.service?['name'] ?? 'Dịch vụ';
    final servicePrice =
        booking.finalPrice?.toString() ??
        booking.service?['basePrice']?.toString() ??
        '0';

    const double buttonHeight = 56;
    final bool isExpanded = _expandedOrderIds.contains(booking.id);
    final bool isProcessing = _processingOrderIds.contains(booking.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header with time
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF1E88E5),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Text(
              _formatDateTime(booking.date),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Service status badge
                // ...removed 'New Order' badge...
                const SizedBox(height: 16),

                // Route info
                Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFFFF6B35),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 2,
                          height: 20,
                          color: Colors.grey[300],
                        ),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFF6B35),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            customerName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            serviceName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Price
                    Text(
                      '₫${_formatPrice(servicePrice)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Toggle button and details
                TextButton.icon(
                  onPressed: () => _toggleOrderDetails(booking.id),
                  icon: Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                  ),
                  label: Text(
                    isExpanded ? 'Thu gọn thông tin' : 'Chi tiết đơn hàng',
                  ),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    alignment: Alignment.centerLeft,
                  ),
                ),

                AnimatedCrossFade(
                  firstChild: const SizedBox.shrink(),
                  secondChild: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(height: 24),
                      _buildInfoRow(Icons.person, 'Khách hàng', customerName),
                      if (customerPhone.isNotEmpty)
                        _buildInfoRow(Icons.phone, 'Điện thoại', customerPhone),
                      _buildInfoRow(
                        Icons.location_on,
                        'Địa chỉ',
                        customerAddress,
                      ),
                      _buildInfoRow(
                        Icons.schedule,
                        'Thời gian',
                        _formatDateTime(booking.date),
                      ),
                      if (booking.note?.isNotEmpty == true) ...[
                        const SizedBox(height: 8),
                        _buildInfoRow(Icons.note, 'Ghi chú', booking.note!),
                      ],
                      const SizedBox(height: 16),
                    ],
                  ),
                  crossFadeState: isExpanded
                      ? CrossFadeState.showSecond
                      : CrossFadeState.showFirst,
                  duration: const Duration(milliseconds: 200),
                ),

                // Action buttons
                Row(
                  children: [
                    // Always show call button, styled as blue round icon
                    SizedBox(
                      width: 48,
                      height: 48,
                      child: _buildCallButton(
                        customerPhone.isNotEmpty ? customerPhone : '0000000000',
                        height: 48,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: SizedBox(
                        height: buttonHeight,
                        child: ElevatedButton.icon(
                          onPressed: isProcessing
                              ? null
                              : () => _confirmOrder(booking, prov),
                          icon: isProcessing
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : const Icon(Icons.check, size: 18),
                          label: Text(
                            isProcessing ? 'Đang xử lý...' : 'Nhận đơn',
                          ),
                          style: ElevatedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.grey[700],
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w400),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallButton(String phoneNumber, {double height = 56}) {
    return InkWell(
      onTap: phoneNumber != '0000000000'
          ? () => _makePhoneCall(phoneNumber)
          : null,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: height,
        height: height,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF2E7FFB), Color(0xFF53C6FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.blue.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Center(
          child: Icon(Icons.phone, color: Colors.white, size: 20),
        ),
      ),
    );
  }

  String _formatDateTime(DateTime date) {
    final now = DateTime.now();
    final localDate = date.toLocal(); // Ensure local timezone
    final today = DateTime(now.year, now.month, now.day);
    final bookingDay = DateTime(localDate.year, localDate.month, localDate.day);

    // Debug print
    print('📅 Debug DateTime - Original: $date, Local: $localDate, Now: $now');

    if (bookingDay.isAtSameMomentAs(today)) {
      return 'Hôm nay, ${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}';
    } else if (bookingDay.isAtSameMomentAs(
      today.add(const Duration(days: 1)),
    )) {
      return 'Ngày mai, ${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}';
    } else {
      return '${localDate.day}/${localDate.month}/${localDate.year} ${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}';
    }
  }

  String _formatPrice(String price) {
    try {
      final numPrice = int.parse(price.replaceAll(RegExp(r'[^\d]'), ''));
      return numPrice.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (Match m) => '${m[1]}.',
      );
    } catch (e) {
      return price;
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final uri = Uri(scheme: 'tel', path: phoneNumber);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Không thể thực hiện cuộc gọi')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi khi thực hiện cuộc gọi')),
        );
      }
    }
  }

  Future<void> _confirmOrder(
    Booking booking,
    BookingsProvider bookingsProvider,
  ) async {
    final pendingOrdersProvider = context.read<PendingOrdersProvider>();
    final activeOrdersProvider = context.read<ActiveOrdersProvider>();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Xác nhận nhận đơn'),
        content: Text(
          'Bạn có chắc chắn muốn nhận đơn "${booking.service?['name'] ?? 'này'}"?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (mounted) {
        setState(() {
          _processingOrderIds.add(booking.id);
        });
      }

      try {
        await bookingsProvider.updateStatus(booking.id, 'confirmed');
        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã nhận đơn thành công!'),
            backgroundColor: Colors.green,
          ),
        );

        pendingOrdersProvider.removeOrder(booking.id);

        final confirmedBooking = booking.copyWith(status: 'confirmed');
        activeOrdersProvider.addOrder(confirmedBooking);

        await Future.wait([
          activeOrdersProvider.refresh(),
          pendingOrdersProvider.loadPendingOrders(),
        ]);

        bookingsProvider.load(statuses: ['confirmed']);
      } catch (e) {
        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        if (mounted) {
          setState(() {
            _processingOrderIds.remove(booking.id);
          });
        }
      }
    }
  }
}
