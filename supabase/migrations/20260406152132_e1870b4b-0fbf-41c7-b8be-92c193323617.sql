
CREATE TABLE public.stock_count_logs (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  product_name text NOT NULL,
  sku text NOT NULL,
  store text NOT NULL,
  old_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  counted_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_count_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock count logs"
  ON public.stock_count_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Privileged users can insert stock count logs"
  ON public.stock_count_logs FOR INSERT TO authenticated
  WITH CHECK (is_privileged_user(auth.uid()));
