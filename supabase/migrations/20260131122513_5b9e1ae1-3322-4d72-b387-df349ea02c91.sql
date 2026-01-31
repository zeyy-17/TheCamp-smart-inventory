
-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Create new restrictive SELECT policy for privileged users only
CREATE POLICY "Privileged users can view products"
ON public.products
FOR SELECT
USING (is_privileged_user(auth.uid()));
