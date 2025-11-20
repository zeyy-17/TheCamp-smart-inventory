import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Fetch sales data for the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('date_sold, quantity, total_amount, product_id, products(name)')
      .gte('date_sold', ninetyDaysAgo.toISOString().split('T')[0])
      .order('date_sold', { ascending: true });

    if (salesError) {
      throw salesError;
    }

    // Prepare data summary for AI
    const salesSummary = salesData.map((sale: any) => ({
      date: sale.date_sold,
      product: sale.products?.name || 'Unknown',
      quantity: sale.quantity,
      amount: sale.total_amount
    }));

    // Call Lovable AI to generate forecast
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a sales forecasting AI. Analyze the provided sales data and generate a forecast for the next 7 days (daily), 4 weeks (weekly), and 6 months (monthly). Return a JSON object with three arrays: dailyForecast, weeklyForecast, and monthlyForecast. Each item should have 'period' (string) and 'forecast' (number) properties. Base your predictions on trends, seasonality, and patterns in the data."
          },
          {
            role: "user",
            content: `Analyze this sales data and generate forecasts:\n\n${JSON.stringify(salesSummary, null, 2)}\n\nReturn only valid JSON with no additional text.`
          }
        ],
        temperature: 0.7,
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
    const forecastText = aiData.choices?.[0]?.message?.content;

    if (!forecastText) {
      throw new Error("No forecast generated");
    }

    // Parse the AI response
    let forecast;
    try {
      // Remove markdown code blocks if present
      const cleanText = forecastText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      forecast = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response:", forecastText);
      throw new Error("Failed to parse forecast data");
    }

    return new Response(
      JSON.stringify(forecast),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating forecast:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
