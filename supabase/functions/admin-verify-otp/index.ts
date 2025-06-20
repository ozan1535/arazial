// Supabase Edge Function to verify OTP without creating a user
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log('admin-verify-otp: Function invoked');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
  
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('admin-verify-otp: Handling OPTIONS request');
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`admin-verify-otp: Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const { phoneNumber, otp } = body;
    
    if (!phoneNumber || !otp) {
      console.error('admin-verify-otp: Missing phoneNumber or otp');
      return new Response(JSON.stringify({ error: 'Phone number and OTP are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`admin-verify-otp: Verifying OTP for phone number ${phoneNumber}`);
    
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('admin-verify-otp: Missing Supabase credentials');
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
    
    // Get the stored OTP
    console.log('admin-verify-otp: Fetching stored OTP for phone number:', phoneNumber);
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('phone_auth_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (otpError || !otpData) {
      console.error('admin-verify-otp: Error retrieving OTP:', otpError);
      return new Response(JSON.stringify({ error: 'No verification code found for this phone number' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('admin-verify-otp: Found OTP entry:', { id: otpData.id, verified: otpData.verified });

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expires_at);
    const now = new Date();
    console.log('admin-verify-otp: OTP expiry check - expires:', expiresAt.toISOString(), 'now:', now.toISOString());
    
    if (expiresAt < now) {
      console.log('admin-verify-otp: OTP expired');
      return new Response(JSON.stringify({ error: 'Verification code expired. Please request a new one.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if OTP matches
    console.log('admin-verify-otp: Checking OTP match - provided:', otp, 'stored:', otpData.code);
    if (otpData.code !== otp) {
      console.log('admin-verify-otp: Invalid OTP provided');
      return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if OTP has already been verified
    if (otpData.verified) {
      console.log('admin-verify-otp: OTP already used');
      return new Response(JSON.stringify({ error: 'This verification code has already been used' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark OTP as verified
    console.log('admin-verify-otp: Marking OTP as verified');
    const { error: updateError } = await supabaseAdmin
      .from('phone_auth_codes')
      .update({ verified: true })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('admin-verify-otp: Error updating OTP status:', updateError);
      return new Response(JSON.stringify({ error: 'Error updating verification status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('admin-verify-otp: OTP marked as verified successfully');

    // Check the auth.users table using the derived email format
    const email = `${phoneNumber}@phone.arazial.com`;
    const altEmail = `+${phoneNumber}@phone.arazial.com`;
    
    console.log('admin-verify-otp: Looking for user with email:', email, 'or', altEmail);
    
    // Use the admin auth API to get users by email
    const { data: users, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('admin-verify-otp: Error listing users:', authError);
      return new Response(JSON.stringify({ error: 'Error retrieving users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Find the user with the matching email
    const matchingUser = users.users.find(user => 
      user.email === email || user.email === altEmail
    );
    
    if (!matchingUser) {
      console.error('admin-verify-otp: No user found with this phone number');
      return new Response(JSON.stringify({ error: 'No user found with this phone number' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return success with user ID
    console.log('admin-verify-otp: OTP verified successfully. User ID:', matchingUser.id);
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP verified successfully',
      user_id: matchingUser.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('admin-verify-otp: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}) 