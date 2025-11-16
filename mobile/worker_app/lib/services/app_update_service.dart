import 'package:flutter/material.dart';
import 'package:firebase_app_distribution/firebase_app_distribution.dart';

/// Service kiểm tra và cập nhật app tự động
class AppUpdateService {
  static final FirebaseAppDistribution _appDistribution =
      FirebaseAppDistribution.instance;

  /// Kiểm tra update khi mở app
  static Future<void> checkForUpdate(BuildContext context) async {
    try {
      // Chỉ kiểm tra nếu không phải production
      if (const bool.fromEnvironment('dart.vm.product')) {
        return; // Skip trong production build
      }

      final result = await _appDistribution.checkForUpdate();

      if (result.hasUpdate) {
        if (context.mounted) {
          _showUpdateDialog(
            context,
            version: result.version ?? 'Mới',
            releaseNotes: result.releaseNotes ?? 'Cải thiện hiệu suất và sửa lỗi',
          );
        }
      }
    } catch (e) {
      debugPrint('Error checking for update: $e');
    }
  }

  /// Hiển thị dialog thông báo có bản cập nhật
  static void _showUpdateDialog(
    BuildContext context, {
    required String version,
    required String releaseNotes,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false, // Không cho dismiss
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.system_update, color: Colors.blue, size: 28),
            SizedBox(width: 12),
            Text('Có phiên bản mới!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Phiên bản $version đã sẵn sàng',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SizedBox(height: 12),
            Text(
              'Nội dung cập nhật:',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                releaseNotes,
                style: TextStyle(fontSize: 14),
              ),
            ),
            SizedBox(height: 12),
            Text(
              '⚡ Cập nhật ngay để trải nghiệm tính năng mới!',
              style: TextStyle(
                fontSize: 13,
                color: Colors.orange[700],
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Để sau'),
          ),
          ElevatedButton.icon(
            icon: Icon(Icons.download),
            label: Text('Cập nhật ngay'),
            onPressed: () async {
              Navigator.pop(context);
              await _downloadAndInstall(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  /// Download và cài đặt bản cập nhật
  static Future<void> _downloadAndInstall(BuildContext context) async {
    // Hiển thị loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Đang tải xuống bản cập nhật...'),
              SizedBox(height: 8),
              Text(
                'Vui lòng không thoát ứng dụng',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );

    try {
      // Tải và cài đặt
      await _appDistribution.updateApp();
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context); // Đóng loading dialog
        _showErrorDialog(context, e.toString());
      }
    }
  }

  /// Hiển thị lỗi khi update thất bại
  static void _showErrorDialog(BuildContext context, String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red),
            SizedBox(width: 8),
            Text('Lỗi cập nhật'),
          ],
        ),
        content: Text('Không thể tải bản cập nhật: $error'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Đóng'),
          ),
        ],
      ),
    );
  }

  /// Background check (gọi định kỳ)
  static Future<void> silentCheckForUpdate(BuildContext context) async {
    try {
      final result = await _appDistribution.checkForUpdate();
      
      if (result.hasUpdate && context.mounted) {
        // Hiển thí snackbar thay vì dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.system_update, color: Colors.white),
                SizedBox(width: 12),
                Expanded(
                  child: Text('Có phiên bản ${result.version} mới!'),
                ),
              ],
            ),
            action: SnackBarAction(
              label: 'Cập nhật',
              textColor: Colors.yellow,
              onPressed: () => checkForUpdate(context),
            ),
            duration: Duration(seconds: 5),
            backgroundColor: Colors.blue,
          ),
        );
      }
    } catch (e) {
      debugPrint('Silent update check failed: $e');
    }
  }
}
