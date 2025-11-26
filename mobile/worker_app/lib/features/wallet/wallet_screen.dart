import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'wallet_provider.dart';
import 'qr_deposit_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().fetchWallet();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Wallet'),
        actions: [
          IconButton(
            onPressed: () {
              context.read<WalletProvider>().fetchWallet();
            },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Consumer<WalletProvider>(
        builder: (context, walletProvider, child) {
          if (walletProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (walletProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    walletProvider.error!,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      walletProvider.clearError();
                      walletProvider.fetchWallet();
                    },
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => walletProvider.fetchWallet(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildWalletCard(context, walletProvider),
                  const SizedBox(height: 24),
                  _buildActionButtons(context, walletProvider),
                  const SizedBox(height: 24),
                  _buildTransactionHistory(context, walletProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildWalletCard(BuildContext context, WalletProvider walletProvider) {
    final colorScheme = Theme.of(context).colorScheme;
    final isNegative = walletProvider.isNegative;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isNegative
              ? [Colors.red.shade400, Colors.red.shade600]
              : [colorScheme.primary, colorScheme.primaryContainer],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isNegative ? Icons.warning : Icons.account_balance_wallet,
                color: Colors.white,
                size: 32,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  isNegative
                      ? 'Số dư âm - Cần nạp ví'
                      : 'Wallet Balance',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            walletProvider.formatCurrency(walletProvider.balance),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Deposited',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    Text(
                      walletProvider.formatCurrency(
                        walletProvider.totalDeposited,
                      ),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Fees Paid',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    Text(
                      walletProvider.formatCurrency(
                        walletProvider.totalDeducted,
                      ),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    WalletProvider walletProvider,
  ) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _showTopUpDialog(context, walletProvider),
            icon: Icon(Icons.add),
            label: Text('Nạp ví'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _showFeeInfoDialog(context, walletProvider),
            icon: const Icon(Icons.info_outline),
            label: const Text('Phí nền tảng'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionHistory(
    BuildContext context,
    WalletProvider walletProvider,
  ) {
    if (walletProvider.transactions.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text('Chưa có giao dịch nào'),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Lịch sử giao dịch',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: walletProvider.transactions.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final transaction = walletProvider.transactions[index];
            return _buildTransactionItem(context, transaction, walletProvider);
          },
        ),
      ],
    );
  }

  Widget _buildTransactionItem(
    BuildContext context,
    Map<String, dynamic> transaction,
    WalletProvider walletProvider,
  ) {
    final isDeposit = (transaction['type']?.toString() ?? '') == 'deposit';
    final amount = (transaction['amount'] is num)
        ? transaction['amount'].toDouble()
        : double.tryParse(transaction['amount']?.toString() ?? '0') ?? 0.0;
    final description = transaction['description']?.toString() ?? '';
    final date =
        DateTime.tryParse(transaction['createdAt']?.toString() ?? '') ??
        DateTime.now();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: (isDeposit ? Colors.green : Colors.red).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isDeposit ? Icons.arrow_downward : Icons.arrow_upward,
              color: isDeposit ? Colors.green : Colors.red,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  description,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 4),
                Text(
                  '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isDeposit ? '+' : '-'}${walletProvider.formatCurrency(amount)}',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: isDeposit ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  void _showTopUpDialog(BuildContext context, WalletProvider walletProvider) {
    final amountController = TextEditingController();
    String selectedMethod = 'manual_qr';
    // Store the parent context (WalletScreen context) before opening dialog
    final parentContext = context;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setState) => AlertDialog(
          title: const Text('Nạp tiền vào ví'),
          content: SizedBox(
            width: double.maxFinite,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: InputDecoration(
                    labelText: 'Số tiền (VND)',
                    hintText:
                        'Từ ${walletProvider.formatCurrency(walletProvider.minTopup)} đến ${walletProvider.formatCurrency(walletProvider.maxTopup)}',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                // Chỉ hỗ trợ QR Banking
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.qr_code, color: Colors.green.shade700),
                      const SizedBox(width: 12),
                      const Text(
                        '🔥 QR Banking',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amountText = amountController.text;
                if (amountText.isEmpty) return;

                final amount = double.tryParse(amountText);
                if (amount == null) return;

                Navigator.pop(dialogContext);

                print(
                  '🚀 Creating deposit request with amount: $amount, method: $selectedMethod',
                );
                final success = await walletProvider.createDepositRequest(
                  amount: amount,
                  paymentMethod: selectedMethod,
                );

                print('💳 Deposit creation result: $success');
                print(
                  '📦 Last deposit response: ${walletProvider.lastDepositResponse}',
                );

                if (success && parentContext.mounted) {
                  print('✅ Success and context mounted - navigating to QR screen...');
                  // Chỉ hỗ trợ QR Banking
                  try {
                    // Navigate to QR deposit screen
                    Navigator.push(
                      parentContext,
                      MaterialPageRoute(
                        builder: (context) => QRDepositScreen(
                          depositResponse:
                              walletProvider.lastDepositResponse!,
                        ),
                      ),
                    );
                    print('✅ Navigation successful');
                  } catch (e) {
                    print('❌ Navigation error: $e');
                  }
                } else {
                  print('❌ Navigation blocked - success: $success');
                }
              },
              child: const Text('Tạo yêu cầu nạp tiền'),
            ),
          ],
        ),
      ),
    );
  }

  void _showFeeInfoDialog(BuildContext context, WalletProvider walletProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Phí nền tảng'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Phí nền tảng: ${walletProvider.feePercentage}%'),
            const SizedBox(height: 8),
            const Text(
              'Phí này được trừ tự động từ ví của bạn mỗi khi hoàn thành đơn hàng.',
            ),
            const SizedBox(height: 16),
            const Text(
              '⚠️ Lưu ý: Nếu ví của bạn bị âm, dịch vụ sẽ bị ẩn khỏi ứng dụng khách hàng cho đến khi bạn nạp tiền.',
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }
}
