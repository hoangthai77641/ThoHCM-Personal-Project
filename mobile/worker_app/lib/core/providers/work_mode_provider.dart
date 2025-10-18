import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class WorkModeProvider with ChangeNotifier {
  bool _isOnline = false;
  bool _isLoading = false;
  String? _errorMessage;

  bool get isOnline => _isOnline;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  WorkModeProvider() {
    _loadOnlineStatus();
    _initSocketListener();
  }

  void _initSocketListener() {
    SocketService.onWorkerStatusChanged((data) {
      print('📡 Received worker status change: $data');
      if (data['workerId'] != null) {
        // Update local status if it's for this worker
        _setOnlineStatus(data['isOnline'] ?? false, notify: true);
      }
    });
  }

  Future<void> _loadOnlineStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isOnline = prefs.getBool('isOnline') ?? false;
      notifyListeners();
    } catch (e) {
      print('Error loading online status: $e');
    }
  }

  Future<void> _saveOnlineStatus(bool status) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isOnline', status);
    } catch (e) {
      print('Error saving online status: $e');
    }
  }

  void _setOnlineStatus(bool status, {bool notify = true}) {
    _isOnline = status;
    _saveOnlineStatus(status);
    if (notify) {
      notifyListeners();
    }
  }

  Future<void> toggleOnlineStatus({bool? isOnline}) async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await ApiService.toggleOnlineStatus(isOnline: isOnline);

      if (result['success']) {
        final userData = result['data']['user'];
        final newStatus = userData['isOnline'] ?? false;

        _setOnlineStatus(newStatus);

        // Show success message
        _errorMessage = result['data']['message'];

        print('✅ Work mode ${newStatus ? 'enabled' : 'disabled'}');
      } else {
        _errorMessage = result['error'] ?? 'Không thể thay đổi trạng thái';
        print('❌ Failed to toggle work mode: $_errorMessage');
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối. Vui lòng thử lại.';
      print('💥 Error toggling work mode: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Get work mode status display text
  String get statusText {
    return _isOnline ? 'Đang làm việc' : 'Không làm việc';
  }

  // Get work mode status color
  Color get statusColor {
    return _isOnline ? Colors.green : Colors.grey;
  }

  // Get work mode icon
  IconData get statusIcon {
    return _isOnline ? Icons.work : Icons.work_off;
  }
}
