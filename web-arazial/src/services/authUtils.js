/**
 * Auth Utilities
 * 
 * Provides authentication utility functions used throughout the application
 */

// Import supabase for direct access if needed
import { supabase } from './supabase';

// Debug flag - set to false to disable all auth utils logs
const DEBUG = process.env.NODE_ENV === 'development' && false;

// Simple debug logger that only logs when DEBUG is true
const debug = (message, ...args) => {
  if (DEBUG) {
    console.log(message, ...args);
  }
};

/**
 * Forces authentication refresh
 * This is a critical function to ensure auth state is consistently updated
 * @param {boolean} isLightRefresh - When true, performs a lighter refresh suitable for visibility changes
 */
export const forceAuthRefresh = async (isLightRefresh = false) => {
  debug('[Auth] forceAuthRefresh: Starting authentication refresh' + (isLightRefresh ? ' (light)' : ''));
  
  // Save function call timestamp for debugging auth flow
  const refreshStartTime = Date.now();
  localStorage.setItem('auth_refresh_started', refreshStartTime.toString());
  
  try {
    // Only clear cached profile data for full refreshes
    if (!isLightRefresh) {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_profile_time');
    }
    
    // Force reload the session from Supabase
    debug('[Auth] forceAuthRefresh: Getting current session');
    const { data, error } = await supabase.auth.getSession();
    
    // Log timing for session retrieval
    const sessionResponseTime = Date.now();
    localStorage.setItem('auth_refresh_session_response_time', (sessionResponseTime - refreshStartTime).toString());
    
    if (error) {
      console.error('[Auth] forceAuthRefresh: Error refreshing auth:', error);
      localStorage.setItem('auth_refresh_error', JSON.stringify({
        time: Date.now(),
        message: error.message,
        code: error.code
      }));
      throw error;
    }
    
    // If we have a session, ensure it's properly loaded into Supabase client
    if (data?.session) {
      debug('[Auth] forceAuthRefresh: Session found, refreshing session for user:', data.session.user.id);
      localStorage.setItem('auth_refresh_session_found', Date.now().toString());
      
      // Save session expiry info for debugging auth timeout issues
      if (data.session.expires_at) {
        const expiresAt = new Date(data.session.expires_at * 1000); // Convert to milliseconds
        const now = new Date();
        const timeUntilExpiry = expiresAt - now;
        
        localStorage.setItem('auth_session_expiry', JSON.stringify({
          expiresAt: expiresAt.toISOString(),
          currentTime: now.toISOString(),
          timeUntilExpiryMs: timeUntilExpiry,
          timeUntilExpiryMinutes: Math.floor(timeUntilExpiry / 60000)
        }));
      }
      
      // Debug log session details to diagnose issues with phone authentication
      // Only log detailed info in full refresh mode
      if (!isLightRefresh) {
        console.log('[Auth] forceAuthRefresh: Session details:', {
          userId: data.session.user.id,
          expiresAt: data.session.expires_at,
          providerToken: !!data.session.provider_token,
          accessToken: data.session.access_token ? data.session.access_token.substring(0, 10) + '...' : null,
        });
        
        // Check for phone-based email to detect if this is a phone auth user
        const userEmail = data.session.user?.email || '';
        if (userEmail.includes('@phone.arazial.com')) {
          console.log('[Auth] forceAuthRefresh: Detected phone authentication user');
          localStorage.setItem('auth_is_phone_user', 'true');
          
          // Extract phone number from email
          const phoneNumber = userEmail.split('@')[0];
          if (phoneNumber) {
            localStorage.setItem('auth_phone_number', phoneNumber);
          }
        }
      }
      
      // For light refreshes, don't explicitly set the session unless it's expired or close to expiry
      let shouldSetSession = !isLightRefresh;
      
      if (isLightRefresh && data.session.expires_at) {
        const expiresAt = new Date(data.session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt - now;
        // If less than 10 minutes until expiry, do a full session refresh
        shouldSetSession = timeUntilExpiry < 10 * 60 * 1000;
      }
      
      if (shouldSetSession) {
        try {
          // Set the session explicitly to ensure it's properly loaded
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });
          
          // Double-check the session was set successfully
          const { data: checkData } = await supabase.auth.getSession();
          if (!checkData?.session) {
            console.warn('[Auth] forceAuthRefresh: Session was not properly set!');
            localStorage.setItem('auth_refresh_session_not_set', Date.now().toString());
            // Try one more time with a different approach
            await supabase.auth.refreshSession();
            
            // Check again after refresh attempt
            const { data: recheckData } = await supabase.auth.getSession();
            if (recheckData?.session) {
              console.log('[Auth] forceAuthRefresh: Session set after refreshSession call');
              localStorage.setItem('auth_refresh_session_recovered', Date.now().toString());
            } else {
              console.error('[Auth] forceAuthRefresh: Failed to set session even after refreshSession!');
              localStorage.setItem('auth_refresh_session_recovery_failed', Date.now().toString());
            }
          }
        } catch (setSessionError) {
          console.error('[Auth] forceAuthRefresh: Error setting session:', setSessionError);
          localStorage.setItem('auth_refresh_set_session_error', JSON.stringify({
            time: Date.now(),
            message: setSessionError.message
          }));
          throw setSessionError;
        }
      }
      
      // For light refreshes, use a more subtle event that won't trigger UI reloads
      if (isLightRefresh) {
        const lightRefreshEvent = new CustomEvent('auth-light-refresh-complete', {
          detail: { success: true, userId: data.session.user.id, time: Date.now() }
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(lightRefreshEvent);
        }
      } else {
        // Trigger a sync event to other components that might be listening (only for full refreshes)
        const syncEvent = new CustomEvent('auth-state-changed', { 
          detail: { userId: data.session.user.id, time: Date.now(), status: 'refreshed' } 
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(syncEvent);
        }
        
        // Also dispatch a completion event specific to auth refresh
        const refreshCompleteEvent = new CustomEvent('auth-refresh-complete', {
          detail: { success: true, userId: data.session.user.id, time: Date.now() }
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(refreshCompleteEvent);
        }
      }
      
      debug('[Auth] forceAuthRefresh: Session refreshed successfully');
      localStorage.setItem('auth_refresh_success', Date.now().toString());
      localStorage.setItem('auth_refresh_duration', (Date.now() - refreshStartTime).toString());
    } else {
      debug('[Auth] forceAuthRefresh: No active session found');
      localStorage.setItem('auth_refresh_no_session', Date.now().toString());
      
      // Check localStorage for any previous authentication to help debug session loss
      try {
        const projectId = supabase.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
        if (projectId) {
          const hasStoredToken = !!localStorage.getItem(`sb-${projectId}-auth-token`);
          localStorage.setItem('auth_refresh_has_stored_token', hasStoredToken.toString());
          
          if (hasStoredToken) {
            console.warn('[Auth] forceAuthRefresh: Local storage has auth token but getSession returned no session!');
          }
        }
      } catch (storageError) {
        console.error('[Auth] forceAuthRefresh: Error checking local storage:', storageError);
      }
      
      // Only dispatch events for full refreshes to avoid unnecessary UI reloads
      if (!isLightRefresh) {
        // Trigger a sync event to notify other components of logged out state
        const syncEvent = new CustomEvent('auth-state-changed', { 
          detail: { userId: null, time: Date.now(), status: 'no-session' } 
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(syncEvent);
        }
        
        // Also dispatch a completion event for auth refresh
        const refreshCompleteEvent = new CustomEvent('auth-refresh-complete', {
          detail: { success: false, userId: null, time: Date.now() }
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(refreshCompleteEvent);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('[Auth] forceAuthRefresh: Critical error refreshing auth:', error);
    localStorage.setItem('auth_refresh_critical_error', JSON.stringify({
      time: Date.now(),
      message: error.message,
      stack: error.stack
    }));
    
    // Dispatch error event
    const errorEvent = new CustomEvent('auth-refresh-complete', {
      detail: { success: false, error: error.message, time: Date.now() }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(errorEvent);
    }
    
    throw error;
  }
};

/**
 * Resets all auth storage
 * Used by components that previously relied on resetAllAuthStorage from appState
 */
export const resetAllAuthStorage = () => {
  // Clear any profile data in localStorage
  localStorage.removeItem('user_profile');
  localStorage.removeItem('user_profile_time');
  
  // Try to extract the project ID from the Supabase URL
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      localStorage.removeItem('supabase.auth.token');
    }
    
    // Also try to clear any sb-* keys
    const projectId = supabase.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
    if (projectId) {
      localStorage.removeItem(`sb-${projectId}-auth-token`);
    }
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
  
  // Log the action
  debug('Auth storage reset');
};

/**
 * Simple utility function to check if a user is authenticated
 */
export const isAuthenticated = () => {
  return supabase.auth.getSession()
    .then(({ data }) => {
      return !!data?.session?.user;
    })
    .catch(error => {
      console.error('Error checking authentication:', error);
      return false;
    });
}; 