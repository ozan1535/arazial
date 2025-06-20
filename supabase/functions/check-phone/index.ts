// Simple Supabase Edge Function to check if a phone number exists in auth.users
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authorization header missing');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    // Get request body
    const body = await req.json();
    const { phoneNumber } = body;
    
    console.log('check-phone: Received request to check phone:', phoneNumber);
    
    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }
    
    // Initialize Supabase client with service role (admin privileges)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    // Direct query to the auth.users table using admin API
    console.log('check-phone: Checking auth.users for phone number:', phoneNumber);
    
    // Using the listUsers function from the admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('check-phone: Error checking user existence:', error);
      return new Response(JSON.stringify({ error: 'Error checking user existence' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }
    
    // Look for an exact match of the phone number in all users
    const matchingUsers = data?.users?.filter(user => user.phone === phoneNumber) || [];
    
    // Check if the user was found
    const exists = matchingUsers.length > 0;
    console.log('check-phone: User search results:', exists ? `Found ${matchingUsers.length} users` : 'No users found');
    console.log('check-phone: Total users checked:', data?.users?.length || 0);
    
    if (exists) {
      console.log('check-phone: Found matching user(s) with phone:', matchingUsers.map(u => u.phone));
    }
    
    // Return the result
    return new Response(JSON.stringify({ 
      exists,
      count: matchingUsers.length,
      totalUsersChecked: data?.users?.length || 0
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
    
  } catch (error) {
    console.error('check-phone: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}) 