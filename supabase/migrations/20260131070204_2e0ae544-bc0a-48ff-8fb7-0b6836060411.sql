-- Drop existing permissive policies and recreate with proper auth checks

-- Categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;

CREATE POLICY "Authenticated users can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Movements
DROP POLICY IF EXISTS "Authenticated users can manage movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can view movements" ON public.movements;

CREATE POLICY "Authenticated users can view movements" 
ON public.movements 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage movements" 
ON public.movements 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Products
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Purchase Orders
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can view purchase orders" ON public.purchase_orders;

CREATE POLICY "Authenticated users can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage purchase orders" 
ON public.purchase_orders 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Returns
DROP POLICY IF EXISTS "Authenticated users can manage returns" ON public.returns;
DROP POLICY IF EXISTS "Authenticated users can view returns" ON public.returns;

CREATE POLICY "Authenticated users can view returns" 
ON public.returns 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage returns" 
ON public.returns 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Sales
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;

CREATE POLICY "Authenticated users can view sales" 
ON public.sales 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage sales" 
ON public.sales 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Suppliers
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;

CREATE POLICY "Authenticated users can view suppliers" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage suppliers" 
ON public.suppliers 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);