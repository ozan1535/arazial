// Supabase Edge Function to verify OTP and sign up/in a user with phone number
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log('verify-otp: Function invoked - method:', req.method);

  try {
    // CORS headers for preflight requests
    if (req.method === 'OPTIONS') {
      console.log('verify-otp: Handling OPTIONS request');
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
        },
      });
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`verify-otp: Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get request body
    let bodyText;
    try {
      bodyText = await req.text();
      console.log('verify-otp: Received request body:', bodyText);
    } catch (e) {
      console.error('verify-otp: Error reading request body:', e);
      return new Response(JSON.stringify({ error: 'Error reading request body' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('verify-otp: Error parsing request JSON:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle both 'phoneNumber' and 'phone' parameters for compatibility
    const phoneNumber = body.phoneNumber || body.phone;
    const { otp, password } = body;
    
    console.log('verify-otp: Parsed phone number:', phoneNumber);
    
    if (!phoneNumber || !otp) {
      console.log('verify-otp: Missing required fields:', { 
        hasPhoneNumber: !!phoneNumber, 
        hasOtp: !!otp 
      });
      return new Response(JSON.stringify({ error: 'Phone number and OTP are required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!password) {
      console.log('verify-otp: Missing password field');
      return new Response(JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Initialize Supabase client with admin privileges
    console.log('verify-otp: Initializing Supabase client');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('verify-otp: Have Supabase URL:', !!supabaseUrl);
    console.log('verify-otp: Have Supabase key:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('verify-otp: Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Database configuration error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
    console.log('verify-otp: Fetching stored OTP for phone number:', phoneNumber);
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('phone_auth_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (otpError || !otpData) {
      console.error('verify-otp: Error retrieving OTP:', otpError);
      return new Response(JSON.stringify({ error: 'No verification code found for this phone number' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    console.log('verify-otp: Found OTP entry:', { id: otpData.id, verified: otpData.verified });

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expires_at);
    const now = new Date();
    console.log('verify-otp: OTP expiry check - expires:', expiresAt.toISOString(), 'now:', now.toISOString());
    
    if (expiresAt < now) {
      console.log('verify-otp: OTP expired');
      return new Response(JSON.stringify({ error: 'Verification code expired. Please request a new one.' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if OTP matches
    console.log('verify-otp: Checking OTP match - provided:', otp, 'stored:', otpData.code);
    if (otpData.code !== otp) {
      console.log('verify-otp: Invalid OTP provided');
      return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if OTP has already been verified
    if (otpData.verified) {
      console.log('verify-otp: OTP already used');
      return new Response(JSON.stringify({ error: 'This verification code has already been used' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Mark OTP as verified
    console.log('verify-otp: Marking OTP as verified');
    const { error: updateError } = await supabaseAdmin
      .from('phone_auth_codes')
      .update({ verified: true })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('verify-otp: Error updating OTP status:', updateError);
      return new Response(JSON.stringify({ error: 'Error updating verification status' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    console.log('verify-otp: OTP marked as verified successfully');

    // Check if a user with this phone number already exists
    console.log('verify-otp: Checking if user exists with phone number:', phoneNumber);
    
    // First check in profiles table
    const { data: existingUsers, error: userQueryError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber);

    // Also check directly in auth.users table for this email
    const email = `${phoneNumber.replace(/[+]/g, '')}@phone.arazial.com`;
    const altEmail = `+${phoneNumber.replace(/[+]/g, '')}@phone.arazial.com`;
    
    // Check if user exists in auth.users with either email format
    console.log('verify-otp: Checking user existence in auth.users with email:', email, 'or', altEmail);
    
    const { data: authUsers, error: authUserError } = await supabaseAdmin
      .from('auth_user_emails_view')
      .select('id')
      .or(`email.eq.${email},email.eq.${altEmail}`)
      .limit(1);
    
    if (authUserError) {
      console.error('verify-otp: Error checking auth users:', authUserError);
    }
    
    let userId;
    let isNewUser = false;
    
    // First check if user exists in auth.users
    if (authUsers && authUsers.length > 0) {
      userId = authUsers[0].user_id;
      console.log('verify-otp: Existing user found in auth.users with ID:', userId);
      
      // Update user password
      console.log('verify-otp: Updating password for existing user');
      const { error: updatePwError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updatePwError) {
        console.error('verify-otp: Error updating password:', updatePwError);
        return new Response(JSON.stringify({ error: 'Error updating password' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Ensure profile exists for this user (in case it was created without a profile)
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .limit(1);
        
      if (!profileData || profileData.length === 0) {
        // Let the database trigger handle profile creation
        console.log('verify-otp: Will let database trigger create profile on next sign-in');
      }
    }
    // Then check profiles table if not found in auth.users
    else if (!userQueryError && existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('verify-otp: Existing user found in profiles with ID:', userId);
      
      // Update user password
      console.log('verify-otp: Updating password for existing user');
      const { error: updatePwError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updatePwError) {
        console.error('verify-otp: Error updating password:', updatePwError);
        return new Response(JSON.stringify({ error: 'Error updating password' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }
    // Create new user if not found in either table
    else {
      // Create a new user with email derived from phone number
      console.log('verify-otp: No existing user found, creating new user');
      
      console.log('verify-otp: Creating user with email:', email);
      try {
        const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          phone: phoneNumber,
          password,
          email_confirm: true, // Auto-confirm the email
          phone_confirm: true, // Auto-confirm the phone
          user_metadata: {
            phone_number: phoneNumber,
            registration_method: 'phone_otp',
            display_name: body.display_name || '',
            first_name: body.first_name || '',
            last_name: body.last_name || '',
            full_name: body.display_name || ''
          }
        });
  
        if (signUpError) {
          console.error('verify-otp: Error creating user:', signUpError);
          
          // If user already exists, try to get the user ID instead
          if (signUpError.message.includes('already registered') || 
              signUpError.message.includes('already been registered') ||
              signUpError.message.includes('email exists')) {
                
            console.log('verify-otp: User already exists, trying to get user ID');
            
            // Try to get the user by email
            const { data: existingUser, error: getUserError } = await supabaseAdmin
              .from('auth_user_emails')  // Must use a view or RLS policy
              .select('user_id')
              .eq('email', email)
              .single();
              
            if (existingUser) {
              userId = existingUser.user_id;
              console.log('verify-otp: Found existing user ID:', userId);
              
              // Update user password
              console.log('verify-otp: Updating password for existing user');
              const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { password }
              );
              
              if (updatePasswordError) {
                console.error('verify-otp: Error updating password:', updatePasswordError);
              }
            } else {
              console.error('verify-otp: Could not retrieve existing user:', getUserError);
              return new Response(JSON.stringify({ error: 'Error retrieving existing user account' }), {
                status: 500,
                headers: { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }
          } else {
            return new Response(JSON.stringify({ error: 'Error creating user account' }), {
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        } else {
          console.log('verify-otp: User created successfully:', authData.user.id);
          userId = authData.user.id;
          isNewUser = true;
    
          // Don't manually create profile, let the database trigger handle it
          console.log('verify-otp: Letting database trigger create profile');
        }
      } catch (error) {
        console.error('verify-otp: Unexpected error during user creation:', error);
        return new Response(JSON.stringify({ error: 'Unexpected error during user creation' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // If we don't have a userId by now, something went wrong
    if (!userId) {
      console.error('verify-otp: Failed to get or create user');
      return new Response(JSON.stringify({ error: 'Failed to get or create user account' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Instead of generating a magic link, directly sign in the user
    console.log('verify-otp: Signing in user with email:', email);
    
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('verify-otp: Error signing in user:', signInError);
      return new Response(JSON.stringify({ 
        error: 'Phone verification successful but automatic login failed. Please login manually.' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    console.log('verify-otp: User signed in successfully');

    // Return success with token and session
    console.log('verify-otp: Returning success response');
    return new Response(JSON.stringify({
      success: true,
      message: isNewUser ? 'Account created and verification successful' : 'Verification successful',
      user: {
        id: userId,
        phone_number: phoneNumber,
        is_new_user: isNewUser
      },
      session: {
        session: {
          access_token: signInData.session?.access_token || '',
          refresh_token: signInData.session?.refresh_token || '',
          user: signInData.user
        },
        user: signInData.user
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('verify-otp: Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}) 