import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const verifyClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await verifyClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products with categories
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, sku, quantity, reorder_level, cost_price, retail_price, categories(name)");
    if (prodErr) throw prodErr;

    // Fetch recent sales (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: sales, error: salesErr } = await supabase
      .from("sales")
      .select("id, product_id, quantity, total_amount, date_sold, store")
      .gte("date_sold", ninetyDaysAgo.toISOString().split("T")[0]);
    if (salesErr) throw salesErr;

    // Aggregate sales by product
    const productSales: Record<number, { totalQty: number; totalRevenue: number; salesCount: number }> = {};
    (sales || []).forEach((s: any) => {
      if (!s.product_id) return;
      if (!productSales[s.product_id]) {
        productSales[s.product_id] = { totalQty: 0, totalRevenue: 0, salesCount: 0 };
      }
      productSales[s.product_id].totalQty += s.quantity;
      productSales[s.product_id].totalRevenue += Number(s.total_amount);
      productSales[s.product_id].salesCount += 1;
    });

    // Build product summary for AI
    const productSummary = (products || []).map((p: any) => {
      const s = productSales[p.id] || { totalQty: 0, totalRevenue: 0, salesCount: 0 };
      const margin = p.retail_price && p.cost_price
        ? (((p.retail_price - p.cost_price) / p.retail_price) * 100).toFixed(1)
        : "N/A";
      return {
        id: p.id,
        name: p.name,
        category: p.categories?.name || "Uncategorized",
        currentStock: p.quantity ?? 0,
        reorderLevel: p.reorder_level ?? 0,
        costPrice: p.cost_price,
        retailPrice: p.retail_price,
        marginPercent: margin,
        last90DaysUnitsSold: s.totalQty,
        last90DaysRevenue: s.totalRevenue,
        last90DaysSalesCount: s.salesCount,
      };
    });

    const prompt = `You are an expert retail business analyst for a beverage inventory system. Analyze the following product and sales data from the last 90 days and generate actionable growth opportunity insights.

DATA:
${JSON.stringify(productSummary, null, 2)}

Generate insights focused on:
1. TOP SELLERS - Products with highest sales velocity, predict which will continue trending
2. PROMOTION OPPORTUNITIES - Products with high margins that could benefit from promotions
3. BUNDLE SUGGESTIONS - Products that could be bundled together based on sales patterns
4. PREDICTED GROWTH - Products showing upward sales trends that should be stocked up
5. REVENUE OPTIMIZATION - Pricing or stocking strategies to maximize revenue

For each insight, provide actionable business recommendations with predicted impact.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a retail analytics AI. Return structured insights." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return structured opportunity insights based on sales analysis",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["opportunity", "revenue"] },
                        title: { type: "string", description: "Short insight title" },
                        description: { type: "string", description: "Detailed explanation with predicted impact" },
                        action: { type: "string", enum: ["Plan Promotion", "View Sales", "Create Purchase Order", "Review Pricing"] },
                        productName: { type: "string", description: "Related product name if applicable" },
                        productId: { type: "number", description: "Related product ID if applicable" },
                      },
                      required: ["type", "title", "description", "action"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let insights = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      insights = parsed.insights || [];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
