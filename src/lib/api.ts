import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// API helper function with authentication
async function callEdgeFunction(functionName: string, options: RequestInit = {}) {
  // Handle paths like 'products/123' by splitting function name from path
  const [baseFunctionName, ...pathParts] = functionName.split('/');
  const pathSuffix = pathParts.length > 0 ? `/${pathParts.join('/')}` : '';
  const url = `${SUPABASE_URL}/functions/v1/${baseFunctionName}${pathSuffix}`;
  
  // Get the current session and include the access token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Categories API
export const categoriesApi = {
  getAll: () => callEdgeFunction('categories'),
  create: (data: { name: string }) => 
    callEdgeFunction('categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Suppliers API
export const suppliersApi = {
  getAll: () => callEdgeFunction('suppliers'),
  create: (data: { name: string; contact_email?: string; contact_phone?: string }) =>
    callEdgeFunction('suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Products API
export const productsApi = {
  getAll: (params?: { name?: string; sku?: string }) => {
    const queryString = params 
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return callEdgeFunction(`products${queryString}`);
  },
  getById: (id: number) => callEdgeFunction(`products/${id}`),
  create: (data: {
    name: string;
    sku: string;
    category_id?: number;
    supplier_id?: number;
    cost_price: number;
    retail_price: number;
    quantity?: number;
    reorder_level?: number;
  }) =>
    callEdgeFunction('products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<{
    name: string;
    sku: string;
    category_id?: number;
    supplier_id?: number;
    cost_price: number;
    retail_price: number;
    quantity: number;
    reorder_level: number;
  }>) =>
    callEdgeFunction(`products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    callEdgeFunction(`products/${id}`, {
      method: 'DELETE',
    }),
};

// Movements API
export const movementsApi = {
  getAll: (params?: { product_id?: number }) => {
    const queryString = params 
      ? '?' + new URLSearchParams({ product_id: String(params.product_id) }).toString()
      : '';
    return callEdgeFunction(`movements${queryString}`);
  },
  create: (data: {
    product_id: number;
    qty_change: number;
    reason?: string;
  }) =>
    callEdgeFunction('movements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Sales API (using Supabase client directly)
export const salesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(*)
      `)
      .order('date_sold', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  create: async (data: {
    product_id: number;
    quantity: number;
    total_amount: number;
    date_sold: string;
  }) => {
    const { data: sale, error } = await supabase
      .from('sales')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return sale;
  },
};
