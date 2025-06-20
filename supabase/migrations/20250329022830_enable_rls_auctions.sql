-- migration:20250329022830

-- Enable Row Level Security (RLS) on auctions table
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to have full access
CREATE POLICY "Admins have full access to auctions"
ON public.auctions
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create policy for authenticated users to view auctions
CREATE POLICY "Authenticated users can view auctions"
ON public.auctions
FOR SELECT
TO authenticated
USING (true);

-- Create policy for anonymous users to view auctions
CREATE POLICY "Anonymous users can view auctions"
ON public.auctions
FOR SELECT
TO anon
USING (true);

-- Create policy to allow auction creators to update their own auctions
CREATE POLICY "Users can update their own auctions"
ON public.auctions
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create policy to allow auction creators to delete their own auctions
CREATE POLICY "Users can delete their own auctions"
ON public.auctions
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Handle edge case: enable admins to bypass RLS for full control
ALTER TABLE public.auctions FORCE ROW LEVEL SECURITY;
GRANT ALL ON public.auctions TO postgres, service_role;
