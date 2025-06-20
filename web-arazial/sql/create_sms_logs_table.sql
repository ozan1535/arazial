-- Create SMS logs table for tracking SMS notifications
-- This table is used by the send-notification-sms Edge Function

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'notification',
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  verimor_response JSONB,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for querying by phone number and date
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_date ON sms_logs(phone_number, sent_at);

-- Add index for querying by status and type
CREATE INDEX IF NOT EXISTS idx_sms_logs_status_type ON sms_logs(status, type);

-- Add RLS policy to allow service role to insert/select
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage SMS logs
CREATE POLICY "Service role can manage SMS logs" ON sms_logs
FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own SMS logs (optional)
CREATE POLICY "Users can view their SMS logs" ON sms_logs
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE phone_number = sms_logs.phone_number
  )
);

-- Add column to user_settings table for SMS notifications if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'sms_notifications'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN sms_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;