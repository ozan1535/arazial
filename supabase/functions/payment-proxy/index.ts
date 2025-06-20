// Supabase Edge Function to proxy requests to payment proxy server
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
  console.log('Payment proxy function invoked:', req.method);

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

  // Define safe body type
  let safeBody: Record<string, any> = {};

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

    // Get and log the request body
    const body = await req.json();
    
    // Create a safe version for logging only
    const logBody = {
      ...body,
      CardInfo: body.CardInfo ? {
        ...body.CardInfo,
        CardNo: '****', // Mask sensitive data for logging only
        Cvv: '***'
      } : undefined
    };
    console.log('Request body (masked for logs):', logBody);

    // Ensure the proxy URL is properly formatted
    let formattedProxyUrl = proxyUrl;
    if (proxyUrl.endsWith('/')) {
      formattedProxyUrl = proxyUrl.slice(0, -1);
    }

    const proxyRequestUrl = `${formattedProxyUrl}/api/pay-request`;
    console.log('Making request to proxy server:', proxyRequestUrl);

    // Forward the original unmasked request to the payment proxy server
    const proxyResponse = await fetch(proxyRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': proxyApiKey
      },
      body: JSON.stringify(body) // Send original body with unmasked card data
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
      isHtml: responseText.toLowerCase().includes('<!doctype html'),
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

    // Check if we have a valid İşyeriPOS response
    if (!proxyData.success || !proxyData.uid) {
      // Log the actual error details for debugging
      console.error('Payment request failed:', {
        success: proxyData.success,
        error: proxyData.error,
        data: proxyData.data,
        message: proxyData.message,
        details: proxyData.details
      });
      
      // Pass through the actual error message from İşyeriPOS
      let actualErrorMessage = 'Ödeme işlemi başarısız';
      
      // First try the direct error field (new format from payment-proxy-server)
      if (proxyData.error && typeof proxyData.error === 'string') {
        actualErrorMessage = proxyData.error;
      } else if (proxyData.data && typeof proxyData.data === 'string') {
        // Try to parse the nested İşyeriPOS response (legacy format)
        try {
          const isyeriposResponse = JSON.parse(proxyData.data);
          if (isyeriposResponse.Message) {
            actualErrorMessage = isyeriposResponse.Message;
          }
        } catch (parseError) {
          console.warn('Could not parse nested İşyeriPOS response:', parseError);
        }
      } else if (proxyData.message) {
        actualErrorMessage = proxyData.message;
      } else if (proxyData.details) {
        actualErrorMessage = proxyData.details;
      }
      
      throw new Error(actualErrorMessage);
    }

    // Return the successful response with payment data
    return new Response(JSON.stringify({
      success: true,
      uid: proxyData.uid,
      paymentLink: proxyData.paymentLink,
      responseHtml: proxyData.responseHtml
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in payment proxy function:', {
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
        error: error instanceof Error ? error.message : 'Unknown error in payment proxy',
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