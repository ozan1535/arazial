import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:land_auction_app/models/auction.dart';
import 'package:land_auction_app/models/bid.dart';
import 'package:land_auction_app/models/offer.dart';
import 'package:land_auction_app/models/app_lifecycle_event.dart';
import 'package:land_auction_app/services/auth_service.dart';
import 'package:land_auction_app/services/auction_service.dart';
import 'package:land_auction_app/services/lifecycle_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuctionProvider with ChangeNotifier {
  final SupabaseClient _supabase;
  final LifecycleService _lifecycleService;
  late final AuthService _authService;
  late final AuctionService _auctionService;
  StreamSubscription<AppLifecycleEvent>? _lifecycleSubscription;
  
  List<Auction> _auctions = [];
  List<Auction> _activeAuctions = [];
  List<Auction> _upcomingAuctions = [];
  List<Auction> _pastAuctions = [];
  
  List<Bid> _bids = [];
  StreamSubscription<List<Map<String, dynamic>>>? _bidSubscription;
  bool _isLoading = false;
  bool _hasError = false;
  String? _errorMessage;
  DateTime? _lastFetchTime;
  DateTime? _lastVisibleTime;
  StreamController<List<Bid>>? _bidStreamController;
  
  // Caching constants
  static const String _cacheKey = 'auctions_cache';
  static const Duration _cacheDuration = Duration(minutes: 5);
  
  AuctionProvider(this._supabase, this._lifecycleService) {
    _authService = AuthService(_supabase);
    _auctionService = AuctionService(_supabase);
    _lastVisibleTime = DateTime.now();
    
    // Listen to lifecycle events
    _setupLifecycleListener();
    
    // Initialize: fetch auctions from backend immediately
    fetchAuctions(forceRefresh: true);
    
    // Subscribe to auction changes
    _supabase.from('auctions')
      .stream(primaryKey: ['id'])
      .order('created_at')
      .listen((List<Map<String, dynamic>> data) async {
        debugPrint('Received auction update from Supabase realtime. Data count: ${data.length}');
        if (data.isNotEmpty) {
          debugPrint('First auction update: ${data[0]}');
        }
        
        // When we get a realtime update, fetch fresh data to ensure we have everything
        await fetchAuctions(forceRefresh: true);
      },
      onError: (error) {
        debugPrint('Error in auction stream: $error');
        // PostgrestError has been replaced with more specific error types in Supabase
        // Just log the error details without trying to cast to a specific type
      });
  }
  
  // Setup lifecycle listener
  void _setupLifecycleListener() {
    _lifecycleSubscription = _lifecycleService.lifecycleEvents.listen((event) {
      if (event.type == AppLifecycleEventType.resumed) {
        debugPrint('AuctionProvider: App resumed, checking if refresh needed');
        
        final now = DateTime.now();
        final lastVisible = _lastVisibleTime ?? now;
        final timeSinceVisible = now.difference(lastVisible);
        
        // Only refresh data if app has been in background for more than 1 minute
        if (timeSinceVisible.inMinutes > 1) {
          debugPrint('App was in background for ${timeSinceVisible.inMinutes} minutes, refreshing data');
          fetchAuctions(forceRefresh: true);
        } else {
          debugPrint('App was in background for less than a minute, no refresh needed');
        }
        
        _lastVisibleTime = now;
      } else if (event.type == AppLifecycleEventType.paused) {
        // Record when app went to background
        _lastVisibleTime = DateTime.now();
      }
    });
  }
  
  // Initialize data on startup
  Future<void> _initializeData() async {
    // First try to load from cache
    await loadFromCache();
    // Then fetch fresh data from backend
    await fetchAuctions();
  }
  
  // Load auctions from cache - kept for backward compatibility
  Future<void> _loadFromCache() async {
    await loadFromCache();
  }
  
  // Save auctions to cache
  Future<void> _saveToCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheData = {
        'timestamp': DateTime.now().toIso8601String(),
        'data': {
          'all': _auctions.map((a) => a.toJson()).toList(),
          'active': _activeAuctions.map((a) => a.toJson()).toList(),
          'upcoming': _upcomingAuctions.map((a) => a.toJson()).toList(),
          'past': _pastAuctions.map((a) => a.toJson()).toList(),
        }
      };
      await prefs.setString(_cacheKey, jsonEncode(cacheData));
      debugPrint('Saved auctions to cache: ${_auctions.length} total, ${_activeAuctions.length} active');
    } catch (e) {
      debugPrint('Error saving to cache: $e');
    }
  }
  
  // Clean up resources
  @override
  void dispose() {
    _lifecycleSubscription?.cancel();
    _bidSubscription?.cancel();
    _bidStreamController?.close();
    super.dispose();
  }
  
  List<Auction> get auctions => [..._auctions];
  List<Auction> get activeAuctions => [..._activeAuctions];
  List<Auction> get upcomingAuctions => [..._upcomingAuctions];
  List<Auction> get pastAuctions => [..._pastAuctions];
  
  bool get isLoading => _isLoading;
  bool get hasError => _hasError;
  String? get errorMessage => _errorMessage;
  DateTime? get lastFetchTime => _lastFetchTime;
  
  Auction? getAuctionById(String id) {
    try {
      return _auctions.firstWhere((auction) => auction.id == id);
    } catch (e) {
      return null;
    }
  }
  
  Future<void> fetchAuctions({bool forceRefresh = false}) async {
    // Skip if already loading and not forced
    if (_isLoading && !forceRefresh) {
      debugPrint('Already loading auctions, skipping fetch');
      return;
    }
    
    // Create a guaranteed timeout
    Timer? timeoutTimer;
    
    try {
      _isLoading = true;
      notifyListeners();
      
      // Set a hard deadline to finish loading
      timeoutTimer = Timer(const Duration(seconds: 8), () {
        if (_isLoading) {
          debugPrint('EMERGENCY: Force ending loading state after timeout');
          _isLoading = false;
          
          // Don't call notifyListeners() from a timer callback directly
          // Instead, use a microtask to ensure it's run on the next event loop
          Future.microtask(() => notifyListeners());
        }
      });
      
      // Load cached data first for fast user experience
      await _loadFromCache();
      
      // Only fetch fresh data if we're forcing a refresh or there's no data
      if (forceRefresh || _auctions.isEmpty) {
        try {
          // A 5-second timeout to prevent blocking
          final result = await _auctionService.getFilteredAuctions()
              .timeout(const Duration(seconds: 5));
          
          if (result['error'] != null) {
            debugPrint('Error from API: ${result['error']}');
            // Don't throw - just log and continue
          } else {
            _lastFetchTime = result['timestamp'] ?? DateTime.now();
            
            // Process active auctions - safe against null
            final activeData = result['active'] as List? ?? [];
            final newActive = _parseAuctionsList(activeData);
            if (newActive.isNotEmpty) {
              _activeAuctions = newActive;
            }
            
            // Process upcoming auctions - safe against null
            final upcomingData = result['upcoming'] as List? ?? [];
            final newUpcoming = _parseAuctionsList(upcomingData);
            if (newUpcoming.isNotEmpty) {
              _upcomingAuctions = newUpcoming;
            }
            
            // Process past auctions - safe against null
            final pastData = result['past'] as List? ?? [];
            final newPast = _parseAuctionsList(pastData);
            if (newPast.isNotEmpty) {
              _pastAuctions = newPast;
            }
            
            // Combine all auctions to maintain the full list
            _auctions = [..._activeAuctions, ..._upcomingAuctions, ..._pastAuctions];
            
            // Only save to cache if we got valid data
            if (_auctions.isNotEmpty) {
              _saveToCache();
            }
          }
        } catch (fetchError) {
          debugPrint('Error fetching fresh data: $fetchError');
          // Don't set hasError to avoid error UI if we have cached data
        }
      }
    } catch (error) {
      debugPrint('Unexpected error in fetchAuctions: $error');
      // Only show errors if we have no data to display
      if (_auctions.isEmpty) {
        _hasError = true;
        _errorMessage = 'Veriler alınamadı. Tekrar deneyin.';
      }
    } finally {
      // Always cancel the timeout timer
      timeoutTimer?.cancel();
      
      // Always end the loading state
      _isLoading = false;
      notifyListeners();
      
      debugPrint('Fetch auctions completed. Total: ${_auctions.length} auctions');
    }
  }
  
  List<Auction> _parseAuctionsList(List auctionsData) {
    final result = <Auction>[];
    
    debugPrint('Parsing ${auctionsData.length} auctions');
    
    for (var i = 0; i < auctionsData.length; i++) {
      try {
        final item = auctionsData[i];
        debugPrint('Sample auction data ${i+1}/${auctionsData.length}: $item');
        
        // Check if the item has the required fields
        if (item['id'] == null) {
          debugPrint('Skipping auction with missing id field');
          continue;
        }
        
        final auction = Auction.fromJson(item);
        result.add(auction);
        debugPrint('Successfully parsed auction: ${auction.id}');
      } catch (e) {
        debugPrint('Error parsing auction at index $i: $e');
      }
    }
    
    debugPrint('Successfully parsed ${result.length}/${auctionsData.length} auctions');
    return result;
  }
  
  Future<bool> placeBid(String auctionId, double amount) async {
    if (_authService.currentUser == null) return false;
    
    _isLoading = true;
    notifyListeners();
    
    try {
      final auction = getAuctionById(auctionId);
      if (auction == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }
      
      // Get the latest bid for this auction
      final latestBidResponse = await _supabase
          .from('bids')
          .select('amount')
          .eq('auction_id', auctionId)
          .order('amount', ascending: false)
          .limit(1)
          .maybeSingle();
      
      final latestBidAmount = latestBidResponse != null 
          ? (latestBidResponse['amount'] as num).toDouble()
          : auction.startPrice;
      
      // Check if bid is valid
      if (amount <= latestBidAmount) {
        debugPrint('Bid rejected: amount ($amount) must be greater than latest bid ($latestBidAmount)');
        _isLoading = false;
        notifyListeners();
        return false;
      }
      
      // Check if bid meets minimum increment
      if (amount < auction.minimumNextBid) {
        debugPrint('Bid rejected: amount ($amount) is less than minimum next bid (${auction.minimumNextBid})');
        _isLoading = false;
        notifyListeners();
        return false;
      }
      
      debugPrint('Placing bid of $amount for auction $auctionId');
      
      // Place bid in Supabase
      final bidResponse = await _supabase.from('bids').insert({
        'auction_id': auctionId,
        'bidder_id': _authService.currentUser!.id,
        'amount': amount,
      }).select().single();
      debugPrint('Bid placed successfully: ${bidResponse['id']}');
      
      // Update auction's final price
      await _supabase
          .from('auctions')
          .update({'final_price': amount})
          .eq('id', auctionId);
      debugPrint('Updated auction final price to $amount');

      // Fetch updated bids to refresh the UI
      final response = await _supabase
          .from('bids')
          .select('*, profiles:bidder_id(*)')
          .eq('auction_id', auctionId)
          .order('created_at', ascending: false);
      debugPrint('Fetched updated bids: ${response.length} bids');
      
      // Update the stream with new bids
      final bids = (response as List<dynamic>)
          .map((bid) => Bid.fromJson(bid))
          .toList();
      _bids = bids;
      _bidStreamController?.add(bids);
      
      // If we have an updated auction, add it to the auctions list
      final updatedAuction = auction.copyWith(finalPrice: amount);
      final auctionIndex = _auctions.indexWhere((a) => a.id == auctionId);
      if (auctionIndex >= 0) {
        _auctions[auctionIndex] = updatedAuction;
      }
      
      // Refresh all auctions to ensure everything is up-to-date
      fetchAuctions(forceRefresh: true);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error placing bid: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<List<Bid>> getAuctionBids(String auctionId, {bool forceRefresh = false}) async {
    try {
      // Check cache first
      final cacheKey = 'auction_bids_$auctionId';
      
      // Skip cache if force refresh requested
      if (!forceRefresh) {
        try {
          final prefs = await SharedPreferences.getInstance();
          final cachedData = prefs.getString(cacheKey);
          
          if (cachedData != null) {
            final map = jsonDecode(cachedData);
            final timestamp = DateTime.parse(map['timestamp']);
            final now = DateTime.now();
            
            // Use cache if it's fresh (less than 1 minute old)
            if (now.difference(timestamp) < const Duration(minutes: 1)) {
              final List<dynamic> bidsData = map['data'];
              return bidsData.map<Bid>((json) => Bid.fromJson(json)).toList();
            }
          }
        } catch (e) {
          debugPrint('Error accessing bid cache: $e');
        }
      }
      
      // Fetch fresh data
      final response = await _supabase
          .from('bids')
          .select('''
            *,
            profiles (
              id,
              full_name
            )
          ''')
          .eq('auction_id', auctionId)
          .order('amount', ascending: false);
      
      final bids = response.map<Bid>((json) => Bid.fromJson(json)).toList();
      
      // Cache the results
      try {
        final prefs = await SharedPreferences.getInstance();
        final cacheData = {
          'timestamp': DateTime.now().toIso8601String(),
          'data': response,
        };
        await prefs.setString(cacheKey, jsonEncode(cacheData));
      } catch (e) {
        debugPrint('Error saving bids to cache: $e');
      }
      
      return bids;
    } catch (e) {
      debugPrint('Error fetching auction bids: $e');
      return [];
    }
  }
  
  Stream<Auction> subscribeToAuction(String auctionId) {
    return _supabase
      .from('auctions')
      .stream(primaryKey: ['id'])
      .eq('id', auctionId)
      .asyncMap((data) async {
        if (data.isEmpty) return null;
        
        // Fetch complete auction data with land listing
        final response = await _supabase
          .from('auctions')
          .select('*, land_listings(*)')
          .eq('id', auctionId)
          .single();
          
        // Get the latest bid for this auction to ensure price is up-to-date
        final latestBidResponse = await _supabase
          .from('bids')
          .select('amount')
          .eq('auction_id', auctionId)
          .order('amount', ascending: false)
          .limit(1)
          .maybeSingle();
          
        // Create the auction from the response
        Auction auction = Auction.fromJson(response);
        
        // Update the finalPrice if the latest bid is higher than the stored finalPrice
        if (latestBidResponse != null) {
          final latestBidAmount = (latestBidResponse['amount'] as num).toDouble();
          if (auction.finalPrice == null || latestBidAmount > auction.finalPrice!) {
            // Update the auction in Supabase
            await _supabase
              .from('auctions')
              .update({'final_price': latestBidAmount})
              .eq('id', auctionId);
            
            // Return an updated auction object with the correct finalPrice
            auction = auction.copyWith(finalPrice: latestBidAmount);
          }
        }
        
        return auction;
      })
      .where((auction) => auction != null)
      .cast<Auction>()
      .asBroadcastStream();
  }
  
  Stream<List<Bid>> subscribeToAuctionBids(String auctionId) {
    debugPrint('Subscribing to bids for auction $auctionId');
    
    // Cancel existing subscriptions
    _bidSubscription?.cancel();
    _bidStreamController?.close();
    
    // Create a new StreamController
    _bidStreamController = StreamController<List<Bid>>.broadcast(
      onListen: () {
        debugPrint('Stream has a listener');
        // Initial fetch of bids
        _supabase
            .from('bids')
            .select('*, profiles:bidder_id(*)')
            .eq('auction_id', auctionId)
            .order('created_at', ascending: false)
            .then((response) {
              debugPrint('Initial bids fetched: ${response.length} bids');
              if (!_bidStreamController!.isClosed) {
                final bids = (response as List<dynamic>)
                    .map((bid) => Bid.fromJson(bid))
                    .toList();
                _bids = bids;
                _bidStreamController!.add(bids);
                notifyListeners();
              }
            })
            .catchError((error) {
              debugPrint('Error fetching initial bids: $error');
              if (!_bidStreamController!.isClosed) {
                _bidStreamController!.addError(error);
              }
            });

        // Subscribe to real-time changes
        _bidSubscription = _supabase
            .from('bids')
            .stream(primaryKey: ['id'])
            .eq('auction_id', auctionId)
            .order('created_at', ascending: false)
            .listen(
              (data) {
                debugPrint('Received bid stream event with ${data.length} bids');
                if (!_bidStreamController!.isClosed) {
                  final bids = data.map((json) => Bid.fromJson(json)).toList();
                  _bids = bids;
                  _bidStreamController!.add(bids);
                  notifyListeners();
                }
              },
              onError: (error) {
                debugPrint('Error in bid stream: $error');
                if (!_bidStreamController!.isClosed) {
                  _bidStreamController!.addError(error);
                }
              },
            );
      },
      onCancel: () {
        debugPrint('Stream listener cancelled');
        _bidSubscription?.cancel();
        _bidStreamController?.close();
      },
    );
    
    return _bidStreamController!.stream;
  }

  List<Bid> get bids => [..._bids];
  
  // Method to fetch user's bids
  Future<List<Bid>> fetchUserBids({bool forceRefresh = false}) async {
    if (_authService.currentUser == null) return [];
    
    try {
      // Check cache first
      final cacheKey = 'user_bids_${_authService.currentUser!.id}';
      
      // Skip cache if force refresh requested
      if (!forceRefresh) {
        try {
          final prefs = await SharedPreferences.getInstance();
          final cachedData = prefs.getString(cacheKey);
          
          if (cachedData != null) {
            final map = jsonDecode(cachedData);
            final timestamp = DateTime.parse(map['timestamp']);
            final now = DateTime.now();
            
            // Use cache if it's fresh (less than 2 minutes old)
            if (now.difference(timestamp) < const Duration(minutes: 2)) {
              final List<dynamic> bidsData = map['data'];
              return bidsData.map<Bid>((json) => Bid.fromJson(json)).toList();
            }
          }
        } catch (e) {
          debugPrint('Error accessing user bids cache: $e');
        }
      }
      
      // Fetch fresh user's bids with auction details
      final response = await _supabase
          .from('bids')
          .select('''
            *,
            auctions (
              id, 
              title, 
              location, 
              status, 
              start_time, 
              end_time,
              start_price,
              final_price,
              images
            )
          ''')
          .eq('bidder_id', _authService.currentUser!.id)
          .order('created_at', ascending: false);
      
      debugPrint('Fetched user bids: ${response.length}');
      
      final List<Bid> userBids = [];
      for (var bidData in response) {
        try {
          final bid = Bid.fromJson(bidData);
          userBids.add(bid);
        } catch (e) {
          debugPrint('Error parsing bid: $e');
        }
      }
      
      // Cache the results
      try {
        final prefs = await SharedPreferences.getInstance();
        final cacheData = {
          'timestamp': DateTime.now().toIso8601String(),
          'data': response,
        };
        await prefs.setString(cacheKey, jsonEncode(cacheData));
      } catch (e) {
        debugPrint('Error saving user bids to cache: $e');
      }
      
      return userBids;
    } catch (e) {
      debugPrint('Error fetching user bids: $e');
      return [];
    }
  }

  // Load auctions from cache
  Future<void> loadFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString(_cacheKey);
      
      if (cachedData != null) {
        final Map<String, dynamic> cacheMap = jsonDecode(cachedData);
        final timestamp = DateTime.parse(cacheMap['timestamp']);
        final now = DateTime.now();
        
        // Use cache if it's fresh enough
        if (now.difference(timestamp) < _cacheDuration) {
          // Handle potential type inconsistencies in the cached data
          if (cacheMap.containsKey('data')) {
            final dynamic dataObject = cacheMap['data'];
            
            // If data is a Map and it contains our expected keys
            if (dataObject is Map<String, dynamic>) {
              debugPrint('Cache data is a Map structure');
              final Map<String, dynamic> dataMap = dataObject;
              
              // Process the 'all' auctions list if it exists
              if (dataMap.containsKey('all') && dataMap['all'] is List) {
                final List<dynamic> allData = dataMap['all'] as List<dynamic>;
                _auctions = allData
                    .map((json) => Auction.fromJson(json as Map<String, dynamic>))
                    .toList();
              }
              
              // Process the 'active' auctions list
              if (dataMap.containsKey('active') && dataMap['active'] is List) {
                final List<dynamic> activeData = dataMap['active'] as List<dynamic>;
                _activeAuctions = activeData
                    .map((json) => Auction.fromJson(json as Map<String, dynamic>))
                    .toList();
              }
              
              // Process the 'upcoming' auctions list
              if (dataMap.containsKey('upcoming') && dataMap['upcoming'] is List) {
                final List<dynamic> upcomingData = dataMap['upcoming'] as List<dynamic>;
                _upcomingAuctions = upcomingData
                    .map((json) => Auction.fromJson(json as Map<String, dynamic>))
                    .toList();
              }
              
              // Process the 'past' auctions list
              if (dataMap.containsKey('past') && dataMap['past'] is List) {
                final List<dynamic> pastData = dataMap['past'] as List<dynamic>;
                _pastAuctions = pastData
                    .map((json) => Auction.fromJson(json as Map<String, dynamic>))
                    .toList();
              }
            } 
            // If data is a List (older cache format)
            else if (dataObject is List) {
              debugPrint('Cache data is a List structure - older format');
              final List<dynamic> dataList = dataObject;
              
              // Create auction objects from the list
              _auctions = dataList
                  .map((json) => Auction.fromJson(json as Map<String, dynamic>))
                  .toList();
                  
              // Reset other lists to empty since we don't have categorized data
              _activeAuctions = [];
              _upcomingAuctions = [];
              _pastAuctions = [];
              
              // Filter auctions into the appropriate categories
              final now = DateTime.now();
              
              for (final auction in _auctions) {
                if (auction.isActive) {
                  _activeAuctions.add(auction);
                } else if (auction.startTime.isAfter(now)) {
                  _upcomingAuctions.add(auction);
                } else {
                  _pastAuctions.add(auction);
                }
              }
            }
            else {
              debugPrint('Unexpected data format in cache: ${dataObject.runtimeType}');
            }
          }
                
          _lastFetchTime = timestamp;
          notifyListeners();
          debugPrint('Loaded auctions from cache: ${_auctions.length} total, ${_activeAuctions.length} active');
        } else {
          debugPrint('Cache expired, will fetch fresh data');
        }
      }
    } catch (e) {
      debugPrint('Error loading from cache: $e');
    }
  }

  // Add a method to complete an auction and set the winner
  Future<bool> completeAuction(String auctionId) async {
    try {
      debugPrint('Attempting to complete auction: $auctionId');
      
      // Call the Supabase RPC function to complete the auction
      final response = await _supabase.rpc(
        'complete_specific_auction',
        params: {'auction_id': auctionId},
      );
      
      if (response == true) {
        debugPrint('Successfully completed auction: $auctionId');
        
        // Force refresh the auction data
        await fetchAuctions(forceRefresh: true);
        
        // Return success
        return true;
      } else {
        debugPrint('Failed to complete auction: $auctionId, response: $response');
        return false;
      }
    } catch (e) {
      debugPrint('Error completing auction: $e');
      return false;
    }
  }

  // Offers related methods
  
  // Fetch offers for a specific auction
  Future<List<Offer>> getAuctionOffers(String auctionId) async {
    try {
      final response = await _supabase
          .from('offers')
          .select()
          .eq('auction_id', auctionId)
          .order('created_at', ascending: false);
      
      return (response as List).map((data) => Offer.fromJson(data)).toList();
    } catch (e) {
      debugPrint('Error fetching offers: $e');
      return [];
    }
  }
  
  // Fetch user's offers for a specific auction
  Future<List<Offer>> getUserOffersForAuction(String auctionId, String userId) async {
    try {
      final response = await _supabase
          .from('offers')
          .select()
          .eq('auction_id', auctionId)
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      
      return (response as List).map((data) => Offer.fromJson(data)).toList();
    } catch (e) {
      debugPrint('Error fetching user offers: $e');
      return [];
    }
  }
  
  // Submit an offer for a negotiable listing
  Future<Map<String, dynamic>> submitOffer(String auctionId, double amount) async {
    try {
      // First check if user is authenticated
      final user = _supabase.auth.currentUser;
      if (user == null) {
        return {
          'success': false,
          'error': 'Teklif vermek için giriş yapmalısınız.'
        };
      }
      
      // Get the auction to verify it's an offer-type listing
      final auction = getAuctionById(auctionId);
      if (auction == null) {
        return {
          'success': false,
          'error': 'İlan bulunamadı.'
        };
      }
      
      if (auction.listingType != ListingType.offer) {
        return {
          'success': false,
          'error': 'Bu ilan pazarlık tipinde değil.'
        };
      }
      
      // Check if the user already has a pending or accepted offer
      final existingOffers = await getUserOffersForAuction(auctionId, user.id);
      final activeOffer = existingOffers.where(
        (o) => o.status == OfferStatus.pending || o.status == OfferStatus.accepted
      ).toList();
      
      if (activeOffer.isNotEmpty) {
        return {
          'success': false,
          'error': 'Zaten aktif bir teklifiniz bulunmaktadır.'
        };
      }
      
      // Create the offer
      final response = await _supabase
          .from('offers')
          .insert({
            'auction_id': auctionId,
            'user_id': user.id,
            'amount': amount,
            'status': OfferStatus.pending.value,
          })
          .select()
          .single();
          
      return {
        'success': true,
        'offer': Offer.fromJson(response)
      };
    } catch (e) {
      debugPrint('Error submitting offer: $e');
      return {
        'success': false,
        'error': e.toString()
      };
    }
  }
  
  // Withdraw an offer
  Future<Map<String, dynamic>> withdrawOffer(String offerId) async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) {
        return {
          'success': false,
          'error': 'Bu işlemi gerçekleştirmek için giriş yapmalısınız.'
        };
      }
      
      final response = await _supabase
          .from('offers')
          .update({
            'status': OfferStatus.withdrawn.value,
            'updated_at': DateTime.now().toIso8601String()
          })
          .eq('id', offerId)
          .eq('user_id', user.id)
          .select()
          .single();
          
      return {
        'success': true,
        'offer': Offer.fromJson(response)
      };
    } catch (e) {
      debugPrint('Error withdrawing offer: $e');
      return {
        'success': false,
        'error': e.toString()
      };
    }
  }
  
  // Create a stream of offers for an auction
  Stream<List<Offer>> streamAuctionOffers(String auctionId) {
    final controller = StreamController<List<Offer>>();
    
    // Initial fetch
    getAuctionOffers(auctionId).then((offers) {
      if (!controller.isClosed) {
        controller.add(offers);
      }
    });
    
    // Set up subscription
    final subscription = _supabase
        .from('offers')
        .stream(primaryKey: ['id'])
        .eq('auction_id', auctionId)
        .listen((data) {
          final offers = data.map((item) => Offer.fromJson(item)).toList();
          if (!controller.isClosed) {
            controller.add(offers);
          }
        });
    
    // Clean up when stream is cancelled
    controller.onCancel = () {
      subscription.cancel();
      controller.close();
    };
    
    return controller.stream;
  }
  
  // Stream only the user's offers for an auction
  Stream<List<Offer>> streamUserOffersForAuction(String auctionId) {
    final controller = StreamController<List<Offer>>();
    final user = _supabase.auth.currentUser;
    
    if (user == null) {
      controller.add([]);
      controller.close();
      return controller.stream;
    }
    
    // Initial fetch
    getUserOffersForAuction(auctionId, user.id).then((offers) {
      if (!controller.isClosed) {
        controller.add(offers);
      }
    });
    
    // Instead of using real-time subscription with multiple filters,
    // set up a timer to poll for updates every few seconds
    final timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (controller.isClosed) return;
      
      getUserOffersForAuction(auctionId, user.id).then((offers) {
        if (!controller.isClosed) {
          controller.add(offers);
        }
      });
    });
    
    // Clean up when stream is cancelled
    controller.onCancel = () {
      timer.cancel();
      controller.close();
    };
    
    return controller.stream;
  }
} 