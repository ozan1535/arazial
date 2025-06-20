-- migration:20250329022633

-- Create the auction-images bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'auction-images'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('auction-images', 'auction-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
        
        -- Enable Row Level Security
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for authenticated users to upload images
        CREATE POLICY "Authenticated users can upload images to auction-images" 
        ON storage.objects 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'auction-images' AND auth.role() = 'authenticated');
        
        -- Create policy for public access to view images
        CREATE POLICY "Public access to auction images" 
        ON storage.objects 
        FOR SELECT 
        TO anon 
        USING (bucket_id = 'auction-images');
        
        -- Create policy for admins to delete images
        CREATE POLICY "Admin users can delete auction images" 
        ON storage.objects 
        FOR DELETE 
        TO authenticated 
        USING (
            bucket_id = 'auction-images' 
            AND (EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            ))
        );
    END IF;
END $$;
