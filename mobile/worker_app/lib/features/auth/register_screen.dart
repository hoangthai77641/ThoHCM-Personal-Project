import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _address = TextEditingController();
  String _selectedRole = 'worker'; // 'worker' or 'driver'

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('Thợ HCM - Đăng ký')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  labelText: 'Họ tên',
                  hintText: 'Ví dụ: Nguyễn Văn A',
                ),
                validator: (v) => (v == null || v.isEmpty) ? 'Bắt buộc' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại',
                  hintText: 'Ví dụ: 0909 123 456',
                  helperText: 'Chỉ nhập số, độ dài từ 9-11 chữ số',
                ),
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Bắt buộc';
                  final digits = v.replaceAll(RegExp(r'\D'), '');
                  if (digits.length < 9 || digits.length > 11) {
                    return 'Số điện thoại không hợp lệ (9-11 số)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _password,
                decoration: const InputDecoration(
                  labelText: 'Mật khẩu',
                  helperText: 'Tối thiểu 6 ký tự, ví dụ: MatKhau123',
                ),
                obscureText: true,
                validator: (v) =>
                    (v == null || v.length < 6) ? 'Tối thiểu 6 ký tự' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _confirmPassword,
                decoration: const InputDecoration(
                  labelText: 'Nhập lại mật khẩu',

                ),
                obscureText: true,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Bắt buộc';
                  if (v != _password.text) return 'Mật khẩu không khớp';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _address,
                decoration: const InputDecoration(
                  labelText: 'Địa chỉ (tuỳ chọn)',
                  hintText: 'Ví dụ: 123 Lê Lợi, Quận 1, TP.HCM',
                ),
              ),
              const SizedBox(height: 20),
              // Role Selection
              const Text(
                'Loại tài khoản',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'worker',
                    label: Text('Thợ'),
                    icon: Icon(Icons.build),
                  ),
                  ButtonSegment(
                    value: 'driver',
                    label: Text('Tài xế'),
                    icon: Icon(Icons.local_shipping),
                  ),
                ],
                selected: {_selectedRole},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _selectedRole = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 8),
              Text(
                _selectedRole == 'worker'
                    ? 'Cung cấp dịch vụ sửa chữa điện lạnh, máy giặt, v.v.'
                    : 'Cung cấp dịch vụ vận chuyển hàng hóa',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 20, color: Colors.blue[700]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Tài khoản sẽ ở trạng thái chờ duyệt. CCCD/giấy tờ do quản trị viên cập nhật.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue[700],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: auth.loading
                      ? null
                      : () async {
                          if (!_formKey.currentState!.validate()) return;
                          final ok = await context
                              .read<AuthProvider>()
                              .register(
                                name: _name.text.trim(),
                                phone: _phone.text.trim(),
                                password: _password.text,
                                role: _selectedRole,
                                address: _address.text.trim().isEmpty
                                    ? null
                                    : _address.text.trim(),
                              );
                          if (!mounted) return;
                          if (ok) {
                            Navigator.of(context).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Đăng ký thành công, hãy đăng nhập',
                                ),
                              ),
                            );
                          } else {
                            final err =
                                context.read<AuthProvider>().error ??
                                'Lỗi không xác định';
                            ScaffoldMessenger.of(
                              context,
                            ).showSnackBar(SnackBar(content: Text(err)));
                          }
                        },
                  child: auth.loading
                      ? const CircularProgressIndicator()
                      : const Text('Đăng ký'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
