-- migration:20250115000001
-- Fix foreign key constraint for sms_notification_queue table

-- First, let's check if the sms_notification_queue table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS sms_notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'notification',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- If the table already exists, we need to drop and recreate the foreign key constraint
-- First, let's check if the constraint exists
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
    
    -- Recreate with CASCADE DELETE
    ALTER TABLE sms_notification_queue 
    ADD CONSTRAINT sms_notification_queue_auction_id_fkey 
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Updated sms_notification_queue foreign key constraint with CASCADE DELETE';
  ELSE
    -- If constraint doesn't exist, add it
    ALTER TABLE sms_notification_queue 
    ADD CONSTRAINT sms_notification_queue_auction_id_fkey 
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added sms_notification_queue foreign key constraint with CASCADE DELETE';
  END IF;
END $$;

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