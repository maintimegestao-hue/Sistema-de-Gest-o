
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, priceAmount } = await req.json();

    // Define plan details
    const plans = {
      'basic': {
        name: 'Básico',
        price: 2900, // em centavos
        description: 'Plano Básico com recursos essenciais'
      },
      'premium': {
        name: 'Premium',
        price: 8990, // em centavos
        description: 'Plano Premium com recursos avançados'
      },
      'enterprise': {
        name: 'Enterprise', 
        price: 12990, // em centavos
        description: 'Plano Enterprise com recursos completos'
      }
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      throw new Error("Plan not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Optional user authentication
    let user = null;
    let customerId = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      
      if (user?.email) {
        // Check if customer exists
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    // Create checkout session
    const sessionData: any = {
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Plano ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.price,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/#precos`,
      metadata: {
        plan_id: planId,
      },
    };

    // Add customer info if available
    if (customerId) {
      sessionData.customer = customerId;
    } else if (user?.email) {
      sessionData.customer_email = user.email;
    }

    if (user?.id) {
      sessionData.metadata.user_id = user.id;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
