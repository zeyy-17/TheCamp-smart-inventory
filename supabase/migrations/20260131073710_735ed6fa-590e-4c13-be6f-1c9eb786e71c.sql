-- Drop the security definer view (security issue)
DROP VIEW IF EXISTS public.suppliers_safe;

-- Instead, we'll handle contact info visibility at the application level
-- The suppliers table now has proper RLS:
-- - All authenticated users can SELECT (see names)
-- - Only privileged users can INSERT/UPDATE/DELETE