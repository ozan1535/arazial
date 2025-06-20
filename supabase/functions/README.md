# Phone Verification with Verimor SMS API

This documentation explains how to set up and use the phone verification system with Verimor SMS API.

## Overview

The system consists of two Supabase Edge Functions:
1. `send-otp`: Sends a verification code via SMS
2. `verify-otp`: Verifies the code and creates/signs in the user

## Database Setup

Run the SQL migration to create the necessary tables:
```sql
-- From migrations/20240401_add_phone_auth_codes.sql
```

## Verimor Proxy Server

To comply with Verimor's static IP whitelist requirement, we use a proxy server for sending SMS. Set up the proxy server as follows:

1. Navigate to the `verimor-proxy-server` directory
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```
   # Server configuration
   PORT=3000
   NODE_ENV=production

   # Verimor API credentials
   VERIMOR_USERNAME=your_username
   VERIMOR_PASSWORD=your_password
   VERIMOR_SOURCE_ADDR=ARAZIAL

   # Security
   API_SECRET_KEY=your_secure_random_string
   ALLOWED_ORIGINS=https://your-frontend-domain.com

   # Rate limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=5
   ```

4. Deploy the proxy server to a VPS or server with a static IP
5. Set up the server with PM2:
   ```
   npm install -g pm2
   pm2 start index.js --name verimor-proxy
   pm2 startup
   pm2 save
   ```

6. Make sure your static IP is whitelisted with Verimor

## Environment Variables

You need to configure the following environment variables in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API > Edge Functions
3. Add the following secrets:
   - `VERIMOR_PROXY_URL`: URL of your proxy server (e.g., https://your-proxy-server.com)
   - `VERIMOR_PROXY_API_KEY`: API key configured in the proxy server's `.env` file

> **Note**: The following variables are deprecated but kept for backward compatibility:
> - `VERIMOR_USERNAME`: Your Verimor account phone number (e.g., 905XXXXXXXX)
> - `VERIMOR_PASSWORD`: Your Verimor API password
> - `VERIMOR_SOURCE_ADDR`: Your SMS sender ID/header (e.g., ARAZIAL)

## Deploying Edge Functions

1. Install Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Login to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref <your-project-id>
   ```

4. Deploy the functions:
   ```
   supabase functions deploy send-otp
   supabase functions deploy verify-otp
   ```

## Testing the Functions

You can test the functions with the following curl commands:

```bash
# Send OTP
curl -X POST https://<your-project-id>.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"905XXXXXXXXX"}'

# Verify OTP
curl -X POST https://<your-project-id>.supabase.co/functions/v1/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"905XXXXXXXXX", "otp":"123456", "password":"secure_password"}'
```

## Integration with Web App

The web app already has the necessary components to work with these functions. Make sure to:

1. Configure the appropriate environment variables in your web app:
   ```
   REACT_APP_SUPABASE_URL=https://<your-project-id>.supabase.co
   ```

2. The `PhoneSignup` component will use these environment variables to call the edge functions. 

## Health Monitoring

To ensure your proxy server is running properly, you can set up monitoring of the `/health` endpoint. The health endpoint returns:

```json
{
  "status": "ok"
}
```

You can use services like UptimeRobot or Pingdom to monitor this endpoint. 

## pay-request

This function handles payment requests to the İşyeriPOS payment provider. It securely receives payment details, adds merchant credentials, and returns the payment link or HTML for 3D Secure authentication. Do not call the payment provider directly from the frontend; always use this function to keep credentials secure. 