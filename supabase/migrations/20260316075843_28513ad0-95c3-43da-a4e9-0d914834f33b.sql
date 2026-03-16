ALTER TABLE public.products ADD COLUMN store character varying DEFAULT 'Ampersand';
UPDATE public.products SET store = 'Ampersand' WHERE store IS NULL;