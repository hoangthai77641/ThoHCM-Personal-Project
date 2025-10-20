import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../../core/env.dart';
import '../home/worker_stats_provider.dart';
import '../home/service_rating_provider.dart';
import '../services/services_repository.dart';
import '../services/services_screen.dart';
import '../widgets/banner_slider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _name;
  late TextEditingController _phone;
  late TextEditingController _address;
  final _currentPass = TextEditingController();
  String? _initialPhone;
  final ServicesRepository _servicesRepository = ServicesRepository();
  bool _servicesLoading = false;
  String? _servicesError;
  List<Map<String, dynamic>> _servicesPreview = const [];
  bool _showServices = false; // Ẩn dịch vụ default

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _name = TextEditingController(text: user?['name'] ?? '');
    _phone = TextEditingController(text: user?['phone'] ?? '');
    _address = TextEditingController(text: user?['address'] ?? '');
    _initialPhone = user?['phone'] as String?;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        context.read<WorkerStatsProvider>().load();
      } catch (_) {}
      try {
        context.read<ServiceRatingProvider>().loadServices();
      } catch (_) {}
      _loadServicesPreview();
    });
  }

  Future<void> _loadServicesPreview() async {
    if (!mounted) return;
    setState(() {
      _servicesLoading = true;
      _servicesError = null;
    });

    try {
      final services = await _servicesRepository.list(mine: true);
      if (!mounted) return;
      setState(() {
        _servicesPreview = List<Map<String, dynamic>>.from(services.take(3));
        _servicesLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _servicesError = e.toString();
        _servicesLoading = false;
      });
    }
  }

  num? _parseNum(dynamic value) {
    if (value == null) return null;
    if (value is num) return value;
    if (value is String) {
      final sanitized = value.trim();
      if (sanitized.isEmpty) return null;
      final cleaned = sanitized.replaceAll(RegExp(r'[^0-9,.-]'), '');
      final normalized = cleaned.contains(',') && !cleaned.contains('.')
          ? cleaned.replaceAll(',', '.')
          : cleaned.replaceAll(',', '');
      return num.tryParse(normalized);
    }
    return null;
  }

  bool _parseBool(dynamic value, {bool fallback = true}) {
    if (value == null) return fallback;
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final normalized = value.trim().toLowerCase();
      if (normalized.isEmpty) return fallback;
      if (['true', '1', 'yes', 'active'].contains(normalized)) return true;
      if (['false', '0', 'no', 'inactive'].contains(normalized)) return false;
    }
    return fallback;
  }

  String _formatCurrency(dynamic value) {
    final numValue = _parseNum(value) ?? 0;
    final formatted = numValue.toInt().toString().replaceAllMapped(
      RegExp(r"(\d)(?=(\d{3})+(?!\d))"),
      (match) => '${match[1]}.',
    );
    return '$formatted đ';
  }

  Widget _buildServicePreviewCard(
    BuildContext context,
    Map<String, dynamic> service,
  ) {
    final theme = Theme.of(context);
    final isActive = _parseBool(service['isActive']);
    final ratingValue = _parseNum(service['averageRating']);
    final reviewCountValue = _parseNum(service['reviewCount'])?.toInt() ?? 0;

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.35),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  service['name'] ?? 'Dịch vụ',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: isActive
                      ? Colors.green.withOpacity(0.15)
                      : Colors.orange.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isActive ? 'Đang hoạt động' : 'Tạm dừng',
                  style: TextStyle(
                    fontSize: 12,
                    color: isActive ? Colors.green[700] : Colors.orange[700],
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _formatCurrency(service['basePrice']),
            style: theme.textTheme.titleMedium?.copyWith(
              color: Colors.green[600],
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.star, size: 18, color: Colors.amber[600]),
              const SizedBox(width: 4),
              Text(
                ratingValue == null
                    ? 'Chưa có đánh giá'
                    : '${ratingValue.toStringAsFixed(1)} • $reviewCountValue đánh giá',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServicesSection(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _showServices = !_showServices;
                      });
                      if (_showServices && _servicesPreview.isEmpty) {
                        _loadServicesPreview();
                      }
                    },
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Dịch vụ của tôi',
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Icon(
                          _showServices ? Icons.expand_less : Icons.expand_more,
                          color: Theme.of(context).primaryColor,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _showServices
                        ? 'Xem nhanh các dịch vụ đang cung cấp và cập nhật khi cần.'
                        : 'Nhấn để xem các dịch vụ đang cung cấp.',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            TextButton.icon(
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ServicesScreen()),
                );
                if (mounted) {
                  _loadServicesPreview();
                }
              },
              icon: Icon(Icons.manage_history),
              label: Text('Quản lý'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_showServices) ...[
          if (_servicesLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: LinearProgressIndicator(),
            )
          else if (_servicesError != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Lỗi tải dịch vụ: $_servicesError',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: _loadServicesPreview,
                    child: Text('Retry'),
                  ),
                ],
              ),
            )
          else if (_servicesPreview.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.surfaceVariant.withOpacity(0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bạn chưa có dịch vụ nào',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Nhấn "Quản lý" để thêm dịch vụ đầu tiên và bắt đầu nhận đơn dễ dàng hơn.',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            )
          else
            Column(
              children: _servicesPreview
                  .map((service) => _buildServicePreviewCard(context, service))
                  .toList(),
            ),
        ],
      ],
    );
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _currentPass.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final payload = <String, dynamic>{'address': _address.text.trim()};

    final trimmedPhone = _phone.text.trim();
    if (trimmedPhone.isNotEmpty) {
      payload['phone'] = trimmedPhone;
    }

    // If phone changed but current password empty, prompt validation
    final phoneChanged = (_initialPhone ?? '') != _phone.text.trim();
    if (phoneChanged && _currentPass.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đổi số điện thoại cần nhập Mật khẩu hiện tại'),
        ),
      );
      return;
    }
    if (_currentPass.text.isNotEmpty) {
      payload['currentPassword'] = _currentPass.text;
    }
    final ok = await auth.updateProfile(payload);
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật hồ sơ thành công')),
      );
    } else if (auth.error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi: ${auth.error}')));
    }
  }

  Widget _buildIncomeCard(
    BuildContext context,
    String label,
    int amount, {
    Color? color,
    IconData? icon,
    bool isCurrency = true,
    String? suffix,
  }) {
    final cs = Theme.of(context).colorScheme;
    final formattedNumber = amount.toString().replaceAllMapped(
      RegExp(r"(\d)(?=(\d{3})+(?!\d))"),
      (m) => '${m[1]}.',
    );
    final valueText = isCurrency
        ? '$formattedNumber đ'
        : '$formattedNumber${suffix ?? ''}';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color ?? cs.primaryContainer,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, 4),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(icon ?? Icons.payments, color: cs.onPrimaryContainer),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: cs.onPrimaryContainer.withOpacity(0.85),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  valueText,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: cs.onPrimaryContainer,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewSection(BuildContext context) {
    final stats = context.watch<WorkerStatsProvider>();
    final textTheme = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Banner & Khuyến mãi',
          style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        const BannerSlider(),
        const SizedBox(height: 16),
        if (stats.loading) const LinearProgressIndicator(),
        if (stats.error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              'Lỗi: ${stats.error}',
              style: TextStyle(color: cs.error),
            ),
          ),
        const SizedBox(height: 8),
        Text(
          'Thống kê thu nhập',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        Column(
          children: [
            _buildIncomeCard(
              context,
              'Hôm nay',
              stats.stats?.incomeToday ?? 0,
              color: cs.primaryContainer,
              icon: Icons.today,
            ),
            const SizedBox(height: 12),
            _buildIncomeCard(
              context,
              'Tháng này',
              stats.stats?.incomeMonth ?? 0,
              color: cs.secondaryContainer,
              icon: Icons.calendar_month,
            ),
            const SizedBox(height: 12),
            _buildIncomeCard(
              context,
              'Tổng cộng',
              stats.stats?.incomeTotal ?? 0,
              color: cs.tertiaryContainer,
              icon: Icons.savings,
            ),
            const SizedBox(height: 12),
            _buildIncomeCard(
              context,
              'Dịch vụ đang hoạt động',
              stats.stats?.servicesActive ?? 0,
              color: cs.primaryContainer.withOpacity(0.85),
              icon: Icons.build_circle,
              isCurrency: false,
              suffix: ' dịch vụ',
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    // Debug: print user data to see if avatar is included
    if (user != null) {
      print('User data: ${user.toString()}');
      print('Has avatar: ${user['avatar'] != null}');
      if (user['avatar'] != null) {
        print('Avatar path: ${user['avatar']}');
      }
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hồ sơ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () async {
              final auth = context.read<AuthProvider>();
              await auth.tryRestoreSession();
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              // Avatar Section
              Center(
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.grey[200],
                            border: Border.all(
                              color: Theme.of(context).primaryColor,
                              width: 3,
                            ),
                          ),
                          child: ClipOval(
                            child: user?['avatar'] != null
                                ? Image.network(
                                    _getAvatarUrl(user!['avatar']),
                                    fit: BoxFit.cover,
                                    loadingBuilder: (context, child, loadingProgress) {
                                      if (loadingProgress == null) {
                                        print(
                                          '✅ Avatar loaded successfully: ${_getAvatarUrl(user['avatar'])}',
                                        );
                                        return child;
                                      }
                                      print(
                                        '⏳ Loading avatar: ${loadingProgress.cumulativeBytesLoaded}/${loadingProgress.expectedTotalBytes}',
                                      );
                                      return const CircularProgressIndicator();
                                    },
                                    errorBuilder: (context, error, stackTrace) {
                                      print('❌ Error loading avatar: $error');
                                      print(
                                        '🔗 Avatar URL: ${Env.apiBase}${user['avatar']}',
                                      );
                                      print('📊 Stack trace: $stackTrace');
                                      return const Icon(
                                        Icons.person,
                                        size: 60,
                                        color: Colors.grey,
                                      );
                                    },
                                  )
                                : Icon(
                                    Icons.person,
                                    size: 60,
                                    color: Colors.grey,
                                  ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      user?['name'] ?? '',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Ảnh đại diện sẽ được quản trị viên Thợ HCM cập nhật giúp bạn.',
                      textAlign: TextAlign.center,
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _buildOverviewSection(context),
              const SizedBox(height: 24),
              _buildServicesSection(context),
              const SizedBox(height: 24),
              Text(
                'Thông tin cá nhân',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _name,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Tên',
                  helperText: 'Liên hệ quản trị viên để cập nhật họ tên.',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                decoration: const InputDecoration(labelText: 'Số điện thoại'),
                keyboardType: TextInputType.phone,
                validator: (v) => (v == null || v.isEmpty) ? 'Bắt buộc' : null,
              ),
              const SizedBox(height: 4),
              const Text(
                'Lưu ý: Đổi số điện thoại sẽ yêu cầu nhập Mật khẩu hiện tại',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _address,
                decoration: const InputDecoration(labelText: 'Địa chỉ'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _currentPass,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Mật khẩu hiện tại',
                  helperText:
                      'Bắt buộc khi đổi số điện thoại. Để trống nếu không đổi.',
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: auth.loading ? null : _save,
                      icon: const Icon(Icons.save),
                      label: auth.loading
                          ? const Text('Đang lưu...')
                          : Text('Save'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.logout),
                      label: const Text('Đăng xuất'),
                      onPressed: () async {
                        await auth.logout();
                        if (context.mounted) {
                          Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(
                              builder: (_) => const LoginScreen(),
                            ),
                            (route) => false,
                          );
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Get the correct avatar URL, handling both relative and absolute paths
  String _getAvatarUrl(String? avatarPath) {
    if (avatarPath == null || avatarPath.isEmpty) {
      return '';
    }
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    
    // If it's a relative path, prepend the API base URL
    return '${Env.apiBase}$avatarPath';
  }
}
