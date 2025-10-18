import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/work_mode_provider.dart';

class WorkModeToggle extends StatelessWidget {
  final bool showLabel;
  final MainAxisAlignment alignment;

  const WorkModeToggle({
    Key? key,
    this.showLabel = true,
    this.alignment = MainAxisAlignment.center,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<WorkModeProvider>(
      builder: (context, workMode, child) {
        return Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: alignment,
                children: [
                  Icon(
                    workMode.statusIcon,
                    color: workMode.statusColor,
                    size: 24,
                  ),
                  if (showLabel) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Work Mode',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            workMode.statusText,
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: workMode.statusColor,
                                  fontWeight: FontWeight.w500,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(width: 12),
                  workMode.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Switch.adaptive(
                          value: workMode.isOnline,
                          onChanged: workMode.isLoading
                              ? null
                              : (value) {
                                  workMode.toggleOnlineStatus(isOnline: value);
                                },
                          activeColor: Colors.green,
                          activeTrackColor: Colors.green.withOpacity(0.3),
                        ),
                ],
              ),

              // Error message
              if (workMode.errorMessage != null) ...[
                SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: workMode.errorMessage!.contains('successful')
                        ? Colors.green.withOpacity(0.1)
                        : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        workMode.errorMessage!.contains('successful')
                            ? Icons.check_circle
                            : Icons.error,
                        size: 16,
                        color: workMode.errorMessage!.contains('successful')
                            ? Colors.green
                            : Colors.red,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          workMode.errorMessage!,
                          style: TextStyle(
                            fontSize: 12,
                            color: workMode.errorMessage!.contains('successful')
                                ? Colors.green
                                : Colors.red,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: workMode.clearError,
                        icon: const Icon(Icons.close, size: 16),
                        constraints: const BoxConstraints(
                          minWidth: 24,
                          minHeight: 24,
                        ),
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                ),
              ],

              // Work mode info
              if (workMode.isOnline) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info, size: 16, color: Colors.green),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'You are in work mode and can receive new orders',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

// Simple toggle button without card wrapper
class WorkModeToggleButton extends StatelessWidget {
  const WorkModeToggleButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<WorkModeProvider>(
      builder: (context, workMode, child) {
        return InkWell(
          onTap: workMode.isLoading
              ? null
              : () {
                  workMode.toggleOnlineStatus();
                },
          borderRadius: BorderRadius.circular(25),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: workMode.isOnline
                  ? Colors.green.withOpacity(0.1)
                  : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(25),
              border: Border.all(
                color: workMode.isOnline ? Colors.green : Colors.grey,
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (workMode.isLoading)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else
                  Icon(
                    workMode.statusIcon,
                    size: 16,
                    color: workMode.statusColor,
                  ),
                const SizedBox(width: 8),
                Text(
                  workMode.statusText,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: workMode.statusColor,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
