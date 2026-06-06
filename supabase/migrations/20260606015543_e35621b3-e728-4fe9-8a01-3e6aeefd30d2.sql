ALTER TABLE public.deletion_logs
  ADD COLUMN IF NOT EXISTS category_id integer,
  ADD COLUMN IF NOT EXISTS supplier_id integer,
  ADD COLUMN IF NOT EXISTS reorder_level integer;

DROP POLICY IF EXISTS "Privileged users can delete deletion logs" ON public.deletion_logs;
CREATE POLICY "Privileged users can delete deletion logs"
  ON public.deletion_logs
  FOR DELETE
  TO authenticated
  USING (is_privileged_user(auth.uid()));