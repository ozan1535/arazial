import { supabase } from './supabase';

/**
 * Check if a user has a completed deposit for a specific auction
 * @param {string} auctionId - The auction ID
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - True if user has completed deposit, false otherwise
 */
export const hasUserCompletedDeposit = async (auctionId, userId) => {
  if (!auctionId || !userId) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('id, status')
      .eq('auction_id', auctionId)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking deposit status:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error in hasUserCompletedDeposit:', err);
    return false;
  }
};

/**
 * Get user's deposit record for a specific auction
 * @param {string} auctionId - The auction ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - Deposit record or null if not found
 */
export const getUserDeposit = async (auctionId, userId) => {
  if (!auctionId || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('auction_id', auctionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting user deposit:', error);
      return null;
    }

    // Return the first item if it exists, otherwise null
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in getUserDeposit:', err);
    return null;
  }
};

/**
 * Check if a user has any deposit (pending or completed) for a specific auction
 * @param {string} auctionId - The auction ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - Deposit record or null if not found
 */
export const getUserDepositAnyStatus = async (auctionId, userId) => {
  if (!auctionId || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('auction_id', auctionId)
      .eq('user_id', userId)
      .in('status', ['pending', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting user deposit any status:', error);
      return null;
    }

    // Return the first item if it exists, otherwise null
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in getUserDepositAnyStatus:', err);
    return null;
  }
};

/**
 * Update deposit status using the Edge Function
 * @param {string} paymentId - The payment ID
 * @param {string} status - The new status ('pending', 'completed', 'failed', 'refunded')
 * @returns {Promise<Object>} - Response from Edge Function
 */
export const updateDepositStatus = async (paymentId, status) => {
  if (!paymentId || !status) {
    const safeError = new Error();
    safeError.message = 'Payment ID and status are required';
    throw safeError;
  }

  try {
    const { data, error } = await supabase.functions.invoke('update-deposit-status', {
      body: {
        payment_id: paymentId,
        status: status
      }
    });

    if (error) {
      let errorMessage = 'Failed to update deposit status: Unknown error';
      try {
        if (error && error.message && typeof error.message === 'string') {
          errorMessage = 'Failed to update deposit status: ' + error.message;
        }
      } catch (e) {
        console.error('Error processing error message:', e);
      }
      
      const safeError = new Error();
      safeError.message = errorMessage;
      throw safeError;
    }

    return data;
  } catch (err) {
    console.error('Error in updateDepositStatus:', err);
    throw err;
  }
};

/**
 * Create a new deposit record or reuse an existing pending one
 * @param {Object} depositData - The deposit data
 * @param {string} depositData.auction_id - The auction ID
 * @param {string} depositData.user_id - The user ID
 * @param {number} depositData.amount - The deposit amount
 * @param {string} depositData.payment_id - The payment ID
 * @returns {Promise<Object>} - Created or updated deposit record
 */
export const createDeposit = async (depositData) => {
  try {
    // First check if there's already a pending or completed deposit
    const existingDeposit = await getUserDepositAnyStatus(depositData.auction_id, depositData.user_id);
    
    if (existingDeposit) {
      if (existingDeposit.status === 'completed') {
        const safeError = new Error();
        safeError.message = 'Bu ilan için depozito ödemesi zaten tamamlanmış.';
        throw safeError;
      } else if (existingDeposit.status === 'pending') {
        // Mark the existing pending deposit as failed so we can create a new one
        // This works around the RLS policy that prevents direct updates from client
        try {
          await supabase.functions.invoke('update-deposit-status', {
            body: {
              payment_id: existingDeposit.payment_id,
              status: 'failed'
            }
          });
          console.log('Marked old pending deposit as failed:', existingDeposit.id);
        } catch (updateError) {
          console.error('Could not mark old deposit as failed:', updateError);
          
          // Create a safe error message without template literals
          let safeErrorMessage = 'Mevcut depozito kaydı güncellenemiyor. Lütfen sayfayı yenileyin ve tekrar deneyin.';
          
          const safeError = new Error();
          safeError.message = safeErrorMessage;
          throw safeError;
        }
      }
    }

    // Create a new deposit record
    const { data, error } = await supabase
      .from('deposits')
      .insert({
        ...depositData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - there's still an active deposit
        const safeError = new Error();
        safeError.message = 'Bu ilan için zaten aktif bir depozito kaydınız var. Lütfen sayfayı yenileyin.';
        throw safeError;
      }
      
      let errorMessage = 'Failed to create deposit: Unknown error';
      try {
        if (error && error.message && typeof error.message === 'string') {
          errorMessage = 'Failed to create deposit: ' + error.message;
        }
      } catch (e) {
        console.error('Error processing error message:', e);
      }
      
      const safeError = new Error();
      safeError.message = errorMessage;
      throw safeError;
    }

    return data;
  } catch (err) {
    console.error('Error in createDeposit:', err);
    throw err;
  }
};

/**
 * Get the current deposit status for UI display
 * @param {string} auctionId - The auction ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Object with hasCompleted, hasPending, and deposit data
 */
export const getDepositStatus = async (auctionId, userId) => {
  if (!auctionId || !userId) {
    return { hasCompleted: false, hasPending: false, deposit: null };
  }

  try {
    const deposit = await getUserDepositAnyStatus(auctionId, userId);
    
    return {
      hasCompleted: deposit?.status === 'completed',
      hasPending: deposit?.status === 'pending',
      deposit: deposit
    };
  } catch (err) {
    console.error('Error in getDepositStatus:', err);
    return { hasCompleted: false, hasPending: false, deposit: null };
  }
}; 