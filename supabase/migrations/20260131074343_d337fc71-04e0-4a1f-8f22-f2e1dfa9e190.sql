-- Drop existing suppliers policies
DROP POLICY IF EXISTS "Authenticated users can view supplier names" ON public.suppliers;
DROP POLICY IF EXISTS "Privileged users can manage suppliers" ON public.suppliers;

-- Create restrictive policies - only admin/manager can access suppliers
CREATE POLICY "Privileged users can view suppliers"
ON public.suppliers
FOR SELECT
USING (public.is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can manage suppliers"
ON public.suppliers
FOR ALL
USING (public.is_privileged_user(auth.uid()))
WITH CHECK (public.is_privileged_user(auth.uid()));