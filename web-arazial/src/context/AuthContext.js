import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { forceAuthRefresh } from '../services/authUtils';

// Debug flag - set to true to enable auth context logs
const DEBUG = process.env.NODE_ENV === 'development' && true;

// Simple debug logger that only logs when DEBUG is true
const debug = (message, ...args) => {
  if (DEBUG) {
    console.log(message, ...args);
  }
};

// Auth state tracking
const AUTH_STATE = {
  LOADING: 'loading',      // Initial loading state
  AUTHENTICATED: 'authenticated',  // User is logged in
  UNAUTHENTICATED: 'unauthenticated', // User is not logged in
  RECOVERY: 'recovery',    // Password recovery mode
  ERROR: 'error'       // Error occurred
};

// Create auth context
const AuthContext = createContext();

// Custom hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authState, setAuthState] = useState(AUTH_STATE.LOADING);
  
  // Track last logged state to prevent duplicate logs
  const [lastLoggedState, setLastLoggedState] = useState(null);
  
  // Loading timeout - prevents perpetual loading states
  useEffect(() => {
    // If loading persists too long, force reset it
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.error('Auth context loading timeout reached, forcing reset');
        setLoading(false);
        setError('Oturum süresi doldu. Lütfen sayfayı yenileyin.');
      }
    }, 15000); // 15 seconds max
    
    return () => clearTimeout(loadingTimeout);
  }, [loading]);
  
  // Debug authentication state directly
  useEffect(() => {
    console.log('[AuthContext] Auth state changed:', {
      state: authState,
      user: user?.email, 
      isAdmin, 
      loading
    });
  }, [authState, user, isAdmin, loading]);
  
  // Initialize auth state and subscribe to auth changes
  useEffect(() => {
    let authSubscription;
    
    async function setupAuthListener() {
      try {
        setLoading(true);
        setAuthState(AUTH_STATE.LOADING);
        debug('[AuthContext] Setting up auth listener');
        
        // Get initial session
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          debug('[AuthContext] Found initial session, user ID:', data.session.user.id);
          setUser(data.session.user);
          await fetchUserProfile(data.session.user.id);
          setAuthState(AUTH_STATE.AUTHENTICATED);
        } else {
          debug('[AuthContext] No initial session found');
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setAuthState(AUTH_STATE.UNAUTHENTICATED);
        }
        
        // Subscribe to auth changes
        const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
          // Enhanced debugging for all auth events
          console.log('[AuthContext] Auth event received:', {
            event,
            sessionExists: !!session,
            userId: session?.user?.id,
            url: window.location.href,
            hash: window.location.hash,
            pathname: window.location.pathname
          });
          
          // Try to parse hash params for debugging
          if (window.location.hash) {
            try {
              const hashParams = {};
              window.location.hash.substring(1).split('&').forEach(item => {
                const [key, value] = item.split('=');
                hashParams[key] = decodeURIComponent(value);
              });
              console.log('[AuthContext] Hash parameters:', hashParams);
            } catch (e) {
              console.log('[AuthContext] Failed to parse hash params:', e);
            }
          }
          
          debug('[AuthContext] Auth state changed:', event, session ? `User: ${session.user.id}` : 'No session');
          
          // Specific handling for password recovery flow
          if (event === 'PASSWORD_RECOVERY') {
            console.log('[AuthContext] Password recovery mode detected');
            
            // Set special recovery state
            setAuthState(AUTH_STATE.RECOVERY);
            
            // Store user from session for the password update operation
            if (session?.user) {
              setUser(session.user);
            }
            
            // Make sure they stay on the reset-password page
            if (!window.location.pathname.includes('reset-password')) {
              console.log('[AuthContext] Redirecting to reset-password page');
              window.location.href = '/reset-password' + window.location.hash;
            } else {
              console.log('[AuthContext] Already on reset-password page');
            }
            
            setLoading(false);
            return; // Don't continue with other auth logic
          }
          
          // Specific handling for email confirmation flow
          if (event === 'EMAIL_CONFIRMED' || 
              (event === 'SIGNED_IN' && window.location.hash && window.location.hash.includes('type=email_confirmation'))) {
            console.log('[AuthContext] Email confirmation detected');
            debug('[AuthContext] Email confirmed, updating auth state');
            
            // Store confirmation time for debugging
            localStorage.setItem('auth_email_confirmed', Date.now().toString());
            localStorage.setItem('auth_email_confirmed_event', event);
            localStorage.setItem('auth_email_confirmed_hash', window.location.hash);
            
            if (session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
              setAuthState(AUTH_STATE.AUTHENTICATED);
            }
            
            // Redirect to homepage or dashboard after email confirmation
            console.log('[AuthContext] Redirecting after email confirmation');
            window.location.href = '/'; // or '/dashboard' or any other page
            
            setLoading(false);
            return; // Don't continue with other auth logic
          }
          
          try {
            if (session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
              setAuthState(AUTH_STATE.AUTHENTICATED);
            } else {
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
              setAuthState(AUTH_STATE.UNAUTHENTICATED);
            }
          } catch (error) {
            console.error('[AuthContext] Error handling auth change:', error);
            setAuthState(AUTH_STATE.ERROR);
          } finally {
            setLoading(false);
          }
        });
        
        // Store the subscription object properly
        authSubscription = subscription;
      } catch (error) {
        console.error('[AuthContext] Error setting up auth:', error);
        setError('Oturum bilgileri yüklenirken bir hata oluştu.');
        setAuthState(AUTH_STATE.ERROR);
      } finally {
        setLoading(false);
      }
    }
    
    setupAuthListener();
    
    // Cleanup subscription
    return () => {
      if (authSubscription) {
        debug('[AuthContext] Cleaning up auth subscription');
        try {
          // The current Supabase client returns { data: { subscription } } structure
          if (authSubscription.subscription) {
            authSubscription.subscription.unsubscribe();
          } 
          // Handle direct subscription object
          else if (typeof authSubscription.unsubscribe === 'function') {
            authSubscription.unsubscribe();
          }
          // If it's some other structure, try to unsubscribe safely
          else {
            console.log('[AuthContext] Unknown subscription format, attempting to clean up');
            for (let key in authSubscription) {
              if (authSubscription[key] && typeof authSubscription[key].unsubscribe === 'function') {
                authSubscription[key].unsubscribe();
              }
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error unsubscribing from auth:', err);
        }
      }
    };
  }, []);
  
  // Fetch user profile data
  const fetchUserProfile = async (userId, backgroundOnly = false) => {
    if (!backgroundOnly) {
      setLoading(true);
    }
    
    try {
      // Skip if no user ID
      if (!userId) {
        setProfile(null);
        setIsAdmin(false);
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
            debug('Using cached profile');
            setProfile(profile);
            setIsAdmin(profile.role === 'admin');
            
            // Only fetch new profile in background if cache is older than 5 minutes
            if ((now - parseInt(cachedTime)) > 5 * 60 * 1000) {
              backgroundFetchProfile(userId, now).catch(console.error);
            }
            return;
          }
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
      
      await backgroundFetchProfile(userId, now);
    } catch (error) {
      console.error('Exception fetching profile:', error);
      // Keep existing profile if we have one, otherwise set default
      if (!profile) {
        setProfile({ role: 'user' });
        setIsAdmin(false);
      }
    } finally {
      if (!backgroundOnly) {
        setLoading(false);
      }
    }
  };
  
  // Internal method for fetching profile from server
  const backgroundFetchProfile = async (userId, now) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }

      setProfile(data);
      setIsAdmin(data?.role === 'admin');
      
      // Cache the profile
      localStorage.setItem('user_profile', JSON.stringify(data));
      localStorage.setItem('user_profile_time', now.toString());
      debug('User profile loaded and cached, isAdmin:', data?.role === 'admin');
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't reset existing profile on background fetch error
      if (!profile) {
        setProfile({ role: 'user' });
        setIsAdmin(false);
      }
    }
  };
  
  // Force reload of user profile
  const reloadUserProfile = async () => {
    setLoading(true);
    
    try {
      if (user?.id) {
        await fetchUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error reloading user profile:', error);
      setError('Profil yüklenirken bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Force refresh auth session
  const refreshAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data?.session) {
        setUser(data.session.user);
        await fetchUserProfile(data.session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      return data;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    setAuthState(AUTH_STATE.LOADING);
    
    // Store timestamp for diagnostics
    const signInStartTime = Date.now();
    localStorage.setItem('auth_signin_started', signInStartTime.toString());
    
    try {
      console.log('[AuthContext] signIn: Attempting login with email', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Log timing for diagnostics
      const signInResponseTime = Date.now();
      localStorage.setItem('auth_signin_response_time', (signInResponseTime - signInStartTime).toString());
      
      if (error) {
        console.error('[AuthContext] signIn: Login error:', error);
        localStorage.setItem('auth_signin_error', JSON.stringify({
          time: Date.now(),
          message: error.message,
          code: error.code
        }));
        
        // NEVER set the raw error message directly
        // Convert known errors to Turkish
        if (error.message === 'Invalid login credentials') {
          setError('Geçersiz giriş bilgileri');
        } else {
          // Don't display raw error messages, use a generic Turkish message instead
          setError('Giriş yapılırken bir hata oluştu');
        }
        
        throw error;
      }
      
      console.log('[AuthContext] signIn: Login successful, session found:', !!data?.session);
      localStorage.setItem('auth_signin_success', Date.now().toString());
      
      if (data?.session) {
        // Store successful session info for diagnostics
        localStorage.setItem('auth_signin_session_user_id', data.session.user.id);
        
        // Update user state right away to trigger dependent components
        setUser(data.session.user);
        
        // IMPORTANT: Fetch admin status synchronously before proceeding
        try {
          console.log('[AuthContext] Fetching admin status immediately during login');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError) {
            console.warn('[AuthContext] Error fetching admin status:', profileError);
          } else if (profileData) {
            const isUserAdmin = profileData.role === 'admin';
            console.log('[AuthContext] User admin status determined:', isUserAdmin);
            setIsAdmin(isUserAdmin);
            
            // Cache basic profile info
            localStorage.setItem('user_profile', JSON.stringify(profileData));
            localStorage.setItem('user_profile_time', Date.now().toString());
            
            // Set full profile in background
            setProfile(profileData);
          }
        } catch (profileFetchError) {
          console.error('[AuthContext] Critical error fetching admin status:', profileFetchError);
        }
        
        // Set authenticated regardless of profile fetch success
        setAuthState(AUTH_STATE.AUTHENTICATED);
        
        // Complete loading now that we have admin status
        setLoading(false);
        localStorage.setItem('auth_signin_complete', Date.now().toString());
        
        // Fetch complete profile in background
        fetchUserProfile(data.session.user.id, true)
          .then(() => {
            localStorage.setItem('auth_profile_loaded', Date.now().toString());
          })
          .catch(err => {
            console.error('[AuthContext] Error fetching complete profile:', err);
            localStorage.setItem('auth_profile_error', JSON.stringify({
              time: Date.now(),
              message: err.message
            }));
          });
        
        // Start background auth refresh but don't block on it
        setTimeout(() => {
          forceAuthRefresh()
            .then(() => {
              localStorage.setItem('auth_refresh_after_signin', Date.now().toString());
            })
            .catch(err => {
              console.error('[AuthContext] Error during auth refresh after signin:', err);
              localStorage.setItem('auth_refresh_after_signin_error', JSON.stringify({
                time: Date.now(),
                message: err.message
              }));
            });
        }, 0);
      } else {
        // No session, set unauthenticated
        console.warn('[AuthContext] signIn: Login returned success but no session data');
        localStorage.setItem('auth_signin_no_session', Date.now().toString());
        setAuthState(AUTH_STATE.UNAUTHENTICATED);
        setLoading(false);
      }
      
      // Return the complete data object for proper redirection
      return data;
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      setError(error.message);
      setAuthState(AUTH_STATE.ERROR);
      setLoading(false);
      
      // Store detailed error info
      localStorage.setItem('auth_signin_critical_error', JSON.stringify({
        time: Date.now(),
        message: error.message,
        stack: error.stack
      }));
      
      throw error;
    }
  };
  
  // Sign up function
  const signUp = async (emailOrOptions, password) => {
    setLoading(true);
    setError(null);
    
    try {
      let signUpParams;
      
      // Check if first parameter is an object (for phone signup) or email string
      if (typeof emailOrOptions === 'object') {
        // New format: signUp({ phone, password, options })
        signUpParams = emailOrOptions;
      } else {
        // Legacy format: signUp(email, password)
        signUpParams = {
          email: emailOrOptions,
          password
        };
      }
      
      console.log('[AuthContext] Signing up with params:', {
        hasPhone: !!signUpParams.phone,
        hasEmail: !!signUpParams.email,
        hasOptions: !!signUpParams.options
      });
      
      const { data, error } = await supabase.auth.signUp(signUpParams);
      
      if (error) throw error;
      
      // Force auth refresh if auto-confirmation is enabled
      if (data?.user && data.user.confirmed_at) {
        await forceAuthRefresh();
      }
      
      return { data };
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First update local state to ensure UI responsiveness
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Then perform the actual signOut operation
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear any auth-related local storage
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_profile_time');
      localStorage.removeItem('auth_last_login');
      localStorage.removeItem('phone_login_success');
      localStorage.removeItem('phone_login_attempt');
      
      // Force auth refresh to ensure all systems recognize the logout
      try {
        await forceAuthRefresh();
      } catch (refreshError) {
        console.warn('Non-critical error during auth refresh after signout:', refreshError);
        // Continue with signout even if refresh fails
      }
      
      // Signal successful logout
      const logoutEvent = new CustomEvent('auth-logout-complete', {
        detail: { success: true, time: Date.now() }
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(logoutEvent);
      }
      
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Update password
  const updatePassword = async (newPassword) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Only log in development and only when state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentState = JSON.stringify({ 
        user: user?.email, 
        isAdmin, 
        loading
      });
      
      if (lastLoggedState !== currentState) {
        console.log('Auth state:', { 
          user: user?.email, 
          isAdmin, 
          loading
        });
        setLastLoggedState(currentState);
      }
    }
  }, [user, isAdmin, loading, lastLoggedState]);
  
  // Value object to provide to context consumers
  const value = {
    user,
    profile,
    loading,
    error,
    isAdmin,
    authState,
    isAuthenticated: authState === AUTH_STATE.AUTHENTICATED || authState === AUTH_STATE.RECOVERY,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    reloadUserProfile,
    refreshAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}