import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/app_theme.dart';
import 'core/api_client.dart';
import 'features/auth/auth_provider.dart';
import 'features/auth/login_screen.dart';
import 'features/bookings/bookings_provider.dart';
import 'features/home/home_shell.dart';
import 'features/home/worker_stats_provider.dart';
import 'features/home/service_rating_provider.dart';
import 'features/receive_orders/pending_orders_provider.dart';
import 'features/receive_orders/active_orders_provider.dart';
import 'features/receive_orders/completed_orders_provider.dart';
import 'features/notifications/notifications_provider.dart';
import 'core/providers/review_provider.dart';
import 'core/repositories/review_repository.dart';
import 'core/services/notification_service.dart';
import 'core/services/firebase_messaging_service.dart';
import 'core/providers/work_mode_provider.dart';
import 'core/providers/socket_provider.dart';
import 'features/wallet/wallet_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  await initializeDateFormatting('vi_VN');

  // Initialize notification service and request permissions
  await NotificationService().initialize();
  await NotificationService().requestPermissions();
  
  // Initialize Firebase Messaging Service
  await FirebaseMessagingService().initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(create: (_) => ApiClient()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => BookingsProvider()),
        ChangeNotifierProvider(create: (_) => WorkerStatsProvider()),
        ChangeNotifierProvider(create: (_) => ServiceRatingProvider()),
        ChangeNotifierProvider(create: (_) => PendingOrdersProvider()),
        ChangeNotifierProvider(create: (_) => ActiveOrdersProvider()),
        ChangeNotifierProvider(create: (_) => CompletedOrdersProvider()),
        ChangeNotifierProvider(create: (_) => NotificationsProvider()),
        ChangeNotifierProvider(create: (_) => WorkModeProvider()),
        ChangeNotifierProvider(
          create: (_) => ReviewProvider(ReviewRepository(ApiClient())),
        ),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
        ChangeNotifierProvider(create: (_) => SocketProvider()..initialize()),
      ],
      child: MaterialApp(
        title: 'Thợ HCM',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const _RootDecider(),
      ),
    );
  }
}

class _RootDecider extends StatefulWidget {
  const _RootDecider();

  @override
  State<_RootDecider> createState() => _RootDeciderState();
}

class _RootDeciderState extends State<_RootDecider> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final auth = context.read<AuthProvider>();
    final notificationsProvider = context.read<NotificationsProvider>();

    // Setup connection between AuthProvider and NotificationsProvider
    auth.setNotificationsProvider(notificationsProvider);

    final ok = await auth.tryRestoreSession();
    if (!mounted) return;
    if (ok) {
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const HomeShell()));
    } else {
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
