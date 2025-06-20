import 'package:supabase_flutter/supabase_flutter.dart';

class Profile {
  final String id;
  final String? fullName;
  final String? phoneNumber;
  final String? avatarUrl;
  final String? email;
  final String? address;
  final String? city;
  final String? postalCode;
  final String? role;
  final DateTime createdAt;
  final DateTime updatedAt;

  Profile({
    required this.id,
    this.fullName,
    this.phoneNumber,
    this.avatarUrl,
    this.email,
    this.address,
    this.city,
    this.postalCode,
    this.role = 'user',
    required this.createdAt,
    required this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      phoneNumber: json['phone_number'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      email: json['email'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      postalCode: json['postal_code'] as String?,
      role: json['role'] as String? ?? 'user',
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'phone_number': phoneNumber,
      'avatar_url': avatarUrl,
      'email': email,
      'address': address,
      'city': city,
      'postal_code': postalCode,
      'role': role,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  // Create a copy with updated fields
  Profile copyWith({
    String? id,
    String? fullName,
    String? phoneNumber,
    String? avatarUrl,
    String? email,
    String? address,
    String? city,
    String? postalCode,
    String? role,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Profile(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      email: email ?? this.email,
      address: address ?? this.address,
      city: city ?? this.city,
      postalCode: postalCode ?? this.postalCode,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  // Check if user is admin
  bool get isAdmin => role == 'admin';
} 