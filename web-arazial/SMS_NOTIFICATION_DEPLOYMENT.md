# SMS Notification Feature - Deployment Guide

## Overview
This feature sends SMS notifications to users when someone makes a new offer on a property they've already made an offer on. The message format is:

```
Sayın [Ad Soyad],

arazialcom üzerinden teklif verdiğiniz [Taşınmaz Adı veya İlan Numarası] için yeni bir teklif alınmıştır.
Son teklif: 35.000 TL.

Size ait mevcut teklif: 30.000 TL.
```

## Files Created/Modified

### New Files Created:
1. **`src/services/smsService.js`** - SMS notification service
2. **`supabase/functions/send-notification-sms/index.ts`** - Supabase Edge Function for sending SMS
3. **`sql/create_sms_logs_table.sql`** - Database migration for SMS logs
4. **`SMS_NOTIFICATION_DEPLOYMENT.md`** - This deployment guide

### Files Modified:
1. **`src/pages/AuctionDetail.js`** - Added SMS notification trigger after offer submission
2. **`src/pages/UserSettings.js`** - Added SMS notification preferences

## Deployment Steps

### 1. Database Setup
Run the SQL migration to create required tables and columns:

```sql
-- Run this in your Supabase SQL editor
\i sql/create_sms_logs_table.sql
```

### 2. Environment Variables
Add these environment variables to your Supabase project:

```bash
# Verimor SMS API Credentials
VERIMOR_USERNAME=your_verimor_username
VERIMOR_PASSWORD=your_verimor_password
VERIMOR_SOURCE=ARAZIALCOM  # Your SMS sender name
```

### 3. Deploy Supabase Edge Function
Deploy the SMS notification function:

```bash
# Navigate to your project root
cd /path/to/your/project

# Deploy the function to Supabase
supabase functions deploy send-notification-sms
```

### 4. Test the Function
Test the Edge Function deployment:

```bash
# Test with curl (replace YOUR_PROJECT_URL and YOUR_ANON_KEY)
curl -X POST 'https://YOUR_PROJECT_URL.supabase.co/functions/v1/send-notification-sms' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "905551234567",
    "message": "Test message",
    "type": "test"
  }'
```

### 5. Frontend Deployment
Deploy the updated frontend code to your hosting platform (Vercel, etc.).

## How It Works

### Flow:
1. User A makes an offer on Property X
2. User B makes a new offer on Property X
3. System automatically:
   - Finds all users with existing offers on Property X (excluding User B)
   - Checks each user's SMS notification preferences
   - Sends SMS to users who have SMS notifications enabled and valid phone numbers
   - Logs all SMS attempts in the `sms_logs` table

### User Settings:
- Users can enable/disable SMS notifications in their settings
- New users have SMS notifications enabled by default
- Users without phone numbers will be skipped

### Error Handling:
- SMS failures don't block offer submission
- All SMS attempts are logged for debugging
- Graceful fallback if Verimor API is unavailable

## Database Schema

### sms_logs table:
```sql
- id (UUID, Primary Key)
- phone_number (TEXT, NOT NULL)
- message (TEXT, NOT NULL)
- type (TEXT, Default: 'notification')
- status (TEXT, 'sent'|'failed'|'pending')
- verimor_response (JSONB)
- error (TEXT)
- sent_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### user_settings table (new column):
```sql
- sms_notifications (BOOLEAN, Default: true)
```

## Monitoring

### Check SMS Logs:
```sql
-- View recent SMS attempts
SELECT 
  phone_number,
  message,
  status,
  error,
  sent_at
FROM sms_logs 
ORDER BY sent_at DESC 
LIMIT 50;

-- Check success rate
SELECT 
  status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM sms_logs 
WHERE sent_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Check User Settings:
```sql
-- Check SMS notification preferences
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE sms_notifications = true) as sms_enabled,
  COUNT(*) FILTER (WHERE sms_notifications = false) as sms_disabled
FROM user_settings;
```

## Troubleshooting

### Common Issues:

1. **SMS not being sent:**
   - Check Verimor credentials in environment variables
   - Verify user has valid phone number
   - Check user's SMS notification preferences
   - Look at `sms_logs` table for error messages

2. **Edge Function errors:**
   - Check Supabase function logs
   - Verify function is deployed correctly
   - Test with curl command above

3. **Database errors:**
   - Ensure `sms_logs` table exists
   - Check `user_settings` has `sms_notifications` column
   - Verify RLS policies allow function access

### Logs Location:
- Supabase Edge Function logs: Supabase Dashboard > Edge Functions > send-notification-sms
- Frontend logs: Browser console during offer submission
- SMS logs: `sms_logs` table in database

## Future Enhancements

Potential improvements:
1. SMS notifications for offer status changes (accepted/rejected)
2. Auction reminder SMS notifications
3. SMS delivery status tracking
4. Rate limiting per user
5. SMS template management
6. Bulk SMS operations

## Security Notes

- Phone numbers are validated and formatted before sending
- RLS policies protect SMS logs
- Environment variables secure API credentials
- No sensitive data exposed in frontend logs