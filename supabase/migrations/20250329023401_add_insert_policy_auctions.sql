-- migration:20250329023401

-- Drop existing admin policy to recreate it properly
DROP POLICY IF EXISTS "Admins have full access to auctions" ON public.auctions;

-- Create policy for admins to have full access
CREATE POLICY "Admins have full access to auctions"
ON public.auctions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create specific INSERT policy for authenticated users to insert their own auctions
CREATE POLICY "Users can create their own auctions"
ON public.auctions
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
