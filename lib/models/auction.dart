import 'package:flutter/foundation.dart';
import 'dart:convert';

// Enum for listing types
enum ListingType {
  auction,
  offer
}

// Extension to convert string to enum and vice versa
extension ListingTypeExtension on ListingType {
  String get value {
    switch (this) {
      case ListingType.auction:
        return 'auction';
      case ListingType.offer:
        return 'offer';
    }
  }
  
  static ListingType fromString(String? value) {
    if (value == 'offer') return ListingType.offer;
    return ListingType.auction;
  }
}

class Auction {
  final String id;
  final double startPrice;
  final double minIncrement;
  final DateTime startTime;
  final DateTime endTime;
  final String status;
  final String? winnerId;
  final double? finalPrice;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> images;
  final String? title;
  final String? description;
  final String? location;
  final double? areaSize;
  final String? areaUnit;
  final ListingType listingType;
  final double? offerIncrement;
  
  // Additional fields from web app
  final String? city;
  final String? district;
  final String? adaNo;
  final String? parselNo;
  final String? neighborhoodName;
  final String? zoning;
  final String? ownerInfo;
  final bool? isFeatured;
  final String? userId;
  final bool? isPublished;
  final List<String>? documents;

  Auction({
    required this.id,
    required this.startPrice,
    required this.minIncrement,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.winnerId,
    this.finalPrice,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
    this.title,
    this.description,
    this.location,
    this.areaSize,
    this.areaUnit,
    this.listingType = ListingType.auction,
    this.offerIncrement,
    // Additional fields
    this.city,
    this.district,
    this.adaNo,
    this.parselNo,
    this.neighborhoodName,
    this.zoning,
    this.ownerInfo,
    this.isFeatured,
    this.userId,
    this.isPublished,
    this.documents,
  });

  // Check if auction is currently active
  bool get isActive {
    final now = DateTime.now();
    
    // Explicitly marked as active
    if (status == 'active') return true;
    
    // OR current time is within auction window AND not marked as upcoming/ended
    return status != 'upcoming' && status != 'ended' && 
           now.isAfter(startTime) && now.isBefore(endTime);
  }

  // Get remaining time in seconds
  int get remainingTimeInSeconds {
    final now = DateTime.now();
    if (now.isAfter(endTime)) return 0;
    return endTime.difference(now).inSeconds;
  }

  // Get current price (either final price or start price)
  double get currentPrice => finalPrice ?? startPrice;

  // Get minimum next bid amount
  double get minimumNextBid => currentPrice + minIncrement;
  
  // Get minimum next offer amount for offer listings
  double get minimumNextOffer => 
    currentPrice + (offerIncrement ?? 0);

  // Check if auction has ended
  bool get hasEnded {
    final now = DateTime.now();
    
    // Explicitly marked as ended
    if (status == 'ended') return true;
    
    // OR current time is after end time
    return now.isAfter(endTime);
  }

  // Check if auction is upcoming
  bool get isUpcoming {
    final now = DateTime.now();
    
    // Explicitly marked as upcoming
    if (status == 'upcoming') return true;
    
    // OR start time is in the future AND not marked as ended
    return status != 'ended' && now.isBefore(startTime);
  }

  // Factory constructor to create Auction from JSON data
  factory Auction.fromJson(Map<String, dynamic> json) {
    if (kDebugMode) {
      print('Parsing auction JSON: ${json['id']}');
    }
    
    // Process images
    List<String> imagesList = [];
    if (json['images'] != null) {
      try {
        if (json['images'] is List) {
          imagesList = List<String>.from(json['images']);
        } else if (json['images'] is String) {
          // Try to parse as JSON if it's a string
          try {
            final decoded = jsonDecode(json['images']);
            if (decoded is List) {
              imagesList = List<String>.from(decoded);
            }
          } catch (e) {
            if (kDebugMode) {
              print('Error parsing images JSON: $e');
            }
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('Error processing images: $e');
        }
      }
    }
    
    // Process documents
    List<String>? documentsList;
    if (json['documents'] != null) {
      try {
        if (json['documents'] is List) {
          documentsList = List<String>.from(json['documents']);
        } else if (json['documents'] is String) {
          // Try to parse as JSON if it's a string
          try {
            final decoded = jsonDecode(json['documents']);
            if (decoded is List) {
              documentsList = List<String>.from(decoded);
            }
          } catch (e) {
            if (kDebugMode) {
              print('Error parsing documents JSON: $e');
            }
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('Error processing documents: $e');
        }
      }
    }
    
    // Parse timestamps - handle both snake_case and camelCase field names
    DateTime startTime, endTime, createdAt, updatedAt;
    
    try {
      startTime = DateTime.parse(json['start_time'] ?? json['startTime'] ?? '');
      endTime = DateTime.parse(json['end_time'] ?? json['endTime'] ?? '');
      createdAt = DateTime.parse(json['created_at'] ?? json['createdAt'] ?? '');
      updatedAt = DateTime.parse(json['updated_at'] ?? json['updatedAt'] ?? '');
    } catch (e) {
      if (kDebugMode) {
        print('Error parsing dates: $e');
      }
      // Fallback to current time if parsing fails
      final now = DateTime.now();
      startTime = now;
      endTime = now.add(const Duration(days: 7));
      createdAt = now;
      updatedAt = now;
    }
    
    // Parse listing type
    final listingTypeStr = json['listing_type'] ?? json['listingType'] as String?;
    final listingType = ListingTypeExtension.fromString(listingTypeStr);
    
    // Parse numeric values with safe conversion
    double parseNumeric(dynamic value) {
      if (value == null) return 0.0;
      if (value is int) return value.toDouble();
      if (value is double) return value;
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }
    
    return Auction(
      id: json['id']?.toString() ?? '',
      startPrice: parseNumeric(json['start_price'] ?? json['startPrice']),
      minIncrement: parseNumeric(json['min_increment'] ?? json['minIncrement']),
      startTime: startTime,
      endTime: endTime,
      status: (json['status'] ?? 'pending').toString(),
      winnerId: json['winner_id']?.toString() ?? json['winnerId']?.toString(),
      finalPrice: json['final_price'] != null || json['finalPrice'] != null 
        ? parseNumeric(json['final_price'] ?? json['finalPrice'])
        : null,
      createdAt: createdAt,
      updatedAt: updatedAt,
      images: imagesList,
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      location: json['location']?.toString(),
      areaSize: json['area_sqm'] != null || json['areaSqm'] != null || json['area_size'] != null
        ? parseNumeric(json['area_sqm'] ?? json['areaSqm'] ?? json['area_size'] ?? json['areaSize'])
        : null,
      areaUnit: json['area_unit']?.toString() ?? json['areaUnit']?.toString(),
      listingType: listingType,
      offerIncrement: json['offer_increment'] != null || json['offerIncrement'] != null
        ? parseNumeric(json['offer_increment'] ?? json['offerIncrement'])
        : null,
      // Additional fields
      city: json['city']?.toString(),
      district: json['district']?.toString(),
      adaNo: json['ada_no']?.toString(),
      parselNo: json['parsel_no']?.toString(),
      neighborhoodName: json['neighborhood_name']?.toString() ?? json['neighborhoodName']?.toString(),
      zoning: json['zoning']?.toString(),
      ownerInfo: json['owner_info']?.toString() ?? json['ownerInfo']?.toString(),
      isFeatured: json['is_featured'] is bool ? json['is_featured'] : (json['isFeatured'] is bool ? json['isFeatured'] : false),
      userId: json['user_id']?.toString() ?? json['userId']?.toString(),
      isPublished: json['is_published'] is bool ? json['is_published'] : (json['isPublished'] is bool ? json['isPublished'] : true),
      documents: documentsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'start_price': startPrice,
      'min_increment': minIncrement,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'status': status,
      'winner_id': winnerId,
      'final_price': finalPrice,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'images': images,
      'title': title,
      'description': description,
      'location': location,
      'area_size': areaSize,
      'area_unit': areaUnit,
      'listing_type': listingType.value,
      'offer_increment': offerIncrement,
      // Additional fields
      'city': city,
      'district': district,
      'ada_no': adaNo,
      'parsel_no': parselNo,
      'neighborhood_name': neighborhoodName,
      'zoning': zoning,
      'owner_info': ownerInfo,
      'is_featured': isFeatured,
      'user_id': userId,
      'is_published': isPublished,
      'documents': documents,
    };
  }

  // Create a copy of the auction with updated values
  Auction copyWith({
    String? id,
    double? startPrice,
    double? minIncrement,
    DateTime? startTime,
    DateTime? endTime,
    String? status,
    String? winnerId,
    double? finalPrice,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? images,
    String? title,
    String? description,
    String? location,
    double? areaSize,
    String? areaUnit,
    ListingType? listingType,
    double? offerIncrement,
    // Additional fields
    String? city,
    String? district,
    String? adaNo,
    String? parselNo,
    String? neighborhoodName,
    String? zoning,
    String? ownerInfo,
    bool? isFeatured,
    String? userId,
    bool? isPublished,
    List<String>? documents,
  }) {
    return Auction(
      id: id ?? this.id,
      startPrice: startPrice ?? this.startPrice,
      minIncrement: minIncrement ?? this.minIncrement,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      winnerId: winnerId ?? this.winnerId,
      finalPrice: finalPrice ?? this.finalPrice,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      images: images ?? this.images,
      title: title ?? this.title,
      description: description ?? this.description,
      location: location ?? this.location,
      areaSize: areaSize ?? this.areaSize,
      areaUnit: areaUnit ?? this.areaUnit,
      listingType: listingType ?? this.listingType,
      offerIncrement: offerIncrement ?? this.offerIncrement,
      // Additional fields
      city: city ?? this.city,
      district: district ?? this.district,
      adaNo: adaNo ?? this.adaNo,
      parselNo: parselNo ?? this.parselNo,
      neighborhoodName: neighborhoodName ?? this.neighborhoodName,
      zoning: zoning ?? this.zoning,
      ownerInfo: ownerInfo ?? this.ownerInfo,
      isFeatured: isFeatured ?? this.isFeatured,
      userId: userId ?? this.userId,
      isPublished: isPublished ?? this.isPublished,
      documents: documents ?? this.documents,
    );
  }

  /// Returns the listing type for display in UI
  String get listingTypeDisplay {
    switch (listingType) {
      case ListingType.offer:
        return 'Pazarlıklı Satış';
      case ListingType.auction:
        return 'Açık Arttırma';
    }
  }
  
  /// Returns true if this is an offer-type listing
  bool get isOfferType => listingType == ListingType.offer;
  
  /// Returns true if this is a standard auction-type listing
  bool get isAuctionType => listingType == ListingType.auction;
  
  /// Get formatted location with full details
  String get fullLocation {
    final parts = <String>[];
    if (neighborhoodName != null && neighborhoodName!.isNotEmpty) {
      parts.add(neighborhoodName!);
    }
    if (district != null && district!.isNotEmpty) {
      parts.add(district!);
    }
    if (city != null && city!.isNotEmpty) {
      parts.add(city!);
    }
    return parts.isNotEmpty ? parts.join(', ') : (location ?? 'Konum belirtilmemiş');
  }
  
  /// Get formatted area display
  String get formattedArea {
    if (areaSize == null) return '';
    return '${areaSize} ${areaUnit ?? 'm²'}';
  }
  
  /// Get formatted zoning info
  String get zoningInfo {
    final parts = <String>[];
    if (zoning != null && zoning!.isNotEmpty) {
      parts.add('İmar: $zoning');
    }
    if (adaNo != null && adaNo!.isNotEmpty) {
      parts.add('Ada No: $adaNo');
    }
    if (parselNo != null && parselNo!.isNotEmpty) {
      parts.add('Parsel No: $parselNo');
    }
    return parts.join(' | ');
  }
} 