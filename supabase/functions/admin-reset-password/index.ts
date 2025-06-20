// Supabase Edge Function to reset a user's password using admin privileges
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log('admin-reset-password: Function invoked');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
  
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('admin-reset-password: Handling OPTIONS request');
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`admin-reset-password: Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const { user_id, password } = body;
    
    if (!user_id || !password) {
      console.error('admin-reset-password: Missing user_id or password');
      return new Response(JSON.stringify({ error: 'User ID and password are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`admin-reset-password: Resetting password for user ${user_id}`);
    
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('admin-reset-password: Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Database configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Reset the user's password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: password }
    );
    
    if (updateError) {
      console.error('admin-reset-password: Error updating password:', updateError);
      return new Response(JSON.stringify({ error: `Error updating password: ${updateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Return success
    console.log('admin-reset-password: Password updated successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Password updated successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('admin-reset-password: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}) 