import 'package:flutter/foundation.dart';

enum OfferStatus {
  pending,
  accepted,
  rejected,
  withdrawn
}

extension OfferStatusExtension on OfferStatus {
  String get value {
    switch (this) {
      case OfferStatus.pending:
        return 'pending';
      case OfferStatus.accepted:
        return 'accepted';
      case OfferStatus.rejected:
        return 'rejected';
      case OfferStatus.withdrawn:
        return 'withdrawn';
    }
  }
  
  static OfferStatus fromString(String? value) {
    switch (value) {
      case 'accepted':
        return OfferStatus.accepted;
      case 'rejected':
        return OfferStatus.rejected;
      case 'withdrawn':
        return OfferStatus.withdrawn;
      default:
        return OfferStatus.pending;
    }
  }
}

class Offer {
  final String id;
  final String auctionId;
  final String userId;
  final double amount;
  final OfferStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  Offer({
    required this.id,
    required this.auctionId,
    required this.userId,
    required this.amount,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      id: json['id'].toString(),
      auctionId: json['auction_id'].toString(),
      userId: json['user_id'].toString(),
      amount: json['amount'] is int 
        ? json['amount'].toDouble() 
        : json['amount'],
      status: OfferStatusExtension.fromString(json['status']),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'auction_id': auctionId,
      'user_id': userId,
      'amount': amount,
      'status': status.value,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Offer copyWith({
    String? id,
    String? auctionId,
    String? userId,
    double? amount,
    OfferStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Offer(
      id: id ?? this.id,
      auctionId: auctionId ?? this.auctionId,
      userId: userId ?? this.userId,
      amount: amount ?? this.amount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 