import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:land_auction_app/models/auction.dart';

/// Service for handling auctions-related API calls
class AuctionService {
  final SupabaseClient _supabase;
  
  // Caching constants
  static const String _cacheKey = 'auctions_cache';
  static const Duration _cacheDuration = Duration(minutes: 5);
  
  AuctionService(this._supabase);
  
  /// Fetch all auctions with improved error handling and caching
  Future<Map<String, dynamic>> fetchAuctions({bool forceRefresh = false}) async {
    try {
      // Use local cache with timestamp to prevent excessive refetching
      final now = DateTime.now();
      
      // Check if we have cached data and it's fresh enough
      if (!forceRefresh) {
        try {
          final prefs = await SharedPreferences.getInstance();
          final cachedData = prefs.getString(_cacheKey);
          
          if (cachedData != null) {
            final cacheMap = jsonDecode(cachedData);
            final timestamp = DateTime.parse(cacheMap['timestamp']);
            
            if (now.difference(timestamp) < _cacheDuration) {
              debugPrint('Using cached auction data');
              return {
                'data': cacheMap['data'],
                'error': null,
                'timestamp': timestamp,
              };
            }
          }
        } catch (cacheError) {
          debugPrint('Error accessing cache: $cacheError');
          // Continue to fetch fresh data
        }
      }
      
      // Fetch fresh data with a direct approach
      debugPrint('Fetching fresh auctions data from Supabase');


      // .select('''
      //       *,
      //       bids (
      //         id, amount, created_at, user_id
      //       ),
      //       offers (
      //         id, amount, status, created_at, user_id
      //       )
      //     ''')
      
      try {
        // Make the API call with a timeout and include all necessary fields
        // This matches the web app's query structure
        final response = await _supabase
          .from('auctions')
          .select('''
            *,
            offers (
              id, amount, status, created_at, user_id
            )
          ''')
          .order('created_at', ascending: false)
          .timeout(const Duration(seconds: 10));
          
        debugPrint('Received response with ${response.length} auctions');
        
        if (response.isNotEmpty) {
          // Process each auction to ensure it has valid fields
          final processedAuctions = response.map((auction) {
            try {
              _ensureValidAuctionFields(auction);
              
              // Process field names to ensure consistency with both snake_case and camelCase
              // This helps with handling data from different sources (API, cache, etc.)
              final processedAuction = {
                ...auction,
                'startPrice': auction['start_price'],
                'minIncrement': auction['min_increment'],
                'startTime': auction['start_time'],
                'endTime': auction['end_time'],
                'finalPrice': auction['final_price'],
                'createdAt': auction['created_at'],
                'updatedAt': auction['updated_at'],
                'winnerId': auction['winner_id'],
                'listingType': auction['listing_type'],
                'offerIncrement': auction['offer_increment'],
                'areaSize': auction['area_sqm'],
                'areaUnit': auction['area_unit'] ?? 'm²',
                'adaNo': auction['ada_no'],
                'parselNo': auction['parsel_no'],
                'neighborhoodName': auction['neighborhood_name'],
                'isFeatured': auction['is_featured'],
                'userId': auction['user_id'],
                'isPublished': auction['is_published'],
              };
              
              return processedAuction;
            } catch (e) {
              debugPrint('Error processing auction: $e');
              // Return the original auction data to avoid crashing
              return auction;
            }
          }).toList();
          
          // Cache the results
          try {
            final prefs = await SharedPreferences.getInstance();
            final cacheData = {
              'data': processedAuctions,
              'timestamp': now.toIso8601String(),
            };
            await prefs.setString(_cacheKey, jsonEncode(cacheData));
          } catch (storageError) {
            debugPrint('Error storing in cache: $storageError');
          }
          
          debugPrint('Fetched and processed ${processedAuctions.length} auctions');
          return {
            'data': processedAuctions,
            'error': null,
            'timestamp': now
          };
        } else {
          debugPrint('API returned empty response');
          throw Exception('No auction data received');
        }
      } catch (apiError) {
        debugPrint('API error: $apiError');
        throw apiError; // Rethrow to be caught by outer try-catch
      }
    } catch (error) {
      debugPrint('Error fetching auctions: $error');
      
      // Try to return cached data even if it's stale
      try {
        final prefs = await SharedPreferences.getInstance();
        final cachedData = prefs.getString(_cacheKey);
        
        if (cachedData != null) {
          final cacheMap = jsonDecode(cachedData);
          final timestamp = DateTime.parse(cacheMap['timestamp']);
          
          debugPrint('Returning stale cached data due to fetch error');
          return {
            'data': cacheMap['data'],
            'error': null,
            'timestamp': timestamp
          };
        }
      } catch (cacheError) {
        debugPrint('Error accessing cache during recovery: $cacheError');
      }
      
      return {
        'data': null,
        'error': error.toString()
      };
    }
  }
  
  // Helper method to ensure auction data has valid fields
  void _ensureValidAuctionFields(Map<String, dynamic> auction) {
    final now = DateTime.now();
    
    // If there are alternative field names, map them to the expected ones
    if (auction['starting_price'] != null && auction['start_price'] == null) {
      auction['start_price'] = auction['starting_price'];
    }
    
    if (auction['start_date'] != null && auction['start_time'] == null) {
      auction['start_time'] = auction['start_date'];
    }
    
    if (auction['end_date'] != null && auction['end_time'] == null) {
      auction['end_time'] = auction['end_date'];
    }
    
    // Provide fallbacks for missing required fields
    if (auction['start_price'] == null) {
      debugPrint('Warning: Adding default start_price for auction ${auction['id']}');
      auction['start_price'] = 0;
    }
    
    if (auction['min_increment'] == null) {
      debugPrint('Warning: Adding default min_increment for auction ${auction['id']}');
      auction['min_increment'] = 0;
    }
    
    if (auction['start_time'] == null) {
      debugPrint('Warning: Adding default start_time for auction ${auction['id']}');
      auction['start_time'] = now.toIso8601String();
    }
    
    if (auction['end_time'] == null) {
      debugPrint('Warning: Adding default end_time for auction ${auction['id']}');
      auction['end_time'] = now.add(const Duration(days: 1)).toIso8601String();
    }
    
    if (auction['status'] == null) {
      debugPrint('Warning: Adding default status for auction ${auction['id']}');
      auction['status'] = 'unknown';
    }
    
    if (auction['created_at'] == null) {
      debugPrint('Warning: Adding default created_at for auction ${auction['id']}');
      auction['created_at'] = now.toIso8601String();
    }
    
    if (auction['updated_at'] == null) {
      debugPrint('Warning: Adding default updated_at for auction ${auction['id']}');
      auction['updated_at'] = now.toIso8601String();
    }
    
    // Set default listing type if missing
    if (auction['listing_type'] == null) {
      debugPrint('Warning: Adding default listing_type for auction ${auction['id']}');
      auction['listing_type'] = 'auction';
    }
  }
  
  /// Get active, upcoming, and past auctions
  Future<Map<String, dynamic>> getFilteredAuctions() async {
    try {
      final result = await fetchAuctions();
      
      if (result['error'] != null) {
        throw result['error'];
      }
      
      // Handle different data structures that might be returned
      final dynamic rawData = result['data'];
      List<Map<String, dynamic>> auctionsList = [];
      
      // Extract the actual list of auctions regardless of format
      if (rawData is List) {
        // Direct list of auctions
        auctionsList = List<Map<String, dynamic>>.from(
          rawData.map((item) => item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map))
        );
      } else if (rawData is Map<String, dynamic>) {
        // Map structure that might contain auctions
        // Try to find a list within the map
        if (rawData.containsKey('auctions') && rawData['auctions'] is List) {
          auctionsList = List<Map<String, dynamic>>.from(
            (rawData['auctions'] as List).map((item) => item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map))
          );
        } else if (rawData.containsKey('all') && rawData['all'] is List) {
          // If using the 'all' key (from the cache structure)
          auctionsList = List<Map<String, dynamic>>.from(
            (rawData['all'] as List).map((item) => item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map))
          );
        } else {
          // Just use all the map values that are maps themselves as individual auctions
          final possibleAuctions = rawData.entries
              .where((entry) => entry.value is Map)
              .map((entry) => entry.value is Map<String, dynamic> 
                  ? entry.value as Map<String, dynamic> 
                  : Map<String, dynamic>.from(entry.value as Map))
              .toList();
              
          if (possibleAuctions.isNotEmpty) {
            auctionsList = possibleAuctions;
          } else {
            throw Exception('Could not find auctions data in the response');
          }
        }
      } else {
        throw Exception('Unknown data format in auctions response: ${rawData.runtimeType}');
      }
      
      debugPrint('Found ${auctionsList.length} auctions to filter');
      
      final now = DateTime.now();
      
      // Parse auctions into proper model objects to use the isActive, isUpcoming, hasEnded properties
      final auctionObjects = auctionsList.map((data) => Auction.fromJson(data)).toList();
      
      // Filter auctions by status
      final List<Map<String, dynamic>> active = [];
      final List<Map<String, dynamic>> upcoming = [];
      final List<Map<String, dynamic>> past = [];
      
      for (var i = 0; i < auctionObjects.length; i++) {
        final auction = auctionObjects[i];
        final original = auctionsList[i];
        
        // Use the model's helper methods to determine status
        if (auction.isActive) {
          active.add(original);
        } else if (auction.isUpcoming) {
          upcoming.add(original);
        } else if (auction.hasEnded) {
          past.add(original);
        } else {
          // Default: auctions with unknown status go to active
          active.add(original);
        }
      }
      
      debugPrint('Filtered auctions: ${active.length} active, ${upcoming.length} upcoming, ${past.length} past');
      
      return {
        'active': active,
        'upcoming': upcoming,
        'past': past,
        'timestamp': result['timestamp'] ?? now,
      };
    } catch (e) {
      debugPrint('Error filtering auctions: $e');
      return {
        'active': [],
        'upcoming': [],
        'past': [],
        'error': e.toString(),
        'timestamp': DateTime.now(),
      };
    }
  }
  
  /// Fetch a single auction by ID
  Future<Map<String, dynamic>> fetchAuctionById(String id) async {
    try {
      debugPrint('Fetching auction $id');

      // .select('''
      //     *,
      //     bids (
      //       id, amount, created_at, user_id, 
      //       profiles:user_id (
      //         username, full_name, avatar_url, email
      //       )
      //     ),
      //     offers (
      //       id, amount, status, message, created_at, updated_at, user_id,
      //       profiles:user_id (
      //         username, full_name, avatar_url, email
      //       )
      //     )
      //   ''')
      
      final response = await _supabase
        .from('auctions')
        .select('''
          *,
          offers (
            id, amount, status, message, created_at, updated_at, user_id,
            profiles:user_id (
              username, full_name, avatar_url, email
            )
          )
        ''')
        .eq('id', id)
        .single()
        .timeout(const Duration(seconds: 5));
        
      if (response != null) {
        _ensureValidAuctionFields(response);
        
        // Process field names to ensure consistency
        final processedAuction = {
          ...response,
          'startPrice': response['start_price'],
          'minIncrement': response['min_increment'],
          'startTime': response['start_time'],
          'endTime': response['end_time'],
          'finalPrice': response['final_price'],
          'createdAt': response['created_at'],
          'updatedAt': response['updated_at'],
          'winnerId': response['winner_id'],
          'listingType': response['listing_type'],
          'offerIncrement': response['offer_increment'],
          'areaSize': response['area_sqm'],
          'areaUnit': response['area_unit'] ?? 'm²',
          'adaNo': response['ada_no'],
          'parselNo': response['parsel_no'],
          'neighborhoodName': response['neighborhood_name'],
          'isFeatured': response['is_featured'],
          'userId': response['user_id'],
          'isPublished': response['is_published'],
        };
        
        return {
          'data': processedAuction,
          'error': null
        };
      } else {
        throw Exception('Auction not found');
      }
    } catch (e) {
      debugPrint('Error fetching auction by ID: $e');
      return {
        'data': null,
        'error': e.toString()
      };
    }
  }
  
  /// Submit a bid for an auction
  Future<Map<String, dynamic>> submitBid(String auctionId, double amount, String userId) async {
    try {
      final response = await _supabase
        .from('bids')
        .insert({
          'auction_id': auctionId,
          'amount': amount,
        //  'user_id': userId
        })
        .select()
        .single();
        
      return {
        'data': response,
        'error': null
      };
    } catch (e) {
      debugPrint('Error submitting bid: $e');
      return {
        'data': null,
        'error': e.toString()
      };
    }
  }
  
  /// Submit an offer for a negotiation-type listing
  Future<Map<String, dynamic>> submitOffer(String auctionId, double amount, String userId, String? message) async {
    try {
      final response = await _supabase
        .from('offers')
        .insert({
          'auction_id': auctionId,
          'amount': amount,
          'user_id': userId,
          'status': 'pending',
          'message': message,
        })
        .select()
        .single();
        
      return {
        'data': response,
        'error': null
      };
    } catch (e) {
      debugPrint('Error submitting offer: $e');
      return {
        'data': null,
        'error': e.toString()
      };
    }
  }
} 