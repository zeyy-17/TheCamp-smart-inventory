-- Restrict supplier access to admin users only (more restrictive than manager+admin)
DROP POLICY IF EXISTS "Privileged users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Privileged users can manage suppliers" ON public.suppliers;

-- Only admin users can view suppliers
CREATE POLICY "Admins can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Only admin users can manage suppliers
CREATE POLICY "Admins can insert suppliers" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suppliers" 
ON public.suppliers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete suppliers" 
ON public.suppliers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));