import 'package:flutter/material.dart';
import '../core/socket_service.dart';

typedef BookingListener = void Function(Map<String, dynamic> bookingJson);

class SocketProvider with ChangeNotifier, WidgetsBindingObserver {
  final SocketService _socketService = SocketService();
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  void initialize() {
    WidgetsBinding.instance.addObserver(this);
  }

  void connect({
    BookingListener? onCreated,
    BookingListener? onUpdated,
    BookingListener? onLoyalty,
  }) {
    _socketService.connect(
      onCreated: onCreated,
      onUpdated: onUpdated,
      onLoyalty: onLoyalty,
    );
    _updateConnectionStatus();
  }

  void disconnect() {
    _socketService.disconnect();
    _isConnected = false;
    notifyListeners();
  }

  void _updateConnectionStatus() {
    _isConnected = _socketService.isConnected;
    notifyListeners();
  }

  void _reconnectIfNeeded() {
    if (!_socketService.isConnected) {
      print('🔄 App resumed, attempting to reconnect socket...');
      _socketService.reconnect();
      Future.delayed(const Duration(seconds: 1), () {
        _updateConnectionStatus();
      });
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    switch (state) {
      case AppLifecycleState.resumed:
        // App came to foreground, check and reconnect if needed
        _reconnectIfNeeded();
        break;
      case AppLifecycleState.paused:
        // App went to background
        print('📱 App paused');
        break;
      case AppLifecycleState.detached:
        // App is about to be terminated
        disconnect();
        break;
      case AppLifecycleState.inactive:
        // App is inactive (e.g., incoming phone call)
        break;
      case AppLifecycleState.hidden:
        // App is hidden
        break;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    disconnect();
    super.dispose();
  }
}