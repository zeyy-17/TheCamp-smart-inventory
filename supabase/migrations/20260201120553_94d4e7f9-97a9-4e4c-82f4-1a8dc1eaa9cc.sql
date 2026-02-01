-- Drop the overly permissive policy that allows any authenticated user to manage categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

-- Create separate restrictive policies for INSERT, UPDATE, DELETE
CREATE POLICY "Privileged users can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can update categories"
ON public.categories
FOR UPDATE
USING (is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can delete categories"
ON public.categories
FOR DELETE
USING (is_privileged_user(auth.uid()));