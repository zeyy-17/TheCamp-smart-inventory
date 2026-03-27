
CREATE TABLE public.deletion_logs (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  store TEXT,
  quantity INTEGER,
  cost_price NUMERIC,
  retail_price NUMERIC,
  deleted_by TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deletion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deletion logs"
ON public.deletion_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Privileged users can insert deletion logs"
ON public.deletion_logs FOR INSERT TO authenticated
WITH CHECK (public.is_privileged_user(auth.uid()));
