import { supabase } from './supabase';

/**
 * SMS Notification Service
 * Handles sending SMS notifications for auction-related events
 */

/**
 * Send SMS notification when a new bid outbids other users in an auction
 * @param {Object} params - Notification parameters
 * @param {string} params.auctionId - The auction ID
 * @param {number} params.newBidAmount - The new bid amount
 * @param {string} params.newBidUserId - The user ID who made the new bid
 * @returns {Promise<Object>} Result of SMS sending operation
 */
export const sendNewBidNotification = async ({ auctionId, newBidAmount, newBidUserId }) => {
  try {
    console.log('[SMS Service] Sending new bid notifications for auction:', auctionId);
    
    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('title, id')
      .eq('id', auctionId)
      .single();
    
    if (auctionError) {
      throw new Error(`Failed to fetch auction: ${auctionError.message}`);
    }
    
    // Get all users who have made bids on this auction (excluding the user who just made the bid)
    // Get users who have been outbid (their bid amount is less than the new bid)
    const { data: outbidUsers, error: bidsError } = await supabase
      .from('bids')
      .select(`
        bidder_id,
        amount,
        profiles!inner(
          full_name,
          phone_number
        ),
        user_settings!left(
          sms_notifications
        )
      `)
      .eq('auction_id', auctionId)
      .neq('bidder_id', newBidUserId)
      .lt('amount', newBidAmount);
    
    if (bidsError) {
      throw new Error(`Failed to fetch existing bids: ${bidsError.message}`);
    }
    
    if (!outbidUsers || outbidUsers.length === 0) {
      console.log('[SMS Service] No users outbid to notify');
      return { success: true, message: 'No users to notify' };
    }
    
    // Remove duplicate users (in case they have multiple bids)
    const uniqueUsers = outbidUsers.reduce((acc, bid) => {
      if (!acc.find(u => u.bidder_id === bid.bidder_id)) {
        acc.push(bid);
      }
      return acc;
    }, []);
    
    // Format price for display
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price || 0) + ' TL';
    };
    
    // Send SMS to each outbid user
    const notificationPromises = uniqueUsers.map(async (bid) => {
      const { profiles: userProfile, user_settings } = bid;
      
      // Check if user has SMS notifications enabled (default to true if no settings)
      const smsEnabled = !user_settings || user_settings.sms_notifications !== false;
      if (!smsEnabled) {
        console.log(`[SMS Service] SMS notifications disabled for user ${bid.bidder_id}`);
        return { success: true, skipped: true, reason: 'SMS notifications disabled' };
      }
      
      if (!userProfile.phone_number) {
        console.log(`[SMS Service] No phone number for user ${bid.bidder_id}`);
        return { success: false, error: 'No phone number' };
      }
      
      // Construct the SMS message for outbid notification
      const message = `Sayın ${userProfile.full_name},

arazialcom üzerindeki ${auction.title || `İlan Numarası: ${auction.id}`} ihalesi için verdiğiniz teklif geçilmiştir.

Yeni en yüksek teklif: ${formatPrice(newBidAmount)}
Sizin teklifiniz: ${formatPrice(bid.amount)}

Yeni teklif vermek için: https://www.arazialcom.net/auctions/${auction.id}`;
      
      // Send SMS via Supabase Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('send-notification-sms', {
          body: {
            phoneNumber: userProfile.phone_number,
            message: message,
            type: 'outbid_notification'
          }
        });
        
        if (error) {
          console.error(`[SMS Service] Failed to send SMS to ${userProfile.phone_number}:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`[SMS Service] Outbid SMS sent successfully to ${userProfile.phone_number}`);
        return { success: true, data };
        
      } catch (error) {
        console.error(`[SMS Service] Exception sending SMS to ${userProfile.phone_number}:`, error);
        return { success: false, error: error.message };
      }
    });
    
    // Wait for all SMS sending operations to complete
    const results = await Promise.all(notificationPromises);
    
    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`[SMS Service] Outbid notification summary: ${successCount} sent, ${failureCount} failed`);
    
    return {
      success: true,
      message: `Outbid SMS notifications sent to ${successCount} users`,
      details: {
        totalSent: successCount,
        totalFailed: failureCount,
        results: results
      }
    };
    
  } catch (error) {
    console.error('[SMS Service] Error in sendNewBidNotification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send SMS notification when a new offer is received on a property
 * @param {Object} params - Notification parameters
 * @param {string} params.auctionId - The auction/property ID
 * @param {number} params.newOfferAmount - The new offer amount
 * @param {string} params.newOfferUserId - The user ID who made the new offer
 * @returns {Promise<Object>} Result of SMS sending operation
 */
export const sendNewOfferNotification = async ({ auctionId, newOfferAmount, newOfferUserId }) => {
  try {
    console.log('[SMS Service] Sending new offer notifications for auction:', auctionId);
    
    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('title, id')
      .eq('id', auctionId)
      .single();
    
    if (auctionError) {
      throw new Error(`Failed to fetch auction: ${auctionError.message}`);
    }
    
    // Get all users who have made offers on this property (excluding the user who just made the offer)
    // Also get their notification preferences
    const { data: existingOffers, error: offersError } = await supabase
      .from('offers')
      .select(`
        user_id,
        amount,
        profiles!inner(
          full_name,
          phone_number
        ),
        user_settings!left(
          sms_notifications
        )
      `)
      .eq('auction_id', auctionId)
      .neq('user_id', newOfferUserId)
      .in('status', ['pending', 'accepted']);
    
    if (offersError) {
      throw new Error(`Failed to fetch existing offers: ${offersError.message}`);
    }
    
    if (!existingOffers || existingOffers.length === 0) {
      console.log('[SMS Service] No existing offers to notify');
      return { success: true, message: 'No users to notify' };
    }
    
    // Format price for display
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price || 0) + ' TL';
    };
    
    // Send SMS to each user with existing offers
    const notificationPromises = existingOffers.map(async (offer) => {
      const { profiles: userProfile, user_settings } = offer;
      
      // Check if user has SMS notifications enabled (default to true if no settings)
      const smsEnabled = !user_settings || user_settings.sms_notifications !== false;
      if (!smsEnabled) {
        console.log(`[SMS Service] SMS notifications disabled for user ${offer.user_id}`);
        return { success: true, skipped: true, reason: 'SMS notifications disabled' };
      }
      
      if (!userProfile.phone_number) {
        console.log(`[SMS Service] No phone number for user ${offer.user_id}`);
        return { success: false, error: 'No phone number' };
      }
      
      // Construct the SMS message
      const message = `Sayın ${userProfile.full_name},

arazialcom üzerinden teklif verdiğiniz ${auction.title || `İlan Numarası: ${auction.id}`} için yeni bir teklif alınmıştır.
Son teklif: ${formatPrice(newOfferAmount)}.
Sizin mevcut teklifiniz: ${formatPrice(offer.amount)}.

Teklifinizi güncellemek için: https://www.arazialcom.net`;
      
      // Send SMS via Supabase Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('send-notification-sms', {
          body: {
            phoneNumber: userProfile.phone_number,
            message: message,
            type: 'new_offer_notification'
          }
        });
        
        if (error) {
          console.error(`[SMS Service] Failed to send SMS to ${userProfile.phone_number}:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`[SMS Service] SMS sent successfully to ${userProfile.phone_number}`);
        return { success: true, data };
        
      } catch (error) {
        console.error(`[SMS Service] Exception sending SMS to ${userProfile.phone_number}:`, error);
        return { success: false, error: error.message };
      }
    });
    
    // Wait for all SMS sending operations to complete
    const results = await Promise.all(notificationPromises);
    
    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`[SMS Service] Notification summary: ${successCount} sent, ${failureCount} failed`);
    
    return {
      success: true,
      message: `SMS notifications sent to ${successCount} users`,
      details: {
        totalSent: successCount,
        totalFailed: failureCount,
        results: results
      }
    };
    
  } catch (error) {
    console.error('[SMS Service] Error in sendNewOfferNotification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user has SMS notifications enabled
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Whether SMS notifications are enabled
 */
export const checkSMSNotificationEnabled = async (userId) => {
  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('sms_notifications')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no settings found, default to enabled
      console.log(`[SMS Service] No settings found for user ${userId}, defaulting to enabled`);
      return true;
    }
    
    return settings.sms_notifications !== false;
    
  } catch (error) {
    console.error('[SMS Service] Error checking SMS notification settings:', error);
    // Default to enabled if we can't check
    return true;
  }
};

/**
 * Send SMS notification for offer status updates (accepted/rejected)
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID who made the offer
 * @param {string} params.auctionTitle - Property/auction title
 * @param {string} params.status - New status ('accepted' or 'rejected')
 * @param {number} params.offerAmount - The offer amount
 * @returns {Promise<Object>} Result of SMS sending operation
 */
export const sendOfferStatusNotification = async ({ userId, auctionTitle, status, offerAmount }) => {
  try {
    // Check if user has SMS notifications enabled
    const smsEnabled = await checkSMSNotificationEnabled(userId);
    if (!smsEnabled) {
      console.log(`[SMS Service] SMS notifications disabled for user ${userId}`);
      return { success: true, message: 'SMS notifications disabled for user' };
    }
    
    // Get user details
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile.phone_number) {
      throw new Error('User not found or no phone number');
    }
    
    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price || 0) + ' TL';
    };
    
    // Construct message based on status
    const statusText = status === 'accepted' ? 'kabul edilmiştir' : 'reddedilmiştir';
    const message = `Sayın ${userProfile.full_name},

arazialcom üzerinden ${auctionTitle} için verdiğiniz ${formatPrice(offerAmount)} tutarındaki teklifiniz ${statusText}.

Detaylar için uygulamayı ziyaret edin.`;
    
    // Send SMS
    const { data, error } = await supabase.functions.invoke('send-notification-sms', {
      body: {
        phoneNumber: userProfile.phone_number,
        message: message,
        type: 'offer_status_notification'
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`[SMS Service] Offer status notification sent to ${userProfile.phone_number}`);
    return { success: true, data };
    
  } catch (error) {
    console.error('[SMS Service] Error in sendOfferStatusNotification:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendNewBidNotification,
  sendNewOfferNotification,
  sendOfferStatusNotification,
  checkSMSNotificationEnabled
};