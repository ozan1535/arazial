/**
 * App State Service
 * 
 * A central store for application state and lifecycle management
 * This eliminates bugs caused by competing event handlers
 */

import { supabase } from './supabase';

class AppStateManager {
  constructor() {
    // Core state
    this.isVisible = true;
    this.isOnline = true;
    this.isAuthed = false;
    this.lastRefreshTime = Date.now();
    this.listeners = new Map();
    this.pendingRefresh = false;
    this.initialSetupComplete = false;
    
    // Maps for different event types
    this.eventTypes = ['visibility', 'auth', 'network', 'refresh'];
    this.eventTypes.forEach(type => {
      this.listeners.set(type, new Set());
    });
    
    // Safe accessor for Supabase auth
    this.auth = {
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      initialized: false
    };
    
    // Initialize handlers
    this.setupHandlers();
  }
  
  // Set up all necessary event listeners
  setupHandlers() {
    // Use a try/catch block to avoid errors during initialization
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Page visibility handler
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Focus/blur handlers
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        window.addEventListener('focus', this.handleFocus);
        window.addEventListener('blur', this.handleBlur);
        
        // Network state handlers
        this.handleOnline = this.handleOnline.bind(this);
        this.handleOffline = this.handleOffline.bind(this);
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
        
        // Pageshow handler (for back/forward cache)
        this.handlePageShow = this.handlePageShow.bind(this);
        window.addEventListener('pageshow', this.handlePageShow);
        
        // Initialize current state
        this.isVisible = document.visibilityState === 'visible';
        this.isOnline = navigator.onLine !== false;
        
        // Set up auth state change listener with Supabase
        this.setupAuthListener();
        
        console.log('[AppState] Event handlers initialized');
      }
    } catch (error) {
      console.error('[AppState] Error setting up handlers:', error);
    }
  }
  
  // Set up authentication state listener
  setupAuthListener() {
    try {
      // Get initial session
      this.refreshAuth();
      
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AppState] Auth state changed:', event);
          
          try {
            if (session?.user) {
              this.auth.user = session.user;
              this.auth.session = session;
              this.isAuthed = true;
              
              // Fetch user profile
              await this.fetchUserProfile(session.user.id);
            } else {
              this.auth.user = null;
              this.auth.session = null;
              this.auth.profile = null;
              this.auth.isAdmin = false;
              this.isAuthed = false;
            }
            
            // Notify subscribers
            this.notifyListeners('auth');
          } catch (error) {
            console.error('[AppState] Error handling auth change:', error);
          }
        }
      );
      
      // Store subscription for cleanup
      this.authSubscription = subscription;
      
      console.log('[AppState] Auth listener set up');
    } catch (error) {
      console.error('[AppState] Error setting up auth listener:', error);
    }
  }
  
  // Fetch user profile data
  async fetchUserProfile(userId) {
    try {
      // Skip if no user ID
      if (!userId) {
        this.auth.profile = null;
        this.auth.isAdmin = false;
        return;
      }
      
      // First check if we have a cached profile and it's not too old
      const cachedProfile = localStorage.getItem('user_profile');
      const cachedTime = localStorage.getItem('user_profile_time');
      const now = Date.now();
      
      // Use cache if it exists and is less than 30 minutes old
      if (cachedProfile && cachedTime && (now - parseInt(cachedTime)) < 30 * 60 * 1000) {
        try {
          const profile = JSON.parse(cachedProfile);
          if (profile.id === userId) {
            console.log('[AppState] Using cached profile');
            this.auth.profile = profile;
            this.auth.isAdmin = profile.role === 'admin';
            
            // Only fetch new profile in background if cache is older than 5 minutes
            if ((now - parseInt(cachedTime)) > 5 * 60 * 1000) {
              this._backgroundFetchProfile(userId, now).catch(console.error);
            }
            return;
          }
        } catch (e) {
          console.error('[AppState] Error parsing cached profile:', e);
        }
      }
      
      await this._backgroundFetchProfile(userId, now);
    } catch (error) {
      console.error('[AppState] Exception fetching profile:', error);
      // Keep existing profile if we have one, otherwise set default
      if (!this.auth.profile) {
        this.auth.profile = { role: 'user' };
        this.auth.isAdmin = false;
      }
    }
  }
  
  // Internal method for fetching profile from server
  async _backgroundFetchProfile(userId, now) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }

      this.auth.profile = data;
      this.auth.isAdmin = data?.role === 'admin';
      
      // Cache the profile
      localStorage.setItem('user_profile', JSON.stringify(data));
      localStorage.setItem('user_profile_time', now.toString());
      console.log('[AppState] User profile loaded and cached, isAdmin:', this.auth.isAdmin);
    } catch (error) {
      console.error('[AppState] Error fetching profile:', error);
      // Don't reset existing profile on background fetch error
      if (!this.auth.profile) {
        this.auth.profile = { role: 'user' };
        this.auth.isAdmin = false;
      }
    }
  }
  
  // Manually refresh authentication state
  async refreshAuth() {
    try {
      // Set initialized to true immediately to avoid long loading states
      this.auth.initialized = true;
      
      // Prevent multiple concurrent refreshes
      if (this.pendingRefresh) {
        console.log('[AppState] Auth refresh already in progress');
        return;
      }
      
      this.pendingRefresh = true;
      console.log('[AppState] Refreshing auth state');
      let sessionError = null; // Keep track of session error
      
      try {
        const { data, error } = await supabase.auth.getSession();
        sessionError = error; // Store error, if any
        
        if (error) {
          console.error('[AppState] Error getting session:', error.message);
          // Clear auth state on session errors
          this.auth.user = null;
          this.auth.session = null;
          this.auth.profile = null;
          this.auth.isAdmin = false;
          this.isAuthed = false;
        } else if (data.session) {
          // We have a valid session
          this.auth.user = data.session.user;
          this.auth.session = data.session;
          this.isAuthed = true;
          
          try {
            // Fetch user profile (fetchUserProfile handles its own errors/defaults)
            await this.fetchUserProfile(data.session.user.id);
          } catch (profileError) {
            // This catch might be redundant if fetchUserProfile handles all internally
            console.error('[AppState] Error fetching profile during refresh:', profileError);
            // Ensure profile/admin are reset if fetch fails critically here
            this.auth.profile = this.auth.profile || { role: 'user' }; // Keep potentially defaulted profile
            this.auth.isAdmin = this.auth.isAdmin || false; 
          }
        } else {
          // No valid session found
          console.log('[AppState] No active session');
          this.auth.user = null;
          this.auth.session = null;
          this.auth.profile = null;
          this.auth.isAdmin = false;
          this.isAuthed = false;
        }
        
      } catch (criticalError) { // Catch critical errors during getSession/profile fetch
        console.error('[AppState] Critical error during auth refresh process:', criticalError);
        // Reset auth state
        this.auth.user = null;
        this.auth.session = null;
        this.auth.profile = null;
        this.auth.isAdmin = false;
        this.isAuthed = false;
        sessionError = criticalError; // Store the error
      }
      
      // Update refresh timestamp regardless of outcome
      this.lastRefreshTime = Date.now();
      
      // Notify listeners *after* all state updates are done
      this.notifyListeners('auth');
      this.notifyListeners('refresh');
      
      console.log('[AppState] Auth refresh complete. Session error:', sessionError ? sessionError.message : 'None');
      
    } finally { // Outer finally
      // Always clear pending flag
      this.pendingRefresh = false;
      // Ensure loading state reflects final status (initialized=true, pending=false)
      // Notify again in case state changed between previous notify and finally
      this.notifyListeners('auth'); 
    }
  }
  
  /* Event Handlers */
  
  // Handle visibility change
  handleVisibilityChange() {
    try {
      const wasVisible = this.isVisible;
      this.isVisible = document.visibilityState === 'visible';
      
      // Only handle becoming visible
      if (this.isVisible && !wasVisible) {
        console.log('[AppState] Tab became visible');
        this.handleVisibilityStateChange();
      }
    } catch (error) {
      console.error('[AppState] Error in visibility change handler:', error);
    }
  }
  
  // Handle focus event
  handleFocus() {
    try {
      const wasVisible = this.isVisible;
      this.isVisible = true;
      
      if (!wasVisible) {
        console.log('[AppState] Window gained focus');
        this.handleVisibilityStateChange();
      }
    } catch (error) {
      console.error('[AppState] Error in focus handler:', error);
    }
  }
  
  // Handle blur event
  handleBlur() {
    try {
      this.isVisible = false;
      console.log('[AppState] Window lost focus');
    } catch (error) {
      console.error('[AppState] Error in blur handler:', error);
    }
  }
  
  // Handle online event
  handleOnline() {
    try {
      this.isOnline = true;
      console.log('[AppState] Network connection restored');
      
      // Trigger visibility state change logic to refresh data
      this.handleVisibilityStateChange();
      
      // Notify network listeners
      this.notifyListeners('network');
    } catch (error) {
      console.error('[AppState] Error in online handler:', error);
    }
  }
  
  // Handle offline event
  handleOffline() {
    try {
      this.isOnline = false;
      console.log('[AppState] Network connection lost');
      
      // Notify network listeners
      this.notifyListeners('network');
    } catch (error) {
      console.error('[AppState] Error in offline handler:', error);
    }
  }
  
  // Handle pageshow event (browser cache restoration)
  handlePageShow(event) {
    try {
      if (event.persisted) {
        console.log('[AppState] Page restored from bfcache');
        
        // Fix for WebKit browsers: force minimal reflow to unstick frozen UI
        if (document.body) {
          document.body.style.display = 'none';
          // Force browser to process the style change
          void document.body.offsetHeight;
          document.body.style.display = '';
        }
        
        // Trigger visibility state change to refresh data
        this.handleVisibilityStateChange();
      }
    } catch (error) {
      console.error('[AppState] Error in pageshow handler:', error);
    }
  }
  
  /* Core visibility state change handling */
  
  // Central visibility state change handler
  async handleVisibilityStateChange() {
    try {
      const wasHidden = !this.isVisible;
      this.isVisible = document.visibilityState === 'visible';
      
      // Skip if not visible or not online
      if (!this.isVisible || !this.isOnline) {
        return;
      }
      
      // Notify visibility listeners first (immediate UI updates)
      this.notifyListeners('visibility');
      
      // If we're coming back from being hidden, always refresh auth
      // This ensures admin status is immediately revalidated
      if (wasHidden) {
        console.log('[AppState] Coming back from background, refreshing auth');
        await this.refreshAuth();
        return;
      }
      
      // For normal visibility changes, check if we need to refresh auth
      const now = Date.now();
      const timeSinceLastRefresh = now - this.lastRefreshTime;
      
      if (timeSinceLastRefresh > 2 * 60 * 1000) { // Reduced to 2 minutes
        console.log('[AppState] Auth refresh needed');
        await this.refreshAuth();
      } else {
        console.log('[AppState] Auth refresh not needed, last refresh was', 
          Math.round(timeSinceLastRefresh / 1000), 'seconds ago');
      }
      
      // Notify refresh listeners
      this.notifyListeners('refresh');
    } catch (error) {
      console.error('[AppState] Error handling visibility state change:', error);
    }
  }
  
  /* Event Subscription */
  
  // Subscribe to an event type
  subscribe(type, callback) {
    if (!this.eventTypes.includes(type)) {
      console.error(`[AppState] Invalid event type: ${type}`);
      return () => {};
    }
    
    if (typeof callback !== 'function') {
      console.error('[AppState] Callback must be a function');
      return () => {};
    }
    
    const listeners = this.listeners.get(type);
    listeners.add(callback);
    
    console.log(`[AppState] Added ${type} listener, total: ${listeners.size}`);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      console.log(`[AppState] Removed ${type} listener, remaining: ${listeners.size}`);
    };
  }
  
  // Subscribe to visibility changes (when tab becomes visible)
  onVisibilityChange(callback) {
    return this.subscribe('visibility', callback);
  }
  
  // Subscribe to auth state changes
  onAuthChange(callback) {
    // Call immediately if auth is already initialized
    if (this.auth.initialized) {
      try {
        callback();
      } catch (error) {
        console.error('[AppState] Error in auth change callback:', error);
      }
    }
    
    return this.subscribe('auth', callback);
  }
  
  // Subscribe to network state changes
  onNetworkChange(callback) {
    return this.subscribe('network', callback);
  }
  
  // Subscribe to data refresh events
  onRefresh(callback) {
    return this.subscribe('refresh', callback);
  }
  
  // Notify all listeners of a specific event type
  notifyListeners(type) {
    if (!this.listeners.has(type)) {
      return;
    }
    
    const listeners = this.listeners.get(type);
    console.log(`[AppState] Notifying ${listeners.size} ${type} listeners`);
    
    listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error(`[AppState] Error in ${type} listener:`, error);
      }
    });
  }
  
  // Force a refresh
  forceRefresh() {
    console.log('[AppState] Force refreshing app state');
    
    // Immediately notify about refresh
    this.notifyListeners('refresh');
    
    // Also refresh auth if needed
    if (Date.now() - this.lastRefreshTime > 60 * 1000) {
      this.refreshAuth();
    }
  }
  
  /* Cleanup */
  
  // Clean up all event listeners
  cleanup() {
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Remove DOM event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('focus', this.handleFocus);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        window.removeEventListener('pageshow', this.handlePageShow);
        
        // Unsubscribe from Supabase auth
        if (this.authSubscription) {
          this.authSubscription.unsubscribe();
        }
        
        // Clear all listeners
        this.eventTypes.forEach(type => {
          this.listeners.get(type).clear();
        });
        
        console.log('[AppState] Cleaned up all listeners');
      }
    } catch (error) {
      console.error('[AppState] Error during cleanup:', error);
    }
  }
  
  /* Auth helpers */
  
  // Get current user
  getUser() {
    return this.auth.user;
  }
  
  // Get user profile
  getUserProfile() {
    return this.auth.profile;
  }
  
  // Check if user is admin
  isUserAdmin() {
    return this.auth.isAdmin;
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return this.isAuthed;
  }
  
  // Get loading state
  isLoading() {
    return !this.auth.initialized || this.pendingRefresh;
  }
}

// Create a singleton instance
const appState = new AppStateManager();

// Export the singleton
export default appState;

// Immediately refresh auth state after login/logout
export const forceAuthRefresh = async () => {
  console.log("[appState] Forcing auth refresh");
  await appState.refreshAuth();
  appState.notifyListeners('auth');
};

// Emergency reset function to clear all auth-related local storage
// This can be called when authentication is stuck or corrupted
export const resetAllAuthStorage = () => {
  console.log('[appState] Emergency auth storage reset');
  try {
    // Clear all Supabase-related items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Look for Supabase keys
      if (key && (
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.includes('token')
      )) {
        console.log(`[appState] Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    }
    return true;
  } catch (error) {
    console.error('[appState] Error clearing auth storage:', error);
    return false;
  }
};