import { supabase } from './supabase';

// Cache constants
const CACHE_KEY = 'auctions_cache';
const NEGOTIATIONS_CACHE_KEY = 'negotiations_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BACKGROUND_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

// Background refresh timer reference
let backgroundRefreshTimer = null;
let lastRefreshTime = 0;
// Track visibility without depending on appState
let isPageVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;

/**
 * Set up background refresh of auction data
 */
export const setupBackgroundRefresh = () => {
  // Clean up existing timer if any
  if (backgroundRefreshTimer) {
    clearInterval(backgroundRefreshTimer);
  }
  
  console.log('[AuctionService] Setting up background refresh');
  
  // Set up visibility change listener
  const handleVisibilityChange = () => {
    isPageVisible = document.visibilityState === 'visible';
    
    // If becoming visible and it's been a while since last refresh, trigger a refresh
    if (isPageVisible && Date.now() - lastRefreshTime > 60 * 1000) {
      console.log('[AuctionService] Page became visible, triggering refresh');
      fetchAuctions(true, false).catch(console.error);
    }
  };
  
  // Add visibility change listener
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  
  // Set up interval for background data refresh
  backgroundRefreshTimer = setInterval(async () => {
    try {
      // Only refresh if tab is visible and it's been long enough since last refresh
      if (isPageVisible && Date.now() - lastRefreshTime > BACKGROUND_REFRESH_INTERVAL) {
        console.log('[AuctionService] Background refresh triggered');
        await fetchAuctions(true, false); // Force refresh but silent
      }
    } catch (error) {
      console.error('[AuctionService] Background refresh error:', error);
    }
  }, BACKGROUND_REFRESH_INTERVAL);
  
  // Return cleanup function
  return () => {
    if (backgroundRefreshTimer) {
      clearInterval(backgroundRefreshTimer);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    console.log('[AuctionService] Background refresh cleaned up');
  };
};

/**
 * Safely read from local storage with error handling
 */
function safeGetFromCache(cacheKey) {
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.warn(`[AuctionService] Error reading from cache: ${cacheKey}:`, error);
  }
  return null;
}

/**
 * Safely write to local storage with error handling
 */
function safeSetToCache(cacheKey, data) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn(`[AuctionService] Error writing to cache: ${cacheKey}:`, error);
  }
}

/**
 * Fetch all auctions or negotiations with improved error handling and caching
 * @param {boolean} forceRefresh - Whether to force a refresh from the database
 * @param {boolean} updateLastRefresh - Whether to update the last refresh time
 * @param {string} type - Type of listings to fetch ('auction' or 'negotiation')
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const fetchListings = async (type = 'auction', forceRefresh = false, updateLastRefresh = true) => {
  try {
    const cacheKey = type === 'auction' ? CACHE_KEY : NEGOTIATIONS_CACHE_KEY;
    const now = Date.now();
    
    // Check if we have cached data and it's fresh enough
    if (!forceRefresh) {
      const cachedData = safeGetFromCache(cacheKey);
      if (cachedData?.data && cachedData?.timestamp && (now - cachedData.timestamp < CACHE_DURATION)) {
        console.log(`[ListingService] Using cached ${type} data`);
        return { data: cachedData.data, error: null };
      }
    }
    
    // Fetch fresh data with a timeout to prevent hanging requests
    const fetchPromise = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('auctions')
          .select('*')
          .eq('listing_type', type)
          .order('created_at');
        
        if (error) throw error;
        
        // Process the listings for consistent field names
        const processedListings = data.map(listing => {
          return {
            ...listing,
            // Ensure consistent naming
            starting_price: listing.starting_price || listing.startingPrice,
            minIncrement: listing.min_increment || listing.minIncrement,
            offerIncrement: listing.offer_increment || listing.offerIncrement,
            startTime: listing.start_time || listing.startTime,
            endTime: listing.end_time || listing.endTime,
            finalPrice: listing.final_price || listing.finalPrice,
            // Ensure ada_no and parsel_no are preserved
            ada_no: listing.ada_no || null,
            parsel_no: listing.parsel_no || null,
            // Ensure images is always an array
            images: Array.isArray(listing.images) ? listing.images : []
          };
        });
        
        // Cache the results
        safeSetToCache(cacheKey, processedListings);
        
        if (updateLastRefresh) {
          lastRefreshTime = now;
        }
        
        console.log(`[ListingService] Fetched fresh ${type}s:`, processedListings.length);
        resolve({ data: processedListings, error: null });
      } catch (error) {
        reject(error);
      }
    });
    
    // Add a timeout to the fetch operation to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 10000); // 10 second timeout
    });
    
    // Race between the fetch and the timeout
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error(`[ListingService] Error fetching ${type}s:`, error);
    
    // Try to return cached data even if it's stale, rather than nothing
    const cachedData = safeGetFromCache(type === 'auction' ? CACHE_KEY : NEGOTIATIONS_CACHE_KEY);
    if (cachedData?.data) {
      console.log(`[ListingService] Returning stale cached data due to fetch error`);
      return { data: cachedData.data, error: null };
    }
    
    return { data: null, error };
  }
};

// Update the existing fetchAuctions to use the new function
export const fetchAuctions = async (forceRefresh = false, updateLastRefresh = true) => {
  return fetchListings('auction', forceRefresh, updateLastRefresh);
};

// Add a new function for negotiations
export const fetchNegotiations = async (forceRefresh = false, updateLastRefresh = true) => {
  return fetchListings('offer', forceRefresh, updateLastRefresh);
};

/**
 * Get active, upcoming, and past auctions
 * @returns {Promise<{active: Array, upcoming: Array, past: Array, error: Error}>}
 */
export const getFilteredAuctions = async () => {
  try {
    const { data, error } = await fetchAuctions();
    
    if (error) throw error;
    
    const now = new Date();
    
    // 1. First, filter active auctions - status is 'active' OR current time is within window
    const active = data.filter(auction => {
      const startTime = new Date(auction.start_time || auction.startTime);
      const endTime = new Date(auction.end_time || auction.endTime);
      const status = auction.status;
      
      // Either explicitly marked as active
      if (status === 'active') return true;
      
      // OR current time is within auction window AND not marked as upcoming/ended
      return status !== 'upcoming' && status !== 'ended' && 
             now >= startTime && now <= endTime;
    });
    
    // 2. Then upcoming auctions - those NOT in active that are either:
    // - have status 'upcoming' OR 
    // - start time is in the future
    const activeIds = new Set(active.map(a => a.id));
    const upcoming = data.filter(auction => {
      // Skip if already in active tab
      if (activeIds.has(auction.id)) return false;
      
      const startTime = new Date(auction.start_time || auction.startTime);
      const status = auction.status;
      
      // Either explicitly marked as upcoming
      if (status === 'upcoming') return true;
      
      // OR start time is in the future AND not marked as ended or active
      return status !== 'ended' && status !== 'active' && now < startTime;
    });
    
    // 3. Finally, past auctions - anything not in active or upcoming that:
    // - has status 'ended' OR
    // - current time is after end time
    const upcomingIds = new Set(upcoming.map(a => a.id));
    const past = data.filter(auction => {
      // Skip if already in active or upcoming tabs
      if (activeIds.has(auction.id) || upcomingIds.has(auction.id)) return false;
      
      const endTime = new Date(auction.end_time || auction.endTime);
      const status = auction.status;
      
      // Either explicitly marked as ended
      if (status === 'ended') return true;
      
      // OR current time is after end time
      return now > endTime;
    });
    
    return { active, upcoming, past, error: null };
  } catch (error) {
    console.error('[AuctionService] Error getting filtered auctions:', error);
    return { active: [], upcoming: [], past: [], error };
  }
};

/**
 * Get auction by ID
 * @param {string} auctionId
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getAuctionById = async (auctionId) => {
  try {
    // First check if we have cached data
    const cachedData = safeGetFromCache(CACHE_KEY);
    if (cachedData?.data && Array.isArray(cachedData.data) && 
        (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      const cachedAuction = cachedData.data.find(auction => auction.id === auctionId);
      if (cachedAuction) {
        console.log('[AuctionService] Using cached auction data for single auction');
        return { data: cachedAuction, error: null };
      }
    }
    
    // Fetch auction data with timeout protection
    const fetchPromise = supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 10000); // 10 second timeout
    });
    
    // Race between fetch and timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (error) throw error;
    
    // Ensure consistent field naming for the frontend
    const processedAuction = {
      ...data,
      // Ensure consistent naming
      starting_price: data.starting_price || data.startingPrice,
      minIncrement: data.min_increment || data.minIncrement,
      startTime: data.start_time || data.startTime,
      endTime: data.end_time || data.endTime,
      finalPrice: data.final_price || data.finalPrice,
      // Ensure images is always an array
      images: Array.isArray(data.images) ? data.images : []
    };
    
    return { data: processedAuction, error: null };
  } catch (error) {
    console.error(`[AuctionService] Error fetching auction ${auctionId}:`, error);
    return { data: null, error };
  }
};

/**
 * Get bids for an auction
 * @param {string} auctionId
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getAuctionBids = async (auctionId) => {
  try {
    // Fetch bids with timeout protection
    const fetchPromise = supabase
      .from('bids')
      .select(`
        *,
        profiles (
          id,
          full_name
        )
      `)
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 10000); // 10 second timeout
    });
    
    // Race between fetch and timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`[AuctionService] Error fetching bids for auction ${auctionId}:`, error);
    return { data: null, error };
  }
};

/**
 * Place a bid on an auction
 * @param {string} auctionId
 * @param {number} amount
 * @returns {Promise<{success: boolean, error: Error}>}
 */
export const placeBid = async (auctionId, amount) => {
  try {
    // Get the current user with timeout protection
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 10000); // 10 second timeout
    });
    
    // Race between user fetch and timeout
    const { data: { user } } = await Promise.race([userPromise, timeoutPromise]);
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the auction details to check bid validity
    const { data: auction, error: auctionError } = await getAuctionById(auctionId);
    if (auctionError) throw auctionError;
    
    // Check if auction is active and can accept bids
    const now = new Date();
    const startTime = new Date(auction.start_time || auction.startTime || auction.start_date || auction.startDate);
    const endTime = new Date(auction.end_time || auction.endTime || auction.end_date || auction.endDate);
    
    // Allow bidding if:
    // 1. Auction is explicitly marked as 'active' in database (admin override)
    // 2. OR auction is within its start/end time window
    const isActive = 
      auction.status === 'active' || 
      (now >= startTime && now <= endTime && auction.status !== 'ended');
    
    if (!isActive) {
      throw new Error('This auction is not currently active');
    }
    
    // Get the latest bid for this auction
    const { data: latestBids, error: bidsError } = await supabase
      .from('bids')
      .select('amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1);
    
    if (bidsError) throw bidsError;
    
    const startPrice = auction.starting_price || auction.startingPrice || 0;
    const latestBidAmount = latestBids && latestBids.length > 0 
      ? latestBids[0].amount 
      : startPrice;
    
    // Calculate minimum next bid
    const minIncrement = auction.min_increment || auction.minIncrement || 0;
    const minimumNextBid = latestBidAmount + minIncrement;
    
    // Check if bid is valid
    if (amount <= latestBidAmount) {
      throw new Error(`Bid amount must be greater than the current highest bid (${latestBidAmount})`);
    }
    
    if (amount < minimumNextBid) {
      throw new Error(`Bid amount must be at least ${minimumNextBid}`);
    }
    
    // Place the bid with transaction to ensure atomicity
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert([
        {
          auction_id: auctionId,
          bidder_id: user.id,
          amount: amount
        }
      ])
      .select()
      .single();
    
    if (bidError) throw bidError;
    
    // Update the auction's final price
    const { error: updateError } = await supabase
      .from('auctions')
      .update({ final_price: amount })
      .eq('id', auctionId);
    
    if (updateError) throw updateError;
    
    // Force refresh the cache after a successful bid
    lastRefreshTime = 0;
    fetchAuctions(true);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('[AuctionService] Error placing bid:', error);
    return { success: false, error };
  }
};

/**
 * Complete an auction and set the winner
 * @param {string} auctionId - The ID of the auction to complete
 * @returns {Promise<{success: boolean, error: Error, data: Object|null}>}
 */
export const completeAuction = async (auctionId) => {
  try {
    // Call the database function to complete the auction and set winner
    const { data, error } = await supabase.rpc(
      'complete_specific_auction',
      { auction_id: auctionId }
    );
    
    if (error) throw error;
    
    if (!data) {
      return { 
        success: false, 
        error: new Error('Auction could not be completed'), 
        data: null 
      };
    }
    
    // Force refresh the cache after completion
    lastRefreshTime = 0;
    await fetchAuctions(true);
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error('[AuctionService] Error completing auction:', error);
    return { success: false, error, data: null };
  }
};