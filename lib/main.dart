import 'package:flutter/material.dart';
import 'package:provider/provider.dart' as provider;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:land_auction_app/providers/auction_provider.dart';
import 'package:land_auction_app/providers/filter_provider.dart';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/screens/auth/login_screen.dart';
import 'package:land_auction_app/screens/home_screen.dart';
import 'package:land_auction_app/screens/my_bids_screen.dart';
import 'package:land_auction_app/screens/profile_screen.dart';
import 'package:land_auction_app/theme/app_theme.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:land_auction_app/services/lifecycle_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize date formatting for Turkish locale
  await initializeDateFormatting('tr_TR', null);
  
  // Load environment variables
  try {
    await dotenv.load();
  } catch (e) {
    debugPrint('Error loading .env file: $e');
  }
  
  // Initialize Supabase with either .env values or defaults
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL'] ?? 'https://ptlniuvpajtcmghkpjdn.supabase.co',
    anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bG5pdXZwYWp0Y21naGtwamRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjkyOTMsImV4cCI6MjA1ODYwNTI5M30.gyjWHTG0zeWk1M03zW8JLKMuRt_iJMZlxb0NKddOcI0',
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  
  @override
  Widget build(BuildContext context) {
    final supabase = Supabase.instance.client;
    
    return provider.MultiProvider(
      providers: [
        provider.Provider<LifecycleService>(
          create: (_) => LifecycleService(),
          dispose: (_, service) => service.dispose(),
        ),
        provider.Provider(
          create: (context) {
            final lifecycleService = provider.Provider.of<LifecycleService>(context, listen: false);
            final authService = AuthService(supabase);
            // Connect lifecycle service with auth service
            authService.setLifecycleService(lifecycleService);
            return authService;
          },
        ),
        provider.ChangeNotifierProvider(
          create: (context) {
            final lifecycleService = provider.Provider.of<LifecycleService>(context, listen: false);
            return AuctionProvider(supabase, lifecycleService);
          },
        ),
        provider.ChangeNotifierProvider(
          create: (context) => FilterProvider(),
        ),
      ],
      child: MaterialApp(
        title: 'Arazi İhale Uygulaması',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        initialRoute: '/login',
        routes: {
          '/': (ctx) => const HomeScreen(),
          '/login': (ctx) => const LoginScreen(),
          '/my-bids': (ctx) => const MyBidsScreen(),
          '/profile': (ctx) => const ProfileScreen(),
        },
      ),
    );
  }
} 