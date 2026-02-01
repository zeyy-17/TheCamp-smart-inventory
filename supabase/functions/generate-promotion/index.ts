import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse request body for product context
    let productName: string | null = null;
    let productId: number | null = null;
    try {
      const body = await req.json();
      productName = body.productName || null;
      productId = body.productId || null;
    } catch {
      // No body or invalid JSON
    }

    // Fetch products data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, quantity, retail_price, cost_price, reorder_level, sku');

    if (productsError) throw productsError;

    // Fetch sales data for the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('date_sold, quantity, total_amount, product_id')
      .gte('date_sold', sixtyDaysAgo.toISOString().split('T')[0])
      .order('date_sold', { ascending: false });

    if (salesError) throw salesError;

    // Calculate product performance metrics
    const productMetrics: Record<number, any> = {};
    
    products.forEach((product: any) => {
      const margin = product.retail_price && product.cost_price 
        ? ((product.retail_price - product.cost_price) / product.retail_price) * 100 
        : 0;
      
      productMetrics[product.id] = {
        name: product.name,
        quantity: product.quantity || 0,
        retailPrice: product.retail_price,
        costPrice: product.cost_price,
        margin: margin.toFixed(1),
        reorderLevel: product.reorder_level || 0,
        totalSold: 0,
        totalRevenue: 0,
        isOverstocked: product.quantity > (product.reorder_level || 10) * 5,
        isLowStock: product.quantity <= (product.reorder_level || 10)
      };
    });

    // Aggregate sales by product
    salesData.forEach((sale: any) => {
      if (sale.product_id && productMetrics[sale.product_id]) {
        productMetrics[sale.product_id].totalSold += sale.quantity;
        productMetrics[sale.product_id].totalRevenue += sale.total_amount;
      }
    });

    // Find target product or use overall data
    let targetProduct = null;
    if (productId && productMetrics[productId]) {
      targetProduct = productMetrics[productId];
    } else if (productName) {
      const found = Object.values(productMetrics).find((p: any) => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      if (found) targetProduct = found;
    }

    // Call Lovable AI to generate promotion plan
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a retail promotion strategist AI for a beverage inventory system. Analyze inventory and sales data to generate smart promotion recommendations.

Consider:
- Products with high stock levels (overstock) need clearance promotions
- High-margin products can afford deeper discounts
- Low-selling products may need bundle deals
- Seasonal timing and market trends
- Competitor pricing strategies

Return a JSON object with:
- recommendations: array of 3-5 promotion ideas, each with:
  - title: string (catchy promotion name)
  - targetProduct: string (product name)
  - discountPercent: number (5-50)
  - duration: number (days, 3-30)
  - strategy: string (clearance/bundle/flash/loyalty/seasonal)
  - reason: string (why this promotion makes sense)
  - expectedImpact: string (projected sales increase)
  - priority: string (high/medium/low)
- summary: object with:
  - totalPotentialRevenue: number
  - topOpportunity: string
  - urgentAction: string or null`
          },
          {
            role: "user",
            content: `Generate promotion recommendations based on this inventory and sales data:

${targetProduct ? `Focus Product: ${JSON.stringify(targetProduct)}` : 'Analyze all products for opportunities'}

Product Metrics Summary (top performers and opportunities):
${JSON.stringify(Object.values(productMetrics).slice(0, 15), null, 2)}

Total Products: ${products.length}
Total Sales Records (60 days): ${salesData.length}

Return only valid JSON with no additional text.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const promotionText = aiData.choices?.[0]?.message?.content;

    if (!promotionText) {
      throw new Error("No promotion plan generated");
    }

    // Parse the AI response
    let promotionPlan;
    try {
      const cleanText = promotionText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      promotionPlan = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response:", promotionText);
      throw new Error("Failed to parse promotion data");
    }

    return new Response(
      JSON.stringify({
        ...promotionPlan,
        generatedAt: new Date().toISOString(),
        targetProduct: targetProduct?.name || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating promotion:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
