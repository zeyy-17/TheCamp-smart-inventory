-- Create purchase_orders table for tracking pre-ordered stocks
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id INTEGER REFERENCES public.suppliers(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  expected_delivery_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view purchase orders"
  ON public.purchase_orders
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage purchase orders"
  ON public.purchase_orders
  FOR ALL
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();