// Supabase Edge Function to send OTP via Verimor SMS API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req) => {
  console.log('Starting OTP send process...');
  
  // Add CORS headers to all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    let body;
    try {
      body = await req.json();
      console.log('Request body (full):', JSON.stringify(body));
      console.log('Request body keys:', Object.keys(body));
      console.log('Request body type:', typeof body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { phoneNumber } = body;
    console.log('Extracted phone number:', phoneNumber);
    console.log('Phone number type:', typeof phoneNumber);
    
    if (!phoneNumber) {
      console.log('Missing phone number in request, body was:', JSON.stringify(body));
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate phone number format (should be like 905311234567)
    const phoneRegex = /^90[5][0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log('Invalid phone number format:', phoneNumber);
      return new Response(JSON.stringify({ 
        error: 'Invalid phone number format. Must start with 90 followed by 5 and 9 more digits' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with admin privileges
    console.log('Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
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

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
    console.log('Generated OTP:', otp, 'Expires at:', expiresAt.toISOString());

    // Store OTP in Supabase
    console.log('Storing OTP in database...');
    const { error: upsertError } = await supabaseAdmin
      .from('phone_auth_codes')
      .upsert({
        phone_number: phoneNumber,
        code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      }, {
        onConflict: 'phone_number'
      });

    if (upsertError) {
      console.error('Error saving OTP to database:', upsertError);
      return new Response(JSON.stringify({ error: 'Error saving OTP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('OTP stored successfully');

    // Prepare SMS message
    const message = `arazialcom doğrulama kodunuz: ${otp}`;

    // Get proxy server credentials from environment variables
    console.log('Getting proxy server credentials...');
    const proxyUrl = Deno.env.get('VERIMOR_PROXY_URL');
    const proxyApiKey = Deno.env.get('VERIMOR_PROXY_API_KEY');

    if (!proxyUrl || !proxyApiKey) {
      console.error('Missing proxy server configuration:', {
        hasProxyUrl: !!proxyUrl,
        hasApiKey: !!proxyApiKey
      });
      return new Response(JSON.stringify({ error: 'SMS proxy service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send SMS via Proxy Server
    console.log('Sending SMS via Proxy Server...');
    const proxyPayload = {
      phoneNumber: phoneNumber,
      message: message
    };
    console.log('Proxy request payload:', {
      ...proxyPayload
    });

    // Ensure the proxy URL is properly formatted to avoid double slashes
    let formattedProxyUrl = proxyUrl;
    if (proxyUrl.endsWith('/')) {
      formattedProxyUrl = proxyUrl.slice(0, -1);
    }
    
    console.log('Using proxy URL:', `${formattedProxyUrl}/api/send-otp`);

    const proxyResponse = await fetch(`${formattedProxyUrl}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': proxyApiKey
      },
      body: JSON.stringify(proxyPayload)
    });

    // Handle the proxy response
    let proxyData;
    let responseText;
    try {
      responseText = await proxyResponse.text();
      try {
        proxyData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        proxyData = { success: false, error: `Invalid JSON response: ${responseText}` };
      }
      
      console.log('Proxy API response:', {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        data: proxyData
      });
    } catch (e) {
      console.error('Error reading proxy response:', e);
      proxyData = { success: false, error: `Failed to read proxy response: ${e.message}` };
    }
    
    if (!proxyResponse.ok || !proxyData.success) {
      console.error('Proxy API error:', {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        data: proxyData,
        headers: Object.fromEntries(proxyResponse.headers.entries())
      });
      return new Response(JSON.stringify({ 
        error: `SMS sending failed: ${proxyData.error || 'Unknown proxy error'}` 
      }), {
        status: proxyResponse.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return success
    console.log('OTP sent successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP sent successfully',
      campaignId: proxyData.campaignId
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Unhandled error in OTP function:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}) 