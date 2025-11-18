import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:in_app_update/in_app_update.dart';

/// Play Store In‑App Update integration
class AppUpdateService {
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
          const SnackBar(content: Text('Ứng dụng đã được cập nhật. Khởi động lại để áp dụng.')),
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
      if (info.updateAvailability == UpdateAvailability.updateAvailable && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Có bản cập nhật mới.'),
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
