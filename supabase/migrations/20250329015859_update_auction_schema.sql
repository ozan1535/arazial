-- migration:20250329015859

-- Add columns to auctions table
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create or replace check_column_exists function
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    column_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = check_column_exists.table_name
        AND column_name = check_column_exists.column_name
    ) INTO column_exists;
    
    RETURN column_exists;
END;
$$;

-- Grant execute privileges on function
GRANT EXECUTE ON FUNCTION public.check_column_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_column_exists TO anon;

-- Create auction-images bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'auction-images'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('auction-images', 'auction-images', true);
    END IF;
END $$;

-- Create storage.object policy for authenticated users to upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload images to auction-images'
    ) THEN
        EXECUTE format('
            CREATE POLICY "Authenticated users can upload images to auction-images" 
            ON storage.objects 
            FOR INSERT 
            TO authenticated 
            WITH CHECK (bucket_id = ''auction-images'' AND auth.role() = ''authenticated'')
        ');
    END IF;
END $$;

-- Create storage.object policy for public access to view images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public access to auction images'
    ) THEN
        EXECUTE format('
            CREATE POLICY "Public access to auction images" 
            ON storage.objects 
            FOR SELECT 
            TO anon 
            USING (bucket_id = ''auction-images'')
        ');
    END IF;
END $$;

-- Create storage.object policy for admins to delete images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Admin users can delete auction images'
    ) THEN
        EXECUTE format('
            CREATE POLICY "Admin users can delete auction images" 
            ON storage.objects 
            FOR DELETE 
            TO authenticated 
            USING (
                bucket_id = ''auction-images'' 
                AND (EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = ''admin''
                ))
            )
        ');
    END IF;
END $$;
