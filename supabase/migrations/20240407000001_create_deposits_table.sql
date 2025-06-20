-- Create deposits table
CREATE TABLE deposits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id uuid REFERENCES auctions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(19,4) NOT NULL,
  payment_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_deposit_status CHECK (status IN ('pending', 'completed', 'refunded', 'failed'))
);

-- Add unique constraint to prevent multiple active deposits for same user and auction
CREATE UNIQUE INDEX unique_active_deposit ON deposits (auction_id, user_id)
WHERE status IN ('pending', 'completed');

-- Add RLS policies
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view their own deposits" ON deposits
FOR SELECT
USING (auth.uid() = user_id);

-- Only authenticated users can insert deposits
CREATE POLICY "Authenticated users can create deposits" ON deposits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only system can update deposits (through functions)
CREATE POLICY "System can update deposits" ON deposits
FOR UPDATE
USING (false)
WITH CHECK (false);

-- Function to check if user has active deposit for an auction
CREATE OR REPLACE FUNCTION has_active_deposit(p_auction_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM deposits
    WHERE auction_id = p_auction_id
    AND user_id = p_user_id
    AND status IN ('pending', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 