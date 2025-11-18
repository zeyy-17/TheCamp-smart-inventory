-- Create returns table to track refunds
CREATE TABLE public.returns (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  refund_amount NUMERIC NOT NULL CHECK (refund_amount >= 0),
  reason TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view returns" 
ON public.returns 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage returns" 
ON public.returns 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_returns_sale_id ON public.returns(sale_id);
CREATE INDEX idx_returns_product_id ON public.returns(product_id);
CREATE INDEX idx_returns_created_at ON public.returns(created_at DESC);