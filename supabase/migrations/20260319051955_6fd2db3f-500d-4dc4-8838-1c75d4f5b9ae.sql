
-- Fix 1: Allow all authenticated users to view products (not just privileged)
DROP POLICY IF EXISTS "Privileged users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 2: Sales validation trigger - enforces correct pricing server-side
CREATE OR REPLACE FUNCTION public.validate_sale_insert()
RETURNS TRIGGER AS $$
DECLARE
  _product RECORD;
  _expected_amount NUMERIC;
BEGIN
  SELECT * INTO _product FROM public.products WHERE id = NEW.product_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  IF _product.quantity < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
  
  _expected_amount := _product.retail_price * NEW.quantity;
  IF NEW.total_amount != _expected_amount THEN
    RAISE EXCEPTION 'Invalid total_amount';
  END IF;
  
  UPDATE public.products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_sale BEFORE INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.validate_sale_insert();

-- Fix 3: Returns validation trigger - enforces correct refund amounts
CREATE OR REPLACE FUNCTION public.validate_return_insert()
RETURNS TRIGGER AS $$
DECLARE
  _sale RECORD;
  _expected_refund NUMERIC;
BEGIN
  SELECT * INTO _sale FROM public.sales WHERE id = NEW.sale_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale not found';
  END IF;
  
  IF NEW.quantity > _sale.quantity THEN
    RAISE EXCEPTION 'Return quantity exceeds sale quantity';
  END IF;
  
  _expected_refund := (_sale.total_amount / _sale.quantity) * NEW.quantity;
  IF NEW.refund_amount != _expected_refund THEN
    RAISE EXCEPTION 'Invalid refund amount';
  END IF;
  
  UPDATE public.products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_return BEFORE INSERT ON public.returns
FOR EACH ROW EXECUTE FUNCTION public.validate_return_insert();
