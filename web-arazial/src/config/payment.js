// Payment service configuration
export const PAYMENT_CONFIG = {
  // Supabase Edge Function endpoints
  PAYMENT_REQUEST_URL: 'https://xfqvbqfwqwxvxmxpjbzz.supabase.co/functions/v1/payment-proxy',
  PAYMENT_RESULT_URL: 'https://xfqvbqfwqwxvxmxpjbzz.supabase.co/functions/v1/payment-proxy',
  PAYMENT_COMPLETE_URL: 'https://xfqvbqfwqwxvxmxpjbzz.supabase.co/functions/v1/payment-proxy',
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY // Using Supabase anon key for edge functions
  }
}; 