-- migration:20240426000001

-- First, we need to get the profile IDs for existing offers
CREATE OR REPLACE FUNCTION temp_migrate_offer_users()
RETURNS void AS $$
DECLARE
    offer_record RECORD;
    profile_id UUID;
BEGIN
    -- For each offer
    FOR offer_record IN SELECT * FROM offers LOOP
        -- Get the corresponding profile ID for the auth.user
        -- Note: profiles.id is already the auth.users id
        SELECT id INTO profile_id 
        FROM profiles 
        WHERE id = offer_record.user_id;
        
        -- Update the offer with the profile ID
        IF profile_id IS NOT NULL THEN
            UPDATE offers 
            SET user_id = profile_id 
            WHERE id = offer_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing foreign key constraint
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_user_id_fkey;

-- Execute the migration function
SELECT temp_migrate_offer_users();

-- Drop the temporary function
DROP FUNCTION temp_migrate_offer_users();

-- Add the new foreign key constraint to reference profiles
ALTER TABLE offers
    ADD CONSTRAINT offers_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Add comment to document the change
COMMENT ON CONSTRAINT offers_user_id_fkey ON offers IS 'Links offers to profiles instead of auth.users for consistency with bids table'; 