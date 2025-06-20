-- migration:20240425000004
-- Storage policies for auction-images bucket

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