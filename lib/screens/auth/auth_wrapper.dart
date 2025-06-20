import 'package:flutter/material.dart';
import 'package:provider/provider.dart' as provider;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/screens/home_screen.dart';
import 'package:land_auction_app/screens/auth/login_screen.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = provider.Provider.of<AuthService>(context);
    
    return StreamBuilder<AuthState>(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        // Show loading indicator while waiting for auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // Show error if something went wrong
        if (snapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Text('Error: ${snapshot.error}'),
            ),
          );
        }

        // Check if user is authenticated
        final session = snapshot.data?.session;
        if (session != null) {
          return const HomeScreen();
        }

        // Show login screen if not authenticated
        return const LoginScreen();
      },
    );
  }
} 