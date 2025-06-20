-- Drop sms_notification_queue table if it's not being used
-- This is an alternative solution if you don't need this table

-- First, check if the table exists and has data
SELECT 
  'Table exists' as status,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_name = 'sms_notification_queue';

-- If the table exists and you want to drop it, uncomment the following lines:

-- DROP TABLE IF EXISTS sms_notification_queue CASCADE;

-- Note: This will permanently delete the table and all its data
-- Only run this if you're sure you don't need this table

-- Alternative: Just drop the foreign key constraint to allow auction deletion
-- Uncomment the following if you want to keep the table but remove the constraint:

/*
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
    
    RAISE NOTICE 'Dropped sms_notification_queue foreign key constraint';
  END IF;
END $$;
*/ 