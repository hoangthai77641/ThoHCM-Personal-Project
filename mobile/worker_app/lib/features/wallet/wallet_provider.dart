import 'package:flutter/foundation.dart';
import 'dart:io';
import '../../core/api_client.dart';

class WalletProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  Map<String, dynamic>? _walletData;
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  Map<String, dynamic>? get walletData => _walletData;
  List<Map<String, dynamic>> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get balance {
    try {
      final walletBalance = _walletData?['wallet']?['balance'];
      if (walletBalance is num) return walletBalance.toDouble();
      if (walletBalance is String) return double.tryParse(walletBalance) ?? 0.0;
      return 0.0;
    } catch (e) {
      print('Error parsing balance: $e');
      return 0.0;
    }
  }

  double get totalDeposited {
    try {
      final deposited = _walletData?['wallet']?['totalDeposited'];
      if (deposited is num) return deposited.toDouble();
      if (deposited is String) return double.tryParse(deposited) ?? 0.0;
      return 0.0;
    } catch (e) {
      print('Error parsing totalDeposited: $e');
      return 0.0;
    }
  }

  double get totalDeducted {
    try {
      final deducted = _walletData?['wallet']?['totalDeducted'];
      if (deducted is num) return deducted.toDouble();
      if (deducted is String) return double.tryParse(deducted) ?? 0.0;
      return 0.0;
    } catch (e) {
      print('Error parsing totalDeducted: $e');
      return 0.0;
    }
  }

  bool get isNegative {
    try {
      final negative = _walletData?['wallet']?['isNegative'];
      if (negative is bool) return negative;
      if (negative is String) return negative.toLowerCase() == 'true';
      return balance < 0;
    } catch (e) {
      print('Error parsing isNegative: $e');
      return balance < 0;
    }
  }

  // Platform fee configuration
  double get feePercentage {
    try {
      final fee = _walletData?['platformFee']?['feePercentage'];
      if (fee is num) return fee.toDouble();
      if (fee is String) return double.tryParse(fee) ?? 20.0;
      return 20.0;
    } catch (e) {
      print('Error parsing feePercentage: $e');
      return 20.0;
    }
  }

  double get minTopup {
    try {
      final min = _walletData?['platformFee']?['minTopup'];
      if (min is num) return min.toDouble();
      if (min is String) return double.tryParse(min) ?? 100000.0;
      return 100000.0;
    } catch (e) {
      print('Error parsing minTopup: $e');
      return 100000.0;
    }
  }

  double get maxTopup {
    try {
      final max = _walletData?['platformFee']?['maxTopup'];
      if (max is num) return max.toDouble();
      if (max is String) return double.tryParse(max) ?? 1000000.0;
      return 1000000.0;
    } catch (e) {
      print('Error parsing maxTopup: $e');
      return 1000000.0;
    }
  }

  Map<String, dynamic> get bankAccount {
    try {
      final account = _walletData?['platformFee']?['bankAccount'];
      if (account is Map<String, dynamic>) return account;
      return {
        'bankName': 'Vietcombank',
        'accountNumber': '0441000765886',
        'accountName': 'CTY TNHH THỢ HCM',
      };
    } catch (e) {
      print('Error parsing bankAccount: $e');
      return {
        'bankName': 'Vietcombank',
        'accountNumber': '0441000765886',
        'accountName': 'CTY TNHH THỢ HCM',
      };
    }
  }

  Future<void> fetchWallet() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('🔄 Fetching wallet data...');
      final response = await _apiClient.get('/api/wallet');
      print('📡 Wallet API response: $response');

      if (response['success'] == true) {
        _walletData = Map<String, dynamic>.from(response['data'] ?? {});
        print('💰 Wallet data parsed: $_walletData');

        // Safely parse transactions
        final transactionsData = response['data']?['transactions'];
        print('📋 Transactions data type: ${transactionsData.runtimeType}');
        print('📋 Transactions data: $transactionsData');

        if (transactionsData is List) {
          _transactions = transactionsData
              .where((item) => item is Map<String, dynamic>)
              .cast<Map<String, dynamic>>()
              .toList();
          print('✅ Parsed ${_transactions.length} transactions');
        } else {
          _transactions = [];
          print('⚠️ No transactions found or invalid format');
        }
        _error = null;
      } else {
        final errorMsg =
            response['message']?.toString() ?? 'Lỗi không xác định';
        _error = errorMsg;
        print('❌ Wallet API error: $errorMsg');
      }
    } catch (e, stackTrace) {
      _error = 'Lỗi kết nối: ${e.toString()}';
      print('❌ Wallet fetch error: $e');
      print('📍 Stack trace: $stackTrace');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Map<String, dynamic>? _lastDepositResponse;
  Map<String, dynamic>? get lastDepositResponse => _lastDepositResponse;

  Future<bool> createDepositRequest({
    required double amount,
    required String paymentMethod,
  }) async {
    print('💳 Creating deposit request: amount=$amount, method=$paymentMethod');
    
    if (amount < minTopup || amount > maxTopup) {
      _error =
          'Số tiền nạp phải từ ${_formatCurrency(minTopup)} đến ${_formatCurrency(maxTopup)}';
      print('❌ Amount validation failed: $amount not in range [$minTopup, $maxTopup]');
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('🌐 Calling deposit API...');
      final response = await _apiClient.post('/api/wallet/deposit', {
        'amount': amount,
        'paymentMethod': paymentMethod,
      });

      print('📡 Deposit API response: $response');

      if (response['success']) {
        _lastDepositResponse = response['data'];
        print('✅ Deposit response saved: $_lastDepositResponse');
        
        // Refresh wallet data after creating deposit request
        print('🔄 Refreshing wallet data after deposit creation...');
        await fetchWallet();
        
        print('💳 Deposit request created successfully');
        return true;
      } else {
        _error = response['message'] ?? 'Không thể tạo yêu cầu nạp tiền';
        print('❌ Deposit API error: $_error');
        return false;
      }
    } catch (e) {
      _error = 'Lỗi kết nối: ${e.toString()}';
      print('❌ Deposit request error: $_error');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String _formatCurrency(double amount) {
    try {
      final amountStr = amount.toInt().toString();
      // Simple thousand separator formatting
      final reversed = amountStr.split('').reversed.toList();
      final formatted = <String>[];

      for (int i = 0; i < reversed.length; i++) {
        if (i > 0 && i % 3 == 0) {
          formatted.add('.');
        }
        formatted.add(reversed[i]);
      }

      return '${formatted.reversed.join('')} ₫';
    } catch (e) {
      // Fallback to simple formatting if anything fails
      return '${amount.toInt().toString()} ₫';
    }
  }

  String formatCurrency(double amount) => _formatCurrency(amount);

  Future<bool> uploadProofOfPayment(String transactionId, File proofImage) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await _apiClient.uploadFile(
        '/api/wallet/upload-proof',
        proofImage,
        fieldName: 'proofImage',
        additionalFields: {'transactionId': transactionId},
      );

      if (success) {
        // Refresh wallet data after upload
        await fetchWallet();
        return true;
      } else {
        _error = 'Không thể upload ảnh chuyển khoản';
        return false;
      }
    } catch (e) {
      _error = 'Lỗi upload: ${e.toString()}';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
