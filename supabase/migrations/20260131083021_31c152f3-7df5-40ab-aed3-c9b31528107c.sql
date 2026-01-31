-- Drop existing overly permissive policies on products
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

-- Create role-based policies for products
-- All authenticated users can view products (needed for inventory operations)
CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only privileged users (admin/manager) can insert products
CREATE POLICY "Privileged users can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (is_privileged_user(auth.uid()));

-- Only privileged users can update products
CREATE POLICY "Privileged users can update products" 
ON public.products 
FOR UPDATE 
USING (is_privileged_user(auth.uid()));

-- Only privileged users can delete products
CREATE POLICY "Privileged users can delete products" 
ON public.products 
FOR DELETE 
USING (is_privileged_user(auth.uid()));

-- Drop existing overly permissive policies on purchase_orders
DROP POLICY IF EXISTS "Authenticated users can view purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON public.purchase_orders;

-- Create role-based policies for purchase_orders (contains sensitive cost/supplier info)
-- Only privileged users can view purchase orders
CREATE POLICY "Privileged users can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
USING (is_privileged_user(auth.uid()));

-- Only privileged users can insert purchase orders
CREATE POLICY "Privileged users can insert purchase orders" 
ON public.purchase_orders 
FOR INSERT 
WITH CHECK (is_privileged_user(auth.uid()));

-- Only privileged users can update purchase orders
CREATE POLICY "Privileged users can update purchase orders" 
ON public.purchase_orders 
FOR UPDATE 
USING (is_privileged_user(auth.uid()));

-- Only privileged users can delete purchase orders
CREATE POLICY "Privileged users can delete purchase orders" 
ON public.purchase_orders 
FOR DELETE 
USING (is_privileged_user(auth.uid()));

-- Drop existing overly permissive policies on returns
DROP POLICY IF EXISTS "Authenticated users can view returns" ON public.returns;
DROP POLICY IF EXISTS "Authenticated users can manage returns" ON public.returns;

-- Create role-based policies for returns
-- All authenticated users can view returns
CREATE POLICY "Authenticated users can view returns" 
ON public.returns 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only privileged users can manage returns (involves refund amounts)
CREATE POLICY "Privileged users can insert returns" 
ON public.returns 
FOR INSERT 
WITH CHECK (is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can update returns" 
ON public.returns 
FOR UPDATE 
USING (is_privileged_user(auth.uid()));

CREATE POLICY "Privileged users can delete returns" 
ON public.returns 
FOR DELETE 
USING (is_privileged_user(auth.uid()));