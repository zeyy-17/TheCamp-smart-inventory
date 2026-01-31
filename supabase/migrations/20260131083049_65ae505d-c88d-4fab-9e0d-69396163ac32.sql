-- Update sales table policies for role-based access
-- Drop existing permissive policies on sales
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;

-- All authenticated users can view sales for dashboard/reporting
CREATE POLICY "Authenticated users can view sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- All authenticated users can record new sales
CREATE POLICY "Authenticated users can record sales" 
ON public.sales 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Only privileged users can update or delete sales
CREATE POLICY "Privileged users can update sales" 
ON public.sales 
FOR UPDATE 
USING (is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can delete sales" 
ON public.sales 
FOR DELETE 
USING (is_privileged_user(auth.uid()));