-- Drop existing tables and recreate with new schema
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.stock_out CASCADE;
DROP TABLE IF EXISTS public.stock_in CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- SUPPLIERS
CREATE TABLE public.suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS (renamed from items)
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INT REFERENCES public.categories(id),
    supplier_id INT REFERENCES public.suppliers(id),
    cost_price DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY MOVEMENTS (consolidates stock_in and stock_out)
CREATE TABLE public.movements (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(id),
    qty_change INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SALES TABLE (recreated to reference products)
CREATE TABLE public.sales (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(id),
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    date_sold DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view movements" ON public.movements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage movements" ON public.movements FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);

-- Trigger to update updated_at on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();