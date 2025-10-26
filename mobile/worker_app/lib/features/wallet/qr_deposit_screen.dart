import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import 'wallet_provider.dart';

class QRDepositScreen extends StatefulWidget {
  final Map<String, dynamic> depositResponse;

  const QRDepositScreen({
    super.key,
    required this.depositResponse,
  });

  @override
  State<QRDepositScreen> createState() => _QRDepositScreenState();
}

class _QRDepositScreenState extends State<QRDepositScreen> {
  File? _proofImage;
  bool _isUploading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  Widget build(BuildContext context) {
    // Debug: Print the entire response structure
    print('🔍 QRDepositScreen - depositResponse keys: ${widget.depositResponse.keys}');
    print('🔍 QRDepositScreen - full depositResponse: ${widget.depositResponse}');
    
    final paymentInfo = widget.depositResponse['paymentInfo'] as Map<String, dynamic>?;
    final transaction = widget.depositResponse['transaction'] as Map<String, dynamic>?;
    final transactionId = transaction?['_id'] as String?;
    
    print('🔍 QRDepositScreen - paymentInfo: $paymentInfo');
    print('🔍 QRDepositScreen - transaction: $transaction');
    
    // Get bankInfo and QR data from the correct structure
    final bankInfo = paymentInfo?['bankInfo'] as Map<String, dynamic>?;
    // Try both locations for QR data
    final qrData = paymentInfo?['qrCode'] as String? ?? bankInfo?['qrCode'] as String?;
    final amount = (transaction?['amount'] ?? 0).toDouble();
    
    print('🔍 QRDepositScreen - bankInfo: $bankInfo');
    print('🔍 QRDepositScreen - qrData found: ${qrData != null ? "YES" : "NO"}');
    print('🔍 QRDepositScreen - amount: $amount');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nạp tiền QR'),
        backgroundColor: Colors.green.shade600,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Step indicator
            _buildStepIndicator(),
            const SizedBox(height: 24),

            // QR Code Section
            _buildQRSection(qrData, amount),
            const SizedBox(height: 24),

            // Bank Info Section  
            _buildBankInfoSection(bankInfo),
            const SizedBox(height: 24),

            // Instructions
            _buildInstructionsSection(),
            const SizedBox(height: 24),

            // Proof Upload Section
            _buildProofUploadSection(),
            const SizedBox(height: 24),

            // Status tracking
            _buildStatusSection(transactionId),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        children: [
          _buildStep(1, 'Quét QR', true),
          const Expanded(child: Divider()),
          _buildStep(2, 'Chuyển khoản', false),
          const Expanded(child: Divider()),
          _buildStep(3, 'Upload ảnh', false),
          const Expanded(child: Divider()),
          _buildStep(4, 'Chờ duyệt', false),
        ],
      ),
    );
  }

  Widget _buildStep(int stepNumber, String title, bool isActive) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? Colors.green : Colors.grey.shade300,
          ),
          child: Center(
            child: Text(
              stepNumber.toString(),
              style: TextStyle(
                color: isActive ? Colors.white : Colors.grey.shade600,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            fontSize: 12,
            color: isActive ? Colors.green : Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildQRSection(String? qrData, double amount) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.qr_code, color: Colors.green.shade600, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Mã QR Chuyển khoản',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (qrData != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.shade300,
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Image.memory(
                  base64Decode(qrData.split(',')[1]),
                  width: 200,
                  height: 200,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Số tiền: ${_formatCurrency(amount)}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.green.shade700,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '📱 Quét mã QR này bằng app ngân hàng của bạn',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ] else ...[
              const Icon(Icons.error, color: Colors.red, size: 48),
              const SizedBox(height: 8),
              const Text(
                'Không thể tạo mã QR. Vui lòng chuyển khoản thủ công.',
                style: TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBankInfoSection(Map<String, dynamic>? bankInfo) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.account_balance, color: Colors.blue.shade600, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Thông tin chuyển khoản',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
              'Ngân hàng:',
              bankInfo?['bankName'] ?? 'Vietcombank',
              Icons.business,
            ),
            _buildInfoRow(
              'Số tài khoản:',
              bankInfo?['accountNumber'] ?? '1234567890',
              Icons.credit_card,
              copyable: true,
            ),
            _buildInfoRow(
              'Tên tài khoản:',
              bankInfo?['accountName'] ?? 'CONG TY THO HCM',
              Icons.person,
            ),
            _buildInfoRow(
              'Nội dung CK:',
              bankInfo?['transferContent'] ?? 'THOHCM NAP VI',
              Icons.message,
              copyable: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, {bool copyable = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            flex: 3,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                if (copyable)
                  IconButton(
                    icon: const Icon(Icons.copy, size: 16),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: value));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã copy!')),
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionsSection() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.help_outline, color: Colors.orange.shade600, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Hướng dẫn chuyển khoản',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildInstructionStep('1', 'Mở app ngân hàng trên điện thoại'),
            _buildInstructionStep('2', 'Chọn "Chuyển khoản QR" hoặc "Quét mã QR"'),
            _buildInstructionStep('3', 'Quét mã QR ở trên hoặc nhập thông tin thủ công'),
            _buildInstructionStep('4', 'Kiểm tra thông tin và xác nhận chuyển khoản'),
            _buildInstructionStep('5', 'Chụp ảnh màn hình kết quả và upload bên dưới'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber, color: Colors.amber),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Lưu ý: Vui lòng chuyển khoản chính xác số tiền và nội dung để được xử lý nhanh chóng.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionStep(String step, String instruction) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.orange.shade100,
            ),
            child: Center(
              child: Text(
                step,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.orange.shade800,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              instruction,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProofUploadSection() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.upload_file, color: Colors.purple.shade600, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Upload ảnh chuyển khoản',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            if (_proofImage == null) ...[
              DottedBorder(
                borderType: BorderType.RRect,
                radius: const Radius.circular(12),
                dashPattern: const [8, 4],
                color: Colors.grey.shade400,
                strokeWidth: 2,
                child: Container(
                  width: double.infinity,
                  height: 120,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.cloud_upload,
                        size: 48,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Chụp ảnh màn hình kết quả chuyển khoản',
                        style: TextStyle(color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _pickImage(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Chụp ảnh'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickImage(ImageSource.gallery),
                      icon: const Icon(Icons.photo_library),
                      label: const Text('Từ thư viện'),
                    ),
                  ),
                ],
              ),
            ] else ...[
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(
                    _proofImage!,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() => _proofImage = null),
                      icon: const Icon(Icons.delete),
                      label: const Text('Xóa ảnh'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isUploading ? null : _uploadProof,
                      icon: _isUploading 
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                      label: Text(_isUploading ? 'Đang gửi...' : 'Gửi ảnh'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusSection(String? transactionId) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline, color: Colors.blue.shade600, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Trạng thái giao dịch',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.schedule, color: Colors.orange.shade600, size: 16),
                      const SizedBox(width: 8),
                      const Text(
                        'Đang chờ xử lý',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Mã giao dịch: ${transactionId ?? 'N/A'}'),
                  const SizedBox(height: 4),
                  const Text(
                    'Admin sẽ xác nhận và cộng tiền vào ví trong vòng 24h.',
                    style: TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1920,
        imageQuality: 85,
      );
      
      if (image != null) {
        setState(() {
          _proofImage = File(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi chọn ảnh: $e')),
      );
    }
  }

  Future<void> _uploadProof() async {
    if (_proofImage == null) return;

    setState(() => _isUploading = true);

    try {
      final success = await context.read<WalletProvider>().uploadProofOfPayment(
        widget.depositResponse['transactionId'] as String,
        _proofImage!,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Đã gửi ảnh thành công! Vui lòng chờ admin xác nhận.'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Lỗi gửi ảnh: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} VNĐ';
  }
}

// Custom dotted border widget (simple implementation)
class DottedBorder extends StatelessWidget {
  final Widget child;
  final Color color;
  final double strokeWidth;
  final List<double> dashPattern;
  final BorderType borderType;
  final Radius radius;

  const DottedBorder({
    Key? key,
    required this.child,
    this.color = Colors.grey,
    this.strokeWidth = 1,
    this.dashPattern = const [5, 5],
    this.borderType = BorderType.Rect,
    this.radius = Radius.zero,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: color, width: strokeWidth),
        borderRadius: borderType == BorderType.RRect 
          ? BorderRadius.all(radius) 
          : null,
      ),
      child: child,
    );
  }
}

enum BorderType { Rect, RRect }