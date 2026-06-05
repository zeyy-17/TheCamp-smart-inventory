DROP POLICY IF EXISTS "Authenticated users can view deletion logs" ON public.deletion_logs;
CREATE POLICY "Privileged users can view deletion logs"
ON public.deletion_logs
FOR SELECT
TO authenticated
USING (public.is_privileged_user(auth.uid()));