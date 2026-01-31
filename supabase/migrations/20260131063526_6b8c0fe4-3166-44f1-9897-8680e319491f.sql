-- Add store column to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN store character varying DEFAULT 'Ampersand';

-- Create index for faster filtering by store
CREATE INDEX idx_purchase_orders_store ON public.purchase_orders(store);