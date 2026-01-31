-- Add store column to sales table
ALTER TABLE public.sales 
ADD COLUMN store character varying DEFAULT 'Ampersand'::character varying;