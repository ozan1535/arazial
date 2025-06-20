-- Fix foreign key constraint for sms_notification_queue table
-- This will allow auctions to be deleted even if they have related SMS notification queue entries

-- First, let's check if the sms_notification_queue table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS sms_notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'notification',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Drop the existing foreign key constraint if it exists
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sms_notification_queue_auction_id_fkey' 
    AND table_name = 'sms_notification_queue'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE sms_notification_queue 
    DROP CONSTRAINT sms_notification_queue_auction_id_fkey;
    
    RAISE NOTICE 'Dropped existing sms_notification_queue foreign key constraint';
  END IF;
END $$;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE sms_notification_queue 
ADD CONSTRAINT sms_notification_queue_auction_id_fkey 
FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_notification_queue_auction_id ON sms_notification_queue(auction_id);
CREATE INDEX IF NOT EXISTS idx_sms_notification_queue_status ON sms_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_sms_notification_queue_created_at ON sms_notification_queue(created_at);

-- Enable RLS if not already enabled
ALTER TABLE sms_notification_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage SMS notification queue" ON sms_notification_queue;

-- Create policy for service role
CREATE POLICY "Service role can manage SMS notification queue" ON sms_notification_queue
FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON sms_notification_queue TO service_role;

-- Verify the constraint was created correctly
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'sms_notification_queue'
  AND kcu.column_name = 'auction_id'; 