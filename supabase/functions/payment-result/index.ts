// Supabase Edge Function to check payment results after 3D secure completion
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Declare Deno namespace
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

serve(async (req: Request) => {
  console.log('Payment result function invoked:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get proxy server credentials from environment variables
    const proxyUrl = Deno.env.get('PAYMENT_PROXY_URL');
    const proxyApiKey = Deno.env.get('PAYMENT_PROXY_API_KEY');

    if (!proxyUrl || !proxyApiKey) {
      console.error('Missing proxy server configuration:', {
        hasProxyUrl: !!proxyUrl,
        hasProxyApiKey: !!proxyApiKey
      });
      throw new Error('Payment proxy service configuration error');
    }

    // Get the request body (should contain uid or orderId)
    const body = await req.json();
    console.log('Payment result check request:', body);

    // Validate that we have either uid or orderId
    if (!body.uid && !body.orderId) {
      throw new Error('Missing uid or orderId parameter');
    }

    // Ensure the proxy URL is properly formatted
    let formattedProxyUrl = proxyUrl;
    if (proxyUrl.endsWith('/')) {
      formattedProxyUrl = proxyUrl.slice(0, -1);
    }

    const proxyRequestUrl = `${formattedProxyUrl}/api/pay-result`;
    console.log('Making request to proxy server:', proxyRequestUrl);

    // Forward the request to the payment proxy server
    const proxyResponse = await fetch(proxyRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': proxyApiKey
      },
      body: JSON.stringify(body)
    });

    // Log detailed response information
    console.log('Detailed proxy server response:', {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: Object.fromEntries(proxyResponse.headers.entries()),
      url: proxyRequestUrl
    });

    // Get the response text first
    const responseText = await proxyResponse.text();
    
    // Log the raw response for debugging
    console.log('Raw proxy server response:', {
      length: responseText.length,
      preview: responseText.substring(0, 200), // First 200 chars
      contentType: proxyResponse.headers.get('content-type')
    });

    // If the response is empty, throw an error
    if (!responseText.trim()) {
      throw new Error('Empty response from payment proxy server');
    }

    // Try to parse as JSON
    let proxyData;
    try {
      proxyData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response as JSON:', {
        error: parseError,
        responsePreview: responseText.substring(0, 500),
        contentType: proxyResponse.headers.get('content-type'),
        status: proxyResponse.status
      });
      throw new Error('Invalid JSON response from payment proxy');
    }

    // Return the payment result data
    return new Response(JSON.stringify(proxyData), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in payment result function:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      } : error
    });
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in payment result check',
        errorType: error instanceof Error ? error.name : 'UnknownError'
      }), 
      {
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}); 