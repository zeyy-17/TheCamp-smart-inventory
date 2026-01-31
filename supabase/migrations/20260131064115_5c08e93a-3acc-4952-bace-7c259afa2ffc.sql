-- Add invoice_number column to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN invoice_number character varying;

-- Create index for faster lookup by invoice
CREATE INDEX idx_purchase_orders_invoice ON public.purchase_orders(invoice_number);