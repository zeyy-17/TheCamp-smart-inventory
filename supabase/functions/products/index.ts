import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const productId = pathParts[pathParts.length - 1];

    // POST /products - Create product
    if (req.method === 'POST') {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('products')
        .insert(body)
        .select(`
          *,
          supplier:suppliers(*),
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // GET /products/:id - Get single product by ID
    if (req.method === 'GET' && productId && productId !== 'products') {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(*),
          category:categories(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /products - Get all products with filters
    if (req.method === 'GET') {
      const name = url.searchParams.get('name');
      const sku = url.searchParams.get('sku');

      let query = supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(*),
          category:categories(*)
        `);

      if (name) query = query.eq('name', name);
      if (sku) query = query.eq('sku', sku);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /products/:id - Update product
    if (req.method === 'PATCH' && productId) {
      const body = await req.json();
      
      const { error: updateError } = await supabase
        .from('products')
        .update(body)
        .eq('id', productId);

      if (updateError) throw updateError;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(*),
          category:categories(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /products/:id - Delete product
    if (req.method === 'DELETE' && productId) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      return new Response(JSON.stringify({ deleted: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error) {
    console.error('Error in products function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
