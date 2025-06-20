import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using fallback values');
}

// Create a single supabase client for the entire app with enhanced options
export const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseAnonKey || 'your-supabase-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      // Add timeout settings for better reliability
      fetch: (url, options = {}) => {
        // Set a reasonable timeout for all fetch requests (10 seconds)
        options.timeout = options.timeout || 10000;
        return fetch(url, options);
      }
    },
    // Automatically retry failed requests
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

export default supabase;