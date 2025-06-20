// Supabase Edge Function to update deposit status after payment verification
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  console.log('Update deposit status function invoked:', req.method);

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
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const body = await req.json();
    console.log('Deposit status update request:', body);

    // Validate required fields
    if (!body.payment_id) {
      throw new Error('Missing payment_id parameter');
    }

    if (!body.status || !['pending', 'completed', 'failed', 'refunded'].includes(body.status)) {
      throw new Error('Invalid status parameter');
    }

    // Update the deposit status
    const { data, error } = await supabase
      .from('deposits')
      .update({
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', body.payment_id)
      .select();

    if (error) {
      console.error('Error updating deposit status:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No deposit found with the provided payment_id');
    }

    const updatedDeposit = data[0];
    console.log('Deposit status updated successfully:', updatedDeposit);

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      deposit: updatedDeposit,
      message: `Deposit status updated to ${body.status}`
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in update deposit status function:', {
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
        error: error instanceof Error ? error.message : 'Unknown error in deposit status update',
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