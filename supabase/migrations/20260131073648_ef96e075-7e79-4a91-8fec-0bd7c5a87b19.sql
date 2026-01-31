-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any privileged role (admin or manager)
CREATE OR REPLACE FUNCTION public.is_privileged_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- RLS policies for user_roles table
-- Only admins can view all roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update suppliers table policies to restrict contact info access
-- First drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;

-- Create new restrictive policies for suppliers
-- All authenticated users can see basic supplier info (name only)
CREATE POLICY "Authenticated users can view supplier names"
ON public.suppliers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only privileged users (admin/manager) can insert/update/delete suppliers
CREATE POLICY "Privileged users can manage suppliers"
ON public.suppliers
FOR ALL
USING (public.is_privileged_user(auth.uid()))
WITH CHECK (public.is_privileged_user(auth.uid()));

-- Create a view that hides contact info for non-privileged users
CREATE OR REPLACE VIEW public.suppliers_safe AS
SELECT 
    id,
    name,
    CASE WHEN public.is_privileged_user(auth.uid()) THEN contact_email ELSE NULL END as contact_email,
    CASE WHEN public.is_privileged_user(auth.uid()) THEN contact_phone ELSE NULL END as contact_phone,
    created_at
FROM public.suppliers;