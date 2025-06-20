-- Drop the existing function first
DROP FUNCTION IF EXISTS send_otp(text);

-- Recreate the function with fixed parameter name
CREATE OR REPLACE FUNCTION send_otp(p_phone_number text)
RETURNS json AS $$
DECLARE
  otp text;
  expires_at timestamp;
  verimor_response http_response;
  verimor_payload json;
  verimor_result text;
BEGIN
  -- Input validation
  IF NOT p_phone_number ~ '^90[5][0-9]{9}$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid phone number format. Must start with 90 followed by 5 and 9 more digits'
    );
  END IF;

  -- Generate OTP and set expiration
  otp := generate_otp();
  expires_at := now() + interval '10 minutes';

  -- Store OTP in database
  INSERT INTO phone_auth_codes (phone_number, code, expires_at, verified)
  VALUES (p_phone_number, otp, expires_at, false)
  ON CONFLICT (phone_number) 
  DO UPDATE SET 
    code = EXCLUDED.code,
    expires_at = EXCLUDED.expires_at,
    verified = false;

  -- Prepare Verimor API payload
  verimor_payload := json_build_object(
    'username', current_setting('app.verimor_username'),
    'password', current_setting('app.verimor_password'),
    'source_addr', coalesce(current_setting('app.verimor_source_addr'), 'ARAZIAL'),
    'messages', json_build_array(
      json_build_object(
        'msg', format('arazialcom doğrulama kodunuz: %s', otp),
        'dest', p_phone_number
      )
    )
  );

  -- Call Verimor API
  SELECT * INTO verimor_response FROM 
  http((
    'POST',
    'https://sms.verimor.com.tr/v2/send.json',
    ARRAY[http_header('Content-Type', 'application/json')],
    verimor_payload::text,
    10
  ));

  -- Check response
  IF verimor_response.status = 200 THEN
    RETURN json_build_object(
      'success', true,
      'message', 'OTP sent successfully',
      'campaignId', verimor_response.content
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', format('SMS sending failed: %s', verimor_response.content)
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