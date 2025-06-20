# Verimor OTP Proxy Server

A proxy server for handling OTP SMS messages via Verimor API. This server acts as a middleware between your Supabase app and Verimor SMS service, allowing you to send OTP SMS from your whitelisted static IP.

## Features

- Secure API with API key authentication
- Rate limiting to prevent abuse
- Robust error handling
- Simple health check endpoint
- Easy deployment with PM2

## Prerequisites

- Node.js 14+ installed
- NPM or Yarn
- A static IP address whitelisted with Verimor
- Verimor API credentials

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd verimor-proxy-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your actual configuration:

```
# Server configuration
PORT=3000
NODE_ENV=production

# Verimor API credentials
VERIMOR_USERNAME=your_username
VERIMOR_PASSWORD=your_password
VERIMOR_SOURCE_ADDR=your_sender_id

# Security
API_SECRET_KEY=your_secure_api_key

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5
```

## Running the Server

### Development

```bash
npm run dev
```

### Production with PM2

1. Install PM2 globally:

```bash
npm install -g pm2
```

2. Start the application:

```bash
pm2 start index.js --name verimor-proxy
```

3. Make sure it starts on system reboot:

```bash
pm2 startup
pm2 save
```

4. Monitor the application:

```bash
pm2 monitor
```

## API Endpoints

### Send OTP SMS

```
POST /api/send-otp
```

Headers:
```
Content-Type: application/json
x-api-key: your_api_secret_key
```

Request Body:
```json
{
  "phoneNumber": "905xxxxxxxxx",
  "message": "Optional custom message with {otp}" 
}
```

Response (Success):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "campaignId": "12345" 
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Error message" 
}
```

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok" 
}
```

## Integration with Supabase

To integrate this proxy server with your Supabase app, update your `send_otp` function to call the proxy server instead of directly calling the Verimor API:

```sql
CREATE OR REPLACE FUNCTION send_otp(p_phone_number text)
RETURNS json AS $$
DECLARE
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

  -- Prepare proxy API payload
  proxy_payload := json_build_object(
    'phoneNumber', p_phone_number
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

  -- Return proxy response
  RETURN proxy_response.content::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Considerations

- Always use HTTPS in production
- Keep your API key secret
- Consider adding IP-based restrictions in production
- Review and adjust rate limiting settings as needed

## License

MIT 