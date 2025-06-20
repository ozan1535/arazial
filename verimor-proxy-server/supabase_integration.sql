-- First, add the API key to your Supabase secrets
-- You would run this in your Supabase project
ALTER DATABASE postgres SET app.proxy_api_key = 'your_secure_api_key';

-- Then, modify your send_otp function to use the proxy server
CREATE OR REPLACE FUNCTION send_otp(p_phone_number text)
RETURNS json AS $$
DECLARE
  otp text;
  expires_at timestamp;
  proxy_response http_response;
  proxy_payload json;
BEGIN
  -- Input validation
  IF NOT p_phone_number ~ '^90[5][0-9]{9}$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid phone number format. Must start with 90 followed by 5 and 9 more digits'
    );
  END IF;

  -- Generate OTP and set expiration
  otp := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  expires_at := now() + interval '10 minutes';

  -- Store OTP in database
  INSERT INTO phone_auth_codes (phone_number, code, expires_at, verified)
  VALUES (p_phone_number, otp, expires_at, false)
  ON CONFLICT (phone_number) 
  DO UPDATE SET 
    code = EXCLUDED.code,
    expires_at = EXCLUDED.expires_at,
    verified = false;

  -- Prepare proxy API payload
  proxy_payload := json_build_object(
    'phoneNumber', p_phone_number,
    'message', format('arazialcom doğrulama kodunuz: %s', otp)
  );

  -- Call Proxy API
  SELECT * INTO proxy_response FROM 
  http((
    'POST',
    'https://your-proxy-server.com/api/send-otp',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('x-api-key', current_setting('app.proxy_api_key'))
    ],
    proxy_payload::text,
    10
  ));

  -- Check response
  IF proxy_response.status = 200 THEN
    RETURN proxy_response.content::json;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', format('SMS sending failed: %s', proxy_response.content)
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_otp(text) TO authenticated;
GRANT EXECUTE ON FUNCTION send_otp(text) TO anon; 