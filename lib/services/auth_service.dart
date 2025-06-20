import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'package:land_auction_app/models/app_lifecycle_event.dart';
import 'package:land_auction_app/services/lifecycle_service.dart';
import 'package:land_auction_app/models/profile.dart';
import 'dart:io';

class AuthService {
  final SupabaseClient _supabase;
  StreamSubscription<AppLifecycleEvent>? _lifecycleSubscription;
  DateTime? _lastSessionCheck;
  LifecycleService? _lifecycleService;
  
  AuthService(this._supabase);
  
  User? get currentUser => _supabase.auth.currentUser;
  
  bool get isAuthenticated => currentUser != null;
  
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
  
  // Set the lifecycle service - should be called after creation
  void setLifecycleService(LifecycleService service) {
    _lifecycleService = service;
    _setupLifecycleListener();
  }
  
  // Setup lifecycle listener for auth session refreshing
  void _setupLifecycleListener() {
    if (_lifecycleService == null) return;
    
    _lifecycleSubscription = _lifecycleService!.lifecycleEvents.listen((event) async {
      if (event.type == AppLifecycleEventType.resumed) {
        final now = DateTime.now();
        final lastCheck = _lastSessionCheck ?? DateTime(1970);
        
        // Only refresh session if it's been more than 2 minutes since last check
        if (now.difference(lastCheck).inMinutes > 2) {
          debugPrint('Auth service: refreshing session after app resume');
          try {
            await _refreshSession();
          } catch (e) {
            debugPrint('Error refreshing session on resume: $e');
            
            // If refreshing failed, try to recover
            try {
              // First check if we still have a valid session
              final session = _supabase.auth.currentSession;
              if (session == null) {
                debugPrint('Session lost, attempting to recover from local storage');
                // Try to restore from persistent storage
                await _supabase.auth.refreshSession();
              }
            } catch (recoveryError) {
              debugPrint('Recovery failed: $recoveryError');
            }
          }
        }
      }
    });
  }
  
  // Private method to refresh the auth session
  Future<void> _refreshSession() async {
    try {
      // Set a timeout to prevent hanging
      await _supabase.auth.refreshSession().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          debugPrint('Session refresh timed out');
          throw TimeoutException('Session refresh timed out');
        },
      );
      
      _lastSessionCheck = DateTime.now();
      debugPrint('Auth session refreshed successfully');
    } catch (e) {
      debugPrint('Error refreshing auth session: $e');
      // Don't rethrow, just log - we want this to be non-blocking
    }
  }
  
  // Phone authentication methods
  
  // Send OTP to provided phone number
  Future<Map<String, dynamic>> sendOTP(String phoneNumber) async {
    try {
      // Format phone number if needed (ensure it has international format)
      if (phoneNumber.startsWith('5') && phoneNumber.length == 10) {
        phoneNumber = '90$phoneNumber'; // Add Turkey country code
      }
      
      // Call the Supabase Edge Function to send OTP
      final response = await _supabase.functions.invoke('send-otp', 
        body: {'phoneNumber': phoneNumber},
      );
      
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
  
  // Verify OTP and create/sign in user
  Future<AuthResponse> verifyOTP({
    required String phoneNumber, 
    required String otp,
    required String password,
  }) async {
    try {
      // Format phone number if needed
      if (phoneNumber.startsWith('5') && phoneNumber.length == 10) {
        phoneNumber = '90$phoneNumber'; // Add Turkey country code
      }
      
      // Call the Supabase Edge Function to verify OTP and create/sign in user
      final response = await _supabase.functions.invoke('verify-otp',
        body: {
          'phoneNumber': phoneNumber,
          'otp': otp,
          'password': password,
        },
      );
      
      // After successful verification, we should have a session
      // Force refresh the session
      await refreshSessionManually();
      
      // Return a proper AuthResponse with the session
      return AuthResponse(
        session: _supabase.auth.currentSession,
        user: _supabase.auth.currentUser,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    return await _supabase.auth.signUp(
      email: email,
      password: password,
    );
  }
  
  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
    _lastSessionCheck = DateTime.now();
    return response;
  }
  
  Future<void> signOut() async {
    await _supabase.auth.signOut();
    _lastSessionCheck = null;
  }
  
  Future<void> resetPassword(String email) async {
    await _supabase.auth.resetPasswordForEmail(email);
  }
  
  Future<void> updatePassword(String newPassword) async {
    await _supabase.auth.updateUser(
      UserAttributes(password: newPassword),
    );
    _lastSessionCheck = DateTime.now();
  }

  // Get user profile
  Future<Profile?> getUserProfile() async {
    if (currentUser == null) return null;
    
    try {
      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', currentUser!.id)
          .single();
      
      if (response != null) {
        return Profile.fromJson(response);
      }
      return null;
    } catch (e) {
      debugPrint('Error fetching profile: $e');
      return null;
    }
  }

  // Update user profile
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? phoneNumber,
    String? avatarUrl,
    String? address,
    String? city,
    String? postalCode,
  }) async {
    if (currentUser == null) {
      return {
        'success': false,
        'error': 'No authenticated user'
      };
    }

    try {
      // Ensure all profile columns exist in the database
      await _supabase.rpc('ensure_profile_columns');

      final updates = {
        if (fullName != null) 'full_name': fullName,
        if (phoneNumber != null) 'phone_number': phoneNumber,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        if (address != null) 'address': address,
        if (city != null) 'city': city,
        if (postalCode != null) 'postal_code': postalCode,
        'updated_at': DateTime.now().toIso8601String(),
      };

      await _supabase
          .from('profiles')
          .update(updates)
          .eq('id', currentUser!.id);
      
      return {
        'success': true
      };
    } catch (e) {
      debugPrint('Error updating profile: $e');
      return {
        'success': false,
        'error': e.toString()
      };
    }
  }
  
  // Upload a profile image
  Future<Map<String, dynamic>> uploadProfileImage(File imageFile) async {
    if (currentUser == null) {
      return {
        'success': false,
        'error': 'No authenticated user'
      };
    }

    try {
      // Generate a unique file path
      final fileExt = imageFile.path.split('.').last;
      final fileName = '${currentUser!.id}_${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final filePath = 'avatars/$fileName';
      
      // Upload the file
      await _supabase
          .storage
          .from('profile-images')
          .upload(filePath, imageFile);
      
      // Get the public URL
      final imageUrl = _supabase
          .storage
          .from('profile-images')
          .getPublicUrl(filePath);
      
      // Update the user profile with the new avatar URL
      await updateProfile(avatarUrl: imageUrl);
      
      return {
        'success': true,
        'avatarUrl': imageUrl
      };
    } catch (e) {
      debugPrint('Error uploading profile image: $e');
      return {
        'success': false,
        'error': e.toString()
      };
    }
  }

  // Get user's bids
  Future<List<Map<String, dynamic>>> getUserBids() async {
    if (currentUser == null) return [];
    
    try {
      final response = await _supabase
          .from('bids')
          .select('''
            id,
            amount,
            created_at,
            auction_id,
            auctions:auction_id (
              id, 
              title, 
              status,
              start_price,
              final_price,
              start_time,
              end_time
            )
          ''')
          .eq('user_id', currentUser!.id)
          .order('created_at', ascending: false);
      
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('Error fetching user bids: $e');
      return [];
    }
  }

  // Get user's offers
  Future<List<Map<String, dynamic>>> getUserOffers() async {
    if (currentUser == null) return [];
    
    try {
      final response = await _supabase
          .from('offers')
          .select('''
            id,
            amount,
            status,
            created_at,
            auction_id,
            auctions:auction_id (
              id, 
              title, 
              status,
              start_price,
              final_price,
              start_time,
              end_time
            )
          ''')
          .eq('user_id', currentUser!.id)
          .order('created_at', ascending: false);
      
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('Error fetching user offers: $e');
      return [];
    }
  }
  
  // Clean up resources
  void dispose() {
    _lifecycleSubscription?.cancel();
  }

  // Public method to manually refresh the session - used after login
  Future<void> refreshSessionManually() async {
    _lastSessionCheck = DateTime.now();
    await _refreshSession();
    
    // Don't try to trigger lifecycle events directly
  }
} 