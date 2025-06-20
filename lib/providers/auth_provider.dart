import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class User {
  final String id;
  final String name;
  final String email;

  User({
    required this.id,
    required this.name,
    required this.email,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
    };
  }
}

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  // For demo purposes, using a hardcoded user
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await Future.delayed(const Duration(seconds: 2)); // Simulating API call
      
      // In a real app, this would be an API call to validate the user
      if (email == 'user@example.com' && password == 'password') {
        _user = User(
          id: '1',
          name: 'Demo User',
          email: email,
        );
        _token = 'demo_token';
        
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        prefs.setString('user', '{"id":"1","name":"Demo User","email":"$email"}');
        prefs.setString('token', _token!);
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await Future.delayed(const Duration(seconds: 2)); // Simulating API call
      
      // In a real app, this would be an API call to register a new user
      _user = User(
        id: '1',
        name: name,
        email: email,
      );
      _token = 'demo_token';
      
      // Save to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      prefs.setString('user', '{"id":"1","name":"$name","email":"$email"}');
      prefs.setString('token', _token!);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    
    // Clear SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('user');
    prefs.remove('token');
    
    notifyListeners();
  }

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    
    if (!prefs.containsKey('token')) {
      return false;
    }
    
    final userJson = prefs.getString('user');
    final extractedToken = prefs.getString('token');
    
    if (userJson == null || extractedToken == null) {
      return false;
    }
    
    _user = User.fromJson(Map<String, dynamic>.from({
      'id': '1',
      'name': 'Demo User',
      'email': 'user@example.com',
    }));
    
    _token = extractedToken;
    notifyListeners();
    return true;
  }
} 