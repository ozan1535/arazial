import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get request body
    const { phoneNumber, message, type } = await req.json()

    // Validate required fields
    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Phone number and message are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[SMS] Sending ${type || 'notification'} to ${phoneNumber}`)

    // Get proxy server credentials from environment variables (same as OTP system)
    const proxyUrl = Deno.env.get('VERIMOR_PROXY_URL')
    const proxyApiKey = Deno.env.get('VERIMOR_PROXY_API_KEY')

    if (!proxyUrl || !proxyApiKey) {
      console.error('[SMS] Missing proxy server configuration:', {
        hasProxyUrl: !!proxyUrl,
        hasApiKey: !!proxyApiKey
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMS proxy service configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format phone number (ensure it starts with 90)
    let formattedPhone = phoneNumber.replace(/\D/g, '') // Remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '90' + formattedPhone.slice(1)
    } else if (!formattedPhone.startsWith('90')) {
      formattedPhone = '90' + formattedPhone
    }

    // Prepare proxy request payload (same format as OTP system)
    const proxyPayload = {
      phoneNumber: formattedPhone,
      message: message
    }

    console.log(`[SMS] Sending via proxy server to: ${formattedPhone}`)

    // Send SMS via Proxy Server
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${proxyApiKey}`
      },
      body: JSON.stringify(proxyPayload)
    })

    const proxyResult = await proxyResponse.json()

    console.log('[SMS] Proxy response:', proxyResult)

    // Check if the SMS was sent successfully
    if (proxyResponse.ok && proxyResult.success) {
      console.log(`[SMS] Successfully sent ${type || 'notification'} to ${formattedPhone}`)
      
      // Log the SMS to database for tracking
      try {
        await supabaseClient
          .from('sms_logs')
          .insert({
            phone_number: formattedPhone,
            message: message,
            type: type || 'notification',
            status: 'sent',
            verimor_response: proxyResult,
            sent_at: new Date().toISOString()
          })
      } catch (logError) {
        console.error('[SMS] Failed to log SMS:', logError)
        // Don't fail the request if logging fails
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS sent successfully',
          messageId: proxyResult.messageId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('[SMS] Proxy error:', proxyResult)
      
      // Log failed SMS attempt
      try {
        await supabaseClient
          .from('sms_logs')
          .insert({
            phone_number: formattedPhone,
            message: message,
            type: type || 'notification',
            status: 'failed',
            verimor_response: proxyResult,
            error: proxyResult.error || 'Unknown proxy error',
            sent_at: new Date().toISOString()
          })
      } catch (logError) {
        console.error('[SMS] Failed to log failed SMS:', logError)
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: proxyResult.error || 'Failed to send SMS via proxy' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('[SMS] Exception:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})