# Payment Proxy Server

This is a proxy server for securely handling payment requests to the İşyeriPOS API from a static IP. It is designed to be deployed on a VPS and run with PM2, similar to the Verimor OTP proxy.

## Features
- Forwards payment requests to İşyeriPOS API (`payRequest3d`)
- Keeps API credentials secure and off the frontend
- Rate limiting and API key authentication
- CORS and security headers
- Health check endpoint

## Setup

1. Clone this repository or copy the folder to your VPS.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file based on the example below:
   ```env
   PORT=4000
   API_SECRET_KEY=your_secure_api_key
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=10
   MERCHANT_ID=your_isyerimpos_merchant_id
   USER_ID=your_isyerimpos_user_id
   API_KEY=your_isyerimpos_api_key
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
4. Start the server with PM2:
   ```sh
   pm2 start index.js --name payment-proxy
   pm2 save
   pm2 startup
   ```

## API

### POST /api/pay-request

Proxy endpoint for payment requests. Requires `x-api-key` header.

**Request Body:** (see İşyeriPOS API docs for full schema)

```json
{
  "ReturnUrl": "https://yourdomain.com/payresult",
  "OrderId": "ORDER_ID",
  "ClientIp": "123.123.123.123",
  "Installment": 1,
  "Amount": 10.00,
  "Is3D": true,
  "IsAutoCommit": true,
  "CardInfo": { ... },
  ...
}
```

**Response:**
- Success: `{ "Uid": "...", "PaymentLink": "...", ... }`
- Error: `{ "error": "..." }`

### GET /health

Health check endpoint. Returns `{ "status": "ok" }`.

## Additional Endpoints

### POST /api/pay-complete

Forwards to İşyeriPOS /payComplete?uid=...&key=... to complete a 3D payment if IsAutoCommit was false. Use after 3D authentication if required.

**Request:**
- Query or JSON body: `{ "uid": "...", "key": "..." }`
- Requires `x-api-key` header

**Response:**
- Success: Payment completion result from İşyeriPOS
- Error: `{ "error": "..." }`

### POST /api/pay-result

Forwards to İşyeriPOS /payResult?uid=... or /payResult?orderId=... to check the final status of a payment. Use after redirect to your ReturnUrl to confirm payment status.

**Request:**
- Query or JSON body: `{ "uid": "..." }` or `{ "orderId": "..." }`
- Requires `x-api-key` header

**Response:**
- Success: Payment result from İşyeriPOS
- Error: `{ "error": "..." }`

**When to use:**
- Use `/api/pay-complete` if you set `IsAutoCommit: false` in the initial payment request.
- Always use `/api/pay-result` after the user is redirected to your ReturnUrl to confirm the payment outcome, as recommended by İşyeriPOS docs.

## Security
- All requests require a valid `x-api-key` header matching `API_SECRET_KEY` in `.env`.
- CORS is enabled for allowed origins.
- Rate limiting is applied to prevent abuse.

## License
MIT 