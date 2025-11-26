import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:in_app_update/in_app_update.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../core/api_client.dart';

/// Enhanced Play Store In‑App Update integration with Backend API
class AppUpdateService {
  static const String _appType = 'worker';

  /// Kiểm tra version từ backend và hiển thị dialog
  static Future<void> checkForUpdateFromBackend(BuildContext context) async {
    try {
      final apiClient = ApiClient();
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      final response = await apiClient.get(
        '/api/app-version/check?appType=$_appType&currentVersion=$currentVersion',
      );

      if (response['success'] == true) {
        final data = response['data'];
        final needsUpdate = data['needsUpdate'] ?? false;
        final forceUpdate = data['forceUpdate'] ?? false;

        if (needsUpdate && context.mounted) {
          _showUpdateDialog(
            context,
            latestVersion: data['latestVersion'] ?? '',
            message: data['updateMessage'] ?? 'Có phiên bản mới!',
            features: List<String>.from(data['features'] ?? []),
            updateUrl: data['updateUrl'] ?? '',
            forceUpdate: forceUpdate,
          );
        }
      }
    } catch (e) {
      print('Error checking update from backend: $e');
      // Fallback to Play Store check
      if (context.mounted) {
        await silentCheckForUpdate(context);
      }
    }
  }

  /// Hiển thị dialog cập nhật với UI đẹp
  static void _showUpdateDialog(
    BuildContext context, {
    required String latestVersion,
    required String message,
    required List<String> features,
    required String updateUrl,
    required bool forceUpdate,
  }) {
    showDialog(
      context: context,
      barrierDismissible: !forceUpdate,
      builder: (context) => WillPopScope(
        onWillPop: () async => !forceUpdate,
        child: AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.system_update,
                  color: Colors.blue.shade700,
                  size: 32,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      forceUpdate ? 'Cập nhật bắt buộc' : 'Cập nhật mới',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Phiên bản $latestVersion',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message,
                  style: const TextStyle(fontSize: 16),
                ),
                if (features.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    '✨ Tính năng mới:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...features.map(
                    (feature) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(fontSize: 16)),
                          Expanded(child: Text(feature)),
                        ],
                      ),
                    ),
                  ),
                ],
                if (forceUpdate) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning, color: Colors.orange.shade700),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Bạn cần cập nhật để tiếp tục sử dụng ứng dụng',
                            style: TextStyle(fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            if (!forceUpdate)
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Để sau'),
              ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                if (Platform.isAndroid) {
                  // Try Play Store in-app update first
                  checkForUpdate(context);
                } else {
                  // iOS or fallback - open browser
                  _openUpdateUrl(updateUrl);
                }
              },
              icon: const Icon(Icons.download),
              label: const Text('Cập nhật ngay'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Mở URL cập nhật (Play Store/App Store)
  static Future<void> _openUpdateUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  /// Check for updates and prompt user (Flexible update)
  static Future<void> checkForUpdate(BuildContext context) async {
    if (!Platform.isAndroid) return; // In‑app update only on Android

    try {
      final info = await InAppUpdate.checkForUpdate();
      if (info.updateAvailability == UpdateAvailability.updateAvailable) {
        // Prefer flexible update for a smoother UX in internal testing
        await InAppUpdate.startFlexibleUpdate();
        if (!context.mounted) return;

        await InAppUpdate.completeFlexibleUpdate();
        if (!context.mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ứng dụng đã được cập nhật. Khởi động lại để áp dụng.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Non‑fatal: just log visually for testers
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể kiểm tra cập nhật: $e')),
        );
      }
    }
  }

  /// Silent background check that shows a small prompt if available
  static Future<void> silentCheckForUpdate(BuildContext context) async {
    if (!Platform.isAndroid) return;
    try {
      final info = await InAppUpdate.checkForUpdate();
      if (info.updateAvailability == UpdateAvailability.updateAvailable &&
          context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Có bản cập nhật mới từ Play Store.'),
            action: SnackBarAction(
              label: 'Cập nhật',
              onPressed: () => checkForUpdate(context),
            ),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (_) {/* ignore */}
  }
}
