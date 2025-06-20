import 'package:flutter/foundation.dart';
import 'package:land_auction_app/models/auction.dart';

class Bid {
  final String id;
  final String auctionId;
  final String bidderId;
  final String? bidderName;
  final double amount;
  final DateTime createdAt;
  final Auction? auction;

  Bid({
    required this.id,
    required this.auctionId,
    required this.bidderId,
    this.bidderName,
    required this.amount,
    required this.createdAt,
    this.auction,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    final profiles = json['profiles'] as Map<String, dynamic>?;
    
    Auction? auctionData;
    if (json['auctions'] != null) {
      try {
        auctionData = Auction.fromJson(json['auctions'] as Map<String, dynamic>);
      } catch (e) {
        debugPrint('Error parsing auction in bid: $e');
      }
    }
    
    return Bid(
      id: json['id'] as String,
      auctionId: json['auction_id'] as String,
      bidderId: json['bidder_id'] as String,
      bidderName: profiles?['full_name'] as String?,
      amount: (json['amount'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at'] as String),
      auction: auctionData,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'auction_id': auctionId,
      'bidder_id': bidderId,
      'amount': amount,
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool get isForActiveAuction {
    if (auction == null) return false;
    return auction!.isActive;
  }

  bool get isHighestBid {
    if (auction == null) return false;
    return auction!.finalPrice != null && amount >= auction!.finalPrice!;
  }
} 