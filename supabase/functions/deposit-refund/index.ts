// Supabase Edge Function to handle deposit refunds
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
  console.log('Deposit refund function invoked:', req.method);

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

    // Get and validate the request body
    const body = await req.json();
    console.log('Refund request body:', {
      uid: body.uid,
      amount: body.amount,
      description: body.description
    });

    // Validate required fields
    if (!body.uid) {
      throw new Error('UID is required for refund request');
    }

    if (!body.amount || body.amount <= 0) {
      throw new Error('Valid amount is required for refund request');
    }

    // Ensure the proxy URL is properly formatted
    let formattedProxyUrl = proxyUrl;
    if (proxyUrl.endsWith('/')) {
      formattedProxyUrl = proxyUrl.slice(0, -1);
    }

    const proxyRequestUrl = `${formattedProxyUrl}/api/refund-request`;
    console.log('Making refund request to proxy server:', proxyRequestUrl);

    // Forward the request to the payment proxy server
    const proxyResponse = await fetch(proxyRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': proxyApiKey
      },
      body: JSON.stringify({
        uid: body.uid,
        amount: body.amount,
        description: body.description || 'Admin deposit refund'
      })
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

    // Check if the refund was successful
    if (!proxyData.success) {
      // Log the actual error details for debugging
      console.error('Refund request failed:', {
        success: proxyData.success,
        error: proxyData.error,
        errorCode: proxyData.errorCode,
        errors: proxyData.errors,
        details: proxyData.details
      });
      
      // Pass through the actual error message from İşyeriPOS
      let actualErrorMessage = 'İade işlemi başarısız';
      
      if (proxyData.error && typeof proxyData.error === 'string') {
        actualErrorMessage = proxyData.error;
      } else if (proxyData.details) {
        actualErrorMessage = proxyData.details;
      }
      
      throw new Error(actualErrorMessage);
    }

    // Return the successful response
    return new Response(JSON.stringify({
      success: true,
      message: proxyData.message,
      data: proxyData.data
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in deposit refund function:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      } : error
    });
    
    // Return error response that Supabase will properly handle
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error in refund process',
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