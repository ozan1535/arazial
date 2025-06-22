-- Add extension_count column to auctions table
ALTER TABLE auctions 
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0;

-- Create function to extend auction time
CREATE OR REPLACE FUNCTION extend_auction_time(auction_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_extension_count INTEGER;
    time_remaining INTERVAL;
    extension_minutes INTEGER;
    new_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current extension count and end time
    SELECT extension_count, end_time 
    INTO current_extension_count, new_end_time
    FROM auctions 
    WHERE id = auction_id;
    
    -- Check if auction exists and is active
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate time remaining
    time_remaining := new_end_time - NOW();
    
    -- Only extend if less than 1 minute remaining and extension count is less than 2
    IF time_remaining > INTERVAL '1 minute' OR current_extension_count >= 2 THEN
        RETURN FALSE;
    END IF;
    
    -- Determine extension time based on current count
    IF current_extension_count = 0 THEN
        extension_minutes := 5;
    ELSIF current_extension_count = 1 THEN
        extension_minutes := 3;
    ELSE
        RETURN FALSE;
    END IF;
    
    -- Update auction end time and extension count
    UPDATE auctions 
    SET 
        end_time = new_end_time + (extension_minutes || ' minutes')::INTERVAL,
        extension_count = current_extension_count + 1
    WHERE id = auction_id;
    
    RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION extend_auction_time(UUID) TO authenticated; 
