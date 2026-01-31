import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /movements - Create movement and adjust product quantity
    if (req.method === 'POST') {
      const { product_id, qty_change, reason } = await req.json();

      // Create movement record
      const { data: movement, error: movementError } = await supabase
        .from('movements')
        .insert({ product_id, qty_change, reason })
        .select()
        .single();

      if (movementError) throw movementError;

      // Get current product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', product_id)
        .single();

      if (productError) throw productError;

      // Update product quantity
      const newQuantity = product.quantity + qty_change;
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', product_id);

      if (updateError) throw updateError;

      console.log(`Movement created: Product ${product_id}, quantity changed by ${qty_change}, new quantity: ${newQuantity}`);

      return new Response(JSON.stringify(movement), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // GET /movements - Get all movements with optional filter by product_id
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const productId = url.searchParams.get('product_id');

      let query = supabase
        .from('movements')
        .select(`
          *,
          product:products(*)
        `);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error) {
    console.error('Error in movements function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
