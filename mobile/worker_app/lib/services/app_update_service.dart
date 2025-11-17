import 'package:flutter/material.dart';

/// Service kiểm tra và cập nhật app tự động
/// Note: Firebase App Distribution đã bị vô hiệu hóa vì app được deploy qua Play Store
/// Play Store tự động quản lý updates cho người dùng
class AppUpdateService {
  /// Kiểm tra update khi mở app
  /// Returns immediately - Play Store handles automatic updates
  static Future<void> checkForUpdate(BuildContext context) async {
    // Play Store handles app updates automatically
    // No manual update check needed
    return;
  }

  /// Background check (gọi định kỳ)
  /// Returns immediately - Play Store handles automatic updates
  static Future<void> silentCheckForUpdate(BuildContext context) async {
    // Play Store handles app updates automatically
    // No manual update check needed
    return;
  }
}
